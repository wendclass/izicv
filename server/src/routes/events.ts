import { Router, Request, Response } from 'express';
import { db } from '../db.js';

const router = Router();

// POST /api/events
// Ingests application events from the client (PWA, exports, logins, errors, etc.)
router.post('/', (req: Request, res: Response): void => {
  try {
    const { event_name, user_id, session_id, properties, device_type } = req.body;

    if (!event_name || typeof event_name !== 'string') {
      res.status(400).json({ error: 'event_name requis' });
      return;
    }

    // Allowed event types per specification (Section 6)
    const allowedEvents = [
      'inscription',
      'connexion',
      'cv_cree',
      'cv_modifie',
      'modele_change',
      'couleur_change',
      'pdf_telecharge',
      'pdf_partage',
      'pwa_installee',
      'erreur_export',
    ];

    if (!allowedEvents.includes(event_name)) {
      res.status(400).json({ error: 'Nom d événement non reconnu' });
      return;
    }

    // Detect country from Vercel / Cloud headers
    const vercelCountry = req.headers['x-vercel-ip-country'];
    const cfCountry = req.headers['cf-ipcountry'];
    const detectedCountry =
      typeof vercelCountry === 'string'
        ? vercelCountry.toUpperCase()
        : typeof cfCountry === 'string'
        ? cfCountry.toUpperCase()
        : (req.body.country || 'Inconnu');

    // Never store resume contents inside event properties (Section 6)
    const sanitizedProps = properties && typeof properties === 'object' ? { ...properties } : {};
    delete sanitizedProps.data;
    delete sanitizedProps.content;
    delete sanitizedProps.personalInfo;
    delete sanitizedProps.experiences;
    delete sanitizedProps.educations;

    // Normalize device type
    let normalizedDevice: 'android' | 'ios' | 'desktop' | 'unknown' = 'unknown';
    if (device_type === 'android' || device_type === 'ios' || device_type === 'desktop') {
      normalizedDevice = device_type;
    }

    db.addEvent({
      user_id: typeof user_id === 'string' ? user_id : undefined,
      session_id: typeof session_id === 'string' ? session_id : undefined,
      event_name,
      properties: sanitizedProps,
      device_type: normalizedDevice,
      country: detectedCountry,
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Erreur ingestion event:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
