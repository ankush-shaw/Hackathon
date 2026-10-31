import type { BrandRule, Finding, EvidenceRecord } from '../types/index.js';

/**
 * Runs deterministic pattern matching against active brand guidelines
 */
export function runDeterministicChecks(
  text: string,
  channel: string = 'LinkedIn Ad',
  rules: BrandRule[],
  evidenceList: EvidenceRecord[]
): Finding[] {
  if (!text || text.trim().length === 0) return [];

  const findings: Finding[] = [];
  const activeRules = rules.filter(r => r.isActive);

  for (const rule of activeRules) {
    if (rule.applicableChannels && rule.applicableChannels.length > 0) {
      if (!rule.applicableChannels.includes(channel)) {
        continue;
      }
    }

    try {
      const regex = new RegExp(rule.matchPattern, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const matchedText = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + matchedText.length;

        let matchedEvidence: EvidenceRecord | undefined;
        if (rule.requiredEvidenceCategory) {
          matchedEvidence = evidenceList.find(
            e => e.category.toLowerCase() === rule.requiredEvidenceCategory?.toLowerCase()
          );
        }

        let finalSeverity = rule.severity;
        let evidenceRef = '';

        if (rule.severity === 'verified') {
          evidenceRef = matchedEvidence?.claimOrFact || 'Supported by SLA documentation';
        } else if (rule.evidenceRequired) {
          if (matchedEvidence && matchedEvidence.verificationStatus === 'verified') {
            finalSeverity = 'verified';
            evidenceRef = matchedEvidence.claimOrFact;
          } else {
            finalSeverity = 'warning';
            evidenceRef = `Evidence repository searched: ${evidenceList.length} records, 0 matching audited benchmark citations found.`;
          }
        } else if (rule.category === 'trademark') {
          const tmEvid = evidenceList.find(e => e.category === 'Product Nomenclature');
          evidenceRef = tmEvid ? tmEvid.sourceReference : 'Glossary v2.4 Product Catalog';
        }

        findings.push({
          id: `find-${rule.id}-${startIndex}`,
          ruleId: rule.id,
          ruleCode: rule.code,
          category: rule.category,
          categoryLabel: rule.categoryLabel,
          severity: finalSeverity,
          originalClaim: `"${matchedText}"`,
          matchedText,
          startIndex,
          endIndex,
          issue: rule.description,
          clarificationNote: rule.clarificationNote,
          evidenceReference: evidenceRef || undefined,
          suggestedAlternative: rule.suggestedReplacement,
          actionLabel: rule.suggestedReplacement ? `Replace with "${rule.suggestedReplacement}"` : undefined,
          status: 'pending'
        });
      }
    } catch (err) {
      console.error(`Regex error on rule ${rule.code}:`, err);
    }
  }

  // Sort by index
  findings.sort((a, b) => a.startIndex - b.startIndex);
  return findings;
}

/**
 * Replace a finding in text safely using character boundaries
 */
export function applySuggestionToText(originalText: string, finding: Finding): string {
  if (!finding.suggestedAlternative || !finding.matchedText) {
    return originalText;
  }

  // Check if the matchedText is wrapped in previous redundant placeholders like "verified ... [Audited Benchmark Required]"
  const cleanMatched = finding.matchedText.trim();
  const redundantPattern = new RegExp('(?:verified\\s+)+' + cleanMatched.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '(?:\\s*\\[Audited Benchmark Required\\])+', 'gi');
  if (redundantPattern.test(originalText)) {
    return originalText.replace(redundantPattern, finding.suggestedAlternative);
  }

  const start = finding.startIndex;
  const end = finding.endIndex;

  if (start >= 0 && end <= originalText.length && originalText.slice(start, end) === finding.matchedText) {
    return originalText.slice(0, start) + finding.suggestedAlternative + originalText.slice(end);
  }

  return originalText.replace(finding.matchedText, finding.suggestedAlternative);
}

/**
 * Apply all suggestions in reverse index order
 */
export function applyAllSuggestionsToText(originalText: string, findings: Finding[]): string {
  const actionable = [...findings]
    .filter(f => f.suggestedAlternative && f.severity !== 'verified')
    .sort((a, b) => b.startIndex - a.startIndex);

  let current = originalText;
  for (const f of actionable) {
    current = applySuggestionToText(current, f);
  }
  return current;
}

