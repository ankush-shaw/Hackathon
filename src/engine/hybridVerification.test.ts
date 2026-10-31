import { describe, it, expect } from 'vitest';
import { runHybridComplianceScan } from '../../server/src/engine/hybridEngine';
import { isEvidenceExpired } from '../../server/src/ai/claimVerifier';
import { calculateContrastRatio, checkAccessibility } from '../../server/src/services/accessibilityChecker';
import { calculateCampaignDrift } from '../../server/src/engine/driftDetector';
import { DEFAULT_RULES } from './rules';
import { DEFAULT_EVIDENCE } from './evidence';

describe('BrandGuard AI — Hybrid Verification & Governance Engine', () => {
  it('correctly classifies a claim substantiated by active SLA as SUPPORTED', async () => {
    const text = 'Our patented zero scheduled downtime architecture powers mission-critical cloud tiers.';
    const result = await runHybridComplianceScan(text, 'LinkedIn Ad', DEFAULT_RULES, DEFAULT_EVIDENCE);

    expect(result.claims.length).toBeGreaterThanOrEqual(1);
    const slaClaim = result.claims.find(c => c.matchedText.includes('zero scheduled downtime'));
    expect(slaClaim).toBeDefined();
    expect(slaClaim?.verification?.status).toBe('SUPPORTED');
    expect(slaClaim?.verification?.matchedEvidenceCode).toBe('SLA-2025-V2');
  });

  it('correctly classifies an unverified superlative claim as UNSUPPORTED', async () => {
    const text = 'Introducing our new platform. It is unequivocally the fastest on the market.';
    const result = await runHybridComplianceScan(text, 'LinkedIn Ad', DEFAULT_RULES, DEFAULT_EVIDENCE);

    const fastestClaim = result.claims.find(c => c.matchedText.includes('fastest on the market'));
    expect(fastestClaim).toBeDefined();
    expect(fastestClaim?.verification?.status).toBe('UNSUPPORTED');
    expect(fastestClaim?.verification?.missingInformation).toBeDefined();
  });

  it('correctly classifies an impossible guarantee or absolute security claim as CONTRADICTED', async () => {
    const text = 'Experience 100% unhackable cloud database storage with 10x guaranteed returns!';
    const result = await runHybridComplianceScan(text, 'LinkedIn Ad', DEFAULT_RULES, DEFAULT_EVIDENCE);

    const contradictedClaims = result.claims.filter(c => c.verification?.status === 'CONTRADICTED');
    expect(contradictedClaims.length).toBeGreaterThanOrEqual(1);
  });

  it('identifies expired evidence records and marks them EXPIRED', () => {
    const expiredRecord = DEFAULT_EVIDENCE.find(e => e.code === 'BENCH-2023-EXPIRED');
    expect(expiredRecord).toBeDefined();
    expect(isEvidenceExpired(expiredRecord! as any)).toBe(true);

    const activeRecord = DEFAULT_EVIDENCE.find(e => e.code === 'SLA-2025-V2');
    expect(activeRecord).toBeDefined();
    expect(isEvidenceExpired(activeRecord! as any)).toBe(false);
  });

  it('calculates campaign drift between revisions with word and score diffs', () => {
    const prevRev = {
      version: 1,
      content: 'Boost enterprise productivity by 10x guaranteed with Acme Cloud Platform.',
      timestamp: '10:00 AM',
      score: 54,
      findings: [
        {
          id: '1',
          ruleCode: 'Policy 4.2',
          category: 'prohibited' as const,
          categoryLabel: 'Critical',
          severity: 'critical' as const,
          originalClaim: '10x guaranteed',
          matchedText: '10x guaranteed',
          startIndex: 33,
          endIndex: 47,
          issue: 'Prohibited',
          suggestedAlternative: 'accelerate productivity',
          status: 'pending' as const
        }
      ]
    };

    const newContent = 'Accelerate enterprise productivity with Acme CloudSphere™.';
    const drift = calculateCampaignDrift(prevRev as any, newContent, 100, []);

    expect(drift.scoreDiff).toBe(46);
    expect(drift.newScore).toBe(100);
    expect(drift.removedWords.some(w => w.includes('10x guaranteed'))).toBe(true);
    expect(drift.modifiedClaims).toContain('Resolved claim: "10x guaranteed"');
  });

  it('performs WCAG contrast checks and digital accessibility linting', () => {
    // Contrast check (Blue #2563EB on White #FFFFFF)
    const ratio = calculateContrastRatio('#2563EB', '#FFFFFF');
    expect(ratio).toBeGreaterThan(4.5); // Meets WCAG AA

    // Alt text & CTA accessibility
    const result = checkAccessibility('Click here to learn more without downtime.', true, 'banner.jpg');
    expect(result.issues.some(i => i.type === 'alt_text')).toBe(true);
    expect(result.issues.some(i => i.type === 'link_text')).toBe(true);
  });
});
