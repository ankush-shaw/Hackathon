import { Router } from 'express';
import { DbStore } from '../services/dbStore.js';
import type { BrandRule } from '../types/index.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

export const guidelinesRouter = Router();

const AUTHORIZED_GOVERNANCE_ROLES = [
  'Brand Marketing Lead',
  'Compliance & Legal Counsel',
  'Admin',
  'Brand Manager',
  'Legal Reviewer'
];

// 1. Get all guidelines
guidelinesRouter.get('/', (req, res) => {
  const rules = DbStore.getRules();
  res.json(rules);
});

// 2. Add custom guideline rule — RBAC Enforced
guidelinesRouter.post('/', requireAuth, requireRoles(AUTHORIZED_GOVERNANCE_ROLES), (req, res) => {
  const { title, code, category, severity, matchPattern, description, clarificationNote, suggestedReplacement } = req.body;
  if (!title || !matchPattern) {
    return res.status(400).json({ error: 'title and matchPattern are required' });
  }

  const newRule: BrandRule = {
    id: `RULE-CUSTOM-${Date.now()}`,
    code: code || 'Custom Policy',
    title,
    category: category || 'prohibited',
    categoryLabel: category === 'prohibited' ? 'Critical: Prohibited Phrase' : 'Brand Standard',
    severity: severity || 'critical',
    description: description || 'Custom configured brand governance rule.',
    matchPattern,
    isRegex: true,
    clarificationNote,
    suggestedReplacement,
    evidenceRequired: category === 'evidence_required',
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const saved = DbStore.addRule(newRule);
  res.status(201).json(saved);
});

// 3. Edit guideline rule parameters — RBAC Enforced
guidelinesRouter.put('/:id', requireAuth, requireRoles(AUTHORIZED_GOVERNANCE_ROLES), (req, res) => {
  const updated = DbStore.updateRule(String(req.params.id), req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json(updated);
});

// 4. Delete guideline rule — RBAC Enforced
guidelinesRouter.delete('/:id', requireAuth, requireRoles(AUTHORIZED_GOVERNANCE_ROLES), (req, res) => {
  const success = DbStore.deleteRule(String(req.params.id));
  if (!success) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json({ message: 'Rule deleted successfully' });
});

// 5. Toggle rule active/inactive — RBAC Enforced
guidelinesRouter.patch('/:id/toggle', requireAuth, requireRoles(AUTHORIZED_GOVERNANCE_ROLES), (req, res) => {
  const rule = DbStore.toggleRule(String(req.params.id));
  if (!rule) {
    return res.status(404).json({ error: 'Rule not found' });
  }
  res.json(rule);
});

// 6. Create new guideline baseline version — RBAC Enforced
guidelinesRouter.post('/versions', requireAuth, requireRoles(AUTHORIZED_GOVERNANCE_ROLES), (req, res) => {
  const { tag, description } = req.body;
  if (!tag) {
    return res.status(400).json({ error: 'version tag (e.g. v2.5) is required' });
  }

  const newVersion = DbStore.createGuidelineVersion(tag, description || 'Official policy update');
  res.status(201).json(newVersion);
});

// 7. Get all guideline baseline versions
guidelinesRouter.get('/versions', (req, res) => {
  const versions = DbStore.getGuidelineVersions();
  res.json(versions);
});
