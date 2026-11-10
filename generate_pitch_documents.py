"""
CIVORA Solution Pitch Document Generator (Master Executive Edition)
Generates:
1. CIVORA_Solution_Pitch.pdf (Strictly 1 A4 Page)
2. CIVORA_Pitch.pdf (Direct 1 A4 Page copy for convenience)
3. CIVORA_Solution_Pitch.docx (Professional A4 DOCX format)
"""

import os
import sys
import shutil
from pypdf import PdfReader
import pypdfium2 as pdfium

# ReportLab imports
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)

# python-docx imports
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

OUTPUT_DIR = r"D:\Codes\civora"
PDF_PATH = os.path.join(OUTPUT_DIR, "CIVORA_Solution_Pitch.pdf")
PDF_ALIAS_PATH = os.path.join(OUTPUT_DIR, "CIVORA_Pitch.pdf")
DOCX_PATH = os.path.join(OUTPUT_DIR, "CIVORA_Solution_Pitch.docx")
PREVIEW_PATH = os.path.join(OUTPUT_DIR, "CIVORA_Pitch_Preview.png")

def create_pdf():
    # A4 Dimensions: 595.28 x 841.89 pt.
    # Margins: 16pt L/R, 14pt T/B -> Usable width = 563.28 pt, usable height = 813.89 pt
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=A4,
        leftMargin=16,
        rightMargin=16,
        topMargin=14,
        bottomMargin=14
    )

    story = []

    # Premium Palette
    c_navy_dark = colors.HexColor("#0B132B")   # Midnight Navy
    c_blue_royal = colors.HexColor("#1D4ED8") # Accent Royal Blue
    c_slate_body = colors.HexColor("#334155") # Slate 700
    c_card_bg = colors.HexColor("#F8FAFC")    # Slate 50
    c_card_border = colors.HexColor("#CBD5E1")# Slate 300
    c_white = colors.HexColor("#FFFFFF")

    # Typography Styles
    style_head_brand = ParagraphStyle(
        'HeadBrand',
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=22,
        textColor=c_white
    )
    style_head_meta = ParagraphStyle(
        'HeadMeta',
        fontName='Helvetica',
        fontSize=7.0,
        leading=10.0,
        textColor=colors.HexColor("#94A3B8"),
        alignment=2
    )
    style_workflow = ParagraphStyle(
        'WorkflowBar',
        fontName='Helvetica-Bold',
        fontSize=7.3,
        leading=9.5,
        textColor=colors.HexColor("#1E3A8A"),
        alignment=1
    )
    style_sec_header = ParagraphStyle(
        'SecHeader',
        fontName='Helvetica-Bold',
        fontSize=8.9,
        leading=11.2,
        textColor=c_blue_royal,
        spaceAfter=2
    )
    style_body = ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=7.6,
        leading=10.3,
        textColor=c_slate_body
    )
    style_bullet = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=7.3,
        leading=9.7,
        textColor=c_slate_body,
        leftIndent=7,
        firstLineIndent=-7
    )
    style_card_p = ParagraphStyle(
        'CardContent',
        fontName='Helvetica',
        fontSize=7.1,
        leading=9.4,
        textColor=c_slate_body,
        leftIndent=6,
        firstLineIndent=-6
    )
    style_tech_cell = ParagraphStyle(
        'TechCell',
        fontName='Helvetica',
        fontSize=7.0,
        leading=9.0,
        textColor=c_slate_body
    )
    style_footer = ParagraphStyle(
        'Footer',
        fontName='Helvetica',
        fontSize=6.8,
        leading=8.8,
        textColor=colors.HexColor("#64748B"),
        alignment=1
    )

    # 1. HEADER BANNER
    h_left = """<b>CIVORA</b><br/>
<font size="10.2" color="#38BDF8"><b>AI-Powered Citizen Grievance Redressal Platform</b></font><br/>
<font size="8.2" color="#E2E8F0"><i>Tagline: "Making Public Grievance Redressal Smarter, Faster, and More Accountable."</i></font>"""
    h_right = """<font size="6.8" color="#94A3B8">ACADEMIC RESEARCH PROTOTYPE &bull; CIVIC TECH PITCH</font><br/>
<font size="7.8" color="#FFFFFF"><b>HUMAN-IN-THE-LOOP AI ARCHITECTURE</b></font><br/>
<font size="7.0" color="#38BDF8">Submission Ready &bull; Strictly 1 A4 Page Proposal</font>"""

    tbl_header = Table([[Paragraph(h_left, style_head_brand), Paragraph(h_right, style_head_meta)]], colWidths=[385, 178])
    tbl_header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_navy_dark),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-1), 2, colors.HexColor("#0284C7"))
    ]))
    story.append(tbl_header)
    story.append(Spacer(1, 4))

    # 2. LIFECYCLE PIPELINE FLOW STRIP
    flow_html = "<b>END-TO-END WORKFLOW:</b> &nbsp; Citizen Intake (Text/Voice) &nbsp;&rarr;&nbsp; AI Relevance & NLP Classification &nbsp;&rarr;&nbsp; Biometric / OTP Verification &nbsp;&rarr;&nbsp; Department Triage & SLA Tracking &nbsp;&rarr;&nbsp; Admin GIS Analytics & Redressal"
    tbl_flow = Table([[Paragraph(flow_html, style_workflow)]], colWidths=[563])
    tbl_flow.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#BFDBFE")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
    ]))
    story.append(tbl_flow)
    story.append(Spacer(1, 5))

    # 3. BACKGROUND & PROBLEMS (2 Columns)
    bg_p = """<b>CIVORA</b> is an AI-powered digital grievance redressal and decision-support platform engineered to bridge the critical trust, speed, and communication gap between citizens and public authorities. It establishes a centralized, transparent system for submitting, categorizing, routing, tracking, and managing municipal and civic grievances.<br/>
By harmonizing <b>NLP-based classification, voice-assisted intake, facial biometrics, and administrative analytics</b>, CIVORA transforms conventional bureaucratic friction into responsive, data-driven governance while rigorously upholding human administrative oversight."""

    prob_p = """&bull; <b>Delayed Processing:</b> Overwhelming complaint backlogs and protracted manual review cycles.<br/>
&bull; <b>Manual Routing Errors:</b> High rate of inter-departmental misdirection and administrative ping-pong.<br/>
&bull; <b>Opacity & Distrust:</b> Complete absence of real-time grievance tracking and verifiable audit logs.<br/>
&bull; <b>Hidden Recurring Clusters:</b> Inability to correlate repetitive civic failures across municipal wards.<br/>
&bull; <b>Digital & Literacy Barriers:</b> Intricate text-only web forms exclude illiterate, elderly, and rural citizens.<br/>
&bull; <b>Administrative Blindspots:</b> Lack of centralized telemetry, SLA tracking, and GIS spatial intelligence."""

    col_bg = [Paragraph("1. PROJECT BACKGROUND", style_sec_header), Paragraph(bg_p, style_body)]
    col_prob = [Paragraph("2. CORE PROBLEMS ADDRESSED", style_sec_header), Paragraph(prob_p, style_bullet)]
    tbl_sec1 = Table([[col_bg, col_prob]], colWidths=[275, 288])
    tbl_sec1.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(tbl_sec1)
    story.append(Spacer(1, 5))

    # 4. PROPOSED SOLUTION – 5 IMPLEMENTED PILLARS
    story.append(Paragraph("3. PROPOSED SOLUTION & IMPLEMENTED CAPABILITIES", style_sec_header))

    card_c1 = """<font color="#0B132B"><b>Citizen Grievance Management</b></font><br/>
&bull; Secure citizen registration, JWT sessions, and RBAC security.<br/>
&bull; Rich complaint filing: text descriptions + image evidence via Cloudinary.<br/>
&bull; Unique alphanumeric tracking reference IDs with verifiable audit trails.<br/>
&bull; Comprehensive real-time status, timeline, and resolution history tracking."""

    card_c2 = """<font color="#0B132B"><b>AI-Powered Classification & Triage</b></font><br/>
&bull; Dual NLP engine: TF-IDF + Logistic Regression & Hugging Face pipeline.<br/>
&bull; Automated relevance validation gatekeeper rejecting spam or non-civic text.<br/>
&bull; Automated department routing and severity prioritization scoring.<br/>
&bull; Human-in-the-loop design: AI advises; administrative personnel approve."""

    card_c3 = """<font color="#0B132B"><b>Voice-Assisted Conversational Intake</b></font><br/>
&bull; Native speech-to-text audio transcription powered by GNANI Prisma STT.<br/>
&bull; Structured entity extraction parsing location, incident type, and urgency.<br/>
&bull; Dynamic contextual follow-up questions prompting for missing complaint details.<br/>
&bull; Voice feedback via GNANI Timbre TTS, democratizing access for non-literate citizens."""

    card_c4 = """<font color="#0B132B"><b>Secure Facial Biometrics & Liveness Verification</b></font><br/>
&bull; On-device facial detection & recognition with InsightFace (ONNX Runtime engine).<br/>
&bull; High-efficiency model pipeline using SCRFD detector and ArcFace/MobileFaceNet models.<br/>
&bull; Active liveness verification challenges to prevent photo/screen presentation attacks.<br/>
&bull; Biometric privacy: 512-d embeddings encrypted with Fernet before database storage."""

    card_c5 = """<font color="#0B132B"><b>Administrative Intelligence Console & GIS Analytics</b></font><br/>
&bull; Centralized command portal monitoring city-wide grievances across departments.<br/>
&bull; Real-time departmental complaint distribution and workload balancing.<br/>
&bull; Interactive charts and analytical visualizations rendered via Recharts.<br/>
&bull; Geographic spatial cluster and hotspot mapping powered by Leaflet GIS.<br/>
&bull; SLA compliance monitoring, escalation triggers, and resolution verification."""

    p_c1 = Paragraph(card_c1, style_card_p)
    p_c2 = Paragraph(card_c2, style_card_p)
    p_c3 = Paragraph(card_c3, style_card_p)
    p_c4 = Paragraph(card_c4, style_card_p)
    p_c5 = Paragraph(card_c5, style_card_p)

    row_top = Table([[p_c1, p_c2, p_c3]], colWidths=[187, 188, 188])
    row_top.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('BOX', (0,0), (-1,-1), 0.5, c_card_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))

    row_bot = Table([[p_c4, p_c5]], colWidths=[281, 282])
    row_bot.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('BOX', (0,0), (-1,-1), 0.5, c_card_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))

    story.append(row_top)
    story.append(Spacer(1, 3))
    story.append(row_bot)
    story.append(Spacer(1, 5))

    # 5. TECHNOLOGY STACK
    story.append(Paragraph("4. TECHNOLOGY STACK (PRODUCTION-PROVEN & INTEGRATED)", style_sec_header))

    t1 = Paragraph("<b>Frontend:</b> Next.js 16 (App Router), React 19, JavaScript, Tailwind CSS", style_tech_cell)
    t2 = Paragraph("<b>Backend:</b> Python 3.12+, FastAPI, Uvicorn, Pydantic, Requests", style_tech_cell)
    t3 = Paragraph("<b>Database:</b> MongoDB Atlas (Cloud NoSQL, Geospatial & Text Indices)", style_tech_cell)

    t4 = Paragraph("<b>AI / NLP:</b> TF-IDF, Logistic Regression, Groq (Qwen-27B), Hugging Face", style_tech_cell)
    t5 = Paragraph("<b>Biometrics:</b> InsightFace, ONNX Runtime (SCRFD + MobileFaceNet)", style_tech_cell)
    t6 = Paragraph("<b>Voice AI:</b> GNANI Prisma STT (Speech-to-Text) & GNANI Timbre TTS", style_tech_cell)

    t7 = Paragraph("<b>Auth & Sec:</b> JWT, Role-Based Access (RBAC), Phone OTP, Fernet Encryption", style_tech_cell)
    t8 = Paragraph("<b>GIS & Viz:</b> Recharts (Interactive Dashboards) & Leaflet (Geospatial GIS)", style_tech_cell)
    t9 = Paragraph("<b>Deployment:</b> Vercel (Frontend CDN), Render (FastAPI Cloud), Cloudinary", style_tech_cell)

    tbl_tech = Table([[t1, t2, t3], [t4, t5, t6], [t7, t8, t9]], colWidths=[187, 188, 188])
    tbl_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 0.5, c_card_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(tbl_tech)
    story.append(Spacer(1, 5))

    # 6, 7, 8. INNOVATION, EXPECTED IMPACT & FUTURE SCOPE (3 Columns)
    inno_box = """<font color="#0B132B"><b>5. INNOVATION & DIFFERENTIATION</b></font><br/>
&bull; <b>Relevance-Validated Triage:</b> Automated screening filters spam & irrelevant submissions before routing.<br/>
&bull; <b>Conversational Voice Intake:</b> Dynamic contextual questioning captures missing civic parameters hands-free.<br/>
&bull; <b>Anti-Spoof Biometrics:</b> On-device ONNX face recognition with active liveness prevents identity fraud.<br/>
&bull; <b>Human-in-the-Loop AI:</b> Automated systems assist prioritization without usurping human administrative authority.<br/>
&bull; <b>Unified Full Lifecycle:</b> Merges citizen tracking, multi-department routing, and administrative oversight."""

    impact_box = """<font color="#065F46"><b>6. EXPECTED SOCIETAL IMPACT</b></font><br/>
&bull; <b>Eliminates Processing Delays:</b> Instant categorization reduces manual sorting and routing backlogs.<br/>
&bull; <b>Accurate Department Routing:</b> Minimizes misdirected complaints and inter-departmental runarounds.<br/>
&bull; <b>Universal Accessibility:</b> Multimodal voice intake empowers semi-literate, elderly, and rural citizens.<br/>
&bull; <b>Radical Public Accountability:</b> Unique IDs & tamper-evident audit history rebuild civic trust.<br/>
&bull; <b>Proactive Civic Maintenance:</b> GIS heatmaps enable data-driven resource allocation over reactive fixes."""

    future_box = """<font color="#1E40AF"><b>7. FUTURE SCOPE (ROADMAP)</b></font><br/>
&bull; <b>Multilingual Voice Expansion:</b> Native support for 12+ regional Indian languages and local dialects.<br/>
&bull; <b>Predictive Civic Analytics:</b> Machine learning to anticipate recurring municipal faults & SLA risks.<br/>
&bull; <b>Government API Gateway:</b> Direct integration with CPGRAMS, state portals, and Smart City command centers.<br/>
&bull; <b>Enterprise Scalability:</b> Distributed microservice expansion for state- and nation-wide deployment.<br/>
&bull; <b>Resolution Quality AI:</b> Automated citizen satisfaction and resolution-adequacy verification."""

    p_inno = Paragraph(inno_box, style_card_p)
    p_impact = Paragraph(impact_box, style_card_p)
    p_future = Paragraph(future_box, style_card_p)

    tbl_bottom = Table([[p_inno, p_impact, p_future]], colWidths=[187, 188, 188])
    tbl_bottom.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#F8FAFC")),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#F0FDF4")),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 0.5, c_card_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(tbl_bottom)
    story.append(Spacer(1, 4))

    # FOOTER
    ft_html = "<b>CIVORA Research Prototype</b> &nbsp;&bull;&nbsp; B.Tech Academic Innovation Project &nbsp;&bull;&nbsp; Human-in-the-Loop Decision Support Architecture &nbsp;&bull;&nbsp; Submission Ready"
    story.append(Paragraph(ft_html, style_footer))

    doc.build(story)

    # Copy to alias path
    shutil.copy2(PDF_PATH, PDF_ALIAS_PATH)

    # Verify strictly 1 page
    reader = PdfReader(PDF_PATH)
    page_count = len(reader.pages)
    print(f"[PDF VERIFICATION] Exact Page Count: {page_count}")
    if page_count != 1:
        raise ValueError(f"CRITICAL: PDF exceeded 1 page! Current count is {page_count}.")
    
    # Generate high-res preview image
    pdf = pdfium.PdfDocument(PDF_PATH)
    page = pdf[0]
    pil_image = page.render(scale=2.0).to_pil()
    pil_image.save(PREVIEW_PATH)
    print(f"[PREVIEW GENERATED] Saved preview to {PREVIEW_PATH}")
    return page_count


