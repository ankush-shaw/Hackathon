import type { 
  BrandRule, 
  EvidenceRecord, 
  Finding, 
  ExtractedClaim, 
  ReviewStatus,
  Severity 
} from '../types/index.js';
import { runDeterministicChecks } from './deterministicRules.js';
import { extractClaims } from '../ai/claimExtractor.js';
import { verifyClaim, generateCompliantAlternative } from '../ai/claimVerifier.js';

export interface HybridScanResult {
  score: number;
  status: ReviewStatus;
  findings: Finding[];
  claims: ExtractedClaim[];
  summaryText: string;
  stats: {
    criticalCount: number;
    unverifiedCount: number;
    suggestionCount: number;
    verifiedCount: number;
    totalClaims: number;
    supportedClaims: number;
    unsupportedClaims: number;
    contradictedClaims: number;
    expiredClaims: number;
    uncertainClaims: number;
  };
}

export async function runHybridComplianceScan(
  text: string,
  channel: string = 'LinkedIn Ad',
  rules: BrandRule[],
  evidenceList: EvidenceRecord[]
): Promise<HybridScanResult> {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      status: 'Draft',
      findings: [],
      claims: [],
      summaryText: 'No marketing content provided for compliance scanning.',
      stats: {
        criticalCount: 0,
        unverifiedCount: 0,
        suggestionCount: 0,
        verifiedCount: 0,
        totalClaims: 0,
        supportedClaims: 0,
        unsupportedClaims: 0,
        contradictedClaims: 0,
        expiredClaims: 0,
        uncertainClaims: 0
      }
    };
  }

  // 1. Run Deterministic Guideline & Regex Checks
  const deterministicFindings = runDeterministicChecks(text, channel, rules, evidenceList);

  // 2. Run AI Claim Extraction
  const extractedClaims = await extractClaims(text);

  // 3. Verify each extracted claim against the Evidence Library (Concurrent Execution)
  let supportedCount = 0;
  let unsupportedCount = 0;
  let contradictedCount = 0;
  let expiredCount = 0;
  let uncertainCount = 0;

  const verifications = await Promise.all(
    extractedClaims.map(claim => verifyClaim(claim, evidenceList))
  );

  for (let i = 0; i < extractedClaims.length; i++) {
    const claim = extractedClaims[i];
    const verification = verifications[i];
    claim.verification = verification;

    if (verification.status === 'SUPPORTED') supportedCount++;
    else if (verification.status === 'UNSUPPORTED') unsupportedCount++;
    else if (verification.status === 'CONTRADICTED') contradictedCount++;
    else if (verification.status === 'EXPIRED') expiredCount++;
    else if (verification.status === 'UNCERTAIN') uncertainCount++;

    // If an AI claim identified a severe issue not already covered by deterministic findings, integrate it
    const alreadyCovered = deterministicFindings.some(f => 
      Math.abs(f.startIndex - claim.startIndex) < 10 || f.matchedText.includes(claim.matchedText) || claim.matchedText.includes(f.matchedText)
    );

    if (!alreadyCovered && verification.status !== 'SUPPORTED') {
      let sev: Severity = 'warning';
      let ruleCode = 'AI-CLAIM-VERIFY';
      let catLabel = 'Evidence Verification';

      if (verification.status === 'CONTRADICTED') {
        sev = 'critical';
        ruleCode = 'FTC/LEGAL CONFLICT';
        catLabel = 'Critical: Claim Contradicted by Evidence';
      } else if (verification.status === 'EXPIRED') {
        sev = 'warning';
        ruleCode = 'EXPIRED EVIDENCE';
        catLabel = 'Warning: Supporting Evidence Expired';
      } else if (verification.status === 'UNCERTAIN') {
        sev = 'suggestion';
        ruleCode = 'UNCERTAIN EVIDENCE';
        catLabel = 'Recommendation: Ambiguous Claim';
      }

      deterministicFindings.push({
        id: `find-claim-${claim.id}`,
        ruleCode,
        category: 'evidence_required',
        categoryLabel: catLabel,
        severity: sev,
        originalClaim: `"${claim.matchedText}"`,
        matchedText: claim.matchedText,
        startIndex: claim.startIndex,
        endIndex: claim.endIndex,
        issue: verification.explanation,
        clarificationNote: verification.missingInformation || verification.explanation,
        evidenceReference: verification.matchedEvidenceCode ? `Referenced: ${verification.matchedEvidenceCode}` : undefined,
        suggestedAlternative: verification.suggestedAlternative || (
          verification.matchedEvidenceCode 
            ? `${claim.matchedText} [Ref: ${verification.matchedEvidenceCode}]`
            : claim.matchedText.toLowerCase().includes('uptime') || claim.matchedText.toLowerCase().includes('99.99%')
            ? `${claim.matchedText} (under SLA terms [Ref: SLA-2025-V2])`
            : generateCompliantAlternative(claim.matchedText, claim.category)
        ),
        status: 'pending'
      });
    }
  }

  // Sort findings by position in text
  deterministicFindings.sort((a, b) => a.startIndex - b.startIndex);

  // 4. Calculate Final Severity Statistics
  let criticalCount = 0;
  let unverifiedCount = 0;
  let suggestionCount = 0;
  let verifiedCount = 0;

  for (const f of deterministicFindings) {
    if (f.severity === 'critical') criticalCount++;
    else if (f.severity === 'warning') unverifiedCount++;
    else if (f.severity === 'suggestion') suggestionCount++;
    else if (f.severity === 'verified') verifiedCount++;
  }

  // 5. Dynamic Mathematical Brand Health Score
  let calculatedScore = 100;
  calculatedScore -= criticalCount * 26;
  calculatedScore -= unverifiedCount * 14;
  calculatedScore -= suggestionCount * 6;
  calculatedScore -= expiredCount * 12;
  calculatedScore -= contradictedCount * 20;

  calculatedScore = Math.max(12, Math.min(100, calculatedScore));

  // Determine overall status
  let overallStatus: ReviewStatus = 'Approved';
  if (criticalCount > 0 || contradictedCount > 0) {
    overallStatus = 'Action Required';
  } else if (unverifiedCount > 0 || expiredCount > 0) {
    overallStatus = 'Needs Evidence';
  } else if (suggestionCount > 0 || uncertainCount > 0) {
    overallStatus = 'Revision Requested';
  } else {
    overallStatus = 'Approved';
  }

  const summaryText = `${criticalCount} Rule Violation${criticalCount === 1 ? '' : 's'}, ${unverifiedCount + expiredCount} Evidence Issue${unverifiedCount + expiredCount === 1 ? '' : 's'}, ${suggestionCount} Tone/Brand Recommendation${suggestionCount === 1 ? '' : 's'}. Total Claims Extracted: ${extractedClaims.length}.`;

  return {
    score: calculatedScore,
    status: overallStatus,
    findings: deterministicFindings,
    claims: extractedClaims,
    summaryText,
    stats: {
      criticalCount,
      unverifiedCount,
      suggestionCount,
      verifiedCount,
      totalClaims: extractedClaims.length,
      supportedClaims: supportedCount,
      unsupportedClaims: unsupportedCount,
      contradictedClaims: contradictedCount,
      expiredClaims: expiredCount,
      uncertainClaims: uncertainCount
    }
  };
}

