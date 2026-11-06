import { Resume, ResumeData, TemplateId, ResumeTheme, User } from '../types/cv';

const API_BASE_URL = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('izicv_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse<T = any>(res: Response, defaultError: string): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  let json: any = null;
  if (contentType.includes('application/json')) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const errorMsg = json?.error || (res.status === 404 ? 'Service indisponible' : defaultError);
    throw new Error(errorMsg);
  }

  if (json === null) {
    throw new Error(defaultError);
  }

  return json as T;
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; fullName: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Erreur lors de l\'inscription');
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Erreur lors de la connexion');
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return parseResponse(res, 'Erreur session');
  },

  // Resumes
  async getResumes(): Promise<Resume[]> {
    const res = await fetch(`${API_BASE_URL}/resumes`, {
      headers: getHeaders(),
    });
    const json = await parseResponse<{ resumes?: Resume[] }>(res, 'Erreur lors du chargement des CV');
    return json.resumes || [];
  },

  async getResume(id: string): Promise<Resume> {
    const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
      headers: getHeaders(),
    });
    const json = await parseResponse<{ resume: Resume }>(res, 'Erreur lors du chargement du CV');
    return json.resume;
  },

  async createResume(payload: {
    title: string;
    templateId?: TemplateId;
    theme?: ResumeTheme;
    data?: ResumeData;
  }): Promise<Resume> {
    const res = await fetch(`${API_BASE_URL}/resumes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await parseResponse<{ resume: Resume }>(res, 'Erreur lors de la creation du CV');
    return json.resume;
  },

  async updateResume(
    id: string,
    payload: {
      title?: string;
      templateId?: TemplateId;
      theme?: ResumeTheme;
      data?: ResumeData;
    }
  ): Promise<{ updatedAt: string }> {
    const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return parseResponse(res, 'Erreur lors de la mise a jour du CV');
  },

  async duplicateResume(id: string): Promise<{ newId: string }> {
    const res = await fetch(`${API_BASE_URL}/resumes/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return parseResponse(res, 'Erreur lors de la duplication du CV');
  },

  async deleteResume(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    await parseResponse(res, 'Erreur lors de la suppression du CV');
  },
};
