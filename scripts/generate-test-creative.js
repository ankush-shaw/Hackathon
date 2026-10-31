import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgBanner = `
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background: Deep Navy #0F172A (Approved Brand Primary Dark) -->
  <rect width="100%" height="100%" fill="#0F172A"/>

  <!-- Logo Pill Badge: Royal Blue #2563EB (Approved Brand Accent) -->
  <rect x="40" y="30" width="130" height="36" rx="6" fill="#2563EB"/>
  <text x="50" y="54" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF">ACME LOGO</text>

  <!-- Headline: White text #FFFFFF on Navy (High Contrast) -->
  <text x="40" y="120" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#FFFFFF">Acme CloudSphere Platform</text>

  <!-- Claim 1: Prohibited absolute guarantee #2563EB -->
  <text x="40" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#38BDF8">Boost productivity by 10x guaranteed!</text>

  <!-- Claim 2: Superlative #1 Fastest & SLA statement -->
  <text x="40" y="215" font-family="Arial, sans-serif" font-size="18" fill="#F8FAFC">Voted #1 fastest cloud database with zero scheduled downtime.</text>

  <!-- Low Contrast Footer Text Box (To trigger WCAG accessibility audit) -->
  <rect x="40" y="320" width="720" height="45" rx="4" fill="#1E293B"/>
  <text x="50" y="348" font-family="Arial, sans-serif" font-size="13" fill="#475569">Mandatory Disclaimer: Terms apply. 100% unhackable security architecture.</text>
</svg>
`;

async function main() {
  const outputPath = path.resolve(process.cwd(), 'sample-marketing-ad.png');
  await sharp(Buffer.from(svgBanner))
    .png()
    .toFile(outputPath);
  
  console.log(`✅ Generated test marketing ad: ${outputPath}`);
}

main().catch(console.error);

