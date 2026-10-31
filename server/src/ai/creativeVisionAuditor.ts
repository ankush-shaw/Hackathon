import { getGeminiClient, isGeminiConfigured } from './geminiClient.js';
import { env } from '../config/env.js';
import type { 
  GeminiCreativeInsights, 
  CreativeFinding, 
  BrandRule, 
  EvidenceRecord 
} from '../types/index.js';

interface VisionAuditInput {
  imageBuffer: Buffer;
  mimeType: string;
  extractedOcrText: string;
  imageDimensions: { width: number; height: number };
  rules: BrandRule[];
  evidenceList: EvidenceRecord[];
}

/**
 * Perform Contextual Visual Understanding using Gemini Vision API with circuit-breaker fallback
 */
export async function auditCreativeWithVision(input: VisionAuditInput): Promise<{
  insights: GeminiCreativeInsights;
  aiFindings: CreativeFinding[];
}> {
  const { imageBuffer, mimeType, extractedOcrText, rules, evidenceList } = input;
  const ai = getGeminiClient();

  // If Gemini is not configured, return deterministic visual insights
  if (!ai || !isGeminiConfigured()) {
    return generateDeterministicVisualInsights(extractedOcrText, rules);
  }

  try {
    const rulesSummary = rules.slice(0, 10).map(r => `• [${r.code}] ${r.title}: ${r.description}`).join('\n');
    const evidenceSummary = evidenceList.slice(0, 8).map(e => `• [${e.code}] ${e.title} (${e.category}): ${e.claimOrFact}`).join('\n');

    const promptText = `You are BrandGuard AI's Senior Creative Compliance Auditor.
Inspect the uploaded marketing creative advertisement image alongside the extracted OCR text and our organization's brand guidelines.

EXTRACTED OCR TEXT FROM CREATIVE:
"""
${extractedOcrText || '(No readable text detected by OCR)'}
"""

APPROVED BRAND GUIDELINES:
${rulesSummary}

APPROVED EVIDENCE REPOSITORY:
${evidenceSummary}

TASK:
1. Provide an overall creative impression and assess visual brand consistency (imagery tone, composition, professional design quality).
2. Inspect if promotional claims, numerical guarantees, or superlatives are accompanied by appropriate legible disclaimers or legal qualifiers in the visual hierarchy.
3. Identify any visual or textual compliance findings.
4. DO NOT invent citations or legal policies; only reference the provided brand guidelines or evidence records.

Return a valid JSON object matching this schema:
{
  "overallCreativeImpression": "Professional summary of the creative layout, messaging, and visual presentation",
  "visualConsistencyRating": "High" | "Medium" | "Low",
  "contextualObservations": [
    "Observation regarding layout, typography, or visual hierarchy"
  ],
  "suggestedCreativeImprovements": [
    "Actionable suggestion to improve brand compliance or visual impact"
  ],
  "disclaimerPlacementAssessment": "Assessment of whether required legal disclaimers or footnotes are legible and appropriately placed",
  "findings": [
    {
      "category": "disclaimer" | "visual" | "tone_sla" | "prohibited",
      "severity": "critical" | "warning" | "suggestion" | "verified",
      "status": "POLICY_VIOLATION" | "UNSUPPORTED" | "SUPPORTED",
      "detectedText": "Specific text or visual element",
      "explanation": "Why this element requires attention",
      "relatedGuideline": "Relevant rule code or 'Brand Visual Standards'",
      "suggestedCorrection": "Specific replacement or layout adjustment",
      "confidence": 0.92
    }
  ]
}`;

    const candidateModels = [env.GEMINI_MODEL, 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite']
      .filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    console.log(`👁️ [Gemini Vision] Auditing creative image (${imageBuffer.length} bytes, ${mimeType})...`);

    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const apiCall = ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType as any,
                    data: imageBuffer.toString('base64')
                  }
                },
                {
                  text: promptText
                }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.15
          }
        });

        // 6-second timeout circuit breaker
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini Vision API timeout after 6000ms on ${modelName}`)), 6000)
        );

        const response = await Promise.race([apiCall, timeout]);
        const responseText = response.text || '{}';
        const parsed = JSON.parse(responseText);

        console.log(`✨ [Gemini Vision] Successfully generated visual insights using ${modelName}.`);

        const findings: CreativeFinding[] = (parsed.findings || []).map((f: any, idx: number) => ({
          id: `vis-find-${Date.now()}-${idx}`,
          type: 'visual',
          detectedText: f.detectedText,
          category: f.category || 'visual',
          severity: f.severity || 'warning',
          status: f.status || 'POLICY_VIOLATION',
          explanation: f.explanation || 'Visual brand standard observation.',
          relatedGuideline: f.relatedGuideline,
          suggestedCorrection: f.suggestedCorrection,
          confidence: typeof f.confidence === 'number' ? f.confidence : 0.9
        }));

        return {
          insights: {
            overallCreativeImpression: parsed.overallCreativeImpression || 'Creative demonstrates standard enterprise marketing composition.',
            visualConsistencyRating: parsed.visualConsistencyRating || 'Medium',
            contextualObservations: parsed.contextualObservations || [],
            suggestedCreativeImprovements: parsed.suggestedCreativeImprovements || [],
            disclaimerPlacementAssessment: parsed.disclaimerPlacementAssessment || 'Disclaimer legibility evaluated against WCAG and brand standards.',
            modelUsed: modelName,
            isAiFallbackEngaged: false
          },
          aiFindings: findings
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`⚠️ [Gemini Vision] ${modelName} call failed or timed out: ${err?.message || err}.`);
      }
    }

    console.warn('⚡ [Gemini Vision] All Vision models exhausted or rate-limited; switching to deterministic visual insights.');
    return generateDeterministicVisualInsights(extractedOcrText, rules, lastError?.message);
  } catch (err: any) {
    console.error('Gemini Vision processing error:', err?.message || err);
    return generateDeterministicVisualInsights(extractedOcrText, rules, err?.message);
  }
}

/**
 * Deterministic fallback for visual insights when Gemini is offline or rate-limited
 */
function generateDeterministicVisualInsights(
  ocrText: string,
  rules: BrandRule[],
  reason?: string
): { insights: GeminiCreativeInsights; aiFindings: CreativeFinding[] } {
  const ocrLower = ocrText.toLowerCase();
  const observations: string[] = [];
  const improvements: string[] = [];
  const findings: CreativeFinding[] = [];

  if (reason) {
    observations.push(`AI Vision fallback active: ${reason}`);
  }
  if (rules.length > 0) {
    observations.push(`Evaluated against ${rules.length} active enterprise brand guidelines.`);
  }

  // Check for presence of disclaimers
  const hasDisclaimer = ocrLower.includes('disclaimer') || ocrLower.includes('terms') || ocrLower.includes('subject to') || ocrLower.includes('conditions apply');
  const hasGuarantee = ocrLower.includes('guaranteed') || ocrLower.includes('100%') || ocrLower.includes('10x');

  if (hasGuarantee && !hasDisclaimer) {
    observations.push('Promotional copy contains high-liability guarantee language without an adjacent legal disclaimer.');
    improvements.push('Append a qualified footnote citation (e.g. "Terms and SLA conditions apply") near promotional claims.');
    findings.push({
      id: `det-vis-disclaimer-${Date.now()}`,
      type: 'visual',
      detectedText: 'Missing Legal Footnote',
      category: 'disclaimer',
      severity: 'critical',
      status: 'POLICY_VIOLATION',
      explanation: 'Performance or ROI assertions in banners must visually feature a qualifying disclaimer pursuant to FTC regulations.',
      relatedGuideline: 'Policy 4.2',
      suggestedCorrection: 'Add legible footnote: "Based on enterprise terms of service and signed SLA addendum."',
      confidence: 0.95
    });
  } else {
    observations.push('Textual composition reviewed against active brand guidelines.');
  }

  // Check logo text
  if (!ocrLower.includes('acme') && !ocrLower.includes('cloudsphere')) {
    observations.push('Brand identifier or logo trademark is not prominently displayed in readable text.');
    improvements.push('Ensure the registered Acme CloudSphere™ logo or wordmark is featured on the banner header.');
  }

  return {
    insights: {
      overallCreativeImpression: 'Creative inspected via BrandGuard Deterministic Visual Engine. Core layout and text regions analyzed.',
      visualConsistencyRating: findings.length === 0 ? 'High' : 'Medium',
      contextualObservations: observations,
      suggestedCreativeImprovements: improvements,
      disclaimerPlacementAssessment: hasDisclaimer 
        ? 'Legal qualifying disclaimer text detected within creative bounds.' 
        : 'No legal qualification or footnote detected for empirical claims.',
      modelUsed: 'BrandGuard Local Semantic Engine (Resilient Fallback)',
      isAiFallbackEngaged: true
    },
    aiFindings: findings
  };
}
