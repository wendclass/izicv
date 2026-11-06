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

// GET /api/admin/users (Section 4.2)
// Returns sanitized list of users with stats
router.get('/users', adminAuthMiddleware, (req: AdminRequest, res: Response) => {
  db.createAuditLog({
    action: 'view_users_list',
    target_type: 'users',
    details: 'Consultation de la liste des utilisateurs',
  });

  const users = db.getAllUsers();
  const allResumes = db.getAllResumes();
  const allEvents = db.getEvents();

  const sanitizedUsers = users.map((u) => {
    const userResumes = allResumes.filter((r) => r.user_id === u.id);
    const userEvents = allEvents.filter((e) => e.user_id === u.id);
    const pdfExports = userEvents.filter((e) => e.event_name === 'pdf_telecharge').length;

    // Detect most frequent device
    const deviceCounts: Record<string, number> = {};
    userEvents.forEach((e) => {
      if (e.device_type && e.device_type !== 'unknown') {
        deviceCounts[e.device_type] = (deviceCounts[e.device_type] || 0) + 1;
      }
    });
    let mostFrequentDevice = 'Inconnu';
    let maxDeviceCount = 0;
    Object.entries(deviceCounts).forEach(([dev, count]) => {
      if (count > maxDeviceCount) {
        maxDeviceCount = count;
        mostFrequentDevice = dev;
      }
    });

    // Detect most frequent country
    const countryCounts: Record<string, number> = {};
    userEvents.forEach((e) => {
      if (e.country && e.country !== 'Inconnu') {
        countryCounts[e.country] = (countryCounts[e.country] || 0) + 1;
      }
    });
    let mostFrequentCountry = 'Inconnu';
    let maxCountryCount = 0;
    Object.entries(countryCounts).forEach(([c, count]) => {
      if (count > maxCountryCount) {
        maxCountryCount = count;
        mostFrequentCountry = c;
      }
    });

    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      statut: u.statut || 'actif',
      methode_connexion: u.methode_connexion || 'email',
      created_at: u.created_at,
      derniere_connexion: u.derniere_connexion || u.created_at,
      cv_count: userResumes.length,
      pdf_exports_count: pdfExports,
      most_frequent_device: mostFrequentDevice,
      most_frequent_country: mostFrequentCountry,
    };
  });

  res.json({ users: sanitizedUsers });
});

// GET /api/admin/users/:id (Section 4.3 Fiche utilisateur)
router.get('/users/:id', adminAuthMiddleware, (req: AdminRequest, res: Response): void => {
  const { id } = req.params;
  const user = db.findUserById(id);

  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
    return;
  }

  db.createAuditLog({
    action: 'view_user_profile',
    target_type: 'user',
    target_id: user.id,
    details: `Consultation de la fiche utilisateur (${user.email})`,
  });

  const resumes = db.findResumesByUserId(user.id).map((r) => {
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(r.data);
    } catch {
      parsedData = {};
    }
    return {
      id: r.id,
      title: r.title,
      template_id: r.template_id,
      theme_color: r.theme_color,
      font_family: r.font_family,
      created_at: r.created_at,
      updated_at: r.updated_at,
      data: parsedData,
    };
  });

  const events = db.getUserEvents(user.id);

  res.json({
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      statut: user.statut || 'actif',
      methode_connexion: user.methode_connexion || 'email',
      created_at: user.created_at,
      derniere_connexion: user.derniere_connexion || user.created_at,
      consentement_confidentialite_le: user.consentement_confidentialite_le,
    },
    resumes,
    events,
  });
});

// GET /api/admin/resumes/:id (Lecture seule d'un CV)
router.get('/resumes/:id', adminAuthMiddleware, (req: AdminRequest, res: Response): void => {
  const { id } = req.params;
  const resume = db.findResumeById(id);

  if (!resume) {
    res.status(404).json({ error: 'CV introuvable' });
    return;
  }

  const owner = db.findUserById(resume.user_id);

  db.createAuditLog({
    action: 'view_cv',
    target_type: 'resume',
    target_id: resume.id,
    details: `Consultation en lecture seule du CV "${resume.title}" (utilisateur: ${owner?.email || resume.user_id})`,
  });

  let parsedData: any = {};
  try {
    parsedData = JSON.parse(resume.data);
  } catch {
    parsedData = {};
  }

  res.json({
    resume: {
      id: resume.id,
      title: resume.title,
      template_id: resume.template_id,
      theme_color: resume.theme_color,
      font_family: resume.font_family,
      created_at: resume.created_at,
      updated_at: resume.updated_at,
      data: parsedData,
    },
    owner: owner
      ? {
          id: owner.id,
          full_name: owner.full_name,
          email: owner.email,
        }
      : null,
  });
});

// POST /api/admin/log-action (Enregistrement d'action client dans le journal d'audit)
router.post('/log-action', adminAuthMiddleware, (req: AdminRequest, res: Response): void => {
  const { action, target_type, target_id, details } = req.body;
  if (!action) {
    res.status(400).json({ error: 'Action requise' });
    return;
  }

  db.createAuditLog({
    action,
    target_type,
    target_id,
    details,
  });

  res.json({ success: true });
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
