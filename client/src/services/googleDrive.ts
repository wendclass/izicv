import { Resume } from '../types/cv';

const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
  '1007788565582-1kf1cbcrrduj7d5101o5o3ttt7dfahd7.apps.googleusercontent.com';

const DRIVE_SCOPE =
  'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file';

export interface GoogleUserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

/**
 * Charge dynamiquement le script Google Identity Services si pas encore prêt
 */
export async function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  if ((window as any).google?.accounts?.oauth2) return;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      // Si déjà chargé
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

/**
 * Lance le flux d'autorisation OAuth2 Google Drive
 */
export async function requestGoogleDriveAccess(): Promise<{
  accessToken: string;
  user: GoogleUserProfile;
}> {
  await loadGoogleGsiScript();

  if (!(window as any).google?.accounts?.oauth2) {
    throw new Error('Le service Google Identity n\'a pas pu être chargé. Vérifie ta connexion.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(`Autorisation Google refusée : ${response.error}`));
            return;
          }

          const accessToken = response.access_token;
          try {
            // Récupérer le profil utilisateur
            const userProfile = await fetchGoogleUserProfile(accessToken);
            // Sauvegarder dans le stockage local
            localStorage.setItem('izicv_google_access_token', accessToken);
            localStorage.setItem(
              'izicv_google_token_expiry',
              String(Date.now() + (Number(response.expires_in) || 3500) * 1000)
            );
            localStorage.setItem('izicv_google_user', JSON.stringify(userProfile));

            resolve({ accessToken, user: userProfile });
          } catch (profileErr) {
            reject(profileErr);
          }
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Récupère le profil de l'utilisateur Google connecté
 */
export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Impossible de récupérer le profil Google.');
  }

  const data = await res.json();
  return {
    id: data.sub || data.id,
    email: data.email,
    fullName: data.name || data.given_name || 'Utilisateur Google',
    avatarUrl: data.picture,
  };
}

/**
 * Vérifie et renvoie le token Google valide ou null si expiré/absent
 */
export function getSavedGoogleAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  const token = localStorage.getItem('izicv_google_access_token');
  const expiry = localStorage.getItem('izicv_google_token_expiry');

  if (!token || !expiry) return null;

  // Si expiré ou expire dans moins de 60 secondes
  if (Date.now() > Number(expiry) - 60000) {
    return null;
  }

  return token;
}

/**
 * Récupère ou crée le dossier "iziCV" sur le Google Drive personnel de l'utilisateur
 */
export async function ensureIziCVFolder(accessToken: string): Promise<string> {
  const query = "mimeType = 'application/vnd.google-apps.folder' and name = 'iziCV' and trashed = false";
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    throw new Error('Erreur lors de la recherche du dossier iziCV sur ton Google Drive.');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Création du dossier iziCV s'il n'existe pas encore
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'iziCV',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Dossier de sauvegarde automatique de tes CV générés avec iziCV',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Impossible de créer le dossier iziCV sur ton Google Drive.');
  }

  const createData = await createRes.json();
  return createData.id;
}

/**
 * Sauvegarde ou met à jour un CV directement sur le Google Drive de l'utilisateur
 */
export async function saveResumeToDrive(
  accessToken: string,
  resume: Resume
): Promise<{ fileId: string; updated: boolean }> {
  const folderId = await ensureIziCVFolder(accessToken);
  const cleanTitle = (resume.title || 'Mon_CV').replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
  const fileName = `CV_${cleanTitle}_${resume.id.slice(-6)}.json`;

  // Vérifier si le fichier existe déjà dans le dossier iziCV
  const query = `'${folderId}' in parents and trashed = false and (name = '${fileName}' or appProperties has { key='resumeId' and value='${resume.id}' })`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const searchData = await searchRes.json();
  const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

  const fileContent = JSON.stringify(resume, null, 2);

  if (existingFile) {
    // Mise à jour du contenu du fichier
    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: fileContent,
    });

    if (!updateRes.ok) {
      throw new Error('Échec de la mise à jour sur Google Drive.');
    }

    // Mise à jour du nom si le titre a changé
    if (existingFile.name !== fileName) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fileName }),
      });
    }

    return { fileId: existingFile.id, updated: true };
  } else {
    // Création d'un nouveau fichier avec multipart
    const boundary = '-------iziCV_MultiPart_Boundary_987654321';
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      appProperties: {
        resumeId: resume.id,
        app: 'iziCV',
      },
    };

    const multipartBody =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${fileContent}\r\n` +
      `--${boundary}--`;

    const createRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    if (!createRes.ok) {
      throw new Error('Échec de la création du fichier sur Google Drive.');
    }

    const created = await createRes.json();
    return { fileId: created.id, updated: false };
  }
}

/**
 * Récupère tous les CV enregistrés dans le dossier "iziCV" de l'utilisateur
 */
export async function listResumesFromDrive(accessToken: string): Promise<Resume[]> {
  const folderId = await ensureIziCVFolder(accessToken);
  const query = `'${folderId}' in parents and trashed = false and name contains '.json'`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)`;

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    throw new Error('Impossible de charger les CV depuis Google Drive.');
  }

  const listData = await listRes.json();
  const files: { id: string; name: string }[] = listData.files || [];

  const resumes: Resume[] = [];
  for (const file of files) {
    try {
      const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (contentRes.ok) {
        const resumeObj: Resume = await contentRes.json();
        if (resumeObj && resumeObj.id && resumeObj.data) {
          resumes.push(resumeObj);
        }
      }
    } catch (err) {
      console.warn(`Erreur lecture fichier Drive ${file.name}:`, err);
    }
  }

  return resumes;
}

/**
 * Supprime un CV du dossier Google Drive
 */
export async function deleteResumeFromDrive(accessToken: string, resumeId: string): Promise<boolean> {
  const folderId = await ensureIziCVFolder(accessToken);
  const query = `'${folderId}' in parents and trashed = false and (name contains '${resumeId.slice(-6)}' or appProperties has { key='resumeId' and value='${resumeId}' })`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) return false;
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    for (const f of searchData.files) {
      await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }
    return true;
  }
  return false;
}
