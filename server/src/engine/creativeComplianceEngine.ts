import path from 'path';
import fs from 'fs';
import { validateUploadedImage } from '../services/imageValidation.js';
import { performOcrAnalysis } from '../services/ocrEngine.js';
import { 
  extractDominantColors, 
  analyzeTextContrast, 
  analyzeLayoutQuality, 
  inspectLogoCompliance 
} from '../services/imageAnalysis.js';
import { runHybridComplianceScan } from './hybridEngine.js';
import { auditCreativeWithVision } from '../ai/creativeVisionAuditor.js';
import type { 
  CreativeAnalysisResult, 
  CreativeFinding, 
  BrandRule, 
  EvidenceRecord, 
  BrandAsset 
} from '../types/index.js';

interface RunCreativeScanOptions {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  targetChannel?: string;
  rules: BrandRule[];
  evidenceList: EvidenceRecord[];
  approvedAssets: BrandAsset[];
}

/**
 * Orchestrates Real Image-Based Creative Compliance Analysis:
 * Combines Deterministic Sharp Pixel/Color Extraction, Tesseract.js OCR, WCAG Contrast Analysis,
 * Brand Claim Verification, and Gemini Vision Contextual Insights.
 */
export async function runCreativeComplianceScan(
  options: RunCreativeScanOptions
): Promise<CreativeAnalysisResult> {
  const { buffer, originalFilename, mimeType, targetChannel = 'Banner Ad', rules, evidenceList, approvedAssets } = options;

  console.log(`\n=====================================================================`);
  console.log(`🎨 [Creative Compliance Engine] Starting Real Image Analysis: "${originalFilename}" (${(buffer.length / 1024).toFixed(1)} KB)`);
  console.log(`=====================================================================`);

  // 1. Image Validation (MIME, Magic Bytes, Dimensions, Corruption)
  const validation = await validateUploadedImage(buffer, originalFilename, mimeType);
  if (!validation.isValid) {
    throw new Error(`Invalid creative image: ${validation.error}`);
  }

  const width = validation.width || 800;
  const height = validation.height || 600;

  // Save asset file to uploads/ for serving in UI
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const safeExt = validation.format || 'png';
  const assetId = `creative-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const savedFilename = `${assetId}.${safeExt}`;
  const savedPath = path.join(uploadsDir, savedFilename);
  fs.writeFileSync(savedPath, buffer);
  const assetFileUrl = `/uploads/${savedFilename}`;

  console.log(`🖼️ [Creative Compliance] Image validated & saved to: ${savedFilename} (${width}x${height}px)`);

  // 2. Optical Character Recognition (OCR) via Tesseract.js
  console.log(`📝 [Creative Compliance] Running Tesseract.js OCR text extraction...`);
  const ocrResult = await performOcrAnalysis(buffer);
  console.log(`   ↳ Extracted ${ocrResult.linesCount} text lines (Confidence: ${ocrResult.overallConfidence}%). Full text: "${ocrResult.fullText.slice(0, 60)}..."`);

  // 3. Dominant Color Extraction & Palette Adherence via Sharp
  console.log(`🎨 [Creative Compliance] Extracting dominant pixel colors & checking palette...`);
  const colorAnalysis = await extractDominantColors(buffer, approvedAssets);
  console.log(`   ↳ Status: ${colorAnalysis.status} (Color Score: ${colorAnalysis.colorScore}/100, Dominant: ${colorAnalysis.dominantColors.slice(0, 3).map(c => `${c.hex} ${c.percentage}%`).join(', ')})`);

  // 4. Contrast Analysis on OCR Text Bounding Boxes via Sharp & WCAG 2.1 Luminance
  console.log(`🔍 [Creative Compliance] Calculating WCAG 2.1 relative luminance contrast ratios...`);
  const contrastAnalysis = await analyzeTextContrast(
    buffer, 
    ocrResult.textBlocks.map(b => ({ text: b.text, bbox: b.bbox })), 
    width, 
    height
  );
  console.log(`   ↳ Status: ${contrastAnalysis.passCount} PASS, ${contrastAnalysis.failCount} FAIL (AA Pass Rate: ${contrastAnalysis.wcagAARate}%, Avg Ratio: ${contrastAnalysis.overallRatioAverage}:1)`);

  // 5. Layout and Visual Quality Analysis (margin overflow, small text legibility)
  const layoutAnalysis = analyzeLayoutQuality(
    ocrResult.textBlocks.map(b => ({ text: b.text, bbox: b.bbox })),
    width,
    height
  );
  console.log(`📐 [Creative Compliance] Layout Quality Score: ${layoutAnalysis.layoutScore}/100 (${layoutAnalysis.overflowRisks.length} edge overflow risks, ${layoutAnalysis.smallTextRisks.length} small text warnings)`);

  // 6. Logo Compliance Analysis
  const logoAnalysis = inspectLogoCompliance(approvedAssets, ocrResult.fullText);
  console.log(`🏷️ [Creative Compliance] Logo Analysis: ${logoAnalysis.status} - ${logoAnalysis.details}`);

  // 7. Textual Brand Governance & Evidence Verification on OCR Text
  console.log(`⚖️ [Creative Compliance] Auditing OCR text against Brand Guidelines & Evidence Repository...`);
  const textComplianceScan = await runHybridComplianceScan(
    ocrResult.fullText || 'Brand Creative Banner', 
    targetChannel, 
    rules, 
    evidenceList
  );
  console.log(`   ↳ Text Compliance Score: ${textComplianceScan.score}/100 (${textComplianceScan.findings.length} findings, ${textComplianceScan.claims?.length || 0} claims)`);

  // 8. Gemini Vision Multimodal Contextual Audit (with circuit-breaker fallback)
  const visionAudit = await auditCreativeWithVision({
    imageBuffer: buffer,
    mimeType: validation.mimeType || 'image/png',
    extractedOcrText: ocrResult.fullText,
    imageDimensions: { width, height },
    rules,
    evidenceList
  });

  // 9. Consolidate All Findings (Textual, Color, Contrast, Layout, Vision)
  const unifiedFindings: CreativeFinding[] = [];

  // Add findings from Text Compliance Scan (mapped to OCR bounding boxes if text matches)
  for (const tf of textComplianceScan.findings) {
    // Find matching OCR block for coordinate positioning
    const matchedBlock = ocrResult.textBlocks.find(b => 
      b.text.toLowerCase().includes(tf.matchedText.toLowerCase()) || 
      tf.matchedText.toLowerCase().includes(b.text.toLowerCase())
    );

    let statusType: CreativeFinding['status'] = 'UNSUPPORTED';
    if (tf.severity === 'critical') statusType = 'POLICY_VIOLATION';
    else if (tf.severity === 'verified') statusType = 'SUPPORTED';
    else if (tf.category === 'evidence_required') statusType = 'UNVERIFIED';

    unifiedFindings.push({
      id: `creative-text-${tf.id}`,
      type: 'textual',
      detectedText: tf.matchedText,
      category: tf.category,
      severity: tf.severity,
      status: statusType,
      explanation: tf.issue || tf.clarificationNote || 'Brand governance finding.',
      relatedGuideline: tf.ruleCode,
      evidenceReference: tf.evidenceReference,
      suggestedCorrection: tf.suggestedAlternative,
      confidence: 0.95,
      bbox: matchedBlock?.bbox
    });
  }

  // Add Contrast Findings for failing text blocks
  for (const cf of contrastAnalysis.regions) {
    if (cf.status === 'FAIL') {
      unifiedFindings.push({
        id: `creative-contrast-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'contrast',
        detectedText: cf.textSnippet,
        category: 'accessibility',
        severity: cf.contrastRatio < 3.0 ? 'critical' : 'warning',
        status: 'POLICY_VIOLATION',
        explanation: `Insufficient text contrast ratio (${cf.contrastRatio}:1). Fails WCAG 2.1 AA requirement of 4.5:1.`,
        relatedGuideline: 'WCAG 2.1 AA Contrast',
        suggestedCorrection: `Increase contrast between text (${cf.textColorHex}) and background (${cf.backgroundColorHex}) to at least 4.5:1.`,
        confidence: 0.98,
        bbox: cf.bbox
      });
    }
  }

  // Add Color Palette Findings for unapproved dominant colors
  for (const unapproved of colorAnalysis.unapprovedDominantColors) {
    unifiedFindings.push({
      id: `creative-color-${Date.now()}-${unapproved.hex.replace('#', '')}`,
      type: 'color',
      detectedText: `Unapproved Color: ${unapproved.hex}`,
      category: 'visual',
      severity: unapproved.percentage >= 25 ? 'critical' : 'warning',
      status: 'POLICY_VIOLATION',
      explanation: `Color ${unapproved.hex} occupies ${unapproved.percentage}% of the creative canvas but does not exist in the approved brand palette.`,
      relatedGuideline: 'Brand Palette Standard',
      suggestedCorrection: `Replace with approved brand primary (${colorAnalysis.approvedPalette[0]?.hex || '#2563EB'}) or neutral tones.`,
      confidence: 0.95
    });
  }

  // Add Missing Primary Color Finding if applicable
  if (colorAnalysis.missingApprovedColors.length > 0 && colorAnalysis.colorScore < 70) {
    unifiedFindings.push({
      id: `creative-missing-color-${Date.now()}`,
      type: 'color',
      detectedText: 'Brand Primary Color Missing',
      category: 'visual',
      severity: 'suggestion',
      status: 'POLICY_VIOLATION',
      explanation: `None of the creative's dominant colors match the organization's primary brand color (${colorAnalysis.missingApprovedColors.map(c => c.name).join(', ')}).`,
      relatedGuideline: 'Corporate Identity Standard',
      suggestedCorrection: `Incorporate ${colorAnalysis.missingApprovedColors[0]?.hex || '#2563EB'} into headers or primary CTA buttons.`,
      confidence: 0.90
    });
  }

  // Add Layout Findings (clipping/margin risks)
  for (const ofr of layoutAnalysis.overflowRisks) {
    unifiedFindings.push({
      id: `creative-layout-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'layout',
      detectedText: ofr.textSnippet,
      category: 'visual',
      severity: 'warning',
      status: 'POLICY_VIOLATION',
      explanation: `Text is located only ${ofr.marginDistancePx}px from the ${ofr.edge}. Risk of clipping or bleed cutoff during digital ad syndication.`,
      relatedGuideline: 'Safe Margin Guideline (2.5% padding)',
      suggestedCorrection: `Inset text block at least ${Math.round(width * 0.04)}px from canvas edge.`,
      confidence: 0.92,
      bbox: ofr.bbox
    });
  }

  // Add Gemini Vision contextual findings
  for (const vf of visionAudit.aiFindings) {
    // Prevent duplicate findings
    const exists = unifiedFindings.some(f => 
      f.detectedText && vf.detectedText && f.detectedText.toLowerCase().includes(vf.detectedText.toLowerCase())
    );
    if (!exists) {
      unifiedFindings.push(vf);
    }
  }

  // 10. Unified Score Computation
  const textualScore = textComplianceScan.score;
  const visualScore = Math.round(
    colorAnalysis.colorScore * 0.35 +
    contrastAnalysis.contrastScore * 0.35 +
    layoutAnalysis.layoutScore * 0.30
  );

  // Overall Score: 50% Textual Compliance + 50% Visual Brand Compliance
  const overallCreativeScore = Math.max(
    15,
    Math.min(100, Math.round(textualScore * 0.50 + visualScore * 0.50))
  );

  console.log(`📊 [Creative Compliance] FINAL SCORES: Overall: ${overallCreativeScore}/100 (Textual: ${textualScore}, Visual: ${visualScore}, Colors: ${colorAnalysis.colorScore}, Contrast: ${contrastAnalysis.contrastScore}, Layout: ${layoutAnalysis.layoutScore})`);
  console.log(`   ↳ Total Unified Findings: ${unifiedFindings.length}`);
  console.log(`=====================================================================\n`);

  return {
    assetId,
    assetFileName: originalFilename,
    assetFileUrl,
    fileSizeBytes: buffer.length,
    mimeType: validation.mimeType || mimeType,
    dimensions: { width, height },
    extractedOcrText: ocrResult.fullText,
    ocrConfidence: ocrResult.overallConfidence,
    textBlocks: ocrResult.textBlocks,
    visualAnalysis: {
      colorCompliance: colorAnalysis,
      contrastCompliance: contrastAnalysis,
      layoutCompliance: layoutAnalysis,
      logoCompliance: logoAnalysis
    },
    geminiInsights: visionAudit.insights,
    findings: unifiedFindings,
    textualClaims: textComplianceScan.claims || [],
    scores: {
      overallCreativeScore,
      textualScore,
      visualScore,
      colorScore: colorAnalysis.colorScore,
      contrastScore: contrastAnalysis.contrastScore,
      layoutScore: layoutAnalysis.layoutScore
    },
    analyzedAt: new Date().toISOString()
  };
}

