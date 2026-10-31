import sharp from 'sharp';
import type { 
  BoundingBox, 
  ExtractedColorSwatch, 
  ColorComplianceAnalysis, 
  TextRegionContrast, 
  ContrastComplianceAnalysis, 
  LayoutComplianceAnalysis, 
  LogoComplianceAnalysis,
  BrandAsset 
} from '../types/index.js';

// Default approved Acme Enterprise Cloud palette
export const DEFAULT_APPROVED_PALETTE = [
  { name: 'Brand Primary Blue', hex: '#2563EB', role: 'Primary CTA & Headers' },
  { name: 'Dark Slate Charcoal', hex: '#0F172A', role: 'Primary Typography' },
  { name: 'Pure White', hex: '#FFFFFF', role: 'Canvas & Background' },
  { name: 'Cool Slate Neutral', hex: '#F8FAFC', role: 'Secondary Background' },
  { name: 'Medium Slate', hex: '#475569', role: 'Secondary Text & Borders' },
  { name: 'Accent Indigo', hex: '#4F46E5', role: 'Feature Highlights' },
  { name: 'Accent Cyan', hex: '#06B6D4', role: 'Telemetry & Badges' }
];

/**
 * Convert HEX string to RGB tuple
 */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/**
 * Convert RGB tuple to HEX string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Euclidean distance between two RGB colors
 */
