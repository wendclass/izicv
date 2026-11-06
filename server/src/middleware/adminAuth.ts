import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'izicv_super_secret_jwt_key_2026';

export interface AdminRequest extends Request {
  admin?: {
    email: string;
    role: 'super_admin';
  };
}

// In-memory rate limiting for admin login attempts
interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
}
const loginRateLimits = new Map<string, RateLimitRecord>();

export function checkAdminRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const record = loginRateLimits.get(ip);
  if (!record) {
    loginRateLimits.set(ip, { attempts: 1, firstAttempt: now });
    return true;
  }

  if (now - record.firstAttempt > windowMs) {
    loginRateLimits.set(ip, { attempts: 1, firstAttempt: now });
    return true;
  }

  record.attempts += 1;
  if (record.attempts > maxAttempts) {
    return false;
  }

  return true;
}

export function resetAdminRateLimit(ip: string): void {
  loginRateLimits.delete(ip);
}

export function getAdminEmail(): string {
  const envEmail = process.env.ADMIN_EMAIL;
  return envEmail ? envEmail.trim().toLowerCase() : '';
}

export function adminAuthMiddleware(req: AdminRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 404 strict: no hint that an admin area exists
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email?: string; role?: string };
    const adminEmail = getAdminEmail();

    if (!adminEmail || decoded.role !== 'super_admin' || !decoded.email || decoded.email.toLowerCase() !== adminEmail) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    req.admin = {
      email: decoded.email.toLowerCase(),
      role: 'super_admin',
    };
    next();
  } catch (err) {
    // Expired or forged token: 404 strict
    res.status(404).json({ error: 'Not Found' });
  }
}

export function generateAdminToken(email: string): string {
  // 2-hour inactivity / session expiration (Section 2)
  return jwt.sign(
    { email: email.toLowerCase(), role: 'super_admin' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}
