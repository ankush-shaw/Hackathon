const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const width = 1920;
const height = 750;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050a15"/>
      <stop offset="50%" stop-color="#091224"/>
      <stop offset="100%" stop-color="#050c1a"/>
    </linearGradient>

    <!-- Top Cards Gradients -->
    <!-- Card 1: Royal Blue -->
    <linearGradient id="card1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <!-- Card 2: Sky Blue -->
    <linearGradient id="card2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>

    <!-- Card 3: Emerald Green -->
    <linearGradient id="card3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Card 4: Purple Indigo -->
    <linearGradient id="card4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>

    <!-- Inner Mockup Container Dark Gradient -->
    <linearGradient id="innerCardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f192f"/>
      <stop offset="100%" stop-color="#0a1222"/>
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="shadow" x="-5%" y="-10%" width="110%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="cardShadow" x="-5%" y="-10%" width="110%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Base Canvas Background -->
  <rect width="${width}" height="${height}" rx="16" fill="url(#bg)" stroke="#1e293b" stroke-width="2"/>

  <!-- ==================== TOP TITLE BAR ==================== -->
  <g transform="translate(60, 42)">
    <!-- BrandGuard Logo Icon -->
    <g transform="translate(0, -6)">
      <path d="M 0 10 Q 0 0 10 0 L 32 0 Q 42 0 42 10 L 42 30 Q 42 52 21 62 Q 0 52 0 30 Z" fill="#2563eb" filter="url(#glow)"/>
      <path d="M 12 28 L 19 35 L 31 19" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- BrandGuard AI Title -->
    <text x="60" y="36" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="0.5">BrandGuard AI</text>

    <!-- Vertical Separator -->
    <line x1="330" y1="8" x2="330" y2="44" stroke="#334155" stroke-width="2.5"/>

    <!-- Process Title -->
    <text x="355" y="34" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="25" font-weight="600" fill="#cbd5e1" letter-spacing="0.2">Methodology &amp; Process for Implementation</text>
  </g>

  <!-- ==================== TOP CARDS ROW (1, 2, 3, 4) ==================== -->
  <!-- Card 1: Input -->
  <g transform="translate(60, 110)">
    <rect width="380" height="135" rx="16" fill="url(#card1)" filter="url(#cardShadow)" stroke="#60a5fa" stroke-width="1.5"/>
    <circle cx="190" cy="46" r="26" fill="#ffffff"/>
    <!-- Upload / Content Icon -->
    <path d="M 180 48 L 190 38 L 200 48 M 190 38 L 190 56" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 176 56 L 204 56" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-linecap="round"/>
    <text x="190" y="96" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="800" fill="#ffffff" text-anchor="middle">Ad Assets</text>
    <text x="190" y="118" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="600" fill="#bfdbfe" text-anchor="middle">(Input)</text>
  </g>

  <!-- Connecting Arrow 1 -> 2 -->
  <g transform="translate(452, 165)">
    <line x1="0" y1="12" x2="22" y2="12" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
    <polyline points="14,4 24,12 14,20" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Card 2: Processing -->
  <g transform="translate(488, 110)">
    <rect width="380" height="135" rx="16" fill="url(#card2)" filter="url(#cardShadow)" stroke="#38bdf8" stroke-width="1.5"/>
    <circle cx="190" cy="46" r="26" fill="#ffffff"/>
    <!-- Scan / Document Icon -->
    <path d="M 180 36 L 194 36 L 200 42 L 200 56 L 180 56 Z" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="196" cy="52" r="5" fill="none" stroke="#0284c7" stroke-width="2.5"/>
    <line x1="200" y1="56" x2="204" y2="60" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
    <text x="190" y="96" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="800" fill="#ffffff" text-anchor="middle">Multimodal Linting</text>
    <text x="190" y="118" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="600" fill="#bae6fd" text-anchor="middle">(Processing)</text>
  </g>

  <!-- Connecting Arrow 2 -> 3 -->
  <g transform="translate(880, 165)">
    <line x1="0" y1="12" x2="22" y2="12" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
    <polyline points="14,4 24,12 14,20" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Card 3: Core Logic -->
  <g transform="translate(916, 110)">
    <rect width="380" height="135" rx="16" fill="url(#card3)" filter="url(#cardShadow)" stroke="#34d399" stroke-width="1.5"/>
    <circle cx="190" cy="46" r="26" fill="#ffffff"/>
    <!-- AI Brain / Sparkle Icon -->
    <path d="M 190 34 L 193 43 L 202 46 L 193 49 L 190 58 L 187 49 L 178 46 L 187 43 Z" fill="#059669"/>
    <circle cx="199" cy="37" r="2" fill="#059669"/>
    <circle cx="181" cy="53" r="1.5" fill="#059669"/>
    <text x="190" y="96" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="800" fill="#ffffff" text-anchor="middle">Claim Verification</text>
    <text x="190" y="118" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="600" fill="#a7f3d0" text-anchor="middle">(Core Logic)</text>
  </g>

  <!-- Connecting Arrow 3 -> 4 -->
  <g transform="translate(1308, 165)">
    <line x1="0" y1="12" x2="22" y2="12" stroke="#38bdf8" stroke-width="4" stroke-linecap="round"/>
    <polyline points="14,4 24,12 14,20" fill="none" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Card 4: Output -->
  <g transform="translate(1344, 110)">
    <rect width="516" height="135" rx="16" fill="url(#card4)" filter="url(#cardShadow)" stroke="#a78bfa" stroke-width="1.5"/>
    <circle cx="258" cy="46" r="26" fill="#ffffff"/>
    <!-- Security Shield / Checkmark Icon -->
    <path d="M 248 38 Q 248 33 258 33 Q 268 33 268 38 L 268 47 Q 268 56 258 60 Q 248 56 248 47 Z" fill="none" stroke="#6d28d9" stroke-width="2.5"/>
    <path d="M 253 46 L 257 50 L 264 42" fill="none" stroke="#6d28d9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="258" y="96" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="800" fill="#ffffff" text-anchor="middle">Compliance Report</text>
    <text x="258" y="118" font-family="'Segoe UI', Roboto, Arial" font-size="14" font-weight="600" fill="#ddd6fe" text-anchor="middle">(Output)</text>
  </g>

  <!-- ==================== BOTTOM CONTAINER (DASHED BORDER) ==================== -->
  <g transform="translate(60, 275)">
    <rect width="1800" height="430" rx="20" fill="#081021" fill-opacity="0.8" stroke="#0284c7" stroke-width="2" stroke-dasharray="10 8"/>

    <!-- SECTION 1: INPUT -->
    <g transform="translate(30, 25)">
      <!-- Number Circle + Label -->
      <circle cx="20" cy="20" r="18" fill="#2563eb"/>
      <text x="20" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">1</text>
      <text x="50" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="800" fill="#ffffff">Input</text>

      <!-- Description Line -->
      <text x="5" y="68" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Ad copy text, headlines, and creative</text>
      <text x="5" y="88" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">banner assets across ad channels.</text>

      <!-- Visual Mockup Box -->
      <g transform="translate(0, 110)">
        <rect width="365" height="240" rx="12" fill="url(#innerCardBg)" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Mini App Window Header -->
        <rect width="365" height="34" rx="12" fill="#131e36"/>
        <rect y="22" width="365" height="12" fill="#131e36"/>
        <circle cx="20" cy="17" r="4.5" fill="#ef4444"/>
        <circle cx="36" cy="17" r="4.5" fill="#f59e0b"/>
        <circle cx="52" cy="17" r="4.5" fill="#10b981"/>

        <!-- Channel Badge -->
        <rect x="235" y="7" width="115" height="20" rx="10" fill="#1e3a8a"/>
        <text x="292" y="21" font-family="'Segoe UI', Roboto, Arial" font-size="10.5" font-weight="700" fill="#93c5fd" text-anchor="middle">LinkedIn Ad (B2B)</text>

        <!-- Mockup Content: Text Area & File Thumbnail -->
        <g transform="translate(18, 50)">
          <rect width="180" height="160" rx="8" fill="#0b1329" stroke="#1e293b"/>
          <text x="12" y="24" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="700" fill="#60a5fa">Marketing Ad Copy</text>
          
          <rect x="12" y="38" width="156" height="6" rx="3" fill="#334155"/>
          <rect x="12" y="52" width="130" height="6" rx="3" fill="#334155"/>
          <rect x="12" y="66" width="145" height="6" rx="3" fill="#334155"/>
          
          <rect x="12" y="85" width="156" height="28" rx="4" fill="#1e293b"/>
          <text x="18" y="103" font-family="'Segoe UI', Roboto, Arial" font-size="10" font-weight="600" fill="#f87171">"10x guaranteed growth"</text>

          <rect x="12" y="125" width="156" height="6" rx="3" fill="#334155"/>
          <rect x="12" y="139" width="100" height="6" rx="3" fill="#334155"/>
        </g>

        <!-- Banner Image Box -->
        <g transform="translate(210, 50)">
          <rect width="135" height="160" rx="8" fill="#0b1329" stroke="#1e293b"/>
          <rect x="10" y="12" width="115" height="95" rx="6" fill="#1e293b"/>
          <circle cx="36" cy="40" r="10" fill="#38bdf8" fill-opacity="0.3"/>
          <path d="M 22 88 L 50 55 L 75 75 L 95 60 L 115 88 Z" fill="#0284c7" fill-opacity="0.5"/>
          <text x="67" y="128" font-family="'Segoe UI', Roboto, Arial" font-size="10" font-weight="600" fill="#cbd5e1" text-anchor="middle">Banner Image</text>
          <text x="67" y="144" font-family="'Segoe UI', Roboto, Arial" font-size="9" fill="#64748b" text-anchor="middle">PNG / JPG (25MB)</text>
        </g>
      </g>
    </g>

    <!-- Arrow 1 -> 2 (Subtle) -->
    <g transform="translate(425, 220)">
      <line x1="0" y1="12" x2="16" y2="12" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      <polyline points="10,6 18,12 10,18" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- SECTION 2: PROCESSING -->
    <g transform="translate(460, 25)">
      <!-- Number Circle + Label -->
      <circle cx="20" cy="20" r="18" fill="#0284c7"/>
      <text x="20" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">2</text>
      <text x="50" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="800" fill="#ffffff">Processing</text>

      <!-- Description Line -->
      <text x="5" y="68" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Regex rule engine, Sharp pixel audits,</text>
      <text x="5" y="88" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">and Tesseract OCR text extraction.</text>

      <!-- Visual Mockup Box -->
      <g transform="translate(0, 110)">
        <rect width="365" height="240" rx="12" fill="url(#innerCardBg)" stroke="#1e293b" stroke-width="1.5"/>

        <g transform="translate(24, 60)">
          <rect width="90" height="115" rx="8" fill="#0b1329" stroke="#0284c7" stroke-width="1.5"/>
          <text x="45" y="68" font-family="'Segoe UI', monospace, Arial" font-size="34" font-weight="900" fill="#38bdf8" text-anchor="middle">&lt;/&gt;</text>
          <circle cx="65" cy="80" r="22" fill="#0b1329" stroke="#38bdf8" stroke-width="3"/>
          <line x1="81" y1="96" x2="98" y2="113" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round"/>
        </g>

        <g transform="translate(135, 40)">
          <rect width="205" height="42" rx="21" fill="#450a0a" stroke="#b91c1c" stroke-width="1.5"/>
          <circle cx="22" cy="21" r="11" fill="#dc2626"/>
          <path d="M 18 17 L 26 25 M 26 17 L 18 25" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <text x="44" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="13" font-weight="700" fill="#fecaca">Banned Guarantees</text>

          <g transform="translate(0, 56)">
            <rect width="205" height="42" rx="21" fill="#0c4a6e" stroke="#0284c7" stroke-width="1.5"/>
            <circle cx="22" cy="21" r="11" fill="#0284c7"/>
            <circle cx="22" cy="21" r="5" fill="#ffffff"/>
            <text x="44" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="13" font-weight="700" fill="#bae6fd">WCAG 2.1 AA Contrast</text>
          </g>

          <g transform="translate(0, 112)">
            <rect width="205" height="42" rx="21" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
            <circle cx="22" cy="21" r="11" fill="#6366f1"/>
            <path d="M 17 21 L 27 21 M 22 16 L 22 26" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
            <text x="44" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="13" font-weight="700" fill="#c7d2fe">Tesseract OCR Text</text>
          </g>
        </g>
      </g>
    </g>

    <!-- Arrow 2 -> 3 (Subtle) -->
    <g transform="translate(855, 220)">
      <line x1="0" y1="12" x2="16" y2="12" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      <polyline points="10,6 18,12 10,18" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- SECTION 3: CORE LOGIC -->
    <g transform="translate(890, 25)">
      <!-- Number Circle + Label -->
      <circle cx="20" cy="20" r="18" fill="#059669"/>
      <text x="20" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">3</text>
      <text x="50" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="800" fill="#ffffff">Core Logic</text>

      <!-- Description Line -->
      <text x="5" y="68" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Gemini AI extracts claims &amp; cross-checks</text>
      <text x="5" y="88" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">against internal verified evidence records.</text>

      <!-- Visual Mockup Box -->
      <g transform="translate(0, 110)">
        <rect width="365" height="240" rx="12" fill="url(#innerCardBg)" stroke="#1e293b" stroke-width="1.5"/>

        <g transform="translate(18, 45)">
          <rect width="115" height="145" rx="8" fill="#0b1329" stroke="#059669" stroke-width="1.5"/>
          <rect x="10" y="12" width="95" height="18" rx="4" fill="#064e3b"/>
          <text x="57" y="25" font-family="'Segoe UI', Roboto, Arial" font-size="9.5" font-weight="800" fill="#6ee7b7" text-anchor="middle">EVIDENCE DB</text>
          
          <text x="12" y="52" font-family="'Segoe UI', monospace" font-size="9" fill="#94a3b8">EVID-SLA-99</text>
          <text x="12" y="68" font-family="'Segoe UI', monospace" font-size="9" fill="#94a3b8">EVID-DEV-10M</text>
          <text x="12" y="84" font-family="'Segoe UI', monospace" font-size="9" fill="#94a3b8">FTC-ACT-2026</text>
          
          <rect x="10" y="102" width="95" height="28" rx="4" fill="#131e36"/>
          <text x="57" y="120" font-family="'Segoe UI', Roboto, Arial" font-size="8.5" font-weight="600" fill="#38bdf8" text-anchor="middle">Temporal Expiry</text>
        </g>

        <g transform="translate(142, 110)">
          <line x1="0" y1="12" x2="16" y2="12" stroke="#34d399" stroke-width="3" stroke-linecap="round"/>
          <polyline points="10,6 18,12 10,18" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </g>

        <g transform="translate(172, 45)">
          <rect width="175" height="145" rx="8" fill="#0b1329" stroke="#34d399" stroke-width="1.5"/>
          
          <circle cx="87" cy="40" r="24" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
          <text x="87" y="47" font-family="'Segoe UI', Roboto, Arial" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">AI</text>
          <circle cx="68" cy="24" r="2.5" fill="#34d399"/>
          <circle cx="106" cy="24" r="2.5" fill="#34d399"/>

          <g transform="translate(12, 76)">
            <rect width="70" height="24" rx="4" fill="#064e3b"/>
            <text x="35" y="92" font-family="'Segoe UI', Roboto, Arial" font-size="9" font-weight="800" fill="#a7f3d0" text-anchor="middle">SUPPORTED</text>

            <rect x="78" width="75" height="24" rx="4" fill="#78350f"/>
            <text x="115" y="92" font-family="'Segoe UI', Roboto, Arial" font-size="9" font-weight="800" fill="#fde68a" text-anchor="middle">UNSUPPORTED</text>

            <rect y="30" width="70" height="24" rx="4" fill="#7f1d1d"/>
            <text x="35" y="46" font-family="'Segoe UI', Roboto, Arial" font-size="9" font-weight="800" fill="#fca5a5" text-anchor="middle">CONTRADICTED</text>

            <rect x="78" y="30" width="75" height="24" rx="4" fill="#312e81"/>
            <text x="115" y="46" font-family="'Segoe UI', Roboto, Arial" font-size="9" font-weight="800" fill="#c7d2fe" text-anchor="middle">EXPIRED</text>
          </g>
        </g>
      </g>
    </g>

    <!-- Arrow 3 -> 4 (Subtle) -->
    <g transform="translate(1285, 220)">
      <line x1="0" y1="12" x2="16" y2="12" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round"/>
      <polyline points="10,6 18,12 10,18" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- SECTION 4: OUTPUT -->
    <g transform="translate(1320, 25)">
      <!-- Number Circle + Label -->
      <circle cx="20" cy="20" r="18" fill="#7c3aed"/>
      <text x="20" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="18" font-weight="900" fill="#ffffff" text-anchor="middle">4</text>
      <text x="50" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="22" font-weight="800" fill="#ffffff">Output</text>

      <!-- Description Line -->
      <text x="5" y="68" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">Brand Health Score, identified findings,</text>
      <text x="5" y="88" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" fill="#94a3b8">and 1-click compliant replacements.</text>

      <!-- Visual Mockup Box (Matching 4 Pill List in Reference) -->
      <g transform="translate(0, 110)">
        <rect width="445" height="240" rx="12" fill="url(#innerCardBg)" stroke="#1e293b" stroke-width="1.5"/>

        <g transform="translate(24, 24)">
          <!-- Finding 1: Red Warning (Security / Brand Risks Found) -->
          <rect width="395" height="42" rx="8" fill="#450a0a" stroke="#ef4444" stroke-width="1.2"/>
          <path d="M 24 13 L 34 31 L 14 31 Z" fill="#ef4444"/>
          <text x="24" y="28" font-family="'Segoe UI', Arial" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">!</text>
          <text x="46" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" font-weight="700" fill="#fca5a5">Brand Violations Detected (e.g. "10x guaranteed")</text>

          <!-- Finding 2: Blue Evidence Path (Citation & Benchmark) -->
          <g transform="translate(0, 52)">
            <rect width="395" height="42" rx="8" fill="#0f2347" stroke="#3b82f6" stroke-width="1.2"/>
            <circle cx="20" cy="21" r="4" fill="#60a5fa"/>
            <circle cx="32" cy="14" r="3" fill="#60a5fa"/>
            <circle cx="32" cy="28" r="3" fill="#60a5fa"/>
            <line x1="20" y1="21" x2="32" y2="14" stroke="#60a5fa" stroke-width="1.5"/>
            <line x1="20" y1="21" x2="32" y2="28" stroke="#60a5fa" stroke-width="1.5"/>
            <text x="46" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" font-weight="700" fill="#93c5fd">Evidence Citation (SLA-2025-V2 Attached)</text>
          </g>

          <!-- Finding 3: Purple Explanation (Health Score 0-100) -->
          <g transform="translate(0, 104)">
            <rect width="395" height="42" rx="8" fill="#2e1065" stroke="#8b5cf6" stroke-width="1.2"/>
            <rect x="15" y="13" width="18" height="14" rx="3" fill="none" stroke="#a78bfa" stroke-width="2"/>
            <polyline points="20,27 20,30 24,27" fill="none" stroke="#a78bfa" stroke-width="2"/>
            <text x="46" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" font-weight="700" fill="#ddd6fe">Brand Health Score: 92/100 (Safe for Launch)</text>
          </g>

          <!-- Finding 4: Green Fix (Suggested Compliant Fixes) -->
          <g transform="translate(0, 156)">
            <rect width="395" height="42" rx="8" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>
            <path d="M 18 16 L 22 20 L 30 12 L 32 14 L 24 22 L 28 26 L 24 30 L 14 20 Z" fill="#34d399"/>
            <text x="46" y="27" font-family="'Segoe UI', Roboto, Arial" font-size="13.5" font-weight="700" fill="#a7f3d0">1-Click Compliant Replacement Suggested</text>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>
`;

// Render using sharp
const outputPath = path.join(__dirname, 'brandguard_proper_workflow.png');

sharp(Buffer.from(svg))
  .png({ quality: 100 })
  .toFile(outputPath)
  .then(() => {
    console.log('SUCCESS! Rendered BrandGuard proper workflow diagram to:', outputPath);
    const stat = fs.statSync(outputPath);
    console.log('File size:', stat.size, 'bytes');

    // Also copy to artifact directory
    const artifactPath = 'C:\\Users\\ankus\\.gemini\\antigravity\\brain\\2b26b26a-8d44-4e01-97cd-8c514ad781ee\\brandguard_proper_workflow.png';
    fs.copyFileSync(outputPath, artifactPath);
    console.log('Copied to artifact path:', artifactPath);
  })
  .catch(err => {
    console.error('Error rendering diagram:', err);
  });
