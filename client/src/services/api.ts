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

export const api = {
  // Auth
  async register(data: { email: string; password: string; fullName: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de l\'inscription');
    return json;
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de la connexion');
    return json;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur session');
    return json;
  },

  // Resumes
  async getResumes(): Promise<Resume[]> {
    const res = await fetch(`${API_BASE_URL}/resumes`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors du chargement des CV');
    return json.resumes || [];
  },

  async getResume(id: string): Promise<Resume> {
    const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors du chargement du CV');
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
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de la création du CV');
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
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de la mise à jour du CV');
    return json;
  },

  async duplicateResume(id: string): Promise<{ newId: string }> {
    const res = await fetch(`${API_BASE_URL}/resumes/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de la duplication du CV');
    return json;
  },

  async deleteResume(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erreur lors de la suppression du CV');
  },
};
