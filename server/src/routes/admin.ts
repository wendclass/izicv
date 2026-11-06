import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import {
  adminAuthMiddleware,
  AdminRequest,
  generateAdminToken,
  getAdminEmail,
  checkAdminRateLimit,
  resetAdminRateLimit,
} from '../middleware/adminAuth.js';

const router = Router();

// Helper to get client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// POST /api/admin/login
// Restrictive: accepts only Google credentials matching ADMIN_EMAIL
// For any unauthorized attempt, returns 404 Not Found to prevent enumeration
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const clientIp = getClientIp(req);

  // Rate limiting check
  if (!checkAdminRateLimit(clientIp)) {
    // Return 404 indistinguishable from nonexistent route
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  try {
    const { credential, accessToken } = req.body;
    const adminEmail = getAdminEmail();

    if (!adminEmail) {
      // ADMIN_EMAIL not configured: fail safe with 404
      console.warn('⚠️ ADMIN_EMAIL is not configured in environment variables.');
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    if (!credential && !accessToken) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    let verifiedEmail = '';

    // Verify Google ID Token or Access Token
    if (credential) {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (!googleRes.ok) {
        db.createAuditLog({
          action: 'admin_login_denied',
          target_type: 'auth',
          details: `Échec validation jeton Google (IP: ${clientIp})`,
        });
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      const data = (await googleRes.json()) as { email?: string; email_verified?: string | boolean };
      if (data.email && (data.email_verified === 'true' || data.email_verified === true)) {
        verifiedEmail = data.email.toLowerCase().trim();
      }
    } else if (accessToken) {
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!googleRes.ok) {
        db.createAuditLog({
          action: 'admin_login_denied',
          target_type: 'auth',
          details: `Échec validation jeton d'accès Google (IP: ${clientIp})`,
        });
        res.status(404).json({ error: 'Not Found' });
        return;
      }
      const data = (await googleRes.json()) as { email?: string; email_verified?: boolean };
      if (data.email && data.email_verified) {
        verifiedEmail = data.email.toLowerCase().trim();
      }
    }

    // Verify email match with ADMIN_EMAIL
    if (!verifiedEmail || verifiedEmail !== adminEmail) {
      db.createAuditLog({
        action: 'admin_login_denied',
        target_type: 'auth',
        details: `Tentative refusée pour l'email [masqué] (IP: ${clientIp})`,
      });
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    // Success: reset rate limit
    resetAdminRateLimit(clientIp);

    // Generate 2-hour admin token
    const token = generateAdminToken(verifiedEmail);

    // Record in immutable audit log
    db.createAuditLog({
      action: 'admin_login_success',
      target_type: 'auth',
      details: `Connexion administrateur réussie (IP: ${clientIp})`,
    });

    res.json({
      success: true,
      token,
      email: verifiedEmail,
      expiresIn: 7200,
    });
  } catch (error) {
    console.error('Erreur lors du traitement /api/admin/login:', error);
    res.status(404).json({ error: 'Not Found' });
  }
});

// GET /api/admin/verify-session
router.get('/verify-session', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({
    authenticated: true,
    email: req.admin?.email,
  });
});

// POST /api/admin/logout
router.post('/logout', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  db.createAuditLog({
    action: 'admin_logout',
    target_type: 'auth',
    details: 'Déconnexion volontaire de la session administrateur',
  });
  res.json({ success: true });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  db.createAuditLog({
    action: 'view_audit_logs',
    target_type: 'audit_log',
    details: 'Consultation du journal d audit',
  });
  const logs = db.getAuditLogs(150);
  res.json({ logs });
});

// GET /api/admin/settings
router.get('/settings', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  res.json({
    adminEmail: req.admin?.email,
    sessionDuration: '2 heures',
    rateLimitPolicy: '5 tentatives maximum par 15 minutes',
  });
});

export default router;
