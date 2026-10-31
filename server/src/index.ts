import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { campaignRouter } from './routes/campaigns.js';
import { guidelinesRouter } from './routes/guidelines.js';
import { evidenceRouter } from './routes/evidence.js';
import { reviewsRouter } from './routes/reviews.js';
import { assetsRouter } from './routes/assets.js';
import { auditRouter, analyticsRouter, authRouter } from './routes/analytics.js';
import { DbStore } from './services/dbStore.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(authenticate);

// Static uploads directory
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Static public directory (favicon, icons)
const publicDir = path.resolve(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Favicon handler
app.get('/favicon.ico', (req, res) => {
  const icoPath = path.resolve(publicDir, 'favicon.ico');
  const svgPath = path.resolve(publicDir, 'favicon.svg');
  if (fs.existsSync(icoPath)) {
    return res.sendFile(icoPath);
  } else if (fs.existsSync(svgPath)) {
    res.type('image/svg+xml');
    return res.sendFile(svgPath);
  }
  res.status(204).end();
});

// Health check with real database connectivity probe
app.get('/api/health', async (req, res) => {
  const dbStatus = await DbStore.getDatabaseStatus();
  res.json({
    status: 'ok',
    service: 'BrandGuard AI Compliance API',
    version: '4.6.1-production',
    persistenceMode: dbStatus.mode,
    supabaseConfigured: dbStatus.supabaseConfigured,
    supabaseConnected: dbStatus.supabaseConnected,
    geminiEnabled: !!(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0)
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/guidelines', guidelinesRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/analytics', analyticsRouter);

// Static frontend build (dist) support when built
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Global Error Handler
app.use(errorHandler);

// Catch-all route handler for SPA and API info (Express 5 safe)
app.use((req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
  }

  const indexPath = path.resolve(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.json({
    name: 'BrandGuard AI Compliance Platform API',
    status: 'active',
    health: '/api/health',
    frontendDevServer: 'http://localhost:5173'
  });
});

const PORT = env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🛡️  BrandGuard AI Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI Engine: ${env.GEMINI_API_KEY ? 'Configured & Active' : 'Offline Heuristic Mode (Set GEMINI_API_KEY in .env)'}`);
  await DbStore.initialize();
});
