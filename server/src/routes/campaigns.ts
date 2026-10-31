import { Router } from 'express';
import { z } from 'zod';
import { DbStore } from '../services/dbStore.js';
import { runHybridComplianceScan } from '../engine/hybridEngine.js';
import { calculateCampaignDrift } from '../engine/driftDetector.js';
import type { Campaign, CampaignRevision } from '../types/index.js';

export const campaignRouter = Router();

const scanRequestSchema = z.object({
  content: z.string(),
  channel: z.string().default('LinkedIn Ad'),
  campaignName: z.string().optional()
});

// 1. Run Scan (Without saving yet)
campaignRouter.post('/scan', async (req, res, next) => {
  try {
    const { content, channel } = scanRequestSchema.parse(req.body);
    const rules = DbStore.getRules();
    const evidence = DbStore.getEvidence();

    const scanResult = await runHybridComplianceScan(content, channel, rules, evidence);
    res.json(scanResult);
  } catch (err) {
    next(err);
  }
});

// 2. Get all campaigns
campaignRouter.get('/', (req, res) => {
  const campaigns = DbStore.getCampaigns();
  res.json(campaigns);
});

// 3. Get single campaign
campaignRouter.get('/:id', (req, res) => {
  const campaign = DbStore.getCampaignById(String(req.params.id));
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json(campaign);
});

// 4. Create new campaign
campaignRouter.post('/', async (req, res, next) => {
  try {
    const { content, channel, campaignName, headline, assetFileName, assetFileUrl, creativeAnalysis } = req.body;
    if (!content || !campaignName) {
      return res.status(400).json({ error: 'content and campaignName are required' });
    }

    const rules = DbStore.getRules();
    const evidence = DbStore.getEvidence();
    const scanResult = await runHybridComplianceScan(content, channel, rules, evidence);

    const existing = DbStore.getCampaigns();
    const nextNum = existing.length + 8925;
    const campaignId = `#BG-${nextNum}`;

    const initialRevision: CampaignRevision = {
      version: 1,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: scanResult.score,
      findings: scanResult.findings,
      claims: scanResult.claims
    };

    const newCampaign: Campaign = {
      id: campaignId,
      campaignName,
      targetChannel: channel || 'LinkedIn Ad',
      headline,
      content,
      activePolicyVersion: 'Acme Global 2025 v2.4',
      status: scanResult.status,
      brandHealthScore: scanResult.score,
      findings: scanResult.findings,
      claims: scanResult.claims,
      versions: [initialRevision],
      currentVersion: 1,
      hasCreativeAsset: !!(assetFileName || assetFileUrl || creativeAnalysis),
      assetFileName,
      assetFileUrl,
      creativeAnalysis,
      auditLog: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Hybrid Scan Completed',
          user: 'BrandGuard AI Engine',
          details: scanResult.summaryText
        }
      ],
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    DbStore.saveCampaign(newCampaign);
    DbStore.addAuditLog('Campaign Created', 'Author', `Created campaign ${campaignId} (${campaignName})`);

    res.status(201).json(newCampaign);
  } catch (err) {
    next(err);
  }
});

// 5. Re-scan modified campaign content & track drift diff
campaignRouter.put('/:id/rescan', async (req, res, next) => {
  try {
    const rawId = String(req.params.id || req.body.id);
    const campaign = DbStore.getCampaignById(rawId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const rules = DbStore.getRules();
    const evidence = DbStore.getEvidence();
    const scanResult = await runHybridComplianceScan(content, campaign.targetChannel, rules, evidence);

    const previousRevision = campaign.versions[campaign.versions.length - 1];
    const diff = calculateCampaignDrift(previousRevision, content, scanResult.score, scanResult.findings);

    const newVersionNum = campaign.currentVersion + 1;
    const newRevision: CampaignRevision = {
      version: newVersionNum,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: scanResult.score,
      findings: scanResult.findings,
      claims: scanResult.claims,
      diff
    };

    campaign.content = content;
    campaign.brandHealthScore = scanResult.score;
    campaign.status = scanResult.status;
    campaign.findings = scanResult.findings;
    campaign.claims = scanResult.claims;
    campaign.versions.push(newRevision);
    campaign.currentVersion = newVersionNum;
    campaign.updatedAt = 'Just now';
    campaign.auditLog.unshift({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Revision v${newVersionNum} Rescanned`,
      user: 'BrandGuard AI Engine',
      details: `Score: ${scanResult.score}/100. ${diff.modifiedClaims.length} claim changes detected.`
    });

    DbStore.saveCampaign(campaign);
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

// Fallback PUT handler if browser drops hash (#BG-xxxx/rescan) from URL path
campaignRouter.put('/', async (req, res, next) => {
  try {
    const { id, content } = req.body;
    if (!id || !content) {
      return res.status(400).json({ error: 'id and content are required' });
    }
    const campaign = DbStore.getCampaignById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const rules = DbStore.getRules();
    const evidence = DbStore.getEvidence();
    const scanResult = await runHybridComplianceScan(content, campaign.targetChannel, rules, evidence);

    const previousRevision = campaign.versions[campaign.versions.length - 1];
    const diff = calculateCampaignDrift(previousRevision, content, scanResult.score, scanResult.findings);

    const newVersionNum = campaign.currentVersion + 1;
    const newRevision: CampaignRevision = {
      version: newVersionNum,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: scanResult.score,
      findings: scanResult.findings,
      claims: scanResult.claims,
      diff
    };

    campaign.content = content;
    campaign.brandHealthScore = scanResult.score;
    campaign.status = scanResult.status;
    campaign.findings = scanResult.findings;
    campaign.claims = scanResult.claims;
    campaign.versions.push(newRevision);
    campaign.currentVersion = newVersionNum;
    campaign.updatedAt = 'Just now';
    campaign.auditLog.unshift({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: `Revision v${newVersionNum} Rescanned`,
      user: 'BrandGuard AI Engine',
      details: `Score: ${scanResult.score}/100. ${diff.modifiedClaims.length} claim changes detected.`
    });

    DbStore.saveCampaign(campaign);
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

// 6. Delete campaign
campaignRouter.delete('/:id', (req, res) => {
  const success = DbStore.deleteCampaign(String(req.params.id));
  if (!success) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json({ message: 'Deleted successfully' });
});

