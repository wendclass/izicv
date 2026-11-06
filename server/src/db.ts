import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  console.warn('Impossible de creer dataDir:', e);
}

const dbFilePath = path.join(dataDir, 'database.json');

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
  statut?: 'actif' | 'suspendu';
  derniere_connexion?: string;
  methode_connexion?: 'google' | 'email';
  consentement_confidentialite_le?: string;
}

export interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  theme_color: string;
  font_family: string;
  data: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLogRow {
  id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  user_id?: string;
  session_id?: string;
  event_name: string;
  properties?: Record<string, any>;
  device_type?: 'android' | 'ios' | 'desktop' | 'unknown';
  country?: string;
  created_at: string;
}

interface DBSchema {
  users: UserRow[];
  resumes: ResumeRow[];
  admin_audit_logs: AdminAuditLogRow[];
  events: EventRow[];
}

class JsonDatabase {
  private data: DBSchema = { users: [], resumes: [], admin_audit_logs: [], events: [] };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.resumes) this.data.resumes = [];
        if (!this.data.admin_audit_logs) this.data.admin_audit_logs = [];
        if (!this.data.events) this.data.events = [];
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Erreur lecture base de données, réinitialisation:', e);
      this.data = { users: [], resumes: [], admin_audit_logs: [], events: [] };
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Erreur écriture base de données:', e);
    }
  }

  // Users
  findUserByEmail(email: string): UserRow | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRow | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user: UserRow): UserRow {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Resumes
  findResumesByUserId(userId: string): ResumeRow[] {
    return this.data.resumes
      .filter((r) => r.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  findResumeByIdAndUserId(id: string, userId: string): ResumeRow | undefined {
    return this.data.resumes.find((r) => r.id === id && r.user_id === userId);
  }

  createResume(resume: ResumeRow): ResumeRow {
    this.data.resumes.push(resume);
    this.save();
    return resume;
  }

  updateResume(id: string, userId: string, updates: Partial<ResumeRow>): ResumeRow | null {
    const idx = this.data.resumes.findIndex((r) => r.id === id && r.user_id === userId);
    if (idx === -1) return null;

    this.data.resumes[idx] = {
      ...this.data.resumes[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.resumes[idx];
  }

  deleteResume(id: string, userId: string): boolean {
    const initialLen = this.data.resumes.length;
    this.data.resumes = this.data.resumes.filter((r) => !(r.id === id && r.user_id === userId));
    const deleted = this.data.resumes.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }

  // Admin Audit Logs (Append-only & Immutable from UI)
  createAuditLog(log: Omit<AdminAuditLogRow, 'id' | 'created_at'>): AdminAuditLogRow {
    const entry: AdminAuditLogRow = {
      id: crypto.randomUUID(),
      action: log.action,
      target_type: log.target_type,
      target_id: log.target_id,
      details: log.details,
      created_at: new Date().toISOString(),
    };
    this.data.admin_audit_logs.push(entry);
    this.save();
    return entry;
  }

  getAuditLogs(limit = 200): AdminAuditLogRow[] {
    return [...this.data.admin_audit_logs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // Events (Telemetry & Activity)
  addEvent(event: Omit<EventRow, 'id' | 'created_at'>): EventRow {
    const entry: EventRow = {
      id: crypto.randomUUID(),
      user_id: event.user_id,
      session_id: event.session_id,
      event_name: event.event_name,
      properties: event.properties || {},
      device_type: event.device_type || 'unknown',
      country: event.country || 'Inconnu',
      created_at: new Date().toISOString(),
    };
    this.data.events.push(entry);
    this.save();
    return entry;
  }

  getEvents(limit = 500): EventRow[] {
    return [...this.data.events]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  // All Users (Admin only)
  getAllUsers(): UserRow[] {
    return [...this.data.users];
  }

  // All Resumes (Admin only)
  getAllResumes(): ResumeRow[] {
    return [...this.data.resumes];
  }
}

export const db = new JsonDatabase();

export function initDB() {
  console.log('✅ Base de données initialisée à :', dbFilePath);
}
