import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';

dotenv.config();

const app = express();

// Initialize DB
initDB();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Increase body size limit for base64 photo avatars
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'iziCV API', timestamp: new Date().toISOString() });
});

// Serve client in production if built
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('iziCV API Server Running. Please start Vite dev server on port 5173.');
    }
  });
});

export default app;
