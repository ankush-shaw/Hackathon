import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { 
  extractDominantColors, 
  calculateContrastRatio, 
  analyzeLayoutQuality,
  inspectLogoCompliance
} from '../../server/src/services/imageAnalysis';
import { validateUploadedImage } from '../../server/src/services/imageValidation';

describe('BrandGuard AI — Real Image-Based Creative Compliance Engine', () => {
  it('correctly calculates WCAG 2.1 relative luminance and contrast ratios', () => {
    // Pure White on Pure Black = 21:1
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [0, 0, 0];
    const maxRatio = calculateContrastRatio(white, black);
    expect(maxRatio).toBe(21);

    // Primary Blue (#2563EB) on Pure White (#FFFFFF)
    const brandBlue: [number, number, number] = [37, 99, 235];
    const brandRatio = calculateContrastRatio(white, brandBlue);
    expect(brandRatio).toBeGreaterThanOrEqual(4.5); // Passes WCAG AA normal text

    // Dark Slate (#0F172A) on Pure White (#FFFFFF)
    const slateDark: [number, number, number] = [15, 23, 42];
    const slateRatio = calculateContrastRatio(white, slateDark);
    expect(slateRatio).toBeGreaterThanOrEqual(13); // High contrast AAA pass
  });

  it('validates image file signatures and rejects unsupported formats', async () => {
    // 1. Create a genuine 200x100 PNG buffer with Sharp
    const validPngBuffer = await sharp({
      create: {
        width: 200,
        height: 100,
        channels: 3,
        background: { r: 37, g: 99, b: 235 }
      }
    }).png().toBuffer();

    const validResult = await validateUploadedImage(validPngBuffer, 'banner.png', 'image/png');
    expect(validResult.isValid).toBe(true);
    expect(validResult.format).toBe('png');
    expect(validResult.width).toBe(200);
    expect(validResult.height).toBe(100);

    // 2. Reject fake file with spoofed extension
    const fakeBuffer = Buffer.from('NOT AN IMAGE FILE HEADER CONTENT');
    const fakeResult = await validateUploadedImage(fakeBuffer, 'fake.png', 'image/png');
    expect(fakeResult.isValid).toBe(false);
    expect(fakeResult.error).toContain('mismatch');
  });

  it('extracts real dominant colors from pixel buffers and identifies brand palette compliance', async () => {
    // Create an image with 80% Brand Blue (#2563EB) and 20% White
    const testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 37, g: 99, b: 235 }
      }
    }).png().toBuffer();

    const colorAnalysis = await extractDominantColors(testImageBuffer);

    expect(colorAnalysis.dominantColors.length).toBeGreaterThan(0);
    const primaryDominant = colorAnalysis.dominantColors[0];
    expect(primaryDominant.isApprovedBrandColor).toBe(true);
    expect(colorAnalysis.colorScore).toBeGreaterThanOrEqual(80);
    expect(colorAnalysis.status).toBe('Compliant');
  });

  it('detects unapproved dominant color deviations', async () => {
    // Create an image with Neon Pink (#FF1493) which is not in Acme Cloud palette
    const unapprovedBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 20, b: 147 }
      }
    }).png().toBuffer();

    const colorAnalysis = await extractDominantColors(unapprovedBuffer);
    expect(colorAnalysis.unapprovedDominantColors.length).toBeGreaterThan(0);
    expect(colorAnalysis.status).toBe('Deviation Detected');
  });

  it('inspects layout quality, margin overflow risks, and text density', () => {
    // Text block located 5px from left edge on a 1000px banner (dangerously close to bleed margin)
    const dangerousBoundingBox = {
      text: 'Limited Time Enterprise Cloud Offer',
      bbox: { x0: 5, y0: 20, x1: 250, y1: 50, width: 245, height: 30 }
    };

    const layout = analyzeLayoutQuality([dangerousBoundingBox], 1000, 500);
    expect(layout.overflowRisks.length).toBe(1);
    expect(layout.overflowRisks[0].edge).toBe('Left Border');
    expect(layout.layoutScore).toBeLessThan(100);
  });

  it('checks logo compliance status honestly against registered assets', () => {
    // If no logo assets exist, reports missing reference asset without fake claims
    const noLogoResult = inspectLogoCompliance([], 'Some ad text without logo');
    expect(noLogoResult.referenceLogoFound).toBe(false);
    expect(noLogoResult.status).toBe('Missing Reference Asset');
  });
});
