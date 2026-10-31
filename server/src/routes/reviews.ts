import { Router } from 'express';
import { DbStore } from '../services/dbStore.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

export const reviewsRouter = Router();

const AUTHORIZED_REVIEWER_ROLES = [
  'Brand Marketing Lead',
  'Compliance & Legal Counsel',
  'Admin',
  'Brand Manager',
  'Legal Reviewer'
];

// 1. Submit campaign for review
reviewsRouter.post('/:id/submit', (req, res) => {
  const campaign = DbStore.getCampaignById(String(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const { notes, user } = req.body;
  const authorName = user || (req.user ? `${req.user.name} (${req.user.role})` : 'Campaign Author');

  campaign.status = 'Submitted for Review';
  campaign.updatedAt = 'Just now';
  campaign.auditLog.unshift({
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    action: 'Submitted for Review',
    user: authorName,
    details: notes || 'Campaign dispatched to Brand & Legal review board.'
  });

  DbStore.saveCampaign(campaign);
  DbStore.addAuditLog('Dispatch to Legal', authorName, `Dispatched ${campaign.id}: ${notes || 'Formal review requested'}`);

  res.json(campaign);
});

// 2. Review Decision (Approve / Request Revision / Reject) — RBAC Enforced
reviewsRouter.post('/:id/decision', requireAuth, requireRoles(AUTHORIZED_REVIEWER_ROLES), (req, res) => {
  const campaign = DbStore.getCampaignById(String(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const { decision, reason, reviewer } = req.body;
  if (!decision || !reason) {
    return res.status(400).json({ error: 'decision and reason are required' });
  }

  const effectiveReviewer = reviewer || (req.user ? `${req.user.name} (${req.user.role})` : 'Authorized Reviewer');

  if (decision === 'Approved') {
    campaign.status = 'Approved';
    campaign.reviewedAt = 'Just now';
  } else if (decision === 'Changes Requested') {
    campaign.status = 'Revision Requested';
  } else if (decision === 'Rejected') {
    campaign.status = 'Rejected';
  }

  campaign.updatedAt = 'Just now';
  campaign.auditLog.unshift({
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    action: `Decision: ${decision}`,
    user: effectiveReviewer,
    details: reason
  });

  DbStore.saveCampaign(campaign);
  DbStore.addAuditLog(`Review ${decision}`, effectiveReviewer, `Campaign ${campaign.id}: ${reason}`);

  res.json(campaign);
});

// 3. Human Finding Override — RBAC Enforced
reviewsRouter.post('/:id/override', requireAuth, requireRoles(AUTHORIZED_REVIEWER_ROLES), (req, res) => {
  const campaign = DbStore.getCampaignById(String(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const { findingId, reason, reviewer } = req.body;
  if (!findingId || !reason) {
    return res.status(400).json({ error: 'findingId and reason are required' });
  }

  const finding = campaign.findings.find(f => f.id === findingId);
  if (!finding) {
    return res.status(404).json({ error: 'Finding not found on campaign' });
  }

  const effectiveReviewer = reviewer || (req.user ? `${req.user.name} (${req.user.role})` : 'Authorizing Reviewer');

  finding.status = 'overridden';
  finding.overrideReason = `${effectiveReviewer}: ${reason}`;

  campaign.updatedAt = 'Just now';
  campaign.auditLog.unshift({
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    action: 'Finding Overridden',
    user: effectiveReviewer,
    details: `Overrode finding "${finding.matchedText}": ${reason}`
  });

  DbStore.saveCampaign(campaign);
  DbStore.addAuditLog('Compliance Override', effectiveReviewer, `Overrode ${finding.ruleCode} on ${campaign.id}: ${reason}`);

  res.json(campaign);
});
