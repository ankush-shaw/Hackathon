const sharp = require('sharp');
const fs = require('fs');

const width = 1774;
const height = 887;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070c18" />
      <stop offset="50%" stop-color="#0b1528" />
      <stop offset="100%" stop-color="#09101f" />
    </linearGradient>

    <!-- Top Card 1 Gradient (Blue) -->
    <linearGradient id="card1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#1e40af" />
    </linearGradient>

    <!-- Top Card 2 Gradient (Cyan-Blue) -->
    <linearGradient id="card2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>

    <!-- Top Card 3 Gradient (Emerald-Teal) -->
    <linearGradient id="card3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <!-- Top Card 4 Gradient (Purple-Indigo) -->
    <linearGradient id="card4Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>

    <!-- Bottom Box Dark Fill -->
    <linearGradient id="subBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#131e36" />
      <stop offset="100%" stop-color="#0d1527" />
    </linearGradient>

    <!-- Pill Gradients -->
    <linearGradient id="pillGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>

    <linearGradient id="pillGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>

    <linearGradient id="pillGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <linearGradient id="pillGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Subtle Drop Shadow Filter -->
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="${width}" height="${height}" rx="18" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="2" />

  <!-- HEADER BAR -->
  <g transform="translate(60, 48)">
    <!-- Brand Shield Icon -->
    <path d="M 0 10 Q 0 0 10 0 L 32 0 Q 42 0 42 10 L 42 32 Q 42 54 21 64 Q 0 54 0 32 Z" fill="#2563eb" />
    <path d="M 12 28 L 19 35 L 31 19" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Title Text -->
    <text x="56" y="32" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff" letter-spacing="0.5">BrandGuard AI</text>
    <line x1="310" y1="8" x2="310" y2="44" stroke="#334155" stroke-width="3" />
    <text x="330" y="32" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="25" font-weight="600" fill="#94a3b8">Methodology &amp; Process for Implementation</text>
  </g>

  <!-- TOP PIPELINE STAGES (Row 1) -->
  <!-- Card 1: Input -->
  <g transform="translate(60, 135)">
    <rect width="360" height="150" rx="14" fill="url(#card1Grad)" filter="url(#shadow)" stroke="#3b82f6" stroke-width="1.5" />
    <circle cx="180" cy="50" r="26" fill="#ffffff" fill-opacity="0.15" />
    <!-- File/Upload Icon -->
    <path d="M 172 40 L 184 40 L 190 46 L 190 62 L 172 62 Z" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" />
    <line x1="176" y1="50" x2="186" y2="50" stroke="#ffffff" stroke-width="2" />
    <line x1="176" y1="55" x2="184" y2="55" stroke="#ffffff" stroke-width="2" />
    <text x="180" y="100" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">Multi-Channel Input</text>
    <text x="180" y="125" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="500" fill="#bfdbfe" text-anchor="middle">(Text Copy &amp; Creative Asset)</text>
  </g>

  <!-- Arrow 1 -> 2 -->
  <g transform="translate(436, 195)">
    <path d="M 0 15 L 20 15 M 12 5 L 22 15 L 12 25" fill="none" stroke="#00d4ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Card 2: Processing -->
  <g transform="translate(475, 135)">
    <rect width="360" height="150" rx="14" fill="url(#card2Grad)" filter="url(#shadow)" stroke="#38bdf8" stroke-width="1.5" />
    <circle cx="180" cy="50" r="26" fill="#ffffff" fill-opacity="0.15" />
    <!-- Layers/Scan Icon -->
    <path d="M 168 50 L 180 43 L 192 50 L 180 57 Z" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M 168 55 L 180 62 L 192 55" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" />
    <text x="180" y="100" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">Multimodal Extraction</text>
    <text x="180" y="125" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="500" fill="#bae6fd" text-anchor="middle">(OCR &amp; Sharp Pixel Analysis)</text>
  </g>

  <!-- Arrow 2 -> 3 -->
  <g transform="translate(851, 195)">
    <path d="M 0 15 L 20 15 M 12 5 L 22 15 L 12 25" fill="none" stroke="#00d4ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Card 3: Core Logic -->
  <g transform="translate(890, 135)">
    <rect width="360" height="150" rx="14" fill="url(#card3Grad)" filter="url(#shadow)" stroke="#34d399" stroke-width="1.5" />
    <circle cx="180" cy="50" r="26" fill="#ffffff" fill-opacity="0.15" />
    <!-- AI Brain / Sparkle Icon -->
    <path d="M 180 38 L 183 47 L 192 50 L 183 53 L 180 62 L 177 53 L 168 50 L 177 47 Z" fill="#ffffff" />
    <circle cx="189" cy="40" r="2" fill="#ffffff" />
    <text x="180" y="100" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">Evidence Corroboration</text>
    <text x="180" y="125" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="500" fill="#a7f3d0" text-anchor="middle">(Gemini AI &amp; Zero-Trust Rules)</text>
  </g>

  <!-- Arrow 3 -> 4 -->
  <g transform="translate(1266, 195)">
    <path d="M 0 15 L 20 15 M 12 5 L 22 15 L 12 25" fill="none" stroke="#00d4ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <!-- Card 4: Output -->
  <g transform="translate(1305, 135)">
    <rect width="409" height="150" rx="14" fill="url(#card4Grad)" filter="url(#shadow)" stroke="#818cf8" stroke-width="1.5" />
    <circle cx="204" cy="50" r="26" fill="#ffffff" fill-opacity="0.15" />
    <!-- Report / Shield Check Icon -->
    <path d="M 194 42 Q 194 36 204 36 Q 214 36 214 42 L 214 52 Q 214 62 204 66 Q 194 62 194 52 Z" fill="none" stroke="#ffffff" stroke-width="2.5" />
    <path d="M 199 50 L 203 54 L 210 46" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
    <text x="204" y="100" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="700" fill="#ffffff" text-anchor="middle">Governance &amp; 1-Click Fix</text>
    <text x="204" y="125" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="500" fill="#c7d2fe" text-anchor="middle">(Brand Score &amp; Audit Trail)</text>
  </g>

  <!-- DIVIDER DASHED LINE -->
  <line x1="60" y1="325" x2="1714" y2="325" stroke="#1e293b" stroke-width="2" stroke-dasharray="8 6" />

  <!-- DETAILED STAGES (Row 2 - 4 Cards) -->

  <!-- Detail Box 1 -->
  <g transform="translate(60, 355)">
    <rect width="380" height="475" rx="14" fill="url(#subBoxGrad)" stroke="#1e3a8a" stroke-width="1.5" />
    <!-- Header Pill -->
    <rect x="24" y="24" width="130" height="38" rx="8" fill="url(#pillGrad1)" />
    <text x="38" y="49" font-family="'Segoe UI', Roboto, Arial" font-size="17" font-weight="800" fill="#ffffff">1  Input</text>

    <!-- Subtitle -->
    <text x="24" y="94" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="600" fill="#e2e8f0">Campaign Assets Ingestion</text>
    <text x="24" y="120" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Accepts multi-format creative &amp; text:</text>

    <!-- Inner Mockup / Features Card -->
    <rect x="20" y="145" width="340" height="305" rx="10" fill="#0b1329" stroke="#1e293b" />

    <!-- Feature 1 -->
    <rect x="36" y="170" width="308" height="60" rx="8" fill="#131e36" stroke="#2563eb" stroke-opacity="0.4" />
    <text x="52" y="194" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#60a5fa">Marketing Ad Copy</text>
    <text x="52" y="216" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Headlines, claims &amp; full campaign text</text>

    <!-- Feature 2 -->
    <rect x="36" y="245" width="308" height="60" rx="8" fill="#131e36" stroke="#2563eb" stroke-opacity="0.4" />
    <text x="52" y="269" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#60a5fa">Creative Display Banners</text>
    <text x="52" y="291" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">PNG, JPG, WebP images (up to 25MB)</text>

    <!-- Feature 3 -->
    <rect x="36" y="320" width="308" height="60" rx="8" fill="#131e36" stroke="#2563eb" stroke-opacity="0.4" />
    <text x="52" y="344" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#60a5fa">Target Distribution Channel</text>
    <text x="52" y="366" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">LinkedIn, Google, Meta, Instagram</text>

    <!-- Badges Row -->
    <rect x="36" y="398" width="85" height="26" rx="6" fill="#1e3a8a" />
    <text x="78" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Dual-Mode</text>

    <rect x="130" y="398" width="95" height="26" rx="6" fill="#1e3a8a" />
    <text x="177" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Live Presets</text>

    <rect x="234" y="398" width="110" height="26" rx="6" fill="#1e3a8a" />
    <text x="289" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">100% Client Sync</text>
  </g>

  <!-- Detail Box 2 -->
  <g transform="translate(470, 355)">
    <rect width="380" height="475" rx="14" fill="url(#subBoxGrad)" stroke="#0284c7" stroke-width="1.5" />
    <!-- Header Pill -->
    <rect x="24" y="24" width="165" height="38" rx="8" fill="url(#pillGrad2)" />
    <text x="38" y="49" font-family="'Segoe UI', Roboto, Arial" font-size="17" font-weight="800" fill="#ffffff">2  Processing</text>

    <!-- Subtitle -->
    <text x="24" y="94" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="600" fill="#e2e8f0">Pixel &amp; Linguistic Linting</text>
    <text x="24" y="120" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Sub-millisecond static compliance checks:</text>

    <!-- Inner Mockup / Features Card -->
    <rect x="20" y="145" width="340" height="305" rx="10" fill="#0b1329" stroke="#1e293b" />

    <!-- Feature 1 -->
    <rect x="36" y="170" width="308" height="60" rx="8" fill="#131e36" stroke="#0284c7" stroke-opacity="0.4" />
    <text x="52" y="194" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#38bdf8">Deterministic Rules Engine</text>
    <text x="52" y="216" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Regex checks: Guarantees, Superlatives</text>

    <!-- Feature 2 -->
    <rect x="36" y="245" width="308" height="60" rx="8" fill="#131e36" stroke="#0284c7" stroke-opacity="0.4" />
    <text x="52" y="269" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#38bdf8">Tesseract OCR &amp; Sharp Pixels</text>
    <text x="52" y="291" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Extracts rendered text from images</text>

    <!-- Feature 3 -->
    <rect x="36" y="320" width="308" height="60" rx="8" fill="#131e36" stroke="#0284c7" stroke-opacity="0.4" />
    <text x="52" y="344" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#38bdf8">WCAG 2.1 AA &amp; Color Audit</text>
    <text x="52" y="366" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Contrast ratios &amp; hex brand palette check</text>

    <!-- Badges Row -->
    <rect x="36" y="398" width="90" height="26" rx="6" fill="#0c4a6e" />
    <text x="81" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#7dd3fc" text-anchor="middle">Sharp Pixels</text>

    <rect x="135" y="398" width="90" height="26" rx="6" fill="#0c4a6e" />
    <text x="180" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#7dd3fc" text-anchor="middle">WCAG 2.1 AA</text>

    <rect x="234" y="398" width="110" height="26" rx="6" fill="#0c4a6e" />
    <text x="289" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#7dd3fc" text-anchor="middle">Tesseract OCR</text>
  </g>

  <!-- Detail Box 3 -->
  <g transform="translate(880, 355)">
    <rect width="380" height="475" rx="14" fill="url(#subBoxGrad)" stroke="#059669" stroke-width="1.5" />
    <!-- Header Pill -->
    <rect x="24" y="24" width="165" height="38" rx="8" fill="url(#pillGrad3)" />
    <text x="38" y="49" font-family="'Segoe UI', Roboto, Arial" font-size="17" font-weight="800" fill="#ffffff">3  Core Logic</text>

    <!-- Subtitle -->
    <text x="24" y="94" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="600" fill="#e2e8f0">Gemini Claim Substantiation</text>
    <text x="24" y="120" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Zero-Trust AI cross-examination:</text>

    <!-- Inner Mockup / Features Card -->
    <rect x="20" y="145" width="340" height="305" rx="10" fill="#0b1329" stroke="#1e293b" />

    <!-- Feature 1 -->
    <rect x="36" y="170" width="308" height="60" rx="8" fill="#131e36" stroke="#059669" stroke-opacity="0.4" />
    <text x="52" y="194" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#34d399">Gemini AI Claim Extractor</text>
    <text x="52" y="216" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Isolates metrics, guarantees &amp; superlatives</text>

    <!-- Feature 2 -->
    <rect x="36" y="245" width="308" height="60" rx="8" fill="#131e36" stroke="#059669" stroke-opacity="0.4" />
    <text x="52" y="269" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#34d399">Evidence Repository Ingestion</text>
    <text x="52" y="291" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Whitepapers, benchmark audits &amp; SLAs</text>

    <!-- Feature 3 -->
    <rect x="36" y="320" width="308" height="60" rx="8" fill="#131e36" stroke="#059669" stroke-opacity="0.4" />
    <text x="52" y="344" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#34d399">5 Temporal Status Classifiers</text>
    <text x="52" y="366" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">SUPPORTED • UNSUPPORTED • EXPIRED...</text>

    <!-- Badges Row -->
    <rect x="36" y="398" width="95" height="26" rx="6" fill="#064e3b" />
    <text x="83" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#6ee7b7" text-anchor="middle">Gemini 2.5</text>

    <rect x="140" y="398" width="100" height="26" rx="6" fill="#064e3b" />
    <text x="190" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#6ee7b7" text-anchor="middle">Evidence RLS</text>

    <rect x="249" y="398" width="95" height="26" rx="6" fill="#064e3b" />
    <text x="296" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#6ee7b7" text-anchor="middle">Expiry Watch</text>
  </g>

  <!-- Detail Box 4 -->
  <g transform="translate(1290, 355)">
    <rect width="424" height="475" rx="14" fill="url(#subBoxGrad)" stroke="#6366f1" stroke-width="1.5" />
    <!-- Header Pill -->
    <rect x="24" y="24" width="145" height="38" rx="8" fill="url(#pillGrad4)" />
    <text x="38" y="49" font-family="'Segoe UI', Roboto, Arial" font-size="17" font-weight="800" fill="#ffffff">4  Output</text>

    <!-- Subtitle -->
    <text x="24" y="94" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="600" fill="#e2e8f0">Governance Dashboard &amp; Remediation</text>
    <text x="24" y="120" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Actionable insights &amp; audit evidence:</text>

    <!-- Inner Mockup / Features Card -->
    <rect x="20" y="145" width="384" height="305" rx="10" fill="#0b1329" stroke="#1e293b" />

    <!-- Feature 1 -->
    <rect x="36" y="170" width="352" height="60" rx="8" fill="#131e36" stroke="#6366f1" stroke-opacity="0.4" />
    <text x="52" y="194" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#a5b4fc">Brand Health Score (0-100)</text>
    <text x="52" y="216" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Weighted composite of rules &amp; claims</text>

    <!-- Feature 2 -->
    <rect x="36" y="245" width="352" height="60" rx="8" fill="#131e36" stroke="#6366f1" stroke-opacity="0.4" />
    <text x="52" y="269" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#a5b4fc">1-Click Compliant Auto-Fix</text>
    <text x="52" y="291" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Dynamic compliant rewrites by Gemini</text>

    <!-- Feature 3 -->
    <rect x="36" y="320" width="352" height="60" rx="8" fill="#131e36" stroke="#6366f1" stroke-opacity="0.4" />
    <text x="52" y="344" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="700" fill="#a5b4fc">Interactive OCR Asset Canvas</text>
    <text x="52" y="366" font-family="'Segoe UI', Roboto, Arial" font-size="12" fill="#cbd5e1">Bounding box overlays &amp; contrast map</text>

    <!-- Badges Row -->
    <rect x="36" y="398" width="105" height="26" rx="6" fill="#312e81" />
    <text x="88" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#c7d2fe" text-anchor="middle">Health 0-100</text>

    <rect x="150" y="398" width="115" height="26" rx="6" fill="#312e81" />
    <text x="207" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#c7d2fe" text-anchor="middle">Evidence Link</text>

    <rect x="274" y="398" width="114" height="26" rx="6" fill="#312e81" />
    <text x="331" y="415" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="600" fill="#c7d2fe" text-anchor="middle">Audit Logs</text>
  </g>
</svg>
`;

sharp(Buffer.from(svg))
  .png()
  .toFile('scripts/brandguard_methodology_flow.png')
  .then(() => {
    console.log('BrandGuard Methodology Flow diagram rendered successfully!');
    const stat = fs.statSync('scripts/brandguard_methodology_flow.png');
    console.log('Image file size:', stat.size, 'bytes');
  })
  .catch(err => {
    console.error('Error rendering diagram:', err);
  });
