const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const width = 2400;
const height = 880;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Canvas Gradient -->
    <linearGradient id="canvasBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#040814"/>
      <stop offset="40%" stop-color="#081023"/>
      <stop offset="100%" stop-color="#040916"/>
    </linearGradient>

    <!-- Top Cards Gradients -->
    <!-- Card 1: Royal Blue -->
    <linearGradient id="card1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <!-- Card 2: Electric Cyan / Sky -->
    <linearGradient id="card2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>

    <!-- Card 3: Emerald Jade -->
    <linearGradient id="card3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Card 4: Violet Purple -->
    <linearGradient id="card4Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>

    <!-- Card Glass Sheen Overlay -->
    <linearGradient id="glassSheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <!-- Mockup Dark Panel Gradient -->
    <linearGradient id="mockupBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0d172e"/>
      <stop offset="100%" stop-color="#080f20"/>
    </linearGradient>

    <!-- Glowing Cyan Arrow -->
    <linearGradient id="cyanArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#00f2fe"/>
    </linearGradient>

    <!-- Logo Gradient -->
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>

    <!-- Filters -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- ==================== BACKGROUND ==================== -->
  <rect width="${width}" height="${height}" rx="20" fill="url(#canvasBg)" stroke="#1e293b" stroke-width="2"/>

  <!-- Subtle Ambient Glow Orbs -->
  <circle cx="200" cy="150" r="160" fill="#2563eb" fill-opacity="0.08" filter="blur(60px)"/>
  <circle cx="1200" cy="150" r="180" fill="#059669" fill-opacity="0.06" filter="blur(60px)"/>
  <circle cx="2100" cy="150" r="160" fill="#7c3aed" fill-opacity="0.08" filter="blur(60px)"/>

  <!-- ==================== TOP TITLE BAR ==================== -->
  <g transform="translate(70, 48)">
    <!-- Shield Logo Emblem -->
    <g transform="translate(0, -6)">
      <!-- Outer Shield Outline -->
      <path d="M 0 12 Q 0 0 12 0 L 36 0 Q 48 0 48 12 L 48 34 Q 48 58 24 70 Q 0 58 0 34 Z" fill="url(#logoGrad)" filter="url(#neonGlow)"/>
      <!-- Inner Shield Core -->
      <path d="M 5 14 Q 5 5 14 5 L 34 5 Q 43 5 43 14 L 43 32 Q 43 52 24 62 Q 5 52 5 32 Z" fill="#070d1e"/>
      <!-- Cyber Checkmark & Sparkle -->
      <path d="M 14 30 L 21 38 L 34 20" fill="none" stroke="#00f2fe" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="24" cy="12" r="3" fill="#38bdf8"/>
    </g>

    <!-- Main Title -->
    <text x="70" y="40" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="38" font-weight="900" fill="#ffffff" letter-spacing="0.5">BrandGuard AI</text>

    <!-- Vertical Divider -->
    <line x1="380" y1="8" x2="380" y2="48" stroke="#334155" stroke-width="3"/>

    <!-- Process Title -->
    <text x="410" y="38" font-family="'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="28" font-weight="600" fill="#cbd5e1" letter-spacing="0.3">Methodology &amp; Process for Implementation</text>
  </g>

  <!-- ==================== TOP ROW: 4 PIPELINE CARDS ==================== -->
  
  <!-- CARD 1: INPUT -->
  <g transform="translate(70, 125)">
    <rect width="475" height="150" rx="18" fill="url(#card1Grad)" filter="url(#softShadow)" stroke="#60a5fa" stroke-width="1.5"/>
    <rect width="475" height="65" rx="18" fill="url(#glassSheen)"/>
    <!-- Icon Circle -->
    <circle cx="237" cy="50" r="30" fill="#ffffff" filter="url(#softShadow)"/>
    <!-- Upload Icon -->
    <path d="M 224 53 L 237 40 L 250 53 M 237 40 L 237 62" fill="none" stroke="#1d4ed8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 220 62 L 254 62" fill="none" stroke="#1d4ed8" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Labels -->
    <text x="237" y="105" font-family="'Segoe UI', Roboto, Arial" font-size="23" font-weight="800" fill="#ffffff" text-anchor="middle">Ad Assets</text>
    <text x="237" y="130" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="600" fill="#bfdbfe" text-anchor="middle">(Input)</text>
  </g>

  <!-- ARROW 1 -> 2 -->
  <g transform="translate(560, 185)">
    <line x1="0" y1="15" x2="30" y2="15" stroke="url(#cyanArrowGrad)" stroke-width="5" stroke-linecap="round" filter="url(#neonGlow)"/>
    <polyline points="20,5 34,15 20,25" fill="none" stroke="url(#cyanArrowGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- CARD 2: PROCESSING -->
  <g transform="translate(610, 125)">
    <rect width="475" height="150" rx="18" fill="url(#card2Grad)" filter="url(#softShadow)" stroke="#38bdf8" stroke-width="1.5"/>
    <rect width="475" height="65" rx="18" fill="url(#glassSheen)"/>
    <!-- Icon Circle -->
    <circle cx="237" cy="50" r="30" fill="#ffffff" filter="url(#softShadow)"/>
    <!-- Document Lens Icon -->
    <path d="M 224 38 L 240 38 L 248 46 L 248 62 L 224 62 Z" fill="none" stroke="#0284c7" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="244" cy="57" r="7" fill="none" stroke="#0284c7" stroke-width="3"/>
    <line x1="249" y1="62" x2="255" y2="68" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Labels -->
    <text x="237" y="105" font-family="'Segoe UI', Roboto, Arial" font-size="23" font-weight="800" fill="#ffffff" text-anchor="middle">Multimodal Linting</text>
    <text x="237" y="130" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="600" fill="#bae6fd" text-anchor="middle">(Processing)</text>
  </g>

  <!-- ARROW 2 -> 3 -->
  <g transform="translate(1100, 185)">
    <line x1="0" y1="15" x2="30" y2="15" stroke="url(#cyanArrowGrad)" stroke-width="5" stroke-linecap="round" filter="url(#neonGlow)"/>
    <polyline points="20,5 34,15 20,25" fill="none" stroke="url(#cyanArrowGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- CARD 3: CORE LOGIC -->
  <g transform="translate(1150, 125)">
    <rect width="475" height="150" rx="18" fill="url(#card3Grad)" filter="url(#softShadow)" stroke="#34d399" stroke-width="1.5"/>
    <rect width="475" height="65" rx="18" fill="url(#glassSheen)"/>
    <!-- Icon Circle -->
    <circle cx="237" cy="50" r="30" fill="#ffffff" filter="url(#softShadow)"/>
    <!-- AI Sparkle / Brain Icon -->
    <path d="M 237 36 L 241 47 L 252 51 L 241 55 L 237 66 L 233 55 L 222 51 L 233 47 Z" fill="#059669"/>
    <circle cx="248" cy="40" r="2.5" fill="#059669"/>
    <circle cx="226" cy="60" r="2" fill="#059669"/>
    <!-- Labels -->
    <text x="237" y="105" font-family="'Segoe UI', Roboto, Arial" font-size="23" font-weight="800" fill="#ffffff" text-anchor="middle">Claim Verification</text>
    <text x="237" y="130" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="600" fill="#a7f3d0" text-anchor="middle">(Core Logic)</text>
  </g>

  <!-- ARROW 3 -> 4 -->
  <g transform="translate(1640, 185)">
    <line x1="0" y1="15" x2="30" y2="15" stroke="url(#cyanArrowGrad)" stroke-width="5" stroke-linecap="round" filter="url(#neonGlow)"/>
    <polyline points="20,5 34,15 20,25" fill="none" stroke="url(#cyanArrowGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- CARD 4: OUTPUT -->
  <g transform="translate(1690, 125)">
    <rect width="640" height="150" rx="18" fill="url(#card4Grad)" filter="url(#softShadow)" stroke="#a78bfa" stroke-width="1.5"/>
    <rect width="640" height="65" rx="18" fill="url(#glassSheen)"/>
    <!-- Icon Circle -->
    <circle cx="320" cy="50" r="30" fill="#ffffff" filter="url(#softShadow)"/>
    <!-- Shield Checkmark Icon -->
    <path d="M 308 40 Q 308 34 320 34 Q 332 34 332 40 L 332 50 Q 332 61 320 66 Q 308 61 308 50 Z" fill="none" stroke="#6d28d9" stroke-width="3"/>
    <path d="M 314 49 L 319 54 L 327 45" fill="none" stroke="#6d28d9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Labels -->
    <text x="320" y="105" font-family="'Segoe UI', Roboto, Arial" font-size="23" font-weight="800" fill="#ffffff" text-anchor="middle">Compliance Report</text>
    <text x="320" y="130" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="600" fill="#ddd6fe" text-anchor="middle">(Output)</text>
  </g>

  <!-- ==================== BOTTOM CONTAINER (DASHED NEON BORDER) ==================== -->
  <g transform="translate(70, 310)">
    <rect width="2260" height="520" rx="22" fill="#081023" fill-opacity="0.85" stroke="#0ea5e9" stroke-width="2.5" stroke-dasharray="12 8" filter="url(#softShadow)"/>

    <!-- ==================== COLUMN 1: INPUT ==================== -->
    <g transform="translate(35, 30)">
      <!-- Number Badge -->
      <circle cx="24" cy="24" r="22" fill="#2563eb" filter="url(#softShadow)"/>
      <text x="24" y="32" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="900" fill="#ffffff" text-anchor="middle">1</text>
      <text x="60" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="26" font-weight="800" fill="#ffffff">Input</text>

      <!-- Subtitle Description -->
      <text x="5" y="76" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">Ad copy text, headlines, and visual creative</text>
      <text x="5" y="98" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">banner assets across publishing channels.</text>

      <!-- Visual Mockup Container -->
      <g transform="translate(0, 120)">
        <rect width="455" height="300" rx="14" fill="url(#mockupBg)" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Mini Browser Window Top Bar -->
        <rect width="455" height="38" rx="14" fill="#131e36"/>
        <rect y="26" width="455" height="12" fill="#131e36"/>
        <circle cx="24" cy="19" r="5" fill="#ef4444"/>
        <circle cx="42" cy="19" r="5" fill="#f59e0b"/>
        <circle cx="60" cy="19" r="5" fill="#10b981"/>

        <!-- Target Channel Badge -->
        <rect x="290" y="8" width="145" height="22" rx="11" fill="#1e3a8a"/>
        <text x="362" y="23" font-family="'Segoe UI', Roboto, Arial" font-size="11.5" font-weight="700" fill="#93c5fd" text-anchor="middle">LinkedIn Ad (B2B)</text>

        <!-- Marketing Ad Copy Mockup Box -->
        <g transform="translate(20, 56)">
          <rect width="230" height="215" rx="10" fill="#0b1329" stroke="#1e293b"/>
          <text x="16" y="28" font-family="'Segoe UI', Roboto, Arial" font-size="12.5" font-weight="700" fill="#60a5fa">Marketing Ad Copy</text>
          
          <rect x="16" y="44" width="195" height="7" rx="3.5" fill="#334155"/>
          <rect x="16" y="60" width="165" height="7" rx="3.5" fill="#334155"/>
          <rect x="16" y="76" width="180" height="7" rx="3.5" fill="#334155"/>
          
          <!-- Flagged Claim Highlight -->
          <rect x="16" y="98" width="198" height="34" rx="6" fill="#450a0a" stroke="#ef4444" stroke-width="1"/>
          <text x="24" y="120" font-family="'Segoe UI', Roboto, Arial" font-size="12" font-weight="700" fill="#fca5a5">"10x guaranteed growth"</text>

          <rect x="16" y="148" width="195" height="7" rx="3.5" fill="#334155"/>
          <rect x="16" y="164" width="140" height="7" rx="3.5" fill="#334155"/>
          <rect x="16" y="180" width="170" height="7" rx="3.5" fill="#334155"/>
        </g>

        <!-- Display Banner Image Asset Box -->
        <g transform="translate(265, 56)">
          <rect width="170" height="215" rx="10" fill="#0b1329" stroke="#1e293b"/>
          <!-- Image preview graphic -->
          <rect x="15" y="16" width="140" height="135" rx="8" fill="#13203c"/>
          <circle cx="45" cy="50" r="14" fill="#38bdf8" fill-opacity="0.25"/>
          <path d="M 25 125 L 65 75 L 100 110 L 125 90 L 145 125 Z" fill="#0284c7" fill-opacity="0.45"/>
          <text x="85" y="176" font-family="'Segoe UI', Roboto, Arial" font-size="13" font-weight="700" fill="#e2e8f0" text-anchor="middle">Display Banner</text>
          <text x="85" y="196" font-family="'Segoe UI', Roboto, Arial" font-size="11" fill="#64748b" text-anchor="middle">PNG, JPG, WebP (25MB)</text>
        </g>
      </g>
    </g>

    <!-- Subtle Connection Arrow 1 -> 2 -->
    <g transform="translate(520, 260)">
      <line x1="0" y1="15" x2="22" y2="15" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
      <polyline points="14,8 24,15 14,22" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- ==================== COLUMN 2: PROCESSING ==================== -->
    <g transform="translate(565, 30)">
      <!-- Number Badge -->
      <circle cx="24" cy="24" r="22" fill="#0284c7" filter="url(#softShadow)"/>
      <text x="24" y="32" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="900" fill="#ffffff" text-anchor="middle">2</text>
      <text x="60" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="26" font-weight="800" fill="#ffffff">Processing</text>

      <!-- Subtitle Description -->
      <text x="5" y="76" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">Regex rule engine, Sharp pixel audits,</text>
      <text x="5" y="98" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">and Tesseract OCR text extraction.</text>

      <!-- Visual Mockup Container -->
      <g transform="translate(0, 120)">
        <rect width="475" height="300" rx="14" fill="url(#mockupBg)" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Code Bracket Container with Scanner Lens -->
        <g transform="translate(25, 65)">
          <rect width="115" height="165" rx="10" fill="#0b1329" stroke="#0284c7" stroke-width="2"/>
          <text x="57" y="98" font-family="'Segoe UI', monospace, Arial" font-size="44" font-weight="900" fill="#38bdf8" text-anchor="middle">&lt;/&gt;</text>
          <!-- Magnifying Scanner Lens -->
          <circle cx="85" cy="115" r="28" fill="#0b1329" stroke="#38bdf8" stroke-width="4"/>
          <line x1="105" y1="135" x2="128" y2="158" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        </g>

        <!-- Stack of 3 Pill Tags (Matching Reference Style) -->
        <g transform="translate(160, 48)">
          <!-- Tag 1: Banned Guarantees -->
          <g>
            <rect width="285" height="52" rx="26" fill="#450a0a" stroke="#dc2626" stroke-width="1.5"/>
            <circle cx="28" cy="26" r="14" fill="#dc2626"/>
            <!-- Lock / Prohibition Icon -->
            <path d="M 23 21 L 33 31 M 33 21 L 23 31" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
            <text x="56" y="34" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="700" fill="#fecaca">Banned Guarantees</text>
          </g>

          <!-- Tag 2: WCAG 2.1 AA Contrast -->
          <g transform="translate(0, 70)">
            <rect width="285" height="52" rx="26" fill="#0c4a6e" stroke="#0284c7" stroke-width="1.5"/>
            <circle cx="28" cy="26" r="14" fill="#0284c7"/>
            <circle cx="28" cy="26" r="6" fill="#ffffff"/>
            <text x="56" y="34" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="700" fill="#bae6fd">WCAG 2.1 AA Contrast</text>
          </g>

          <!-- Tag 3: Tesseract OCR Text -->
          <g transform="translate(0, 140)">
            <rect width="285" height="52" rx="26" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5"/>
            <circle cx="28" cy="26" r="14" fill="#6366f1"/>
            <path d="M 21 26 L 35 26 M 28 19 L 28 33" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
            <text x="56" y="34" font-family="'Segoe UI', Roboto, Arial" font-size="15" font-weight="700" fill="#c7d2fe">Tesseract OCR Text</text>
          </g>
        </g>
      </g>
    </g>

    <!-- Subtle Connection Arrow 2 -> 3 -->
    <g transform="translate(1065, 260)">
      <line x1="0" y1="15" x2="22" y2="15" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
      <polyline points="14,8 24,15 14,22" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- ==================== COLUMN 3: CORE LOGIC ==================== -->
    <g transform="translate(1110, 30)">
      <!-- Number Badge -->
      <circle cx="24" cy="24" r="22" fill="#059669" filter="url(#softShadow)"/>
      <text x="24" y="32" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="900" fill="#ffffff" text-anchor="middle">3</text>
      <text x="60" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="26" font-weight="800" fill="#ffffff">Core Logic</text>

      <!-- Subtitle Description -->
      <text x="5" y="76" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">Gemini AI extracts claims &amp; cross-checks</text>
      <text x="5" y="98" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">against internal verified evidence records.</text>

      <!-- Visual Mockup Container -->
      <g transform="translate(0, 120)">
        <rect width="475" height="300" rx="14" fill="url(#mockupBg)" stroke="#1e293b" stroke-width="1.5"/>

        <!-- Evidence Repository Knowledge Base Box -->
        <g transform="translate(20, 50)">
          <rect width="150" height="200" rx="10" fill="#0b1329" stroke="#059669" stroke-width="1.5"/>
          <rect x="12" y="15" width="126" height="26" rx="5" fill="#064e3b"/>
          <text x="75" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="12" font-weight="900" fill="#6ee7b7" text-anchor="middle">EVIDENCE DB</text>
          
          <text x="16" y="68" font-family="'Segoe UI', monospace" font-size="11.5" fill="#94a3b8">EVID-SLA-99</text>
          <text x="16" y="88" font-family="'Segoe UI', monospace" font-size="11.5" fill="#94a3b8">EVID-DEV-10M</text>
          <text x="16" y="108" font-family="'Segoe UI', monospace" font-size="11.5" fill="#94a3b8">FTC-ACT-2026</text>
          <text x="16" y="128" font-family="'Segoe UI', monospace" font-size="11.5" fill="#94a3b8">Q4-CENSUS-DATA</text>
          
          <rect x="12" y="148" width="126" height="36" rx="6" fill="#131e36"/>
          <text x="75" y="171" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">Temporal Expiry</text>
        </g>

        <!-- Connecting Arrow into AI Brain -->
        <g transform="translate(180, 140)">
          <line x1="0" y1="15" x2="24" y2="15" stroke="#34d399" stroke-width="4" stroke-linecap="round"/>
          <polyline points="16,8 26,15 16,22" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>

        <!-- Gemini AI Hub Box with 4 Status Classifiers -->
        <g transform="translate(215, 50)">
          <rect width="240" height="200" rx="10" fill="#0b1329" stroke="#34d399" stroke-width="1.5"/>
          
          <!-- AI Brain Emblem -->
          <circle cx="120" cy="45" r="28" fill="#064e3b" stroke="#10b981" stroke-width="2"/>
          <text x="120" y="53" font-family="'Segoe UI', Roboto, Arial" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">AI</text>
          <!-- Sparkles -->
          <circle cx="95" cy="26" r="3" fill="#34d399"/>
          <circle cx="145" cy="26" r="3" fill="#34d399"/>

          <!-- 4 Empirical Status Chips -->
          <g transform="translate(16, 92)">
            <!-- SUPPORTED -->
            <rect width="98" height="32" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
            <text x="49" y="113" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="800" fill="#a7f3d0" text-anchor="middle">SUPPORTED</text>

            <!-- UNSUPPORTED -->
            <rect x="108" width="100" height="32" rx="6" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
            <text x="158" y="113" font-family="'Segoe UI', Roboto, Arial" font-size="10.5" font-weight="800" fill="#fde68a" text-anchor="middle">UNSUPPORTED</text>

            <!-- CONTRADICTED -->
            <rect y="42" width="98" height="32" rx="6" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
            <text x="49" y="63" font-family="'Segoe UI', Roboto, Arial" font-size="10" font-weight="800" fill="#fca5a5" text-anchor="middle">CONTRADICTED</text>

            <!-- EXPIRED -->
            <rect x="108" y="42" width="100" height="32" rx="6" fill="#312e81" stroke="#818cf8" stroke-width="1"/>
            <text x="158" y="63" font-family="'Segoe UI', Roboto, Arial" font-size="11" font-weight="800" fill="#c7d2fe" text-anchor="middle">EXPIRED</text>
          </g>
        </g>
      </g>
    </g>

    <!-- Subtle Connection Arrow 3 -> 4 -->
    <g transform="translate(1610, 260)">
      <line x1="0" y1="15" x2="22" y2="15" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>
      <polyline points="14,8 24,15 14,22" fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- ==================== COLUMN 4: OUTPUT ==================== -->
    <g transform="translate(1655, 30)">
      <!-- Number Badge -->
      <circle cx="24" cy="24" r="22" fill="#7c3aed" filter="url(#softShadow)"/>
      <text x="24" y="32" font-family="'Segoe UI', Roboto, Arial" font-size="21" font-weight="900" fill="#ffffff" text-anchor="middle">4</text>
      <text x="60" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="26" font-weight="800" fill="#ffffff">Output</text>

      <!-- Subtitle Description -->
      <text x="5" y="76" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">Brand Health Score, identified findings,</text>
      <text x="5" y="98" font-family="'Segoe UI', Roboto, Arial" font-size="15.5" fill="#94a3b8">and 1-click compliant replacements.</text>

      <!-- Visual Mockup Container (Exact 4-Pill Match from Reference Image) -->
      <g transform="translate(0, 120)">
        <rect width="570" height="300" rx="14" fill="url(#mockupBg)" stroke="#1e293b" stroke-width="1.5"/>

        <g transform="translate(28, 25)">
          <!-- Finding 1: Red Warning Bar (Security Risks / Violations) -->
          <rect width="514" height="52" rx="10" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>
          <!-- Warning Triangle Icon -->
          <path d="M 30 16 L 43 38 L 17 38 Z" fill="#ef4444"/>
          <text x="30" y="34" font-family="'Segoe UI', Arial" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle">!</text>
          <text x="58" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="700" fill="#fca5a5">Brand Violations Detected (e.g. "10x guaranteed")</text>

          <!-- Finding 2: Blue Evidence Path Bar -->
          <g transform="translate(0, 65)">
            <rect width="514" height="52" rx="10" fill="#0f2347" stroke="#3b82f6" stroke-width="1.5"/>
            <!-- Network Nodes Icon -->
            <circle cx="26" cy="26" r="5" fill="#60a5fa"/>
            <circle cx="40" cy="18" r="4" fill="#60a5fa"/>
            <circle cx="40" cy="34" r="4" fill="#60a5fa"/>
            <line x1="26" y1="26" x2="40" y2="18" stroke="#60a5fa" stroke-width="2"/>
            <line x1="26" y1="26" x2="40" y2="34" stroke="#60a5fa" stroke-width="2"/>
            <text x="58" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="700" fill="#93c5fd">Evidence Citation (SLA-2025-V2 Verified)</text>
          </g>

          <!-- Finding 3: Purple Explanation / Health Score Bar -->
          <g transform="translate(0, 130)">
            <rect width="514" height="52" rx="10" fill="#2e1065" stroke="#8b5cf6" stroke-width="1.5"/>
            <!-- Chat Bubble Icon -->
            <rect x="20" y="17" width="22" height="16" rx="4" fill="none" stroke="#a78bfa" stroke-width="2.5"/>
            <polyline points="26,33 26,38 31,33" fill="none" stroke="#a78bfa" stroke-width="2.5"/>
            <text x="58" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="700" fill="#ddd6fe">Brand Health Score: 92/100 (Audit Approved)</text>
          </g>

          <!-- Finding 4: Green Fix Bar (Suggested Fixes) -->
          <g transform="translate(0, 195)">
            <rect width="514" height="52" rx="10" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
            <!-- Tool / Magic Wand Icon -->
            <path d="M 23 20 L 28 25 L 38 15 L 41 18 L 31 28 L 36 33 L 31 38 L 18 25 Z" fill="#34d399"/>
            <text x="58" y="33" font-family="'Segoe UI', Roboto, Arial" font-size="16" font-weight="700" fill="#a7f3d0">1-Click Compliant Replacement Suggested</text>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>
`;

// Render using sharp at 2400x880 PNG
const outputPath = path.join(__dirname, 'brandguard_proper_workflow.png');
sharp(Buffer.from(svg))
  .png({ quality: 100 })
  .toFile(outputPath)
  .then(() => {
    console.log('SUCCESS: Rendered BrandGuard proper workflow at 2400x880 to:', outputPath);
    const stat = fs.statSync(outputPath);
    console.log('File size:', stat.size, 'bytes');

    const artifactPath = 'C:\\Users\\ankus\\.gemini\\antigravity\\brain\\2b26b26a-8d44-4e01-97cd-8c514ad781ee\\brandguard_proper_workflow.png';
    fs.copyFileSync(outputPath, artifactPath);
    console.log('Copied to artifact:', artifactPath);
  })
  .catch(err => {
    console.error('Error rendering diagram:', err);
  });
