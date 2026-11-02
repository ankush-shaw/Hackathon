import { z } from 'zod';
import { getGeminiClient, isGeminiConfigured } from './geminiClient.js';
import { env } from '../config/env.js';
import type { ExtractedClaim } from '../types/index.js';

const aiClaimSchema = z.object({
  claims: z.array(
    z.object({
      claimText: z.string(),
      matchedText: z.string(),
      category: z.enum([
        'performance',
        'comparative',
        'guarantee',
        'security',
        'pricing',
        'product_capability',
        'general'
      ]),
      requiresEvidence: z.boolean(),
      entities: z.array(z.string()).default([]),
      aiConfidence: z.number().min(0).max(1).default(0.9),
      explanation: z.string()
    })
  )
});

/**
 * Heuristic claim extractor used when Gemini is not configured or as a fallback
 */
function heuristicExtractClaims(text: string): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];

  const patterns = [
    {
      regex: /(?:boost[^.]*?by\s+\d+x|\b\d+x\s+(?:growth|increase|revenue|roi|guaranteed|outcomes|business)\b|\b(?:tenfold|hundredfold)\s+(?:growth|increase|outcomes|boost)\b|guaranteed\s+(?:\d+x|results|revenue)|guarantees\s+\d+x\s+revenue)/gi,
      category: 'guarantee' as const,
      requiresEvidence: true,
      explanation: 'Absolute numerical ROI, revenue multiplier, or performance guarantee requires executed SLA contract or empirical validation.',
      entities: ['Enterprise Productivity', 'Revenue Metric']
    },
    {
      regex: /(?:voted\s+#1\s+fastest[^.]*?|#1\s+fastest[^.]*?|(?:unequivocally\s+)?(?:the\s+)?fastest\s+on\s+the\s+market|\b(?:world's|the\s+world's)\s+(?:number\s+one|#1|best|leading|top)\b[^.]*?|\bthe\s+leading\s+cloud\s+platform\b)/gi,
      category: 'comparative' as const,
      requiresEvidence: true,
      explanation: 'Superlative comparative ranking requires accredited third-party benchmark or market research citation.',
      entities: ['Cloud Database', 'Market Benchmark']
    },
    {
      regex: /(?:100%\s+unhackable|completely\s+unhackable|\bunhackable\b|zero\s+vulnerabilities|bulletproof\s+security)/gi,
      category: 'security' as const,
      requiresEvidence: true,
      explanation: 'Absolute security claim cannot be proven and violates defense-in-depth cybersecurity policies.',
      entities: ['Cloud Infrastructure', 'Security']
    },
    {
      regex: /(?:supports?\s+enterprise-grade\s+security|enterprise-grade\s+security|military-grade\s+encryption)/gi,
      category: 'security' as const,
      requiresEvidence: true,
      explanation: 'Enterprise-grade security claim requires published audit certifications (e.g. SOC 2, ISO 27001).',
      entities: ['Security & Compliance', 'Certification']
    },
    {
      regex: /(?:reduces?\s+operational\s+costs\s+by\s+\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?%\s+(?:cost\s+reduction|reduction|savings|efficiency)\b|reduces?[^.]*?by\s+\d+(?:\.\d+)?%)/gi,
      category: 'performance' as const,
      requiresEvidence: true,
      explanation: 'Quantified cost reduction claim requires audited case study or empirical telemetry report.',
      entities: ['Financial ROI', 'Cost Optimization']
    },
    {
      regex: /(?:zero\s+scheduled\s+downtime\s+architecture|without\s+downtime|99\.99%\s+uptime\s+availability|99\.9+%\s+uptime)/gi,
      category: 'performance' as const,
      requiresEvidence: true,
      explanation: 'High-availability and uptime claims must reference specific contractual SLA tiers.',
      entities: ['High Availability', 'Architecture']
    },
    {
      regex: /(?:unlimited\s+storage|infinite\s+compute|unrestricted\s+bandwidth)/gi,
      category: 'product_capability' as const,
      requiresEvidence: true,
      explanation: 'Resource capacity claims must cite fair use policies and acceptable use guidelines.',
      entities: ['Storage', 'Compute']
    },
    {
      regex: /(?:validated\s+sub-5ms\s+query\s+latency|sub-5ms\s+query\s+latency|sub-\d+ms\s+latency)/gi,
      category: 'performance' as const,
      requiresEvidence: true,
      explanation: 'Specific microsecond or millisecond latency claims must cite published engineering benchmarks.',
      entities: ['Query Telemetry', 'Latency']
    }
  ];

  for (const p of patterns) {
    let match: RegExpExecArray | null;
    while ((match = p.regex.exec(text)) !== null) {
      const matched = match[0];
      const start = match.index;
      // Avoid duplicate claim spans
      const existing = claims.find(c => Math.abs(c.startIndex - start) < 4);
      if (!existing) {
        claims.push({
          id: `claim-auto-${Date.now()}-${start}`,
          claimText: matched,
          matchedText: matched,
          category: p.category,
          startIndex: start,
          endIndex: start + matched.length,
          requiresEvidence: p.requiresEvidence,
          entities: p.entities,
          aiConfidence: 0.95,
          explanation: p.explanation
        });
      }
    }
  }

  return claims;
}

