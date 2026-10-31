import fs from 'fs';
import path from 'path';

async function testCreativeUpload() {
  const imagePath = path.resolve(process.cwd(), 'sample-marketing-ad.png');
  const buffer = fs.readFileSync(imagePath);

  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'image/png' });
  formData.append('creative', blob, 'sample-marketing-ad.png');
  formData.append('channel', 'LinkedIn Ad');

  console.log('🚀 Sending sample-marketing-ad.png to http://localhost:5000/api/assets/analyze-creative ...');

  const start = Date.now();
  const response = await fetch('http://localhost:5000/api/assets/analyze-creative', {
    method: 'POST',
    body: formData,
  });

  const durationMs = Date.now() - start;
  console.log(`⏱️ Response received in ${durationMs}ms (Status: ${response.status})`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Request failed:', errorText);
    return;
  }

  const result = await response.json();
  const statusLabel = result.scores?.overallCreativeScore >= 85 
    ? 'APPROVED' 
    : result.scores?.overallCreativeScore >= 65 
    ? 'ACTION REQUIRED' 
    : 'CRITICAL REJECTION';

  console.log('\n======================================================');
  console.log('✨ BRANDGUARD REAL CREATIVE COMPLIANCE REPORT');
  console.log('======================================================');
  console.log(`📊 Unified Creative Compliance Score: ${result.scores?.overallCreativeScore}/100`);
  console.log(`   - Textual Content Score:  ${result.scores?.textualScore}/100`);
  console.log(`   - Visual Brand Score:     ${result.scores?.visualScore}/100`);
  console.log(`   - Governance Status:      ${statusLabel}`);
  console.log(`\n🔤 Extracted OCR Text (${result.dimensions?.width}x${result.dimensions?.height}px, Confidence: ${result.ocrConfidence}%):`);
  console.log(`   "${result.extractedOcrText?.trim()?.replace(/\n+/g, ' ')}"`);
  console.log(`   Text Blocks Detected: ${result.textBlocks?.length || 0}`);
  
  console.log('\n🎨 Dominant Colors (Sharp Real Pixel Clustering):');
  for (const c of result.visualAnalysis?.colorCompliance?.dominantColors || []) {
    const approval = c.isApprovedBrandColor ? 'PASS (Aligned)' : 'FAIL (Unapproved)';
    console.log(`   - ${c.hex} (${c.percentage}%) | ${c.matchedBrandColor} | ΔE: ${c.colorDistanceDeltaE} [${approval}]`);
  }
  if (result.visualAnalysis?.colorCompliance?.details) {
    console.log(`   ↳ Palette Audit: ${result.visualAnalysis.colorCompliance.details}`);
  }

  console.log('\n👁️ Text / Background Contrast Audits (WCAG 2.1):');
  for (const ct of result.visualAnalysis?.contrastCompliance?.regions || []) {
    console.log(`   - "${ct.textSnippet}" -> Contrast: ${ct.contrastRatio}:1 (${ct.textColorHex} on ${ct.backgroundColorHex}) | Status: ${ct.status}`);
  }

  const layout = result.visualAnalysis?.layoutCompliance;
  console.log(`\n📐 Layout & Margins: Safe: ${layout?.overflowRisks?.length === 0 ? 'YES ✅' : 'NO ⚠️'}`);
  console.log(`   ↳ ${layout?.details}`);
  if (layout?.overflowRisks?.length) {
    for (const r of layout.overflowRisks) {
      console.log(`   * Clipping Risk: "${r.textSnippet}" is ${r.marginDistancePx}px from ${r.edge}`);
    }
  }

  console.log(`\n🚩 Findings Flagged (${result.findings?.length || 0} total):`);
  for (const f of result.findings || []) {
    console.log(`   - [${f.status}] [${f.severity.toUpperCase()}] "${f.detectedText}"`);
    console.log(`     Reason: ${f.explanation}`);
    if (f.suggestedCorrection) {
      console.log(`     Suggested Fix: ${f.suggestedCorrection}`);
    }
  }

  console.log('======================================================\n');
}

testCreativeUpload().catch(console.error);