export function calculateColorDistance(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const dr = rgb1[0] - rgb2[0];
  const dg = rgb1[1] - rgb2[1];
  const db = rgb1[2] - rgb2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Relative Luminance according to W3C WCAG 2.1 specifications
 */
export function calculateRelativeLuminance(rgb: [number, number, number]): number {
  const sRgb = rgb.map(val => {
    const v = val / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRgb[0] + 0.7152 * sRgb[1] + 0.0722 * sRgb[2];
}

/**
 * WCAG 2.1 Contrast Ratio between two RGB colors
 */
export function calculateContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = calculateRelativeLuminance(rgb1);
  const l2 = calculateRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Extract actual dominant colors using Sharp downsampled raw pixel clustering
 */
export async function extractDominantColors(
  buffer: Buffer,
  approvedAssets: BrandAsset[] = []
): Promise<ColorComplianceAnalysis> {
  // Build active approved palette from brand assets or default
  const registeredColors = approvedAssets
    .filter(a => a.assetType === 'color' && a.colorHex)
    .map(a => ({
      name: a.assetName,
      hex: a.colorHex!.toUpperCase(),
      role: a.colorRole || 'Brand Guideline Color'
    }));

  const activeApprovedPalette = registeredColors.length > 0 ? registeredColors : DEFAULT_APPROVED_PALETTE;

  // 1. Resize to 64x64 raw RGB buffer (4,096 pixels)
  const { data: pixelBuffer, info } = await sharp(buffer)
    .resize(64, 64, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = info.width * info.height;
  const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  // Quantize 24-bit RGB into 5-bit clusters (32 steps per channel)
  for (let i = 0; i < pixelBuffer.length; i += 3) {
    const r = pixelBuffer[i];
    const g = pixelBuffer[i + 1];
    const b = pixelBuffer[i + 2];

    const qR = Math.round(r / 16) * 16;
    const qG = Math.round(g / 16) * 16;
    const qB = Math.round(b / 16) * 16;
    const key = `${qR},${qG},${qB}`;

    const existing = colorBuckets.get(key);
    if (existing) {
      existing.count++;
      existing.r = Math.round((existing.r * (existing.count - 1) + r) / existing.count);
      existing.g = Math.round((existing.g * (existing.count - 1) + g) / existing.count);
      existing.b = Math.round((existing.b * (existing.count - 1) + b) / existing.count);
    } else {
      colorBuckets.set(key, { r, g, b, count: 1 });
    }
  }

  // Sort buckets by frequency
  const sortedClusters = Array.from(colorBuckets.values()).sort((a, b) => b.count - a.count);

  // Group top 5 clusters, merging near duplicates (deltaE < 25)
  const dominantList: { r: number; g: number; b: number; count: number }[] = [];
  for (const cluster of sortedClusters) {
    const isClose = dominantList.some(d => calculateColorDistance([d.r, d.g, d.b], [cluster.r, cluster.g, cluster.b]) < 28);
    if (!isClose) {
      dominantList.push(cluster);
      if (dominantList.length >= 6) break;
    } else {
      // Add count to matching cluster
      const match = dominantList.find(d => calculateColorDistance([d.r, d.g, d.b], [cluster.r, cluster.g, cluster.b]) < 28);
      if (match) match.count += cluster.count;
    }
  }

  // Re-sort and map to ExtractedColorSwatch
  const dominantColors: ExtractedColorSwatch[] = dominantList.map(item => {
    const hex = rgbToHex(item.r, item.g, item.b);
    const rgb: [number, number, number] = [item.r, item.g, item.b];
    const percentage = Number(((item.count / totalPixels) * 100).toFixed(1));

    // Find nearest approved brand color
    let minDistance = 999;
    let closestApproved = '';

    for (const app of activeApprovedPalette) {
      const appRgb = hexToRgb(app.hex);
      const dist = calculateColorDistance(rgb, appRgb);
      if (dist < minDistance) {
        minDistance = dist;
        closestApproved = `${app.name} (${app.hex})`;
      }
    }

    // DeltaE <= 45 is considered brand aligned
    const isApprovedBrandColor = minDistance <= 45;

    return {
      hex,
      rgb,
      percentage,
      isApprovedBrandColor,
      matchedBrandColor: closestApproved,
      colorDistanceDeltaE: Number(minDistance.toFixed(1))
    };
  });

  // Identify unapproved colors that occupy significant area (> 12%)
  const unapprovedDominantColors = dominantColors.filter(
    c => !c.isApprovedBrandColor && c.percentage >= 12
  );

  // Check if primary brand color appears in creative
  const missingApprovedColors = activeApprovedPalette.filter(app => {
    const appRgb = hexToRgb(app.hex);
    const hasMatch = dominantColors.some(c => calculateColorDistance(c.rgb, appRgb) <= 45);
    return !hasMatch && (app.name.toLowerCase().includes('primary') || app.name.toLowerCase().includes('brand'));
  });

  // Calculate Color Score (0 - 100)
  let colorScore = 100;
  for (const unapproved of unapprovedDominantColors) {
    colorScore -= Math.round(unapproved.percentage * 0.8);
  }
  if (missingApprovedColors.length > 0) {
    colorScore -= missingApprovedColors.length * 15;
  }
  colorScore = Math.max(20, Math.min(100, colorScore));

  const status = unapprovedDominantColors.length > 0 
    ? 'Deviation Detected' 
    : colorScore >= 80 
    ? 'Compliant' 
    : 'Deviation Detected';

  const details = unapprovedDominantColors.length > 0
    ? `Detected ${unapprovedDominantColors.length} significant color deviation(s) from approved brand palette (${unapprovedDominantColors.map(c => `${c.hex} ~${c.percentage}%`).join(', ')}).`
    : `Creative colors conform with approved corporate palette. Strong brand alignment score: ${colorScore}/100.`;

  return {
    status,
    dominantColors,
    approvedPalette: activeApprovedPalette,
    unapprovedDominantColors,
    missingApprovedColors,
    details,
    colorScore
  };
}

/**
 * Contrast Analysis on OCR Text Regions using Sharp crops and relative luminance
 */
export async function analyzeTextContrast(
  buffer: Buffer,
  bboxes: { text: string; bbox: BoundingBox }[],
  imageWidth: number,
  imageHeight: number
): Promise<ContrastComplianceAnalysis> {
  const regions: TextRegionContrast[] = [];

  for (const item of bboxes) {
    const { bbox, text } = item;
    const safeLeft = Math.max(0, Math.min(imageWidth - 4, Math.round(bbox.x0)));
    const safeTop = Math.max(0, Math.min(imageHeight - 4, Math.round(bbox.y0)));
    const safeWidth = Math.max(4, Math.min(imageWidth - safeLeft, Math.round(bbox.width)));
    const safeHeight = Math.max(4, Math.min(imageHeight - safeTop, Math.round(bbox.height)));

    try {
      // Extract the text region crop
      const cropBuffer = await sharp(buffer)
        .extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight })
        .resize(32, 16, { fit: 'fill' })
        .removeAlpha()
        .raw()
        .toBuffer();

      // Sample pixels into brightness spectrum
      const samples: { r: number; g: number; b: number; lum: number }[] = [];
      for (let i = 0; i < cropBuffer.length; i += 3) {
        const r = cropBuffer[i];
        const g = cropBuffer[i + 1];
        const b = cropBuffer[i + 2];
        samples.push({ r, g, b, lum: calculateRelativeLuminance([r, g, b]) });
      }

      // Sort by luminance to separate text foreground from background
      samples.sort((a, b) => a.lum - b.lum);

      // Darkest 15% vs Lightest 15%
      const sampleCount = Math.max(1, Math.floor(samples.length * 0.15));
      const darkSamples = samples.slice(0, sampleCount);
      const lightSamples = samples.slice(-sampleCount);

      const avgDark: [number, number, number] = [
        Math.round(darkSamples.reduce((s, p) => s + p.r, 0) / sampleCount),
        Math.round(darkSamples.reduce((s, p) => s + p.g, 0) / sampleCount),
        Math.round(darkSamples.reduce((s, p) => s + p.b, 0) / sampleCount)
      ];

      const avgLight: [number, number, number] = [
        Math.round(lightSamples.reduce((s, p) => s + p.r, 0) / sampleCount),
        Math.round(lightSamples.reduce((s, p) => s + p.g, 0) / sampleCount),
        Math.round(lightSamples.reduce((s, p) => s + p.b, 0) / sampleCount)
      ];

      const contrastRatio = calculateContrastRatio(avgLight, avgDark);

      // Is large text (height >= 24px)
      const isLargeText = safeHeight >= 24;
      const wcagAALarge = contrastRatio >= 3.0;
      const wcagAANormal = contrastRatio >= 4.5;
      const wcagAAALarge = contrastRatio >= 4.5;
      const wcagAAANormal = contrastRatio >= 7.0;

      const passesAA = isLargeText ? wcagAALarge : wcagAANormal;

      regions.push({
        textSnippet: text.trim().slice(0, 40),
        bbox,
        textColorHex: rgbToHex(...avgDark),
        backgroundColorHex: rgbToHex(...avgLight),
        contrastRatio,
        wcagAALarge,
        wcagAANormal,
        wcagAAALarge,
        wcagAAANormal,
        status: passesAA ? 'PASS' : 'FAIL',
        isEstimate: safeWidth < 20 || safeHeight < 12
      });
    } catch {
      // Mark region as unavailable if crop extraction failed
      regions.push({
        textSnippet: text.trim().slice(0, 40),
        bbox,
        textColorHex: '#000000',
        backgroundColorHex: '#FFFFFF',
        contrastRatio: 4.5,
        wcagAALarge: true,
        wcagAANormal: true,
        wcagAAALarge: false,
        wcagAAANormal: false,
        status: 'ESTIMATE',
        isEstimate: true
      });
    }
  }

  const passCount = regions.filter(r => r.status === 'PASS').length;
  const failCount = regions.filter(r => r.status === 'FAIL').length;
  const total = Math.max(1, regions.length);
  const wcagAARate = Number(((passCount / total) * 100).toFixed(1));
  const overallRatioAverage = regions.length > 0 
    ? Number((regions.reduce((s, r) => s + r.contrastRatio, 0) / regions.length).toFixed(1))
    : 4.5;

  let contrastScore = Math.round(wcagAARate);
  contrastScore = Math.max(15, Math.min(100, contrastScore));

  const details = failCount > 0
    ? `Flagged ${failCount} text block(s) failing WCAG 2.1 AA 4.5:1 minimum contrast. Overall AA pass rate: ${wcagAARate}%.`
    : `All readable text blocks meet or exceed WCAG 2.1 AA accessibility contrast standards (Avg: ${overallRatioAverage}:1).`;

  return {
    passCount,
    failCount,
    overallRatioAverage,
    regions,
    wcagAARate,
    details,
    contrastScore
  };
}

/**
 * Layout and Visual Quality Analysis (clipping, small font sizes, density)
 */
export function analyzeLayoutQuality(
  bboxes: { text: string; bbox: BoundingBox }[],
  width: number,
  height: number
): LayoutComplianceAnalysis {
  const marginThresholdX = Math.round(width * 0.025); // 2.5% edge safety
  const marginThresholdY = Math.round(height * 0.025);

  const overflowRisks: LayoutComplianceAnalysis['overflowRisks'] = [];
  const smallTextRisks: LayoutComplianceAnalysis['smallTextRisks'] = [];

  let totalTextArea = 0;

  for (const item of bboxes) {
    const { bbox, text } = item;
    totalTextArea += bbox.width * bbox.height;

    // Check edge proximity (overflow/clipping risks)
    if (bbox.x0 <= marginThresholdX) {
      overflowRisks.push({ textSnippet: text.slice(0, 30), bbox, marginDistancePx: Math.round(bbox.x0), edge: 'Left Border' });
    } else if (bbox.x1 >= width - marginThresholdX) {
      overflowRisks.push({ textSnippet: text.slice(0, 30), bbox, marginDistancePx: Math.round(width - bbox.x1), edge: 'Right Border' });
    }

    if (bbox.y0 <= marginThresholdY) {
      overflowRisks.push({ textSnippet: text.slice(0, 30), bbox, marginDistancePx: Math.round(bbox.y0), edge: 'Top Border' });
    } else if (bbox.y1 >= height - marginThresholdY) {
      overflowRisks.push({ textSnippet: text.slice(0, 30), bbox, marginDistancePx: Math.round(height - bbox.y1), edge: 'Bottom Border' });
    }

    // Check small text legibility (< 13px or < 1.4% height)
    const minHeightThreshold = Math.max(12, Math.round(height * 0.014));
    if (bbox.height < minHeightThreshold && bbox.height > 0) {
      smallTextRisks.push({
        textSnippet: text.slice(0, 30),
        bbox,
        heightPx: Math.round(bbox.height),
        warning: `Text height (${Math.round(bbox.height)}px) is below recommended mobile legibility threshold (${minHeightThreshold}px).`
      });
    }
  }

  const canvasArea = width * height;
  const textCoveragePercent = Number(((totalTextArea / canvasArea) * 100).toFixed(1));
  const isCrowded = textCoveragePercent > 55;

  let layoutScore = 100;
  layoutScore -= overflowRisks.length * 10;
  layoutScore -= smallTextRisks.length * 6;
  if (isCrowded) layoutScore -= 15;
  layoutScore = Math.max(25, Math.min(100, layoutScore));

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(width, height);
  const aspectRatio = `${Math.round(width / d)}:${Math.round(height / d)}`;

  return {
    imageDimensions: { width, height, aspectRatio },
    overflowRisks,
    smallTextRisks,
    densityCrowding: {
      textCoveragePercent,
      isCrowded,
      warning: isCrowded ? `High visual text density (${textCoveragePercent}% of canvas). Potential negative space crowding.` : undefined
    },
    layoutScore,
    details: overflowRisks.length > 0 
      ? `Found ${overflowRisks.length} text region(s) dangerously close to canvas trim margins (< 2.5% margin).`
      : 'Visual layout demonstrates clean margin boundaries and balanced whitespace.'
  };
}

/**
 * Logo Compliance Inspection against registered logo assets
 */
export function inspectLogoCompliance(
  approvedAssets: BrandAsset[] = [],
  ocrText: string
): LogoComplianceAnalysis {
  const registeredLogo = approvedAssets.find(a => a.assetType === 'logo');

  if (!registeredLogo) {
    return {
      referenceLogoFound: false,
      logoDetectedInImage: false,
      status: 'Missing Reference Asset',
      details: 'No approved master logo asset is registered in BrandGuard repository. Upload an official SVG/PNG logo in Brand Guidelines to enable logo verification.'
    };
  }

  // Check if logo name or trademark text is present in OCR
  const logoKeywords = ['acme', 'cloudsphere', 'logo', registeredLogo.assetName.toLowerCase()];
  const ocrLower = ocrText.toLowerCase();
  const keywordFound = logoKeywords.some(k => ocrLower.includes(k));

  return {
    referenceLogoFound: true,
    referenceLogoAsset: registeredLogo.assetName,
    logoDetectedInImage: keywordFound,
    confidence: keywordFound ? 0.88 : 0.4,
    status: keywordFound ? 'Verified' : 'Potential Inconsistency',
    details: keywordFound 
      ? `Brand logo nomenclature detected in creative and cross-referenced with approved asset "${registeredLogo.assetName}".`
      : `Approved logo "${registeredLogo.assetName}" was not distinctly recognized in the creative canvas.`
  };
}