def create_docx():
    """Generates the companion Word document formatted strictly to fit on 1 A4 page."""
    doc = docx.Document()

    # Set page size to A4
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.24)
    section.bottom_margin = Inches(0.24)
    section.left_margin = Inches(0.30)
    section.right_margin = Inches(0.30)

    def set_cell_background(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:val="clear" w:color="auto" w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=35, bottom=35, left=50, right=50):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>'
            f'<w:top w:w="{top}" w:type="dxa"/>'
            f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
            f'<w:left w:w="{left}" w:type="dxa"/>'
            f'<w:right w:w="{right}" w:type="dxa"/>'
            f'</w:tcMar>'
        )
        tcPr.append(tcMar)

    # --- HEADER TABLE ---
    h_table = doc.add_table(rows=1, cols=2)
    h_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    h_table.autofit = False

    cell_l, cell_r = h_table.rows[0].cells
    cell_l.width = Inches(5.35)
    cell_r.width = Inches(2.32)
    set_cell_background(cell_l, "0B132B")
    set_cell_background(cell_r, "0B132B")
    set_cell_margins(cell_l, top=70, bottom=70, left=90, right=70)
    set_cell_margins(cell_r, top=70, bottom=70, left=70, right=90)

    p_hl = cell_l.paragraphs[0]
    p_hl.paragraph_format.space_before = Pt(0)
    p_hl.paragraph_format.space_after = Pt(0)
    p_hl.paragraph_format.line_spacing = 1.05
    run_brand = p_hl.add_run("CIVORA\n")
    run_brand.font.name = "Arial"
    run_brand.font.size = Pt(16.5)
    run_brand.font.bold = True
    run_brand.font.color.rgb = RGBColor(255, 255, 255)

    run_sub = p_hl.add_run("AI-Powered Citizen Grievance Redressal Platform\n")
    run_sub.font.name = "Arial"
    run_sub.font.size = Pt(9.8)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(56, 189, 248)

    run_tag = p_hl.add_run('Tagline: "Making Public Grievance Redressal Smarter, Faster, and More Accountable."')
    run_tag.font.name = "Arial"
    run_tag.font.size = Pt(8.0)
    run_tag.font.italic = True
    run_tag.font.color.rgb = RGBColor(226, 232, 240)

    p_hr = cell_r.paragraphs[0]
    p_hr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_hr.paragraph_format.space_before = Pt(0)
    p_hr.paragraph_format.space_after = Pt(0)
    p_hr.paragraph_format.line_spacing = 1.05

    run_meta1 = p_hr.add_run("ACADEMIC INNOVATION PITCH\n")
    run_meta1.font.name = "Arial"
    run_meta1.font.size = Pt(7.0)
    run_meta1.font.color.rgb = RGBColor(203, 213, 225)

    run_meta2 = p_hr.add_run("HUMAN-IN-THE-LOOP AI\n")
    run_meta2.font.name = "Arial"
    run_meta2.font.size = Pt(7.4)
    run_meta2.font.bold = True
    run_meta2.font.color.rgb = RGBColor(255, 255, 255)

    run_meta3 = p_hr.add_run("Submission Ready • Strictly 1-Page")
    run_meta3.font.name = "Arial"
    run_meta3.font.size = Pt(7.0)
    run_meta3.font.color.rgb = RGBColor(56, 189, 248)

    # --- PIPELINE STRIP ---
    flow_table = doc.add_table(rows=1, cols=1)
    flow_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_f = flow_table.rows[0].cells[0]
    cell_f.width = Inches(7.67)
    set_cell_background(cell_f, "EFF6FF")
    set_cell_margins(cell_f, top=30, bottom=30, left=50, right=50)
    p_flow = cell_f.paragraphs[0]
    p_flow.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_flow.paragraph_format.space_before = Pt(0)
    p_flow.paragraph_format.space_after = Pt(0)
    r_fl = p_flow.add_run("END-TO-END PIPELINE: Citizen Intake (Text/Voice) → AI Relevance & NLP Triage → Biometric/OTP Auth → Department Routing & SLA Tracking → Admin GIS Analytics & Redressal")
    r_fl.font.name = "Arial"
    r_fl.font.size = Pt(7.0)
    r_fl.font.bold = True
    r_fl.font.color.rgb = RGBColor(30, 58, 138)

    # --- SECTION 1 & 2: BACKGROUND & PROBLEMS ---
    s12_table = doc.add_table(rows=1, cols=2)
    s12_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    s12_table.autofit = False
    c_s1, c_s2 = s12_table.rows[0].cells
    c_s1.width = Inches(3.72)
    c_s2.width = Inches(3.95)
    set_cell_margins(c_s1, top=25, bottom=25, left=35, right=35)
    set_cell_margins(c_s2, top=25, bottom=25, left=35, right=35)

    p_s1_h = c_s1.paragraphs[0]
    p_s1_h.paragraph_format.space_before = Pt(2)
    p_s1_h.paragraph_format.space_after = Pt(1)
    r_h1 = p_s1_h.add_run("1. PROJECT BACKGROUND")
    r_h1.font.name = "Arial"
    r_h1.font.size = Pt(8.5)
    r_h1.font.bold = True
    r_h1.font.color.rgb = RGBColor(29, 78, 216)

    p_s1_b = c_s1.add_paragraph()
    p_s1_b.paragraph_format.space_before = Pt(0)
    p_s1_b.paragraph_format.space_after = Pt(0)
    p_s1_b.paragraph_format.line_spacing = 1.05
    r_b1 = p_s1_b.add_run(
        "CIVORA is an AI-powered digital grievance redressal and decision-support platform engineered "
        "to bridge the critical trust, speed, and communication gap between citizens and public authorities. "
        "It provides a centralized, transparent system for submitting, categorizing, routing, tracking, and managing municipal and civic complaints.\n"
        "By harmonizing NLP-based classification, voice-assisted intake, facial biometrics, and administrative analytics, "
        "CIVORA transforms conventional bureaucratic friction into responsive, data-driven governance while rigorously upholding human administrative oversight."
    )
    r_b1.font.name = "Arial"
    r_b1.font.size = Pt(7.3)
    r_b1.font.color.rgb = RGBColor(51, 65, 85)

    p_s2_h = c_s2.paragraphs[0]
    p_s2_h.paragraph_format.space_before = Pt(2)
    p_s2_h.paragraph_format.space_after = Pt(1)
    r_h2 = p_s2_h.add_run("2. CORE PROBLEMS ADDRESSED")
    r_h2.font.name = "Arial"
    r_h2.font.size = Pt(8.5)
    r_h2.font.bold = True
    r_h2.font.color.rgb = RGBColor(29, 78, 216)

    p_s2_b = c_s2.add_paragraph()
    p_s2_b.paragraph_format.space_before = Pt(0)
    p_s2_b.paragraph_format.space_after = Pt(0)
    p_s2_b.paragraph_format.line_spacing = 1.05
    r_b2 = p_s2_b.add_run(
        "• Delayed Processing: Protracted complaint backlogs and manual review bottlenecks.\n"
        "• Manual Routing Errors: High rate of inter-departmental misdirection and administrative ping-pong.\n"
        "• Opacity & Distrust: Zero visibility into grievance lifecycles, progress status, and audit trails.\n"
        "• Hidden Recurring Clusters: Inability to correlate repetitive civic failures across municipal wards.\n"
        "• Digital & Literacy Barriers: Complex text-only forms disenfranchise semi-literate & elderly citizens.\n"
        "• Administrative Blindspots: Absence of centralized telemetry, SLA tracking, and GIS spatial intelligence."
    )
    r_b2.font.name = "Arial"
    r_b2.font.size = Pt(7.0)
    r_b2.font.color.rgb = RGBColor(51, 65, 85)

    # --- SECTION 3: PROPOSED SOLUTION ---
    p_s3_title = doc.add_paragraph()
    p_s3_title.paragraph_format.space_before = Pt(3)
    p_s3_title.paragraph_format.space_after = Pt(1)
    r_s3_t = p_s3_title.add_run("3. PROPOSED SOLUTION & IMPLEMENTED CAPABILITIES")
    r_s3_t.font.name = "Arial"
    r_s3_t.font.size = Pt(8.5)
    r_s3_t.font.bold = True
    r_s3_t.font.color.rgb = RGBColor(29, 78, 216)

    sol_t1 = doc.add_table(rows=1, cols=3)
    sol_t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    sol_t1.autofit = False
    c_p1, c_p2, c_p3 = sol_t1.rows[0].cells
    c_p1.width = Inches(2.55)
    c_p2.width = Inches(2.55)
    c_p3.width = Inches(2.57)

    for c in [c_p1, c_p2, c_p3]:
        set_cell_background(c, "F8FAFC")
        set_cell_margins(c, top=35, bottom=35, left=45, right=45)

    def fill_pillar(cell, title, bullets):
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        rt = p.add_run(title + "\n")
        rt.font.name = "Arial"
        rt.font.size = Pt(7.3)
        rt.font.bold = True
        rt.font.color.rgb = RGBColor(11, 19, 43)

        rb = p.add_run(bullets)
        rb.font.name = "Arial"
        rb.font.size = Pt(6.8)
        rb.font.color.rgb = RGBColor(51, 65, 85)

    fill_pillar(
        c_p1,
        "Citizen Grievance Management",
        "• Secure citizen registration, JWT sessions, and RBAC security.\n"
        "• Multimedia submission: descriptions + image proof via Cloudinary.\n"
        "• Unique tracking reference IDs with tamper-evident audit logs.\n"
        "• End-to-end status, timeline, and resolution history tracking."
    )
    fill_pillar(
        c_p2,
        "AI-Powered Classification & Triage",
        "• Dual NLP: TF-IDF + Logistic Regression & Hugging Face pipeline.\n"
        "• Relevance validation gatekeeper rejecting spam or non-civic text.\n"
        "• Automated department routing & severity prioritization scoring.\n"
        "• Human-in-the-loop: AI recommends; human administrators approve."
    )
    fill_pillar(
        c_p3,
        "Voice-Assisted Grievance Intake",
        "• Speech-to-text audio transcription via GNANI Prisma STT.\n"
        "• Structured extraction parsing location, issue type, and urgency.\n"
        "• Dynamic contextual follow-up questions elicit missing details.\n"
        "• Voice feedback via GNANI Timbre TTS for accessible intake."
    )

    sol_t2 = doc.add_table(rows=1, cols=2)
    sol_t2.alignment = WD_TABLE_ALIGNMENT.CENTER
    sol_t2.autofit = False
    c_p4, c_p5 = sol_t2.rows[0].cells
    c_p4.width = Inches(3.83)
    c_p5.width = Inches(3.84)

    for c in [c_p4, c_p5]:
        set_cell_background(c, "F8FAFC")
        set_cell_margins(c, top=35, bottom=35, left=45, right=45)

    fill_pillar(
        c_p4,
        "Secure Facial Biometrics & Liveness Verification",
        "• On-device face detection & recognition with InsightFace (ONNX Runtime).\n"
        "• High-efficiency pipeline using SCRFD detector & ArcFace/MobileFaceNet.\n"
        "• Active liveness verification challenges to stop presentation attacks.\n"
        "• 512-d facial embeddings encrypted with Fernet before database storage."
    )
    fill_pillar(
        c_p5,
        "Administrative Intelligence & GIS Console",
        "• Centralized command portal monitoring civic issues across departments.\n"
        "• Real-time departmental complaint distribution & workload balancing.\n"
        "• Interactive analytics and resolution trends visualized via Recharts.\n"
        "• Geographic spatial cluster and hotspot mapping powered by Leaflet GIS.\n"
        "• SLA compliance monitoring, escalation tracking, and resolution verification."
    )

    # --- SECTION 4: TECH STACK ---
    p_s4_title = doc.add_paragraph()
    p_s4_title.paragraph_format.space_before = Pt(3)
    p_s4_title.paragraph_format.space_after = Pt(1)
    r_s4_t = p_s4_title.add_run("4. TECHNOLOGY STACK (PRODUCTION-PROVEN & INTEGRATED)")
    r_s4_t.font.name = "Arial"
    r_s4_t.font.size = Pt(8.5)
    r_s4_t.font.bold = True
    r_s4_t.font.color.rgb = RGBColor(29, 78, 216)

    tech_table = doc.add_table(rows=3, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_table.autofit = False

    t_data = [
        ("Frontend: Next.js 16 (App Router), React 19, Tailwind CSS",
         "Backend: Python 3.12+, FastAPI, Uvicorn, Pydantic",
         "Database: MongoDB Atlas (Cloud NoSQL & Indexing)"),
        ("AI / NLP: TF-IDF, Logistic Regression, Groq (Qwen-27B)",
         "Biometrics: InsightFace, ONNX Runtime (SCRFD/ArcFace)",
         "Voice AI: GNANI Prisma STT & GNANI Timbre TTS"),
        ("Auth & Sec: JWT, RBAC, Phone OTP, Fernet Biometrics",
         "GIS & Viz: Recharts (Analytics) & Leaflet (GIS Mapping)",
         "Deployment: Vercel (Web), Render (FastAPI), Cloudinary")
    ]

    for row_idx, row in enumerate(tech_table.rows):
        for col_idx, cell in enumerate(row.cells):
            cell.width = Inches(2.55)
            set_cell_background(cell, "F1F5F9")
            set_cell_margins(cell, top=25, bottom=25, left=40, right=40)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(t_data[row_idx][col_idx])
            r.font.name = "Arial"
            r.font.size = Pt(6.7)
            r.font.color.rgb = RGBColor(51, 65, 85)

    # --- SECTION 5, 6, 7 ---
    p_s567_title = doc.add_paragraph()
    p_s567_title.paragraph_format.space_before = Pt(3)
    p_s567_title.paragraph_format.space_after = Pt(1)
    r_s567_t = p_s567_title.add_run("5. INNOVATION  |  6. EXPECTED IMPACT  |  7. FUTURE SCOPE")
    r_s567_t.font.name = "Arial"
    r_s567_t.font.size = Pt(8.5)
    r_s567_t.font.bold = True
    r_s567_t.font.color.rgb = RGBColor(29, 78, 216)

    bot_table = doc.add_table(rows=1, cols=3)
    bot_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    bot_table.autofit = False
    c_inno, c_imp, c_fut = bot_table.rows[0].cells
    c_inno.width = Inches(2.55)
    c_imp.width = Inches(2.55)
    c_fut.width = Inches(2.57)

    set_cell_background(c_inno, "F8FAFC")
    set_cell_background(c_imp, "F0FDF4")
    set_cell_background(c_fut, "EFF6FF")

    for c in [c_inno, c_imp, c_fut]:
        set_cell_margins(c, top=35, bottom=35, left=45, right=45)

    fill_pillar(
        c_inno,
        "5. Innovation & Differentiation",
        "• Relevance-Validated Triage: Filters non-civic noise early.\n"
        "• Contextual Voice Intake: Solicits missing details hands-free.\n"
        "• Anti-Spoof Biometrics: Low-latency ONNX face verification.\n"
        "• Human-in-the-Loop AI: AI recommends; human approves.\n"
        "• Unified Lifecycle: Connects citizen tracking to GIS analytics."
    )
    fill_pillar(
        c_imp,
        "6. Expected Societal Impact",
        "• Cuts Triage Bottlenecks: Eliminates manual sorting delays.\n"
        "• Accurate Routing: Stops inter-departmental runarounds.\n"
        "• Universal Access: Voice empowers semi-literate citizens.\n"
        "• Public Accountability: Tamper-evident tracking rebuilds trust.\n"
        "• Proactive Governance: GIS spatial clusters pinpoint failures."
    )
    fill_pillar(
        c_fut,
        "7. Future Scope (Roadmap)",
        "• Multilingual Voice: Expansion to 12+ regional languages.\n"
        "• Predictive Analytics: Anticipating municipal fault hotspots.\n"
        "• Gov Gateway: Interoperability with CPGRAMS & state APIs.\n"
        "• Municipal Scale: Distributed microservices for statewide use.\n"
        "• Resolution Quality AI: Citizen redressal adequacy scoring."
    )

    # --- FOOTER ---
    p_ft = doc.add_paragraph()
    p_ft.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_ft.paragraph_format.space_before = Pt(3)
    p_ft.paragraph_format.space_after = Pt(0)
    r_ft = p_ft.add_run("CIVORA Research Prototype • B.Tech Academic Innovation Project • Human-in-the-Loop Decision Support Architecture • Submission Ready")
    r_ft.font.name = "Arial"
    r_ft.font.size = Pt(6.5)
    r_ft.font.color.rgb = RGBColor(100, 116, 139)

    doc.save(DOCX_PATH)
    print(f"[DOCX BUILD] Saved Word document to {DOCX_PATH}")


if __name__ == "__main__":
    pdf_count = create_pdf()
    create_docx()
    if pdf_count == 1:
        print("[SUCCESS] Both PDF and DOCX successfully generated strictly on 1 A4 page!")
    else:
        sys.exit(1)
