import { ResumeData } from '../types/cv';

export interface PDFExportResult {
  filename: string;
  blob?: Blob;
}

/**
 * Calcule le nom de fichier standard et propre : CV_Nom_Prenom.pdf
 */
export function getResumePDFFilename(resumeData: ResumeData, customTitle?: string): string {
  const firstName = resumeData?.personalInfo?.firstName?.trim() || '';
  const lastName = resumeData?.personalInfo?.lastName?.trim() || '';

  if (lastName || firstName) {
    const cleanLast = lastName.replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
    const cleanFirst = firstName.replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_');
    return `CV_${cleanLast}${cleanFirst ? `_${cleanFirst}` : ''}.pdf`;
  }

  if (customTitle?.trim()) {
    return `CV_${customTitle.trim().replace(/[^a-zA-Z0-9À-ÿ_-]/g, '_')}.pdf`;
  }

  return 'Mon_CV.pdf';
}

/**
 * Prépare et déclenche l'impression vectorielle W3C CSS Paged Media (Section 4.1).
 *
 * Utilise un iframe isolé pour que le rendu ne dépende ni du zoom de l'écran,
 * ni de la largeur du mobile Android.
 * Le résultat est 100% vectoriel, avec texte sélectionnable, liens cliquables
 * et respect strict des règles de saut de page (@page).
 */
export async function exportResumeToPDF(
  elementId: string,
  resumeData: ResumeData,
  options?: { customFileName?: string }
): Promise<string> {
  // 1. Attendre le chargement complet des polices
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Élément de CV introuvable pour l'export.");
  }

  const filename = options?.customFileName
    ? (options.customFileName.endsWith('.pdf') ? options.customFileName : `${options.customFileName}.pdf`)
    : getResumePDFFilename(resumeData);

  const documentTitle = filename.replace(/\.pdf$/i, '');

  return new Promise((resolve, reject) => {
    try {
      // 2. Création d'un iframe isolé invisible
      const iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        throw new Error("Impossible d'initialiser le moteur d'impression.");
      }

      // 3. Titre du document (nom de fichier par défaut lors de l'enregistrement PDF)
      iframeDoc.title = documentTitle;

      // 4. Cloner les feuilles de style de la page principale dans l'iframe
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      styles.forEach((styleNode) => {
        iframeDoc.head.appendChild(styleNode.cloneNode(true));
      });

      // 5. Injecter les règles CSS strictes pour l'impression A4 vectorielle
      const printStyle = iframeDoc.createElement('style');
      printStyle.textContent = `
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        *, *::before, *::after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          width: 100% !important;
          color: #0f172a !important;
          font-variant-ligatures: none !important;
        }
        .a4-sheet {
          box-shadow: none !important;
          margin: 0 !important;
          border-radius: 0 !important;
          width: 100% !important;
          min-height: auto !important;
          max-width: 100% !important;
        }
        .avoid-break {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        .avoid-break-after {
          break-after: avoid !important;
          page-break-after: avoid !important;
        }
        .no-print {
          display: none !important;
        }
        a {
          text-decoration: none !important;
          color: inherit !important;
        }
      `;
      iframeDoc.head.appendChild(printStyle);

      // 6. Cloner le CV dans le corps de l'iframe
      const clonedElement = element.cloneNode(true) as HTMLElement;
      clonedElement.id = 'print-cv-sheet';
      clonedElement.style.transform = 'none';
      clonedElement.style.maxWidth = '100%';
      clonedElement.style.visibility = 'visible';
      clonedElement.style.opacity = '1';
      iframeDoc.body.appendChild(clonedElement);

      // 7. Attendre le chargement des images et des polices de l'iframe
      const waitForAssets = async () => {
        if (iframeDoc.fonts) {
          try {
            await iframeDoc.fonts.ready;
          } catch {}
        }

        const images = Array.from(iframeDoc.querySelectorAll('img'));
        await Promise.all(
          images.map(
            (img) =>
              new Promise<void>((imgResolve) => {
                if (img.complete) {
                  imgResolve();
                } else {
                  img.onload = () => imgResolve();
                  img.onerror = () => imgResolve();
                }
              })
          )
        );
      };

      waitForAssets().then(() => {
        // Petit délai pour finaliser le reflow
        setTimeout(() => {
          try {
            const win = iframe.contentWindow;
            if (!win) {
              document.body.removeChild(iframe);
              resolve(filename);
              return;
            }

            win.focus();
            win.print();

            // Nettoyage de l'iframe après déclenchement
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 2000);

            resolve(filename);
          } catch (printErr) {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            reject(printErr);
          }
        }, 150);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Partage le CV via l'API Web Share native (Android/iOS)
 * ou déclenche le téléchargement/impression si non supporté.
 */
export async function shareResumePDF(
  elementId: string,
  resumeData: ResumeData,
  options?: { customFileName?: string }
): Promise<{ filename: string; shared: boolean }> {
  const filename = options?.customFileName
    ? (options.customFileName.endsWith('.pdf') ? options.customFileName : `${options.customFileName}.pdf`)
    : getResumePDFFilename(resumeData);

  // Déclencher l'export vectoriel
  await exportResumeToPDF(elementId, resumeData, options);

  // Si l'API Web Share est supportée pour le texte/titre
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'Mon CV',
        text: `Voici mon CV : ${filename.replace(/\.pdf$/i, '')}`,
      });
      return { filename, shared: true };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { filename, shared: false };
      }
    }
  }

  return { filename, shared: true };
}

/**
 * Rétro-compatibilité : génère un résultat pour les contextes attendant generateResumePDFBlob
 */
export async function generateResumePDFBlob(
  elementId: string,
  resumeData: ResumeData,
  options?: { customFileName?: string }
): Promise<PDFExportResult> {
  const filename = await exportResumeToPDF(elementId, resumeData, options);
  return { filename };
}
