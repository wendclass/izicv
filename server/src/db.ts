import path from 'path';
import fs from 'fs';

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

interface DBSchema {
  users: UserRow[];
  resumes: ResumeRow[];
}

class JsonDatabase {
  private data: DBSchema = { users: [], resumes: [] };

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
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Erreur lecture base de données, réinitialisation:', e);
      this.data = { users: [], resumes: [] };
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
}

export const db = new JsonDatabase();

export function initDB() {
  console.log('✅ Base de données initialisée à :', dbFilePath);
}
