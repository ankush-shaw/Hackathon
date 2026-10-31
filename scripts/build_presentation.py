import os
import pptx
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

template_path = r'C:\Users\ankus\.gemini\antigravity\brain\2b26b26a-8d44-4e01-97cd-8c514ad781ee\.user_uploaded\media_1793432676328_0f6f2d21.pptx'
diagram_path = r'c:\Users\ankus\OneDrive\Desktop\Codex-48\scripts\brandguard_proper_workflow.png'
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

# Shape 5: TEAM NAME
set_para(slide1.shapes[5].text_frame.paragraphs[0], "Kaccha Papad", font_name="Calibri", size_pt=20, bold=True, color_rgb=RGBColor(37, 99, 235))

# Shape 8: TRACK
set_para(slide1.shapes[8].text_frame.paragraphs[0], "AI / ML & Enterprise Automation", font_name="Calibri", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 11: PROBLEM STATEMENT TITLE
set_para(slide1.shapes[11].text_frame.paragraphs[0], "BrandGuard AI – AI-Powered Brand Governance & Real-Time Marketing Claim Verification Engine", font_name="Calibri", size_pt=16, bold=True, color_rgb=RGBColor(30, 41, 59))

# Team Members Card under the DevNexus Logo
left = Emu(457200)
top = Emu(5650000)
width = Emu(6324888)
height = Emu(1000000)

team_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
team_box.fill.solid()
team_box.fill.fore_color.rgb = RGBColor(15, 23, 42)
team_box.line.color.rgb = RGBColor(59, 130, 246)
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

# Shape 0: Idea Title
set_para(slide2.shapes[0].text_frame.paragraphs[0], "BrandGuard AI", font_name="Arial", size_pt=32, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 1: Proposed Solution Subtitle
set_para(slide2.shapes[1].text_frame.paragraphs[0], "Proposed Solution: Real-Time Multimodal Compliance & Claim Verification Copilot", font_name="Arial", size_pt=15, bold=False, color_rgb=RGBColor(71, 85, 105))

# Shape 6: Detailed Explanation
set_para(slide2.shapes[6].text_frame.paragraphs[0], "Detailed Explanation", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 7: Content
explanation_text = (
    "In fast-paced digital marketing, teams produce hundreds of ad variants across channels, often unintentionally "
    "including unverified claims (\"10x guaranteed\", \"#1 fastest\"), trademark drift, or poor visual contrast that risk legal penalties. "
    "BrandGuard AI is a proposed AI-powered governance tool that analyzes marketing copy and visual creatives before publication. "
    "It combines deterministic brand rules, image contrast/OCR inspection, and LLM reasoning to flag compliance issues, verify empirical claims, and suggest safe rewrites."
)
set_para(slide2.shapes[7].text_frame.paragraphs[0], explanation_text, font_name="Calibri", size_pt=12, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 12: How It Addresses the Problem
set_para(slide2.shapes[12].text_frame.paragraphs[0], "How It Addresses the Problem", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 13: 3 bullets
tf13 = slide2.shapes[13].text_frame
set_para(tf13.paragraphs[0], "1. Problem Solved: Detects deceptive claims, trademark violations, and brand guideline discrepancies before ad launch.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf13.paragraphs[1], "2. Beneficiaries: Marketing teams, copywriters, and compliance officers get instant warnings and suggested fixes.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf13.paragraphs[2], "3. Expected Outcome: Safer campaign launches, fewer compliance rejections, and reduced risk of regulatory fines.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 18: Innovation & Uniqueness
set_para(slide2.shapes[18].text_frame.paragraphs[0], "Innovation & Uniqueness", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 19: 3 bullets
tf19 = slide2.shapes[19].text_frame
set_para(tf19.paragraphs[0], "1. Difference: Inspects both text copy and image creatives simultaneously within a unified workflow.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf19.paragraphs[1], "2. Novel Approach: Uses AI reasoning to cross-check empirical claims against verified company evidence and SLAs.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf19.paragraphs[2], "3. Competitive Edge: Does not just flag violations—dynamically suggests compliant ad copy alternatives with an objective Brand Health Score.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# ==============================================================================
# SLIDE 3: Technical Approach & Methodology Diagram
# ==============================================================================
slide3 = prs.slides[2]

# Shape 5: Programming languages (NO PYTHON)
tf5 = slide3.shapes[5].text_frame
set_para(tf5.paragraphs[0], "Programming Languages", font_name="Calibri", size_pt=15, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5.paragraphs[1], "TypeScript, JavaScript", font_name="Calibri", size_pt=14, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 6: Frameworks & libraries
tf6 = slide3.shapes[6].text_frame
set_para(tf6.paragraphs[0], "Frameworks & Libraries", font_name="Calibri", size_pt=15, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf6.paragraphs[1], "React 19, Node.js / Express 5, Sharp, Tesseract.js, Tailwind CSS", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 7: Tools, APIs & Cloud
tf7 = slide3.shapes[7].text_frame
set_para(tf7.paragraphs[0], "Tools, APIs & Cloud", font_name="Calibri", size_pt=15, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf7.paragraphs[1], "Google Gemini API, Supabase / PostgreSQL, Docker, GitHub, Vite", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Pipeline Top Badges (Shapes 13, 16, 19, 22)
set_para(slide3.shapes[13].text_frame.paragraphs[0], "1. Ingestion", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(37, 99, 235))
set_para(slide3.shapes[16].text_frame.paragraphs[0], "2. Processing", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(2, 132, 199))
set_para(slide3.shapes[19].text_frame.paragraphs[0], "3. Core Logic", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(5, 150, 105))
set_para(slide3.shapes[22].text_frame.paragraphs[0], "4. Output", font_name="Calibri", size_pt=13, bold=True, color_rgb=RGBColor(124, 58, 237))

# Replace old diagram with BrandGuard Proper Workflow Diagram!
with open(diagram_path, 'rb') as f:
    slide3.shapes[25].image._blob = f.read()

# ==============================================================================
# SLIDE 4: Feasibility and Viability
# ==============================================================================
slide4 = prs.slides[3]

# Shape 4: Feasibility Analysis
set_para(slide4.shapes[4].text_frame.paragraphs[0], "Feasibility Analysis", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 5: Feasibility Content
tf4_5 = slide4.shapes[5].text_frame
set_para(tf4_5.paragraphs[0], "Technical: Built using lightweight web frameworks (React, Express), proven OCR tools, and modern Gemini AI APIs.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_5.paragraphs[1], "Economic: Highly cost-effective; utilizes open-source libraries and efficient lightweight LLM calls.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_5.paragraphs[2], "Time & Resources: A working functional prototype is achievable within the hackathon timeframe by a 4-member team.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 9: Potential Challenges & Risks
set_para(slide4.shapes[9].text_frame.paragraphs[0], "Potential Challenges & Risks", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 10: Risks Content
tf4_10 = slide4.shapes[10].text_frame
set_para(tf4_10.paragraphs[0], "Technical Hurdles: Handling diverse font stylings, low-contrast graphics, and noisy image backgrounds in OCR.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_10.paragraphs[1], "Data, Cost & Hardware: Managing API rate limits and structuring guidelines effectively for consistent AI checks.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_10.paragraphs[2], "Adoption & Scalability: Ensuring review suggestions feel natural and do not slow down creative drafting speed.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 14: Strategies to Overcome
set_para(slide4.shapes[14].text_frame.paragraphs[0], "Strategies to Overcome", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 15: Strategies Content
tf4_15 = slide4.shapes[15].text_frame
set_para(tf4_15.paragraphs[0], "Risk Mitigation: Apply image pre-processing (grayscale, contrast boost) to maximize OCR text accuracy.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_15.paragraphs[1], "Fallback Options: Rely on deterministic regex rule checking if API latency occurs.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf4_15.paragraphs[2], "Phased Development: Start with text copy compliance, add image OCR & contrast analysis, then integrate dynamic AI claim verification.", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# ==============================================================================
# SLIDE 5: Impacts and Benefits
# ==============================================================================
slide5 = prs.slides[4]

# Shape 4: Impact on Target Audience
set_para(slide5.shapes[4].text_frame.paragraphs[0], "Impact on Target Audience", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 5: Target Audience Content
tf5_5 = slide5.shapes[5].text_frame
set_para(tf5_5.paragraphs[0], "Target Audience: Content creators, marketing teams, brand agencies, and compliance reviewers.", font_name="Calibri", size_pt=13.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf5_5.paragraphs[1], "Improvement: Replaces days of manual compliance checking with instant pre-publish feedback.", font_name="Calibri", size_pt=13.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf5_5.paragraphs[2], "Expected Reach: Highly scalable from student projects and startups to large marketing teams.", font_name="Calibri", size_pt=13.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 9: Social Benefits
tf5_9 = slide5.shapes[9].text_frame
set_para(tf5_9.paragraphs[0], "Social Benefits", font_name="Arial", size_pt=16, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5_9.paragraphs[1], "Encourages truthful advertising, prevents misleading claims, and promotes transparency for everyday digital consumers.", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 13: Economic Benefits
tf5_13 = slide5.shapes[13].text_frame
set_para(tf5_13.paragraphs[0], "Economic Benefits", font_name="Arial", size_pt=16, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5_13.paragraphs[1], "Minimizes risk of heavy regulatory penalties (FTC/advertising boards) and cuts time spent on ad re-work and legal revisions.", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 17: Environmental Benefits
tf5_17 = slide5.shapes[17].text_frame
set_para(tf5_17.paragraphs[0], "Environmental Benefits", font_name="Arial", size_pt=16, bold=True, color_rgb=RGBColor(15, 23, 42))
set_para(tf5_17.paragraphs[1], "Lightweight, targeted inference reduces redundant cloud compute cycles and server energy consumption.", font_name="Calibri", size_pt=13, bold=False, color_rgb=RGBColor(51, 65, 85))

# ==============================================================================
# SLIDE 6: Research and References
# ==============================================================================
slide6 = prs.slides[5]

# Shape 4: References
set_para(slide6.shapes[4].text_frame.paragraphs[0], "References", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 5: References Content
tf6_5 = slide6.shapes[5].text_frame
set_para(tf6_5.paragraphs[0], "[1] FTC Advertising Guides. Federal Trade Commission Truth-in-Advertising and Endorsement Guides. https://www.ftc.gov/legal-library/browse/rules/endorsement-guides", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_5.paragraphs[1], "[2] W3C Web Accessibility Initiative. WCAG 2.1 Guidelines on Visual Contrast and Readability. https://www.w3.org/WAI/WCAG21/quickref/", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_5.paragraphs[2], "[3] Google AI Documentation. Gemini Multimodal Prompting and Structured JSON Outputs. https://ai.google.dev/docs", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Shape 9: Research Works
set_para(slide6.shapes[9].text_frame.paragraphs[0], "Research Works", font_name="Arial", size_pt=18, bold=True, color_rgb=RGBColor(15, 23, 42))

# Shape 10: Research Works Content
tf6_10 = slide6.shapes[10].text_frame
set_para(tf6_10.paragraphs[0], "[1] NIST AI Risk Management Framework. Standards for Trustworthy and Responsible AI Systems. https://www.nist.gov/itl/ai-risk-management-framework", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_10.paragraphs[1], "[2] IEEE Research Papers. Automated Claim Verification and Fact-Checking in Digital Media. https://ieeexplore.ieee.org/", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))
set_para(tf6_10.paragraphs[2], "[3] Tesseract OCR Documentation. Open Source Optical Character Recognition Architecture. https://github.com/tesseract-ocr/tesseract", font_name="Calibri", size_pt=12.5, bold=False, color_rgb=RGBColor(51, 65, 85))

# Save presentation
prs.save(output_path)
print(f"Presentation successfully updated at: {output_path}")

artifact_dir = r'C:\Users\ankus\.gemini\antigravity\brain\2b26b26a-8d44-4e01-97cd-8c514ad781ee'
artifact_copy_path = os.path.join(artifact_dir, 'BrandGuard_AI_Kaccha_Papad_Presentation.pptx')
prs.save(artifact_copy_path)
print(f"Presentation copied to artifact directory at: {artifact_copy_path}")
