import { Router } from 'express';
import { DbStore } from '../services/dbStore.js';

export const auditRouter = Router();

auditRouter.get('/', (req, res) => {
  const logs = DbStore.getAuditLogs();
  res.json(logs);
});

export const analyticsRouter = Router();

analyticsRouter.get('/dashboard', (req, res) => {
  const metrics = DbStore.getMetrics();
  res.json(metrics);
});

export const authRouter = Router();

authRouter.post('/signin', (req, res) => {
  const { email, name, company, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and full name are required' });
  }

  const user = {
    id: `user-${Date.now()}`,
    name,
    email,
    company: company || 'Acme Global Corp',
    role: role || 'Brand Marketing Lead'
  };

  const token = Buffer.from(JSON.stringify(user)).toString('base64');

  DbStore.addAuditLog('User Sign-In', name, `Signed in as ${user.role} (${email})`);
  res.json({ user, token });
});

authRouter.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated', user: null });
  }
  res.json({ user: req.user });
});

