import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db.js';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Tous les champs sont requis (nom complet, email, mot de passe).' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = db.findUserByEmail(cleanEmail);
    if (existingUser) {
      res.status(409).json({ error: 'Un compte avec cette adresse email existe déjà.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    const createdUser = db.createUser({
      id: userId,
      email: cleanEmail,
      password_hash: passwordHash,
      full_name: fullName.trim(),
      created_at: new Date().toISOString(),
    });

    const token = generateToken({ id: userId, email: cleanEmail });

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.full_name,
      },
    });
  } catch (error: any) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création du compte.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Veuillez saisir votre email et votre mot de passe.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(cleanEmail);

    if (!user) {
      res.status(401).json({ error: 'Adresse email ou mot de passe incorrect.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Adresse email ou mot de passe incorrect.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la connexion.' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Non authentifié.' });
      return;
    }

    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé.' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});

export default router;
