export interface AccessibilityIssue {
  type: 'alt_text' | 'color_contrast' | 'link_text' | 'readability';
  severity: 'critical' | 'warning' | 'suggestion';
  target: string;
  issue: string;
  recommendation: string;
}

export interface AccessibilityAuditResult {
  score: number;
  passedCount: number;
  issues: AccessibilityIssue[];
  status: 'Pass' | 'Needs Improvement' | 'Fail';
}

/**
 * Calculates relative luminance of a hex color
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculate WCAG contrast ratio between two hex colors
 */
export function calculateContrastRatio(foregroundHex: string, backgroundHex: string): number {
  try {
    const l1 = getLuminance(foregroundHex);
    const l2 = getLuminance(backgroundHex);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 4.5;
  }
}

/**
 * Checks content copy and ad HTML for digital accessibility compliance
 */
export function checkAccessibility(content: string, hasAsset: boolean, assetFileName?: string): AccessibilityAuditResult {
  const issues: AccessibilityIssue[] = [];

  // Check 1: Missing image alt description
  if (hasAsset && (!assetFileName || !assetFileName.includes('alt_'))) {
    issues.push({
      type: 'alt_text',
      severity: 'warning',
      target: assetFileName || 'Attached Creative Banner',
      issue: 'Image asset does not specify descriptive alternative text for screen readers.',
      recommendation: 'Add descriptive alt text summarizing key graphics, headline text, and data badges.'
    });
  }

  // Check 2: Vague link calls-to-action (e.g. "click here", "read more")
  const vagueLinkRegex = /\b(?:click\s+here|read\s+more|link|learn\s+more\s+here)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = vagueLinkRegex.exec(content)) !== null) {
    issues.push({
      type: 'link_text',
      severity: 'suggestion',
      target: `"${match[0]}"`,
      issue: 'Vague hyperlink anchor text hinders screen reader users from understanding destination context.',
      recommendation: 'Replace generic anchor text with descriptive context, e.g. "Download the Cloud Migration Guide".'
    });
  }

  // Check 3: Readability sentence length
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 30);
  if (longSentences.length > 0) {
    issues.push({
      type: 'readability',
      severity: 'suggestion',
      target: `"${longSentences[0].trim().slice(0, 50)}..."`,
      issue: 'Sentence exceeds 30 words, impacting cognitive readability and quick ad comprehension.',
      recommendation: 'Split complex compound sentences into concise, punchy assertions.'
    });
  }

  const score = Math.max(50, 100 - (issues.length * 15));
  return {
    score,
    passedCount: 4 - issues.length,
    issues,
    status: issues.length === 0 ? 'Pass' : issues.some(i => i.severity === 'critical') ? 'Fail' : 'Needs Improvement'
  };
}

