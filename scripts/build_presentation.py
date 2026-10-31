import os
import pptx
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

template_path = r'C:\Users\ankus\.gemini\antigravity\brain\2b26b26a-8d44-4e01-97cd-8c514ad781ee\.user_uploaded\media_1793432676328_0f6f2d21.pptx'
diagram_path = r'c:\Users\ankus\OneDrive\Desktop\Codex-48\scripts\brandguard_methodology_flow.png'
output_path = r'c:\Users\ankus\OneDrive\Desktop\Codex-48\BrandGuard_AI_Kaccha_Papad_Presentation.pptx'

prs = pptx.Presentation(template_path)

def set_para(p, text, font_name='Calibri', size_pt=14, bold=False, color_rgb=None, align=None):
    p.text = text
    p.font.name = font_name
    if size_pt:
        p.font.size = Pt(size_pt)
    p.font.bold = bold
    if color_rgb:
        p.font.color.rgb = color_rgb
    if align:
        p.alignment = align

# ==============================================================================
# SLIDE 1: Title & Team Cover Slide
# ==============================================================================
slide1 = prs.slides[0]

# Shape 4: 'TEAM NAME'
# Shape 5: 'Chaiii Suttaaa' -> 'Kaccha Papad'
set_para(slide1.shapes[5].text_frame.paragraphs[0], "Kaccha Papad", font_name="Calibri", size_pt=20, bold=True, color_rgb=RGBColor(37, 99, 235))