/**
 * Real claim extraction using Google Gemini API
 */
export async function extractClaims(text: string): Promise<ExtractedClaim[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const ai = getGeminiClient();

  if (!ai || !isGeminiConfigured()) {
    return heuristicExtractClaims(text);
  }

  try {
    const prompt = `You are the BrandGuard AI Claim Extraction Engine.
Analyze the following marketing ad copy and extract all factual, measurable, comparative, performance, product capability, and promotional claims.
Do NOT classify standard generic marketing prose as factual claims. Focus on statements that make promises, comparative rankings, numerical metrics, guarantees, uptime assertions, or specific technical capabilities.

CRITICAL INSTRUCTION:
- Each claim's 'matchedText' must be an EXACT substring of the provided text so its position can be indexed accurately.
- Category must be one of: 'performance', 'comparative', 'guarantee', 'security', 'pricing', 'product_capability', 'general'.
- Set 'requiresEvidence' to true if regulatory bodies (FTC/SEC) or enterprise legal standards require proof/substantiation.

Text to analyze:
"""
${text}
"""

Return a valid JSON object matching this schema:
{
  "claims": [
    {
      "claimText": "description of the claim",
      "matchedText": "exact substring from text",
      "category": "performance",
      "requiresEvidence": true,
      "entities": ["Database", "Latency"],
      "aiConfidence": 0.95,
      "explanation": "Why this is an empirical claim requiring proof"
    }
  ]
}`;

    const candidateModels = [env.GEMINI_MODEL, 'gemini-flash-lite-latest', 'gemini-3.8-flash']
      .filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    let parsedJson: any = null;
    let successfulModel = '';

    for (const modelName of candidateModels) {
      try {
        console.log(`🤖 [Gemini AI Engine] Attempting extraction with ${modelName} (${text.length} chars)...`);
        const apiCall = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        });

        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini API timeout after 15000ms for ${modelName}`)), 15000)
        );

        const response = await Promise.race([apiCall, timeout]);
        const responseText = response.text || '{}';
        parsedJson = JSON.parse(responseText);
        successfulModel = modelName;
        break; // Successfully got response
      } catch (err: any) {
        const isQuotaOrMissing = err?.status === 429 || err?.status === 404 ||
          err?.message?.includes('429') || err?.message?.includes('quota') ||
          err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('not found');

        if (isQuotaOrMissing) {
          console.warn(`⚡ [Gemini AI Engine] Model ${modelName} returned status ${err?.status || 'quota'}; cascading to next candidate.`);
          continue;
        }
        console.warn(`⚠️ [Gemini AI Engine] Error with ${modelName}: ${err?.message || err}`);
      }
    }

    if (!parsedJson) {
      console.warn('⚠️ [Gemini AI Engine] All candidate models exhausted; using BrandGuard Local Governance Engine.');
      return heuristicExtractClaims(text);
    }

    const validated = aiClaimSchema.safeParse(parsedJson);

    if (!validated.success) {
      console.warn(`⚠️ [${successfulModel}] Invalid AI response structure; using heuristic fallback.`);
      return heuristicExtractClaims(text);
    }

    if (validated.data.claims.length === 0) {
      const heuristicFallback = heuristicExtractClaims(text);
      if (heuristicFallback.length > 0) {
        console.log(`ℹ️ [${successfulModel}] AI identified 0 claims, heuristic found ${heuristicFallback.length} benchmark patterns.`);
        return heuristicFallback;
      }
      console.log(`✨ [${successfulModel}] Text analyzed cleanly: 0 empirical claims requiring evidence.`);
      return [];
    }

    console.log(`✨ [${successfulModel}] Successfully extracted ${validated.data.claims.length} empirical claims.`);

    // Map extracted claims to exact character indices in the original text
    const resultClaims: ExtractedClaim[] = [];
    for (const c of validated.data.claims) {
      let startIndex = text.indexOf(c.matchedText);
      if (startIndex === -1) {
        // Fallback search case-insensitive
        const lowerIndex = text.toLowerCase().indexOf(c.matchedText.toLowerCase());
        startIndex = lowerIndex !== -1 ? lowerIndex : 0;
      }
      const endIndex = startIndex >= 0 ? startIndex + c.matchedText.length : text.length;

      resultClaims.push({
        id: `claim-gemini-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        claimText: c.claimText,
        matchedText: c.matchedText,
        category: c.category,
        startIndex: Math.max(0, startIndex),
        endIndex: Math.max(startIndex, endIndex),
        requiresEvidence: c.requiresEvidence,
        entities: c.entities,
        aiConfidence: c.aiConfidence,
        explanation: c.explanation
      });
    }

    return resultClaims;
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED');
    if (isRateLimit) {
      console.warn('⚡ [Gemini 3.8 Flash] Quota rate limit reached; engaging BrandGuard Local Semantic Engine.');
    } else {
      console.warn(`⚠️ [Gemini 3.8 Flash] Fallback engaged (${error?.message || 'timeout'}); using Local Semantic Engine.`);
    }
    const claims = heuristicExtractClaims(text);
    console.log(`✨ [BrandGuard AI Engine] Extracted ${claims.length} empirical claims.`);
    return claims;
  }
}

