import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all resume routes
router.use(authMiddleware);

// Get all resumes for current user
router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const rows = db.findResumesByUserId(userId);

    const resumes = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      templateId: r.template_id,
      theme: {
        primaryColor: r.theme_color,
        fontFamily: r.font_family,
      },
      data: JSON.parse(r.data),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json({ resumes });
  } catch (error: any) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de vos CV.' });
  }
});

// Get single resume by id
router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const row = db.findResumeByIdAndUserId(id, userId);

    if (!row) {
      res.status(404).json({ error: 'CV non trouvé ou non autorisé.' });
      return;
    }

    const resume = {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      templateId: row.template_id,
      theme: {
        primaryColor: row.theme_color,
        fontFamily: row.font_family,
      },
      data: JSON.parse(row.data),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    res.json({ resume });
  } catch (error: any) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du CV.' });
  }
});

// Create new resume
router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { title, templateId, theme, data } = req.body;

    const resumeId = crypto.randomUUID();
    const resumeTitle = title?.trim() || 'Mon Nouveau CV';
    const chosenTemplate = templateId || 'modern-sidebar';
    const primaryColor = theme?.primaryColor || '#0d9488';
    const fontFamily = theme?.fontFamily || 'inter';
    const jsonData = JSON.stringify(data || {});
    const now = new Date().toISOString();

    const created = db.createResume({
      id: resumeId,
      user_id: userId,
      title: resumeTitle,
      template_id: chosenTemplate,
      theme_color: primaryColor,
      font_family: fontFamily,
      data: jsonData,
      created_at: now,
      updated_at: now,
    });

    res.status(201).json({
      message: 'CV créé avec succès',
      resume: {
        id: created.id,
        userId,
        title: created.title,
        templateId: created.template_id,
        theme: {
          primaryColor: created.theme_color,
          fontFamily: created.font_family,
        },
        data: data || {},
        createdAt: created.created_at,
        updatedAt: created.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error creating resume:', error);
    res.status(500).json({ error: 'Erreur lors de la création du CV.' });
  }
});

// Update resume (Auto-save)
router.put('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, templateId, theme, data } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (templateId !== undefined) updates.template_id = templateId;
    if (theme?.primaryColor !== undefined) updates.theme_color = theme.primaryColor;
    if (theme?.fontFamily !== undefined) updates.font_family = theme.fontFamily;
    if (data !== undefined) updates.data = JSON.stringify(data);

    const updated = db.updateResume(id, userId, updates);

    if (!updated) {
      res.status(404).json({ error: 'CV non trouvé.' });
      return;
    }

    res.json({
      message: 'CV mis à jour',
      updatedAt: updated.updated_at,
    });
  } catch (error: any) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du CV.' });
  }
});

// Duplicate resume
router.post('/:id/duplicate', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const source = db.findResumeByIdAndUserId(id, userId);

    if (!source) {
      res.status(404).json({ error: 'CV source introuvable.' });
      return;
    }

    const newId = crypto.randomUUID();
    const newTitle = `${source.title} (Copie)`;
    const now = new Date().toISOString();

    db.createResume({
      id: newId,
      user_id: userId,
      title: newTitle,
      template_id: source.template_id,
      theme_color: source.theme_color,
      font_family: source.font_family,
      data: source.data,
      created_at: now,
      updated_at: now,
    });

    res.status(201).json({
      message: 'CV dupliqué avec succès',
      newId,
    });
  } catch (error: any) {
    console.error('Error duplicating resume:', error);
    res.status(500).json({ error: 'Erreur lors de la duplication du CV.' });
  }
});

// Delete resume
router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = db.deleteResume(id, userId);

    if (!deleted) {
      res.status(404).json({ error: 'CV non trouvé ou déjà supprimé.' });
      return;
    }

    res.json({ message: 'CV supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du CV.' });
  }
});

export default router;