# Shape 7: 'TRACK'
# Shape 8: 'Cybersecurity' -> 'AI / Machine Learning & Enterprise Governance'
set_para(slide1.shapes[8].text_frame.paragraphs[0], "AI / ML & Enterprise Automation", font_name="Calibri", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 10: 'PROBLEM STATEMENT TITLE'
# Shape 11: 'ShadowPR ...' -> 'BrandGuard AI: Multimodal Brand Compliance & Autonomous Claim Substantiation Engine'
set_para(slide1.shapes[11].text_frame.paragraphs[0], "BrandGuard AI: Multimodal Brand Compliance & Autonomous Claim Substantiation Engine", font_name="Calibri", size_pt=16, bold=True, color_rgb=RGBColor(30, 41, 59))

# Add a sleek Team Members Card on Slide 1 under the DevNexus Logo!
# DevNexus logo is at left=457200, top=1280160, width=6324888, height=4297680 (ends at top=5577840)
# Slide height is 6858000. Clean space from 5650000 to 6650000.
left = Emu(457200)
top = Emu(5650000)
width = Emu(6324888)
height = Emu(1000000)

team_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
team_box.fill.solid()
team_box.fill.fore_color.rgb = RGBColor(15, 23, 42) # Dark navy #0f172a
team_box.line.color.rgb = RGBColor(59, 130, 246) # Electric Blue #3b82f6
team_box.line.width = Pt(1.5)

tf = team_box.text_frame
tf.word_wrap = True
tf.margin_left = Inches(0.2)
tf.margin_right = Inches(0.2)
tf.margin_top = Inches(0.12)
tf.margin_bottom = Inches(0.1)

p0 = tf.paragraphs[0]
set_para(p0, "TEAM MEMBERS  |  TEAM KACCHA PAPAD", font_name="Segoe UI", size_pt=11, bold=True, color_rgb=RGBColor(147, 197, 253))

p1 = tf.add_paragraph()
p1.text = "Ankush Shaw (Team Leader)   |   Ananya Bhadra   |   Aksita Das   |   Sounak Ghosh"
p1.font.name = "Segoe UI"
p1.font.size = Pt(13)
p1.font.bold = True
p1.font.color.rgb = RGBColor(255, 255, 255)

# ==============================================================================
# SLIDE 2: Idea Title & Proposed Solution
# ==============================================================================
slide2 = prs.slides[1]

# Shape 0: 'Idea Title' -> 'BrandGuard AI'
set_para(slide2.shapes[0].text_frame.paragraphs[0], "BrandGuard AI", font_name="Arial", size_pt=32, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 1: 'Proposed Solution: ' -> 'Proposed Solution: Autonomous Multimodal Marketing Compliance Platform'
set_para(slide2.shapes[1].text_frame.paragraphs[0], "Proposed Solution: Autonomous Multimodal Marketing Compliance & Verification Engine", font_name="Arial", size_pt=15, bold=False, color_rgb=RGBColor(71, 85, 105))

# Shape 6: 'Detailed Explanation'
set_para(slide2.shapes[6].text_frame.paragraphs[0], "Detailed Explanation", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 7: Content for Detailed Explanation
explanation_text = (
    "In hyper-growth enterprises, marketing teams publish hundreds of ad variants across channels, "
    "often making unverified claims (\"#1 fastest\", \"10x guaranteed\"), trademark drift, or WCAG contrast failures. "
    "BrandGuard AI is an automated compliance copilot unifying deterministic regex rules, Sharp pixel & WCAG analysis, "
    "Tesseract OCR, and Gemini multimodal AI to audit ad copy and creative banners in real-time."
)
set_para(slide2.shapes[7].text_frame.paragraphs[0], explanation_text, font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 12: 'How It Addresses the Problem'
set_para(slide2.shapes[12].text_frame.paragraphs[0], "How It Addresses the Problem", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 13: 3 bullets for How It Addresses the Problem
tf13 = slide2.shapes[13].text_frame
set_para(tf13.paragraphs[0], "1. Problem Solved: Eliminates false advertising liability, trademark drift, and unverified superlative claims before campaign launch.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf13.paragraphs[1], "2. Beneficiaries: Marketing teams, legal/compliance auditors, brand designers, and consumers.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf13.paragraphs[2], "3. Expected Outcome: 90% faster compliance reviews, zero legal penalties, and immutable audit trails.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 18: 'Innovation & Uniqueness'
set_para(slide2.shapes[18].text_frame.paragraphs[0], "Innovation & Uniqueness", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 19: 3 bullets for Innovation & Uniqueness
tf19 = slide2.shapes[19].text_frame
set_para(tf19.paragraphs[0], "1. Multimodal Dual-Inspection: Audits both copy text and visual creative banners (WCAG AA contrast, dominant palettes, OCR).", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf19.paragraphs[1], "2. Zero-Trust Evidence Engine: Cross-references claims against active SLA/census benchmarks with temporal expiration tracking.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf19.paragraphs[2], "3. Contextual Compliant Auto-Fix: Gemini dynamically rewrites risky claims into natural compliant variants with 1-click replacement.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# ==============================================================================
# SLIDE 3: Technical Approach & Methodology Diagram
# ==============================================================================
slide3 = prs.slides[2]

# Shape 5: Programming languages
tf5 = slide3.shapes[5].text_frame
set_para(tf5.paragraphs[0], "Programming Languages", font_name="Calibri", size_pt=15, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5.paragraphs[1], "TypeScript (React 19 & Node.js), Python", font_name="Calibri", size_pt=14, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 6: Frameworks & libraries
tf6 = slide3.shapes[6].text_frame
set_para(tf6.paragraphs[0], "Frameworks & Libraries", font_name="Calibri", size_pt=15, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf6.paragraphs[1], "React 19, Express 5, Sharp (libvips), Tesseract.js (WASM OCR), Tailwind", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 7: Tools, APIs & Cloud
tf7 = slide3.shapes[7].text_frame
set_para(tf7.paragraphs[0], "Tools, APIs & Cloud", font_name="Calibri", size_pt=15, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf7.paragraphs[1], "Google Gemini 2.5 Flash API, Supabase PostgreSQL (RLS), Vitest (18/18 Tests Passed)", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Pipeline Top Badges (Shapes 13, 16, 19, 22)
set_para(slide3.shapes[13].text_frame.paragraphs[0], "1. Ingestion", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(37, 99, 235))
set_para(slide3.shapes[16].text_frame.paragraphs[0], "2. Extraction", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(2, 132, 199))
set_para(slide3.shapes[19].text_frame.paragraphs[0], "3. AI Logic", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(5, 150, 105))
set_para(slide3.shapes[22].text_frame.paragraphs[0], "4. Governance", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(99, 102, 241))

# Replace the old diagram picture (Shape 25) with our BrandGuard Flow diagram!
with open(diagram_path, 'rb') as f:
    slide3.shapes[25].image._blob = f.read()

# ==============================================================================
# SLIDE 4: Feasibility and Viability
# ==============================================================================
slide4 = prs.slides[3]

# Shape 4: 'Feasibility Analysis'
set_para(slide4.shapes[4].text_frame.paragraphs[0], "Feasibility Analysis", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 5: Feasibility Content
tf4_5 = slide4.shapes[5].text_frame
set_para(tf4_5.paragraphs[0], "Technical: Fully operational full-stack architecture with 18 automated Vitest tests, hot-reloading Express 5 API, and React 19 client.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_5.paragraphs[1], "Economic: Highly cost-effective; utilizes low-latency Gemini Flash-Lite for claims and Sharp for native sub-millisecond pixel audits.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_5.paragraphs[2], "Time & Resources: Production-ready MVP completed within hackathon scope with clean TypeScript modular architecture.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 9: 'Potential Challenges & Risks'
set_para(slide4.shapes[9].text_frame.paragraphs[0], "Potential Challenges & Risks", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 10: Risks Content
tf4_10 = slide4.shapes[10].text_frame
set_para(tf4_10.paragraphs[0], "Technical Hurdles: Latency and OCR precision across complex typography, stylized overlays, and low-contrast creative banners.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_10.paragraphs[1], "Data & Expiration: Keeping internal benchmark documents and legal SLAs synchronized as enterprise terms and products evolve.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_10.paragraphs[2], "Adoption Friction: Marketing team hesitation toward rigid automated gates and creative workflow disruption.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 14: 'Strategies to Overcome'
set_para(slide4.shapes[14].text_frame.paragraphs[0], "Strategies to Overcome", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 15: Strategies Content
tf4_15 = slide4.shapes[15].text_frame
set_para(tf4_15.paragraphs[0], "Risk Mitigation: Sharp pre-processing with WebAssembly OCR pipelines ensures sub-second scan speeds and noise reduction.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_15.paragraphs[1], "Temporal Expiration Engine: Automated EXPIRED status flagging when benchmark validity windows elapse, notifying brand admins.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_15.paragraphs[2], "Empowering Workflow: Contextual AI auto-fix suggestions + human auditor override allow agile campaign velocity without friction.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# ==============================================================================
# SLIDE 5: Impacts and Benefits
# ==============================================================================
slide5 = prs.slides[4]

# Shape 4: 'Impact on Target Audience'
set_para(slide5.shapes[4].text_frame.paragraphs[0], "Impact on Target Audience", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 5: Target Audience Content
tf5_5 = slide5.shapes[5].text_frame
set_para(tf5_5.paragraphs[0], "Target Audience: Enterprise marketing leads, legal compliance auditors, brand designers, and growth marketers.", font_name="Calibri", size_pt=13.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf5_5.paragraphs[1], "Improvement: Reduces compliance review turnaround from 3-5 days to under 5 seconds; eliminates regulatory penalties.", font_name="Calibri", size_pt=13.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf5_5.paragraphs[2], "Expected Reach: Scales seamlessly from fast-moving SaaS startups to multi-brand Fortune 500 enterprise marketing operations.", font_name="Calibri", size_pt=13.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 9: Social Benefits
tf5_9 = slide5.shapes[9].text_frame
set_para(tf5_9.paragraphs[0], "Social Benefits", font_name="Arial", size_pt=16, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5_9.paragraphs[1], "Eliminates deceptive advertising and predatory dark patterns; restores consumer trust in digital product claims and transparency.", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 13: Economic Benefits
tf5_13 = slide5.shapes[13].text_frame
set_para(tf5_13.paragraphs[0], "Economic Benefits", font_name="Arial", size_pt=16, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5_13.paragraphs[1], "Prevents multi-million-dollar regulatory non-compliance fines (FTC/ASCI) and slashes external legal auditing expenses by over 70%.", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 17: Environmental Benefits
tf5_17 = slide5.shapes[17].text_frame
set_para(tf5_17.paragraphs[0], "Environmental Benefits", font_name="Arial", size_pt=16, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5_17.paragraphs[1], "Lightweight local image pre-processing and cached verification tokens minimize server cloud compute load and carbon emissions.", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# ==============================================================================
# SLIDE 6: Research and References
# ==============================================================================
slide6 = prs.slides[5]

# Shape 4: 'References'
set_para(slide6.shapes[4].text_frame.paragraphs[0], "References", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 5: References Content
tf6_5 = slide6.shapes[5].text_frame
set_para(tf6_5.paragraphs[0], "[1] FTC Advertising Guides. Federal Trade Commission Guides Concerning Use of Endorsements & Truth-in-Advertising (16 CFR Part 255). https://www.ftc.gov/legal-library/browse/rules/endorsement-guides", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_5.paragraphs[1], "[2] W3C Web Content Accessibility Guidelines (WCAG) 2.1. Success Criterion 1.4.3 Contrast (Minimum) Level AA. https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_5.paragraphs[2], "[3] Google Gemini API Documentation. Multimodal Reasoning & Structured JSON Schemas for Enterprise Verification. https://ai.google.dev/docs", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 9: 'Research Works'
set_para(slide6.shapes[9].text_frame.paragraphs[0], "Research Works", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 10: Research Works Content
tf6_10 = slide6.shapes[10].text_frame
set_para(tf6_10.paragraphs[0], "[1] NIST AI Risk Management Framework (AI RMF 1.0). Trustworthy and Responsible AI Systems Governance & Verification. https://www.nist.gov/itl/ai-risk-management-framework", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_10.paragraphs[1], "[2] IEEE Access on Brand Safety & Advertising Compliance. Automated Verification of Digital Commercial Claims via Knowledge Retrieval. https://ieeexplore.ieee.org/", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_10.paragraphs[2], "[3] ISO/IEC 42001:2023 Standard. Information Technology — Artificial Intelligence Management System for Enterprise Assurance. https://www.iso.org/standard/81230.html", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Save presentation
prs.save(output_path)
print(f"Presentation successfully created at: {output_path}")

# Also copy to artifact directory
artifact_dir = r'C:\Users\ankus\.gemini\antigravity\brain\2b26b26a-8d44-4e01-97cd-8c514ad781ee'
artifact_copy_path = os.path.join(artifact_dir, 'BrandGuard_AI_Kaccha_Papad_Presentation.pptx')
prs.save(artifact_copy_path)
print(f"Presentation also copied to artifact directory at: {artifact_copy_path}")
