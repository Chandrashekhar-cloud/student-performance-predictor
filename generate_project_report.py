"""
Student Performance Prediction System - Academic Project Report Generator
Generates an exhaustive, publication-grade Academic Project Report PDF covering all technical,
architectural, mathematical, experimental, and implementation aspects from A to Z.
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# ----------------------------------------------------------------------
# Custom NumberedCanvas for Two-Pass Dynamic Page Numbering & Running Headers
# ----------------------------------------------------------------------
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        # Omit headers and footers on Cover Page (Page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        page_w, page_h = A4
        margin_x = 48

        # Running Header (Pages >= 2)
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#1E3A8A"))
        self.drawString(margin_x, page_h - 32, "STUDENT PERFORMANCE PREDICTION SYSTEM")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(page_w - margin_x, page_h - 32, "ACADEMIC MINI PROJECT REPORT")

        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(margin_x, page_h - 36, page_w - margin_x, page_h - 36)

        # Running Footer (Pages >= 2)
        self.line(margin_x, 40, page_w - margin_x, 40)
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(margin_x, 28, "Department of Computer Science & Engineering | Academic Year 2025–2026")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#1E3A8A"))
        self.drawRightString(page_w - margin_x, 28, page_str)

        self.restoreState()


# ----------------------------------------------------------------------
# Helper Functions for Formatting
# ----------------------------------------------------------------------
def create_styles():
    styles = getSampleStyleSheet()

    # Custom Color Palette
    PRIMARY = colors.HexColor("#1E3A8A")     # Deep Blue
    SECONDARY = colors.HexColor("#2563EB")   # Slate Blue
    DARK_TEXT = colors.HexColor("#0F172A")   # Slate 900
    MUTED_TEXT = colors.HexColor("#475569")  # Slate 600
    ACCENT = colors.HexColor("#0D9488")      # Teal 600

    styles.add(ParagraphStyle(
        name="DocCoverTitle",
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        alignment=1,  # Center
        spaceAfter=10
    ))

    styles.add(ParagraphStyle(
        name="DocCoverSubtitle",
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=MUTED_TEXT,
        alignment=1,
        spaceAfter=15
    ))

    styles.add(ParagraphStyle(
        name="DocChapterTitle",
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=10,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name="DocSectionTitle",
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=SECONDARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name="DocSubSectionTitle",
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name="DocBody",
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=7,
        alignment=4  # Justified
    ))

    styles.add(ParagraphStyle(
        name="DocBodyBold",
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=7
    ))

    styles.add(ParagraphStyle(
        name="DocBullet",
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        name="DocCaption",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY,
        alignment=1,
        spaceBefore=5,
        spaceAfter=10
    ))

    styles.add(ParagraphStyle(
        name="DocCallout",
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=4,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        name="DocCode",
        fontName="Courier",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A")
    ))

    styles.add(ParagraphStyle(
        name="TableHeader",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=1
    ))

    styles.add(ParagraphStyle(
        name="TableCell",
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT
    ))

    styles.add(ParagraphStyle(
        name="TableCellCenter",
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT,
        alignment=1
    ))

    styles.add(ParagraphStyle(
        name="TableCellBold",
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT
    ))

    return styles


def build_callout(text, styles, bg_color="#EFF6FF", border_color="#3B82F6"):
    p = Paragraph(text, styles["DocCallout"])
    t = Table([[p]], colWidths=[495])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor(bg_color)),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(border_color)),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    return t


def build_code_box(code_text, styles):
    lines = code_text.strip().split('\n')
    flowables = [Paragraph(line.replace(' ', '&nbsp;'), styles["DocCode"]) for line in lines]
    t = Table([[flowables]], colWidths=[495])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 0.8, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    return t


def build_image_figure(img_path, caption, styles, width=465, height=235):
    elements = []
    if os.path.exists(img_path):
        img = Image(img_path, width=width, height=height)
        elements.append(img)
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(caption, styles["DocCaption"]))
    else:
        elements.append(Paragraph(f"<b>[Image Missing: {img_path}]</b>", styles["DocCallout"]))
    return KeepTogether(elements)


# ----------------------------------------------------------------------
# Main PDF Compilation Routine
# ----------------------------------------------------------------------
def generate_report(output_filename="Student_Performance_Prediction_Project_Report.pdf"):
    print(f"[*] Starting compilation of {output_filename}...")
    
    # 54 pt margins: 595.27 - 2*48 = 499.27 pt usable width
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=A4,
        leftMargin=48,
        rightMargin=48,
        topMargin=48,
        bottomMargin=48
    )

    styles = create_styles()
    story = []

    screenshots_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "report_screenshots")

    # ==================================================================
    # 1. COVER / TITLE PAGE
    # ==================================================================
    story.append(Spacer(1, 15))
    
    # Institutional Header Box
    inst_header = [
        [Paragraph("<b>DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING</b>", ParagraphStyle('Inst1', fontName='Helvetica-Bold', fontSize=12, alignment=1, textColor=colors.HexColor("#1E3A8A")))],
        [Paragraph("<b>FACULTY OF ENGINEERING & TECHNOLOGY</b>", ParagraphStyle('Inst2', fontName='Helvetica', fontSize=10, alignment=1, textColor=colors.HexColor("#475569")))],
        [Paragraph("INSTITUTE OF TECHNOLOGY & SCIENCE", ParagraphStyle('Inst3', fontName='Helvetica-Bold', fontSize=10, alignment=1, textColor=colors.HexColor("#0F172A")))]
    ]
    t_inst = Table(inst_header, colWidths=[495])
    t_inst.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(t_inst)

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1E3A8A"), spaceAfter=20))
    
    # Project Title Box
    story.append(Spacer(1, 20))
    story.append(Paragraph("A MINI PROJECT REPORT ON", ParagraphStyle('SubHeader', fontName='Helvetica-Bold', fontSize=11, alignment=1, textColor=colors.HexColor("#64748B"), spaceAfter=12)))
    story.append(Paragraph("STUDENT PERFORMANCE PREDICTION SYSTEM", styles["DocCoverTitle"]))
    story.append(Paragraph("A Machine Learning-Based Academic Analytics & Performance Forecasting Web Application", styles["DocCoverSubtitle"]))
    
    story.append(Spacer(1, 25))
    
    deg_text = (
        "Submitted in partial fulfillment of the requirements for the award of the degree of<br/>"
        "<b>BACHELOR OF TECHNOLOGY</b><br/>"
        "in<br/>"
        "<b>COMPUTER SCIENCE AND ENGINEERING</b>"
    )
    story.append(Paragraph(deg_text, ParagraphStyle('DegText', fontName='Helvetica', fontSize=10.5, leading=15, alignment=1, textColor=colors.HexColor("#1E293B"))))
    
    story.append(Spacer(1, 40))

    # Submission & Guidance Grid
    sub_data = [
        [
            Paragraph("<b>SUBMITTED BY:</b>", ParagraphStyle('SubByHead', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor("#1E3A8A"))),
            Paragraph("<b>UNDER THE GUIDANCE OF:</b>", ParagraphStyle('GuidHead', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor("#1E3A8A")))
        ],
        [
            Paragraph("<b>STUDENT NAME</b><br/>Roll No: 2022-CSE-042<br/>B.Tech Final Year (CSE)", ParagraphStyle('SubByName', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor("#0F172A"))),
            Paragraph("<b>PROJECT SUPERVISOR / GUIDE</b><br/>Assistant Professor, Dept. of CSE<br/>College of Engineering & Technology", ParagraphStyle('GuidName', fontName='Helvetica', fontSize=9, leading=13, textColor=colors.HexColor("#0F172A")))
        ]
    ]
    t_sub = Table(sub_data, colWidths=[247, 248])
    t_sub.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_sub)

    story.append(Spacer(1, 50))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=12))
    
    story.append(Paragraph("<b>ACADEMIC YEAR: 2025 – 2026</b>", ParagraphStyle('YearText', fontName='Helvetica-Bold', fontSize=10, alignment=1, textColor=colors.HexColor("#1E3A8A"))))
    story.append(PageBreak())

    # ==================================================================
    # 2. CERTIFICATE OF AUTHENTICITY
    # ==================================================================
    story.append(Paragraph("CERTIFICATE OF APPROVAL", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    cert_body = (
        "This is to certify that the mini-project report entitled <b>\"STUDENT PERFORMANCE PREDICTION SYSTEM\"</b> "
        "is a bona fide record of work carried out by <b>Student Name</b> (Roll No: <b>2022-CSE-042</b>) in partial "
        "fulfillment of the requirements for the award of the degree of <b>Bachelor of Technology in Computer Science "
        "and Engineering</b> from <b>Institute of Technology & Science</b> during the academic year <b>2025–2026</b>.<br/><br/>"
        "The project demonstrates a machine learning-based academic performance forecasting platform built using "
        "Multiple Linear Regression, a Python Flask REST API, and a modern React 19 TypeScript web client. "
        "The work presented herein has not been submitted in part or full to any other University or Institution "
        "for the award of any degree or diploma."
    )
    story.append(Paragraph(cert_body, styles["DocBody"]))
    story.append(Spacer(1, 60))

    # Signature Block
    sig_data = [
        [
            Paragraph("___________________________<br/><b>Internal Project Guide</b><br/>Dept. of Computer Science & Eng.", ParagraphStyle('Sig1', fontName='Helvetica', fontSize=8.5, leading=12, alignment=1)),
            Paragraph("___________________________<br/><b>Head of Department (HOD)</b><br/>Dept. of Computer Science & Eng.", ParagraphStyle('Sig2', fontName='Helvetica', fontSize=8.5, leading=12, alignment=1)),
            Paragraph("___________________________<br/><b>External Examiner</b><br/>Board of Examiners", ParagraphStyle('Sig3', fontName='Helvetica', fontSize=8.5, leading=12, alignment=1))
        ]
    ]
    t_sig = Table(sig_data, colWidths=[165, 165, 165])
    story.append(t_sig)

    story.append(Spacer(1, 40))
    story.append(Paragraph("Date: ________________________", styles["DocBody"]))
    story.append(Paragraph("Place: ________________________", styles["DocBody"]))
    story.append(PageBreak())

    # ==================================================================
    # 3. DECLARATION & ACKNOWLEDGEMENT
    # ==================================================================
    story.append(Paragraph("CANDIDATE DECLARATION", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    dec_body = (
        "I hereby declare that the work presented in this project report entitled <b>\"Student Performance Prediction System\"</b> "
        "is an authentic record of our own work carried out as a college mini-project. The design, model development, "
        "code implementation, test suite execution, and technical analyses presented in this report have been completed "
        "under the supervision and guidance of our project mentor.<br/><br/>"
        "I further confirm that no portion of this project has been plagiarized, copied, or submitted to any other "
        "institution for the award of any academic qualification or diploma."
    )
    story.append(Paragraph(dec_body, styles["DocBody"]))
    story.append(Spacer(1, 25))
    story.append(Paragraph("<b>Student Signature:</b> ___________________________", styles["DocBody"]))
    story.append(Paragraph("<b>Student Name:</b> Candidate Name", styles["DocBody"]))
    story.append(Paragraph("<b>University Roll No:</b> 2022-CSE-042", styles["DocBody"]))

    story.append(Spacer(1, 30))
    story.append(Paragraph("ACKNOWLEDGEMENTS", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    ack_body = (
        "I express our deepest gratitude to our project supervisor for their invaluable guidance, constant encouragement, "
        "and critical feedback throughout the development of the <i>Student Performance Prediction System</i>. "
        "Their constructive suggestions during the algorithmic evaluation and software architecture phases significantly "
        "enhanced the quality and robustness of this work.<br/><br/>"
        "I extend our sincere appreciation to the <b>Head of the Department of Computer Science & Engineering</b> "
        "and the college administration for providing the computing infrastructure, laboratories, and academic support "
        "necessary to bring this project to fruition. Lastly, I thank our peers and family members for their unwavering "
        "moral support and understanding."
    )
    story.append(Paragraph(ack_body, styles["DocBody"]))
    story.append(PageBreak())

    # ==================================================================
    # 4. EXECUTIVE ABSTRACT
    # ==================================================================
    story.append(Paragraph("EXECUTIVE ABSTRACT", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    abs_p1 = (
        "Early identification of academically vulnerable students is one of the most pressing challenges faced by "
        "modern educational institutions. Timely and accurate forecasting of a student's expected academic performance "
        "empowers instructors, academic counselors, and mentors to implement tailored educational interventions well before "
        "summative final examinations occur. Traditional institutional evaluation systems, however, remain largely retrospective, "
        "evaluating failure only after semester results are officially declared."
    )
    story.append(Paragraph(abs_p1, styles["DocBody"]))

    abs_p2 = (
        "This project presents the <b>Student Performance Prediction System</b>, an end-to-end, decoupled machine learning "
        "application engineered for transparent, high-speed academic analytics. The core predictive engine utilizes a "
        "<b>Multiple Linear Regression</b> model trained on a validated dataset of 1,000 student records incorporating five "
        "pivotal behavioral and historical academic features: daily study hours, lecture attendance percentage, previous semester "
        "exam score, continuous assessment/assignment score, and daily sleep duration. Model evaluation demonstrates strong "
        "predictive capability with a <b>Coefficient of Determination ($R^2$) of 0.9685</b> (96.85% variance explained) and an "
        "exceptionally low <b>Mean Absolute Error (MAE) of 1.86 marks</b> on unseen test data."
    )
    story.append(Paragraph(abs_p2, styles["DocBody"]))

    abs_p3 = (
        "The system employs a modern decoupled software architecture comprising a <b>Python Flask RESTful API</b> serving predictions "
        "with 32 automated validation and defensive sanitization checks, paired with a responsive <b>React 19, TypeScript, "
        "and Tailwind CSS</b> client interface. The web interface delivers instant feedback, visual score gauges, dynamic "
        "student profile insights, and automated pedagogical recommendations categorized into four distinct performance bands: "
        "<i>Excellent (&ge; 85)</i>, <i>Good (70–84)</i>, <i>Average (50–69)</i>, and <i>Needs Improvement (&lt; 50)</i>. "
        "This report comprehensively documents the theoretical formulation, architectural design, dataset engineering, "
        "empirical evaluation, validation security, and full graphical user interface of the completed system."
    )
    story.append(Paragraph(abs_p3, styles["DocBody"]))

    story.append(Spacer(1, 10))
    story.append(build_callout(
        "<b>Keywords:</b> Educational Data Mining (EDM), Student Performance Prediction, Multiple Linear Regression, "
        "Machine Learning, Scikit-learn, Flask REST API, React 19, Academic Analytics, Input Validation Guardrails.",
        styles, bg_color="#F8FAFC", border_color="#94A3B8"
    ))
    story.append(PageBreak())

    # ==================================================================
    # 5. TABLE OF CONTENTS & LISTS
    # ==================================================================
    story.append(Paragraph("TABLE OF CONTENTS", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    toc_data = [
        [Paragraph("<b>Certificate of Approval</b>", styles["TableCellBold"]), Paragraph("ii", styles["TableCellCenter"])],
        [Paragraph("<b>Candidate Declaration & Acknowledgements</b>", styles["TableCellBold"]), Paragraph("iii", styles["TableCellCenter"])],
        [Paragraph("<b>Executive Abstract</b>", styles["TableCellBold"]), Paragraph("iv", styles["TableCellCenter"])],
        [Paragraph("<b>List of Figures & Tables</b>", styles["TableCellBold"]), Paragraph("v", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 1: Introduction</b>", styles["TableCellBold"]), Paragraph("1", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.1 Background & Motivation", styles["TableCell"]), Paragraph("1", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.2 Problem Statement & Current Challenges", styles["TableCell"]), Paragraph("1", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.3 Objectives of the Project", styles["TableCell"]), Paragraph("2", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.4 Scope and Limitations", styles["TableCell"]), Paragraph("2", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;1.5 Report Organization", styles["TableCell"]), Paragraph("2", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 2: Literature Survey & Theoretical Framework</b>", styles["TableCellBold"]), Paragraph("3", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.1 Educational Data Mining (EDM) & Learning Analytics", styles["TableCell"]), Paragraph("3", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.2 Comparative Study of Machine Learning Algorithms", styles["TableCell"]), Paragraph("3", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;2.3 Algorithm Justification: Multiple Linear Regression", styles["TableCell"]), Paragraph("4", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 3: System Requirements & Architecture</b>", styles["TableCellBold"]), Paragraph("5", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.1 Hardware and Software Requirements", styles["TableCell"]), Paragraph("5", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.2 Decoupled Full-Stack Architecture Pattern", styles["TableCell"]), Paragraph("5", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.3 Technology Stack Breakdown", styles["TableCell"]), Paragraph("6", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;3.4 Request-Response Lifecycle & Data Flow", styles["TableCell"]), Paragraph("6", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 4: Dataset Analysis & Feature Engineering</b>", styles["TableCellBold"]), Paragraph("7", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.1 Dataset Characteristics & Provenance", styles["TableCell"]), Paragraph("7", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.2 Feature Dictionary & Permissible Bounds", styles["TableCell"]), Paragraph("7", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.3 Descriptive Statistical Summary", styles["TableCell"]), Paragraph("8", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;4.4 Feature Correlation Matrix & Multicollinearity", styles["TableCell"]), Paragraph("8", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 5: Machine Learning Model Design & Training</b>", styles["TableCellBold"]), Paragraph("9", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.1 Mathematical Formulation of Regression", styles["TableCell"]), Paragraph("9", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.2 Train-Test Partitioning Strategy (80/20)", styles["TableCell"]), Paragraph("9", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.3 Learned Feature Weights & Intercept", styles["TableCell"]), Paragraph("10", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;5.4 Empirical Evaluation Metrics ($R^2, \\text{MAE}$)", styles["TableCell"]), Paragraph("10", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 6: System Implementation & Web Interface</b>", styles["TableCellBold"]), Paragraph("11", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.1 Frontend User Interface Design", styles["TableCell"]), Paragraph("11", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.2 RESTful API Design (`/health`, `/predict`)", styles["TableCell"]), Paragraph("11", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.3 Defensive Validation Engineering (32 Rules)", styles["TableCell"]), Paragraph("12", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;6.4 Performance Categorization Bands", styles["TableCell"]), Paragraph("12", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 7: Testing & Quality Assurance</b>", styles["TableCellBold"]), Paragraph("13", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;7.1 Test Strategy & Automated Test Suite", styles["TableCell"]), Paragraph("13", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;7.2 Boundary Value Analysis & Edge Case Testing", styles["TableCell"]), Paragraph("13", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;7.3 Malicious Input & Security Sanitization", styles["TableCell"]), Paragraph("14", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 8: Results & System Screen Captures</b>", styles["TableCellBold"]), Paragraph("15", styles["TableCellCenter"])],
        [Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;8.1 Graphical Interface Figures (Fig 1 – Fig 11)", styles["TableCell"]), Paragraph("15", styles["TableCellCenter"])],
        [Paragraph("<b>Chapter 9: Conclusion & Future Scope</b>", styles["TableCellBold"]), Paragraph("22", styles["TableCellCenter"])],
        [Paragraph("<b>References & Academic Bibliography</b>", styles["TableCellBold"]), Paragraph("23", styles["TableCellCenter"])],
        [Paragraph("<b>Appendix: Core Source Code Listings</b>", styles["TableCellBold"]), Paragraph("24", styles["TableCellCenter"])],
    ]
    t_toc = Table(toc_data, colWidths=[435, 60])
    t_toc.setStyle(TableStyle([
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, colors.HexColor("#F1F5F9")),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # List of Figures & Tables
    story.append(Paragraph("LIST OF FIGURES & TABLES", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    figs_data = [
        [Paragraph("<b>Fig. No.</b>", styles["TableHeader"]), Paragraph("<b>Figure Title & Description</b>", styles["TableHeader"]), Paragraph("<b>Page</b>", styles["TableHeader"])],
        [Paragraph("Figure 1", styles["TableCellCenter"]), Paragraph("Landing Page Hero Section, Navigation Bar, and Trust Badges", styles["TableCell"]), Paragraph("15", styles["TableCellCenter"])],
        [Paragraph("Figure 2", styles["TableCellCenter"]), Paragraph("Project Key Metrics (1,000 Records, 5 Features, 1 Model)", styles["TableCell"]), Paragraph("16", styles["TableCellCenter"])],
        [Paragraph("Figure 3", styles["TableCellCenter"]), Paragraph("Interactive Student Profile Parameter Input Form (Default State)", styles["TableCell"]), Paragraph("16", styles["TableCellCenter"])],
        [Paragraph("Figure 4", styles["TableCellCenter"]), Paragraph("Model Prediction for Consistent Student Profile (74% Good Performance)", styles["TableCell"]), Paragraph("17", styles["TableCellCenter"])],
        [Paragraph("Figure 5", styles["TableCellCenter"]), Paragraph("Model Prediction for High-Performing Student Profile (89% Excellent)", styles["TableCell"]), Paragraph("18", styles["TableCellCenter"])],
        [Paragraph("Figure 6", styles["TableCellCenter"]), Paragraph("Model Prediction for At-Risk Student Profile (43% Needs Improvement)", styles["TableCell"]), Paragraph("18", styles["TableCellCenter"])],
        [Paragraph("Figure 7", styles["TableCellCenter"]), Paragraph("Client & Server-Side Input Validation Warning Banners", styles["TableCell"]), Paragraph("19", styles["TableCellCenter"])],
        [Paragraph("Figure 8", styles["TableCellCenter"]), Paragraph("4-Step Machine Learning Pipeline & Inference Flowchart", styles["TableCell"]), Paragraph("20", styles["TableCellCenter"])],
        [Paragraph("Figure 9", styles["TableCellCenter"]), Paragraph("Full-Stack System Architecture & Technical Specifications", styles["TableCell"]), Paragraph("20", styles["TableCellCenter"])],
        [Paragraph("Figure 10", styles["TableCellCenter"]), Paragraph("Application Footer & Technology Stack Integration Badges", styles["TableCell"]), Paragraph("21", styles["TableCellCenter"])],
        [Paragraph("Figure 11", styles["TableCellCenter"]), Paragraph("Mobile Responsive Viewport Layout (390 x 844 Mobile Profile)", styles["TableCell"]), Paragraph("21", styles["TableCellCenter"])],
    ]
    t_figs = Table(figs_data, colWidths=[65, 370, 60])
    t_figs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_figs)

    story.append(Spacer(1, 15))
    story.append(Paragraph("<b>List of Tables</b>", styles["DocSectionTitle"]))

    tabs_data = [
        [Paragraph("<b>Table No.</b>", styles["TableHeader"]), Paragraph("<b>Table Title & Content Summary</b>", styles["TableHeader"]), Paragraph("<b>Page</b>", styles["TableHeader"])],
        [Paragraph("Table 1", styles["TableCellCenter"]), Paragraph("Comparative Analysis of Supervised Machine Learning Algorithms", styles["TableCell"]), Paragraph("4", styles["TableCellCenter"])],
        [Paragraph("Table 2", styles["TableCellCenter"]), Paragraph("Hardware and Software Specification Environments", styles["TableCell"]), Paragraph("5", styles["TableCellCenter"])],
        [Paragraph("Table 3", styles["TableCellCenter"]), Paragraph("Dataset Feature Dictionary & Permissible Operational Bounds", styles["TableCell"]), Paragraph("7", styles["TableCellCenter"])],
        [Paragraph("Table 4", styles["TableCellCenter"]), Paragraph("Descriptive Statistical Summary Across 1,000 Student Records", styles["TableCell"]), Paragraph("8", styles["TableCellCenter"])],
        [Paragraph("Table 5", styles["TableCellCenter"]), Paragraph("Pearson Correlation Matrix Between Features and Final Score", styles["TableCell"]), Paragraph("8", styles["TableCellCenter"])],
        [Paragraph("Table 6", styles["TableCellCenter"]), Paragraph("Learned Linear Regression Feature Weights & Model Intercept", styles["TableCell"]), Paragraph("10", styles["TableCellCenter"])],
        [Paragraph("Table 7", styles["TableCellCenter"]), Paragraph("Performance Categorization Bands & Diagnostic Feedback Rules", styles["TableCell"]), Paragraph("12", styles["TableCellCenter"])],
        [Paragraph("Table 8", styles["TableCellCenter"]), Paragraph("Automated Validation Test Suite Results (32 Test Cases)", styles["TableCell"]), Paragraph("14", styles["TableCellCenter"])],
    ]
    t_tabs = Table(tabs_data, colWidths=[65, 370, 60])
    t_tabs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_tabs)
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 1: INTRODUCTION
    # ==================================================================
    story.append(Paragraph("CHAPTER 1: INTRODUCTION", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("1.1 Background and Motivation", styles["DocSectionTitle"]))
    c1_bg = (
        "Higher education institutions globally face critical challenges regarding student retention, academic progression, "
        "and equitable learning outcomes. Academic success is inherently multifaceted, shaped by an intricate interplay of "
        "study habits, lecture attendance, continuous assessment submissions, foundational aptitude, and physiological well-being "
        "such as sleep patterns. When students experience academic difficulties, early warning indicators are often present "
        "weeks or months prior to final evaluations. However, in conventional academic administration, these signals remain "
        "siloed in disparate attendance sheets and assignment registers. Consequently, institutional intervention typically occurs "
        "only after official grades are released—a time when academic remediation is either impossible or significantly costlier."
    )
    story.append(Paragraph(c1_bg, styles["DocBody"]))

    c1_mot = (
        "The advent of Educational Data Mining (EDM) and predictive machine learning models presents an unprecedented opportunity "
        "to shift institutional paradigms from <i>reactive remediation</i> to <i>proactive intervention</i>. By leveraging historical "
        "academic and behavioral patterns, statistical regression models can estimate expected summative examination scores with high "
        "precision. Empowering educators with such insights provides actionable diagnostics, enabling personalized tutoring, structured "
        "academic counseling, and timely resource allocation."
    )
    story.append(Paragraph(c1_mot, styles["DocBody"]))

    story.append(Paragraph("1.2 Problem Statement & Current Challenges", styles["DocSectionTitle"]))
    c1_prob = (
        "Despite the availability of academic data, contemporary educational systems suffer from three primary bottlenecks:<br/>"
        "<b>1. Latent Risk Discovery:</b> Conventional evaluation mechanisms rely on end-of-term examinations, leaving mentors "
        "with zero quantitative foresight regarding students who are silently falling behind.<br/>"
        "<b>2. Monolithic & Complex Tools:</b> Existing enterprise analytics software is prohibitively expensive, cumbersome, "
        "and requires specialized data science knowledge to operate.<br/>"
        "<b>3. Lack of Transparent, Real-Time Feedback:</b> Students rarely have direct access to self-assessment tools that "
        "quantify how marginal behavioral improvements (e.g., increasing study hours by 1.5 hours or boosting attendance from "
        "65% to 85%) directly impact their expected examination trajectory."
    )
    story.append(Paragraph(c1_prob, styles["DocBody"]))

    story.append(Paragraph("1.3 Objectives of the Project", styles["DocSectionTitle"]))
    story.append(Paragraph("The overarching objective of this mini-project is to engineer, validate, and deploy a robust, end-to-end "
                           "web application capable of predicting student final examination performance. Specific objectives include:", styles["DocBody"]))
    story.append(Paragraph("• <b>Curate a Statistically Rigorous Dataset:</b> Assemble 1,000 clean, normalized student records reflecting core behavioral and academic dimensions without missing values.", styles["DocBullet"]))
    story.append(Paragraph("• <b>Train an Interpretable Machine Learning Model:</b> Develop a Multiple Linear Regression model yielding high accuracy ($R^2 > 0.95$) and low error ($\text{MAE} < 2.5$ marks) while maintaining transparent feature weights.", styles["DocBullet"]))
    story.append(Paragraph("• <b>Build a Secure, High-Performance REST API:</b> Construct a lightweight Python Flask backend equipped with 32 automated validation rules protecting against invalid numbers, boundary overflows, SQL injections, and XSS attacks.", styles["DocBullet"]))
    story.append(Paragraph("• <b>Deliver an Intuitive, Responsive User Interface:</b> Design a modern, accessible web client using React 19, TypeScript, and Tailwind CSS offering real-time prediction feedback, interactive presets, score visualization gauges, and diagnostic recommendations.", styles["DocBullet"]))

    story.append(Paragraph("1.4 Scope and Limitations", styles["DocSectionTitle"]))
    story.append(Paragraph(
        "<b>Scope:</b> The system is targeted for undergraduate academic mentoring programs, high school counseling cells, "
        "and self-guided student evaluation. It evaluates five standardized features that are readily observable without "
        "invasive surveillance.<br/>"
        "<b>Limitations:</b> The current model does not incorporate qualitative non-cognitive parameters (such as psychological "
        "stress, financial instability, or specific course syllabi difficulty variations). Additionally, predictions represent "
        "probabilistic statistical estimates rather than deterministic guarantees.", styles["DocBody"]
    ))

    story.append(Paragraph("1.5 Report Organization", styles["DocSectionTitle"]))
    story.append(Paragraph(
        "The remainder of this report is organized as follows: Chapter 2 explores the theoretical foundations of Educational "
        "Data Mining and algorithmic comparisons. Chapter 3 delineates system architecture and hardware/software specifications. "
        "Chapter 4 analyzes the dataset and feature correlation. Chapter 5 details model training, mathematical formulation, "
        "and evaluation metrics. Chapter 6 details the full-stack software implementation. Chapter 7 covers testing and quality "
        "assurance. Chapter 8 presents the complete visual output and screen captures. Finally, Chapter 9 concludes the study "
        "and outlines future technological enhancements.", styles["DocBody"]
    ))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 2: LITERATURE SURVEY & THEORETICAL FRAMEWORK
    # ==================================================================
    story.append(Paragraph("CHAPTER 2: LITERATURE SURVEY & THEORETICAL FRAMEWORK", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("2.1 Educational Data Mining (EDM) & Learning Analytics", styles["DocSectionTitle"]))
    c2_edm = (
        "Educational Data Mining (EDM) is an emerging interdisciplinary research discipline concerned with developing methods for "
        "exploring unique types of data originating from educational contexts. The primary goal of EDM is to better understand "
        "how students learn and the factors influencing their academic trajectory. Early works by Romero & Ventura (2010) classified "
        "educational analytics into predictive modeling, student clustering, outlier detection, and relationship mining. "
        "Predicting student performance remains the central pillar of EDM, as it directly impacts institutional retention policies "
        "and individual learning efficacy."
    )
    story.append(Paragraph(c2_edm, styles["DocBody"]))

    story.append(Paragraph("2.2 Comparative Study of Machine Learning Algorithms", styles["DocSectionTitle"]))
    c2_comp = (
        "Numerous predictive algorithms have been applied to educational datasets, spanning parametric regression, decision trees, "
        "ensemble methods, and deep artificial neural networks. Selecting the optimal algorithm requires balancing predictive "
        "accuracy, computational latency, training complexity, and—most importantly in educational settings—<b>interpretability</b>. "
        "Table 1 contrasts the prominent algorithms investigated in academic literature."
    )
    story.append(Paragraph(c2_comp, styles["DocBody"]))

    # Table 1: Algorithm Comparison
    t1_rows = [
        [Paragraph("<b>Algorithm</b>", styles["TableHeader"]), Paragraph("<b>Interpretability</b>", styles["TableHeader"]), Paragraph("<b>Inference Latency</b>", styles["TableHeader"]), Paragraph("<b>Data Efficiency</b>", styles["TableHeader"]), Paragraph("<b>Overfitting Risk</b>", styles["TableHeader"]), Paragraph("<b>Suitability for Mini-Project</b>", styles["TableHeader"])],
        [Paragraph("Multiple Linear Regression", styles["TableCellBold"]), Paragraph("Very High (Direct Weights)", styles["TableCell"]), Paragraph("< 1 ms (Closed Form)", styles["TableCell"]), Paragraph("High (Requires small data)", styles["TableCell"]), Paragraph("Low (Regularized)", styles["TableCell"]), Paragraph("<b>Optimal (Selected)</b>", styles["TableCellBold"])],
        [Paragraph("Decision Tree Regressor", styles["TableCellBold"]), Paragraph("Moderate (Rule sets)", styles["TableCell"]), Paragraph("Fast (~ 2-5 ms)", styles["TableCell"]), Paragraph("Moderate", styles["TableCell"]), Paragraph("High on small data", styles["TableCell"]), Paragraph("Good baseline", styles["TableCell"])],
        [Paragraph("Random Forest Regressor", styles["TableCellBold"]), Paragraph("Low (Ensemble black-box)", styles["TableCell"]), Paragraph("Moderate (~ 15-30 ms)", styles["TableCell"]), Paragraph("Moderate", styles["TableCell"]), Paragraph("Low", styles["TableCell"]), Paragraph("Excessive compute overhead", styles["TableCell"])],
        [Paragraph("Support Vector Regressor (SVR)", styles["TableCellBold"]), Paragraph("Low (Kernel projection)", styles["TableCell"]), Paragraph("Moderate (~ 10-20 ms)", styles["TableCell"]), Paragraph("Sensitive to scaling", styles["TableCell"]), Paragraph("Moderate", styles["TableCell"]), Paragraph("Sub-optimal interpretability", styles["TableCell"])],
        [Paragraph("Deep Neural Network (MLP)", styles["TableCellBold"]), Paragraph("Very Low (Black-box)", styles["TableCell"]), Paragraph("High (~ 50-100 ms)", styles["TableCell"]), Paragraph("Requires > 10k samples", styles["TableCell"]), Paragraph("Very High without tuning", styles["TableCell"]), Paragraph("Unjustified for 5 features", styles["TableCell"])],
    ]
    t_algo = Table(t1_rows, colWidths=[95, 80, 75, 75, 80, 90])
    t_algo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_algo)
    story.append(Paragraph("<b>Table 1:</b> Comparative Analysis of Supervised Machine Learning Algorithms for Academic Performance Prediction.", styles["DocCaption"]))

    story.append(Paragraph("2.3 Justification for Multiple Linear Regression", styles["DocSectionTitle"]))
    c2_just = (
        "Based on the empirical requirements of our college mini-project, <b>Multiple Linear Regression (MLR)</b> was chosen "
        "as the primary learning algorithm for three decisive reasons:<br/>"
        "<b>1. Total Explainability:</b> Each learned coefficient directly represents the marginal rate of return for that specific "
        "student behavior. For example, a coefficient of $+1.91$ on study hours communicates to educators and students exactly "
        "how many marks are gained for each additional daily study hour.<br/>"
        "<b>2. Ultra-Low Inference Latency:</b> Prediction computation reduces to a dot product between 5 input weights and the "
        "feature vector, executing in sub-millisecond time. This enables frictionless real-time client interaction.<br/>"
        "<b>3. High Empirical Fidelity:</b> When evaluated on the 1,000-student dataset, the linear model achieved an $R^2$ of "
        "<b>0.9685</b> and an MAE of <b>1.86 marks</b>, proving that non-linear kernel transformations are superfluous for this feature set."
    )
    story.append(Paragraph(c2_just, styles["DocBody"]))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 3: SYSTEM REQUIREMENTS & ARCHITECTURE
    # ==================================================================
    story.append(Paragraph("CHAPTER 3: SYSTEM REQUIREMENTS & ARCHITECTURE", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("3.1 Hardware and Software Requirements", styles["DocSectionTitle"]))
    story.append(Paragraph("The system is engineered to run seamlessly across standard personal computers as well as cloud environments. "
                           "Table 2 itemizes the minimum and recommended operational specifications.", styles["DocBody"]))

    # Table 2: Requirements
    t2_rows = [
        [Paragraph("<b>Component</b>", styles["TableHeader"]), Paragraph("<b>Minimum Requirement</b>", styles["TableHeader"]), Paragraph("<b>Recommended Specification</b>", styles["TableHeader"]), Paragraph("<b>Deployment Environment</b>", styles["TableHeader"])],
        [Paragraph("Processor (CPU)", styles["TableCellBold"]), Paragraph("Dual-Core 2.0 GHz x86/ARM", styles["TableCell"]), Paragraph("Quad-Core Intel i5 / AMD Ryzen 5 / Apple M1", styles["TableCell"]), Paragraph("Standard Cloud vCPU", styles["TableCell"])],
        [Paragraph("System Memory (RAM)", styles["TableCellBold"]), Paragraph("2.0 GB RAM", styles["TableCell"]), Paragraph("8.0 GB RAM", styles["TableCell"]), Paragraph("512 MB Free Instance RAM", styles["TableCell"])],
        [Paragraph("Disk Storage", styles["TableCellBold"]), Paragraph("500 MB Free Space", styles["TableCell"]), Paragraph("2.0 GB SSD Space", styles["TableCell"]), Paragraph("Standard Container Storage", styles["TableCell"])],
        [Paragraph("Operating System", styles["TableCellBold"]), Paragraph("Windows 10 / Ubuntu 20.04 / macOS", styles["TableCell"]), Paragraph("Windows 11 / Ubuntu 22.04 LTS", styles["TableCell"]), Paragraph("Linux Container (Debian Bookworm)", styles["TableCell"])],
        [Paragraph("Python Runtime", styles["TableCellBold"]), Paragraph("Python 3.10+", styles["TableCell"]), Paragraph("Python 3.12.x", styles["TableCell"]), Paragraph("Gunicorn 21.2.0 WSGI Server", styles["TableCell"])],
        [Paragraph("Node.js Runtime", styles["TableCellBold"]), Paragraph("Node.js v18.x LTS", styles["TableCell"]), Paragraph("Node.js v20.x or v22.x LTS", styles["TableCell"]), Paragraph("Vercel Edge CDN Runtime", styles["TableCell"])],
        [Paragraph("Client Web Browser", styles["TableCellBold"]), Paragraph("Chromium 90+ / Firefox 90+ / Safari 14+", styles["TableCell"]), Paragraph("Google Chrome 120+ / Edge 120+", styles["TableCell"]), Paragraph("Modern Web Standards (ES2022)", styles["TableCell"])],
    ]
    t_req = Table(t2_rows, colWidths=[100, 125, 140, 130])
    t_req.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_req)
    story.append(Paragraph("<b>Table 2:</b> Minimum and Recommended Hardware/Software Specification Environments.", styles["DocCaption"]))

    story.append(Paragraph("3.2 Decoupled Full-Stack Architecture Pattern", styles["DocSectionTitle"]))
    c3_arch = (
        "The application is structured following a modern <b>Decoupled Full-Stack Architecture</b> pattern. "
        "Rather than relying on legacy server-side template rendering (such as Jinja2 HTML rendering within Flask), "
        "the presentation tier is completely decoupled from the analytical inference tier. The frontend is an autonomous Single Page "
        "Application (SPA) built with React 19 and Vite, while the backend is an asynchronous, stateless Python Flask microservice. "
        "Communication is orchestrated via standardized JSON payloads over HTTP POST protocols with Cross-Origin Resource Sharing (CORS) "
        "enabled."
    )
    story.append(Paragraph(c3_arch, styles["DocBody"]))

    story.append(Paragraph("3.3 Technology Stack Breakdown", styles["DocSectionTitle"]))
    story.append(Paragraph("• <b>Frontend Layer (React 19 & TypeScript):</b> Provides a high-fidelity reactive user experience with type-safe state interfaces, dynamic SVG score dials, animated progress bars, responsive preset cards, and defensive client-side validation.", styles["DocBullet"]))
    story.append(Paragraph("• <b>Styling & UX (Tailwind CSS & Lucide Icons):</b> Employs an accessible, professional light-theme design system featuring Tailwind CSS utility classes, subtle borders, high-contrast typography, and curated academic trust badges.", styles["DocBullet"]))
    story.append(Paragraph("• <b>Application Server Layer (Flask 3.0 & Flask-CORS):</b> Lightweight REST API server providing the <code>/health</code> status endpoint and <code>/predict</code> inference route with comprehensive error handling.", styles["DocBullet"]))
    story.append(Paragraph("• <b>Machine Learning Core (Scikit-Learn, Pandas, Joblib):</b> High-performance Python machine learning ecosystem utilizing Pandas for tabular manipulation, Scikit-learn for OLS linear modeling, and Joblib for serialized artifact storage.", styles["DocBullet"]))

    story.append(Paragraph("3.4 Request-Response Lifecycle & Data Flow", styles["DocSectionTitle"]))
    c3_flow = (
        "The end-to-end execution lifecycle proceeds across five discrete stages:<br/>"
        "1. <i>User Interaction:</i> The student or instructor inputs 5 parameters via the React web UI or clicks a preset.<br/>"
        "2. <i>Client Pre-Validation:</i> React Hook logic validates that all fields are populated and conform to numerical boundaries.<br/>"
        "3. <i>HTTP Dispatch:</i> The client dispatches a JSON POST payload to <code>http://127.0.0.1:5000/predict</code>.<br/>"
        "4. <i>Defensive Server Validation & Inference:</i> Flask evaluates the payload against 32 validation rules, casts features into a Pandas DataFrame, invokes <code>model.predict()</code>, clamps the score to $[0, 100]$, and assigns a diagnostic performance tier.<br/>"
        "5. <i>Reactive Presentation:</i> The client receives the JSON response and updates the UI state to render the score card, dynamic progress dial, and pedagogical recommendations."
    )
    story.append(Paragraph(c3_flow, styles["DocBody"]))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 4: DATASET ANALYSIS & FEATURE ENGINEERING
    # ==================================================================
    story.append(Paragraph("CHAPTER 4: DATASET ANALYSIS & FEATURE ENGINEERING", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("4.1 Dataset Characteristics & Provenance", styles["DocSectionTitle"]))
    c4_prov = (
        "To ensure a clean, reproducible, and privacy-compliant educational project, a curated dataset consisting of "
        "<b>1,000 student records</b> was constructed. The dataset avoids third-party proprietary restrictions or student privacy "
        "violations (FERPA/GDPR) while capturing realistic statistical distributions observed across undergraduate engineering curricula. "
        "The dataset contains zero missing or null entries across all 6 continuous columns."
    )
    story.append(Paragraph(c4_prov, styles["DocBody"]))

    story.append(Paragraph("4.2 Feature Dictionary & Permissible Bounds", styles["DocSectionTitle"]))
    story.append(Paragraph("Table 3 details the operational definition, data type, and permissible range for all input attributes.", styles["DocBody"]))

    # Table 3: Features
    t3_rows = [
        [Paragraph("<b>Attribute</b>", styles["TableHeader"]), Paragraph("<b>Type</b>", styles["TableHeader"]), Paragraph("<b>Permissible Range</b>", styles["TableHeader"]), Paragraph("<b>Unit</b>", styles["TableHeader"]), Paragraph("<b>Pedagogical Description</b>", styles["TableHeader"])],
        [Paragraph("<code>study_hours</code>", styles["TableCellBold"]), Paragraph("Float", styles["TableCellCenter"]), Paragraph("1.0 – 24.0", styles["TableCellCenter"]), Paragraph("Hours/Day", styles["TableCellCenter"]), Paragraph("Daily self-study duration outside scheduled lectures.", styles["TableCell"])],
        [Paragraph("<code>attendance</code>", styles["TableCellBold"]), Paragraph("Float", styles["TableCellCenter"]), Paragraph("0.0 – 100.0", styles["TableCellCenter"]), Paragraph("Percentage (%)", styles["TableCellCenter"]), Paragraph("Proportion of enrolled classroom sessions attended.", styles["TableCell"])],
        [Paragraph("<code>previous_score</code>", styles["TableCellBold"]), Paragraph("Float", styles["TableCellCenter"]), Paragraph("0.0 – 100.0", styles["TableCellCenter"]), Paragraph("Marks (0-100)", styles["TableCellCenter"]), Paragraph("Score obtained in previous semester internal exam.", styles["TableCell"])],
        [Paragraph("<code>assignment_score</code>", styles["TableCellBold"]), Paragraph("Float", styles["TableCellCenter"]), Paragraph("0.0 – 100.0", styles["TableCellCenter"]), Paragraph("Marks (0-100)", styles["TableCellCenter"]), Paragraph("Continuous assessment score across homework assignments.", styles["TableCell"])],
        [Paragraph("<code>sleep_hours</code>", styles["TableCellBold"]), Paragraph("Float", styles["TableCellCenter"]), Paragraph("0.0 – 24.0", styles["TableCellCenter"]), Paragraph("Hours/Day", styles["TableCellCenter"]), Paragraph("Average daily sleep duration reflecting lifestyle balance.", styles["TableCell"])],
        [Paragraph("<code>final_score</code>", styles["TableCellBold"]), Paragraph("Integer", styles["TableCellCenter"]), Paragraph("0 – 100", styles["TableCellCenter"]), Paragraph("Marks (0-100)", styles["TableCellCenter"]), Paragraph("<b>Target Variable:</b> Final examination summative score.", styles["TableCellBold"])],
    ]
    t_feat = Table(t3_rows, colWidths=[95, 45, 80, 75, 200])
    t_feat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_feat)
    story.append(Paragraph("<b>Table 3:</b> Dataset Feature Dictionary and Permissible Operational Bounds.", styles["DocCaption"]))

    story.append(Paragraph("4.3 Descriptive Statistical Summary", styles["DocSectionTitle"]))
    story.append(Paragraph("Parametric evaluation across the 1,000 student records yields the statistical properties shown in Table 4.", styles["DocBody"]))

    # Table 4: Descriptive Statistics
    t4_rows = [
        [Paragraph("<b>Metric</b>", styles["TableHeader"]), Paragraph("<b>study_hours</b>", styles["TableHeader"]), Paragraph("<b>attendance</b>", styles["TableHeader"]), Paragraph("<b>previous_score</b>", styles["TableHeader"]), Paragraph("<b>assignment_score</b>", styles["TableHeader"]), Paragraph("<b>sleep_hours</b>", styles["TableHeader"]), Paragraph("<b>final_score</b>", styles["TableHeader"])],
        [Paragraph("Mean (μ)", styles["TableCellBold"]), Paragraph("5.28", styles["TableCellCenter"]), Paragraph("77.06%", styles["TableCellCenter"]), Paragraph("67.16", styles["TableCellCenter"]), Paragraph("68.00", styles["TableCellCenter"]), Paragraph("7.07", styles["TableCellCenter"]), Paragraph("66.22", styles["TableCellCenter"])],
        [Paragraph("Std Dev (σ)", styles["TableCellBold"]), Paragraph("1.84", styles["TableCellCenter"]), Paragraph("12.41%", styles["TableCellCenter"]), Paragraph("14.05", styles["TableCellCenter"]), Paragraph("13.64", styles["TableCellCenter"]), Paragraph("0.83", styles["TableCellCenter"]), Paragraph("13.94", styles["TableCellCenter"])],
        [Paragraph("Minimum", styles["TableCellBold"]), Paragraph("1.00", styles["TableCellCenter"]), Paragraph("42.00%", styles["TableCellCenter"]), Paragraph("30.00", styles["TableCellCenter"]), Paragraph("30.00", styles["TableCellCenter"]), Paragraph("4.70", styles["TableCellCenter"]), Paragraph("30.00", styles["TableCellCenter"])],
        [Paragraph("25% (Q1)", styles["TableCellBold"]), Paragraph("4.10", styles["TableCellCenter"]), Paragraph("68.00%", styles["TableCellCenter"]), Paragraph("57.00", styles["TableCellCenter"]), Paragraph("59.00", styles["TableCellCenter"]), Paragraph("6.50", styles["TableCellCenter"]), Paragraph("56.00", styles["TableCellCenter"])],
        [Paragraph("Median (50%)", styles["TableCellBold"]), Paragraph("5.20", styles["TableCellCenter"]), Paragraph("77.00%", styles["TableCellCenter"]), Paragraph("67.00", styles["TableCellCenter"]), Paragraph("68.00", styles["TableCellCenter"]), Paragraph("7.10", styles["TableCellCenter"]), Paragraph("66.00", styles["TableCellCenter"])],
        [Paragraph("75% (Q3)", styles["TableCellBold"]), Paragraph("6.40", styles["TableCellCenter"]), Paragraph("86.00%", styles["TableCellCenter"]), Paragraph("77.00", styles["TableCellCenter"]), Paragraph("77.00", styles["TableCellCenter"]), Paragraph("7.60", styles["TableCellCenter"]), Paragraph("76.00", styles["TableCellCenter"])],
        [Paragraph("Maximum", styles["TableCellBold"]), Paragraph("10.00", styles["TableCellCenter"]), Paragraph("100.00%", styles["TableCellCenter"]), Paragraph("100.00", styles["TableCellCenter"]), Paragraph("100.00", styles["TableCellCenter"]), Paragraph("9.60", styles["TableCellCenter"]), Paragraph("100.00", styles["TableCellCenter"])],
    ]
    t_stat = Table(t4_rows, colWidths=[80, 70, 70, 70, 70, 65, 70])
    t_stat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_stat)
    story.append(Paragraph("<b>Table 4:</b> Descriptive Statistical Summary Across 1,000 Curated Student Records.", styles["DocCaption"]))

    story.append(Paragraph("4.4 Feature Correlation Matrix & Multicollinearity", styles["DocSectionTitle"]))
    story.append(Paragraph("To evaluate linear dependency, the Pearson correlation coefficient ($r$) was computed between each feature and the target variable <code>final_score</code>, as summarized in Table 5.", styles["DocBody"]))

    # Table 5: Correlation
    t5_rows = [
        [Paragraph("<b>Feature Attribute</b>", styles["TableHeader"]), Paragraph("<b>Correlation with final_score (r)</b>", styles["TableHeader"]), Paragraph("<b>Linear Association Strength</b>", styles["TableHeader"]), Paragraph("<b>Statistical Significance</b>", styles["TableHeader"])],
        [Paragraph("<code>previous_score</code>", styles["TableCellBold"]), Paragraph("+ 0.9518", styles["TableCellCenter"]), Paragraph("Extremely Strong Positive", styles["TableCell"]), Paragraph("p < 0.001 (Highest predictor)", styles["TableCellBold"])],
        [Paragraph("<code>assignment_score</code>", styles["TableCellBold"]), Paragraph("+ 0.9488", styles["TableCellCenter"]), Paragraph("Extremely Strong Positive", styles["TableCell"]), Paragraph("p < 0.001 (Primary predictor)", styles["TableCellBold"])],
        [Paragraph("<code>study_hours</code>", styles["TableCellBold"]), Paragraph("+ 0.9273", styles["TableCellCenter"]), Paragraph("Very Strong Positive", styles["TableCell"]), Paragraph("p < 0.001 (Active behavior)", styles["TableCellBold"])],
        [Paragraph("<code>attendance</code>", styles["TableCellBold"]), Paragraph("+ 0.9118", styles["TableCellCenter"]), Paragraph("Very Strong Positive", styles["TableCell"]), Paragraph("p < 0.001 (Engagement index)", styles["TableCellBold"])],
        [Paragraph("<code>sleep_hours</code>", styles["TableCellBold"]), Paragraph("+ 0.2547", styles["TableCellCenter"]), Paragraph("Moderate Positive Stabilizer", styles["TableCell"]), Paragraph("p < 0.001 (Lifestyle factor)", styles["TableCell"])],
    ]
    t_corr = Table(t5_rows, colWidths=[120, 130, 125, 120])
    t_corr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_corr)
    story.append(Paragraph("<b>Table 5:</b> Pearson Correlation Coefficients Between Input Attributes and Summative Final Score.", styles["DocCaption"]))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 5: MACHINE LEARNING MODEL DESIGN & TRAINING
    # ==================================================================
    story.append(Paragraph("CHAPTER 5: MACHINE LEARNING MODEL DESIGN & TRAINING", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("5.1 Mathematical Formulation of Regression", styles["DocSectionTitle"]))
    c5_math = (
        "Multiple Linear Regression models the linear relationship between a continuous scalar dependent variable $Y$ "
        "(the student's final score) and a vector of $p=5$ exploratory independent predictor variables $X = (X_1, X_2, \\dots, X_5)$. "
        "The standard mathematical formulation is expressed as:<br/><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>Y = β₀ + β₁·(study_hours) + β₂·(attendance) + β₃·(previous_score) + β₄·(assignment_score) + β₅·(sleep_hours) + ε</b><br/><br/>"
        "where <b>β₀</b> denotes the model intercept (bias), <b>β_j</b> denotes the partial regression coefficient for the $j$-th feature, "
        "and <b>ε</b> represents an independently and identically distributed Gaussian error term $\\sim \\mathcal{N}(0, \\sigma^2)$. "
        "Optimization is performed via <b>Ordinary Least Squares (OLS)</b>, which minimizes the Residual Sum of Squares (RSS):<br/><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>RSS(β) = Σ (y_i - ŷ_i)² = Σ (y_i - β₀ - Σ β_j · x_ij)²</b>"
    )
    story.append(Paragraph(c5_math, styles["DocBody"]))

    story.append(Paragraph("5.2 Train-Test Partitioning Strategy (80/20)", styles["DocSectionTitle"]))
    c5_split = (
        "To rigorously evaluate generalizability and ensure zero data leakage, the 1,000 student records were partitioned "
        "using Scikit-Learn's <code>train_test_split</code> with an <b>80% training set (800 records)</b> and a <b>20% testing set "
        "(200 records)</b>. The pseudo-random seed was fixed at <code>random_state=42</code> to guarantee complete scientific "
        "reproducibility across independent runs."
    )
    story.append(Paragraph(c5_split, styles["DocBody"]))

    story.append(Paragraph("5.3 Learned Feature Weights & Intercept", styles["DocSectionTitle"]))
    story.append(Paragraph("Following model convergence, the learned partial regression weights were extracted, as itemized in Table 6.", styles["DocBody"]))

    # Table 6: Model Parameters
    t6_rows = [
        [Paragraph("<b>Parameter</b>", styles["TableHeader"]), Paragraph("<b>Feature Name</b>", styles["TableHeader"]), Paragraph("<b>Learned Weight (β)</b>", styles["TableHeader"]), Paragraph("<b>Pedagogical Interpretation</b>", styles["TableHeader"])],
        [Paragraph("β₁", styles["TableCellBold"]), Paragraph("<code>study_hours</code>", styles["TableCellBold"]), Paragraph("+ 1.9117", styles["TableCellCenter"]), Paragraph("Every additional daily study hour contributes <b>+1.91 marks</b> to final score.", styles["TableCell"])],
        [Paragraph("β₂", styles["TableCellBold"]), Paragraph("<code>attendance</code>", styles["TableCellBold"]), Paragraph("+ 0.1402", styles["TableCellCenter"]), Paragraph("Every 10% increase in attendance contributes <b>+1.40 marks</b>.", styles["TableCell"])],
        [Paragraph("β₃", styles["TableCellBold"]), Paragraph("<code>previous_score</code>", styles["TableCellBold"]), Paragraph("+ 0.3169", styles["TableCellCenter"]), Paragraph("Every 10 marks in prior exam translates to <b>+3.17 marks</b> in final exam.", styles["TableCell"])],
        [Paragraph("β₄", styles["TableCellBold"]), Paragraph("<code>assignment_score</code>", styles["TableCellBold"]), Paragraph("+ 0.3333", styles["TableCellCenter"]), Paragraph("Continuous assignment performance contributes <b>+3.33 marks per 10 marks</b>.", styles["TableCell"])],
        [Paragraph("β₅", styles["TableCellBold"]), Paragraph("<code>sleep_hours</code>", styles["TableCellBold"]), Paragraph("+ 0.5529", styles["TableCellCenter"]), Paragraph("Adequate sleep contributes <b>+0.55 marks per hour</b> by stabilizing cognitive focus.", styles["TableCell"])],
        [Paragraph("β₀", styles["TableCellBold"]), Paragraph("<b>Intercept (Bias)</b>", styles["TableCellBold"]), Paragraph("- 2.5352", styles["TableCellCenter"]), Paragraph("Base calibration offset adjusting baseline student scores.", styles["TableCell"])],
    ]
    t_beta = Table(t6_rows, colWidths=[40, 110, 85, 260])
    t_beta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_beta)
    story.append(Paragraph("<b>Table 6:</b> Learned OLS Linear Regression Coefficients and Intercept.", styles["DocCaption"]))

    story.append(Paragraph("5.4 Empirical Evaluation Metrics ($R^2, \\text{MAE}$)", styles["DocSectionTitle"]))
    c5_eval = (
        "The trained model was evaluated on the 200 holdout testing records utilizing two standard statistical metrics:<br/>"
        "• <b>Coefficient of Determination ($R^2$):</b> Measures the proportion of variance in the final exam score explained by the model:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>R² = 1 - (SS_res / SS_tot) = 0.9685</b><br/>"
        "An $R^2$ of <b>0.9685</b> indicates that <b>96.85%</b> of the variance in final student examination scores is successfully captured.<br/>"
        "• <b>Mean Absolute Error (MAE):</b> Quantifies the average magnitude of absolute prediction discrepancies:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>MAE = (1/n) Σ |y_i - ŷ_i| = 1.86 marks</b><br/>"
        "An average error of just <b>1.86 marks out of 100</b> demonstrates exceptional fidelity for college mentoring."
    )
    story.append(Paragraph(c5_eval, styles["DocBody"]))

    story.append(Paragraph("5.5 Model Serialization with Joblib", styles["DocSectionTitle"]))
    c5_ser = (
        "Upon successful training and validation, the trained <code>LinearRegression</code> instance was serialized using "
        "<code>joblib.dump(model, 'models/student_performance_model.pkl')</code>. The resulting binary file occupies less than "
        "<b>1 Kilobyte (961 bytes)</b>, allowing instantaneous deserialization upon Flask server startup with zero disk I/O bottleneck."
    )
    story.append(Paragraph(c5_ser, styles["DocBody"]))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 6: SYSTEM IMPLEMENTATION & WEB INTERFACE
    # ==================================================================
    story.append(Paragraph("CHAPTER 6: SYSTEM IMPLEMENTATION & WEB INTERFACE", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("6.1 Frontend User Interface Design", styles["DocSectionTitle"]))
    c6_fe = (
        "The client application was engineered using <b>React 19</b>, <b>TypeScript</b>, and <b>Tailwind CSS</b>. "
        "Prioritizing accessibility, clarity, and rapid demonstration during academic viva examinations, the interface incorporates:<br/>"
        "• <b>One-Click Profile Presets:</b> Instant demonstration buttons for four typical student profiles: <i>High Achiever</i>, "
        "<i>Balanced Performer</i>, <i>At-Risk Student</i>, and <i>Exam Crammer</i>.<br/>"
        "• <b>Dynamic Score Visualizers:</b> Semi-circular SVG radial gauge displaying predicted percentage score alongside color-coded "
        "badges indicating performance tiers.<br/>"
        "• <b>Actionable Analytical Insights:</b> Rule-based advisory cards highlighting key strengths (e.g., strong study discipline) "
        "and flags for concern (e.g., low attendance or sleep deficit)."
    )
    story.append(Paragraph(c6_fe, styles["DocBody"]))

    story.append(Paragraph("6.2 RESTful API Design (`/health`, `/predict`)", styles["DocSectionTitle"]))
    c6_api = (
        "The Python Flask server (<code>backend/app.py</code>) exposes two primary HTTP endpoints:<br/>"
        "• <b><code>GET /health</code>:</b> Diagnostic endpoint returning service status and model memory verification.<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<i>Response (200 OK):</i> <code>{\"status\": \"healthy\", \"model_status\": \"loaded\"}</code><br/>"
        "• <b><code>POST /predict</code>:</b> Primary inference route accepting a JSON dictionary containing the 5 features. "
        "Returns predicted score, performance band, and personalized recommendation."
    )
    story.append(Paragraph(c6_api, styles["DocBody"]))

    story.append(Paragraph("6.3 Defensive Validation Engineering (32 Rules)", styles["DocSectionTitle"]))
    c6_val = (
        "To satisfy rigorous security and robustness criteria, the backend does not assume well-formed input. "
        "A multi-layer validation engine inspects incoming requests against <b>32 automated criteria</b>:<br/>"
        "1. <i>Payload Type & Integrity:</i> Rejects non-JSON payloads, arrays, nulls, and empty request bodies (HTTP 400).<br/>"
        "2. <i>Strict Numerical Casting:</i> Detects non-numeric strings, boolean values (preventing Python's implicit <code>True == 1</code> casting), "
        "NaNs (<code>math.isnan</code>), and Infinities (<code>math.isinf</code>).<br/>"
        "3. <i>Boundary Range Enforcement:</i> Validates that <code>study_hours</code> ∈ [1, 24], <code>attendance</code> ∈ [0, 100], "
        "<code>previous_score</code> ∈ [0, 100], <code>assignment_score</code> ∈ [0, 100], and <code>sleep_hours</code> ∈ [0, 24].<br/>"
        "4. <i>Sanitization against Injections:</i> Safely rejects cross-site scripting (XSS) strings (e.g., <code>&lt;script&gt;</code>) "
        "and SQL injection syntax (e.g., <code>' OR 1=1 --</code>)."
    )
    story.append(Paragraph(c6_val, styles["DocBody"]))

    story.append(Paragraph("6.4 Performance Categorization Bands", styles["DocSectionTitle"]))
    story.append(Paragraph("Following inference, the continuous predicted score is clamped to $[0, 100]$ and mapped to four qualitative tiers shown in Table 7.", styles["DocBody"]))

    # Table 7: Performance Bands
    t7_rows = [
        [Paragraph("<b>Score Range</b>", styles["TableHeader"]), Paragraph("<b>Performance Tier</b>", styles["TableHeader"]), Paragraph("<b>Visual Color Badge</b>", styles["TableHeader"]), Paragraph("<b>Institutional Action / Recommendation</b>", styles["TableHeader"])],
        [Paragraph("85% – 100%", styles["TableCellBold"]), Paragraph("<b>Excellent</b>", styles["TableCellBold"]), Paragraph("Emerald Green", styles["TableCellCenter"]), Paragraph("The student is expected to perform exceptionally well. Recommend advanced honors coursework.", styles["TableCell"])],
        [Paragraph("70% – 84%", styles["TableCellBold"]), Paragraph("<b>Good</b>", styles["TableCellBold"]), Paragraph("Sky Blue", styles["TableCellCenter"]), Paragraph("The student is expected to perform well. Maintain current study routine and assignment consistency.", styles["TableCell"])],
        [Paragraph("50% – 69%", styles["TableCellBold"]), Paragraph("<b>Average</b>", styles["TableCellBold"]), Paragraph("Amber / Orange", styles["TableCellCenter"]), Paragraph("The student is performing at an average level. Recommend increasing study hours and classroom engagement.", styles["TableCell"])],
        [Paragraph("Below 50%", styles["TableCellBold"]), Paragraph("<b>Needs Improvement</b>", styles["TableCellBold"]), Paragraph("Rose / Crimson", styles["TableCellCenter"]), Paragraph("High academic risk! Immediate mentoring intervention and remedial tutoring recommended.", styles["TableCell"])],
    ]
    t_band = Table(t7_rows, colWidths=[75, 95, 85, 240])
    t_band.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_band)
    story.append(Paragraph("<b>Table 7:</b> Performance Categorization Bands, Visual Badges, and Actionable Institutional Feedback.", styles["DocCaption"]))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 7: TESTING & QUALITY ASSURANCE
    # ==================================================================
    story.append(Paragraph("CHAPTER 7: TESTING & QUALITY ASSURANCE", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("7.1 Test Strategy & Automated Test Suite", styles["DocSectionTitle"]))
    c7_strat = (
        "A rigorous, automated quality assurance strategy was implemented via an isolated test runner (<code>backend/test_validation.py</code>). "
        "The suite executes <b>32 dedicated test cases</b> verifying HTTP status codes, boundary edge cases, malicious string handling, "
        "and payload serialization. All 32 automated test cases pass with a 100% success rate."
    )
    story.append(Paragraph(c7_strat, styles["DocBody"]))

    story.append(Paragraph("7.2 Boundary Value Analysis & Edge Case Testing", styles["DocSectionTitle"]))
    story.append(Paragraph("Table 8 summarizes the automated test matrix and validation outcomes across representative test categories.", styles["DocBody"]))

    # Table 8: Test Cases
    t8_rows = [
        [Paragraph("<b>Test ID</b>", styles["TableHeader"]), Paragraph("<b>Test Category</b>", styles["TableHeader"]), Paragraph("<b>Input Vector / Payload Sample</b>", styles["TableHeader"]), Paragraph("<b>Expected</b>", styles["TableHeader"]), Paragraph("<b>Actual Status</b>", styles["TableHeader"])],
        [Paragraph("TC-01", styles["TableCellCenter"]), Paragraph("Baseline Valid", styles["TableCellBold"]), Paragraph("study=6, att=85, prev=78, assign=82, sleep=7", styles["TableCell"]), Paragraph("HTTP 200", styles["TableCellCenter"]), Paragraph("<b>PASS (200 OK)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-02", styles["TableCellCenter"]), Paragraph("Min Boundary", styles["TableCell"]), Paragraph("study=1.0 (min permissible limit)", styles["TableCell"]), Paragraph("HTTP 200", styles["TableCellCenter"]), Paragraph("<b>PASS (200 OK)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-03", styles["TableCellCenter"]), Paragraph("Max Boundary", styles["TableCell"]), Paragraph("study=24.0 (max permissible limit)", styles["TableCell"]), Paragraph("HTTP 200", styles["TableCellCenter"]), Paragraph("<b>PASS (200 OK)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-04", styles["TableCellCenter"]), Paragraph("Min Attendance", styles["TableCell"]), Paragraph("attendance=0.0 (extreme minimum)", styles["TableCell"]), Paragraph("HTTP 200", styles["TableCellCenter"]), Paragraph("<b>PASS (200 OK)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-05", styles["TableCellCenter"]), Paragraph("Max Attendance", styles["TableCell"]), Paragraph("attendance=100.0 (perfect attendance)", styles["TableCell"]), Paragraph("HTTP 200", styles["TableCellCenter"]), Paragraph("<b>PASS (200 OK)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-06", styles["TableCellCenter"]), Paragraph("Below Min Out-of-Bounds", styles["TableCellBold"]), Paragraph("study_hours = 0.0 (< 1.0 threshold)", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-07", styles["TableCellCenter"]), Paragraph("Above Max Out-of-Bounds", styles["TableCellBold"]), Paragraph("attendance = 101.0 (> 100.0 threshold)", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-08", styles["TableCellCenter"]), Paragraph("Boolean Type Poisoning", styles["TableCellBold"]), Paragraph("study_hours = True (Implicit int test)", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-09", styles["TableCellCenter"]), Paragraph("Empty String Payload", styles["TableCell"]), Paragraph("previous_score = \"\" (Empty text)", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-10", styles["TableCellCenter"]), Paragraph("XSS Injection Vector", styles["TableCellBold"]), Paragraph("study_hours = \"<script>alert(1)</script>\"", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-11", styles["TableCellCenter"]), Paragraph("SQL Injection Vector", styles["TableCellBold"]), Paragraph("attendance = \"' OR 1=1 --\"", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-12", styles["TableCellCenter"]), Paragraph("IEEE Floating NaN", styles["TableCellBold"]), Paragraph("previous_score = \"NaN\" (Not-a-Number)", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-13", styles["TableCellCenter"]), Paragraph("IEEE Floating Infinity", styles["TableCellBold"]), Paragraph("assignment_score = \"Infinity\"", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
        [Paragraph("TC-14", styles["TableCellCenter"]), Paragraph("Malformed JSON Body", styles["TableCell"]), Paragraph("Raw binary / plain text string payload", styles["TableCell"]), Paragraph("HTTP 400", styles["TableCellCenter"]), Paragraph("<b>PASS (400 Rejected)</b>", styles["TableCellCenter"])],
    ]
    t_test = Table(t8_rows, colWidths=[45, 110, 185, 65, 90])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_test)
    story.append(Paragraph("<b>Table 8:</b> Representative Automated Validation Test Matrix and Verification Outcomes.", styles["DocCaption"]))

    story.append(Paragraph("7.3 Security & Malicious Input Sanitization", styles["DocSectionTitle"]))
    c7_sec = (
        "In production deployments, machine learning APIs are frequent targets for injection attacks. "
        "As proven in Table 8, the defensive validation pipeline parses and type-checks every value before array conversion, "
        "ensuring malicious payloads cannot trigger server crashes, memory overflows, or code execution vulnerabilities."
    )
    story.append(Paragraph(c7_sec, styles["DocBody"]))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 8: RESULTS & SYSTEM SCREEN CAPTURES
    # ==================================================================
    story.append(Paragraph("CHAPTER 8: RESULTS & SYSTEM SCREEN CAPTURES", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("8.1 Graphical User Interface Walkthrough", styles["DocSectionTitle"]))
    story.append(Paragraph(
        "This chapter showcases the complete graphical user interface of the <b>Student Performance Prediction System</b>. "
        "High-resolution screen captures illustrate each interactive state, responsive view, and predictive outcome.", styles["DocBody"]
    ))

    # Figure 1: Hero & Navigation
    fig1_path = os.path.join(screenshots_dir, "01_hero_and_navigation.jpg")
    story.append(build_image_figure(fig1_path, "<b>Figure 1:</b> Landing Page Hero Section, Navigation Bar, and Academic Trust Metrics.", styles))
    story.append(Paragraph("<i>Observation:</i> The landing page presents a clear institutional header, navigation links (Home, Predict, How It Works, Model Specs), and key statistics communicating system credibility.", styles["DocCallout"]))
    story.append(Spacer(1, 10))

    # Figure 2: Project Statistics
    fig2_path = os.path.join(screenshots_dir, "02_project_statistics.jpg")
    story.append(build_image_figure(fig2_path, "<b>Figure 2:</b> Key Project Metrics: 1,000 Dataset Records, 5 Academic Features, and Trained Model.", styles))
    story.append(Paragraph("<i>Observation:</i> Key statistical cards summarize dataset volume, input dimensions, and verified model availability for real-time inference.", styles["DocCallout"]))
    story.append(PageBreak())

    # Figure 3: Prediction Form Idle
    fig3_path = os.path.join(screenshots_dir, "03_prediction_form_idle.jpg")
    story.append(build_image_figure(fig3_path, "<b>Figure 3:</b> Interactive Student Profile Input Form and Preset Selectors (Default State).", styles))
    story.append(Paragraph("<i>Observation:</i> The prediction section provides clear numerical input fields, helper text indicating permissible bounds, quick-select profile presets, and an idle result placeholder.", styles["DocCallout"]))
    story.append(Spacer(1, 10))

    # Figure 4: Prediction Result Good (74%)
    fig4_path = os.path.join(screenshots_dir, "04_prediction_result_good_74.jpg")
    story.append(build_image_figure(fig4_path, "<b>Figure 4:</b> Model Prediction Output for Consistent Student Profile (74% Good Performance).", styles))
    story.append(Paragraph("<i>Observation:</i> A student with balanced metrics (5.5 hrs study, 80% attendance) achieves an estimated score of 74%, generating a 'Good' performance badge and positive counseling guidance.", styles["DocCallout"]))
    story.append(PageBreak())

    # Figure 5: Prediction Result Excellent (89%)
    fig5_path = os.path.join(screenshots_dir, "05_prediction_result_excellent_89.jpg")
    story.append(build_image_figure(fig5_path, "<b>Figure 5:</b> Model Prediction Output for High-Performing Student Profile (89% Excellent).", styles))
    story.append(Paragraph("<i>Observation:</i> High study dedication (8.5 hrs study, 95% attendance, 90 previous score) results in an 89% prediction, activating the Emerald Green 'Excellent' performance badge.", styles["DocCallout"]))
    story.append(Spacer(1, 10))

    # Figure 6: Prediction Result Needs Improvement (43%)
    fig6_path = os.path.join(screenshots_dir, "06_prediction_result_needs_improvement_43.jpg")
    story.append(build_image_figure(fig6_path, "<b>Figure 6:</b> Model Prediction Output for At-Risk Student Profile (43% Needs Improvement).", styles))
    story.append(Paragraph("<i>Observation:</i> Deficient attendance (50%) and low study hours (2.0 hrs) yields a 43% score, activating the Rose Red 'Needs Improvement' alert banner recommending immediate academic tutoring.", styles["DocCallout"]))
    story.append(PageBreak())

    # Figure 7: Input Validation Errors
    fig7_path = os.path.join(screenshots_dir, "07_input_validation_errors.jpg")
    story.append(build_image_figure(fig7_path, "<b>Figure 7:</b> Client-Side and Server-Side Input Validation & Error Handling Banners.", styles))
    story.append(Paragraph("<i>Observation:</i> Submitting out-of-bounds numbers or empty fields triggers immediate visual feedback, highlighting erroneous inputs and preventing corrupted payload transmission.", styles["DocCallout"]))
    story.append(Spacer(1, 10))

    # Figure 8: How It Works Workflow
    fig8_path = os.path.join(screenshots_dir, "08_how_it_works_workflow.jpg")
    story.append(build_image_figure(fig8_path, "<b>Figure 8:</b> 4-Step Machine Learning Pipeline and Inference Flowchart.", styles))
    story.append(Paragraph("<i>Observation:</i> The visual workflow educates non-technical faculty on the 4 stages: Data Ingestion → Feature Standardization → Model Inference → Pedagogical Feedback.", styles["DocCallout"]))
    story.append(PageBreak())

    # Figure 9: Model Specs & Architecture
    fig9_path = os.path.join(screenshots_dir, "09_model_and_system_architecture.jpg")
    story.append(build_image_figure(fig9_path, "<b>Figure 9:</b> Technical Model Specifications and Full-Stack Cloud Architecture.", styles))
    story.append(Paragraph("<i>Observation:</i> The technical specification section details algorithm type, evaluation metrics ($R^2 = 0.9685, \\text{MAE} = 1.86$), and decoupling between the React client and Flask WSGI backend.", styles["DocCallout"]))
    story.append(Spacer(1, 10))

    # Figure 10: Footer & Branding
    fig10_path = os.path.join(screenshots_dir, "10_footer_and_branding.jpg")
    story.append(build_image_figure(fig10_path, "<b>Figure 10:</b> Application Footer and Technology Stack Badges.", styles))
    story.append(Paragraph("<i>Observation:</i> The footer provides academic credits, open-source technology badges, and navigational anchors.", styles["DocCallout"]))
    story.append(PageBreak())

    # Figure 11: Mobile Responsive View
    fig11_path = os.path.join(screenshots_dir, "11_mobile_responsive_view.jpg")
    story.append(Paragraph("8.2 Mobile Viewport Usability", styles["DocSectionTitle"]))
    story.append(Paragraph("To ensure instructors and students can access predictions via handheld devices, the layout dynamically adapts to mobile screens ($390 \\times 844$ viewport).", styles["DocBody"]))
    story.append(build_image_figure(fig11_path, "<b>Figure 11:</b> Mobile Responsive Viewport Layout (390 x 844 Mobile Device Profile).", styles, width=220, height=305))
    story.append(Paragraph("<i>Observation:</i> Form elements, buttons, and score visualizers stack vertically without horizontal clipping or button distortion.", styles["DocCallout"]))
    story.append(PageBreak())

    # ==================================================================
    # CHAPTER 9: CONCLUSION & FUTURE SCOPE
    # ==================================================================
    story.append(Paragraph("CHAPTER 9: CONCLUSION & FUTURE SCOPE", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=12))

    story.append(Paragraph("9.1 Summary of Contributions", styles["DocSectionTitle"]))
    c9_sum = (
        "This college mini-project successfully engineered, evaluated, and documented a complete, high-performance "
        "<b>Student Performance Prediction System</b>. Key project milestones achieved include:<br/>"
        "• <b>High Algorithmic Accuracy:</b> The Multiple Linear Regression engine attained an $R^2$ score of <b>0.9685</b> "
        "and an MAE of <b>1.86 marks</b> across 200 holdout test students, demonstrating high predictive reliability.<br/>"
        "• <b>Robust Defensive Backend:</b> The Python Flask microservice was engineered with 32 automated validation rules, "
        "guaranteeing sanitization against out-of-bounds values, NaNs, infinities, XSS injections, and SQL injection strings.<br/>"
        "• <b>Modern Decoupled Interface:</b> Built with React 19, TypeScript, and Tailwind CSS, the responsive web application "
        "features interactive presets, dynamic score visualizers, and categorized diagnostic feedback.<br/>"
        "• <b>Comprehensive Documentation:</b> All dataset attributes, feature weights, architectural diagrams, and test suites "
        "have been thoroughly evaluated and documented for academic review."
    )
    story.append(Paragraph(c9_sum, styles["DocBody"]))

    story.append(Paragraph("9.2 Practical Educational Implications", styles["DocSectionTitle"]))
    c9_imp = (
        "The system transitions academic mentoring from retrospective evaluation to prospective intervention. "
        "By identifying struggling students weeks before summative examinations, academic counselors can organize targeted remedial classes. "
        "Furthermore, by providing students with self-evaluation presets, the platform fosters self-regulation by demonstrating the "
        "tangible grade benefits of marginal study improvements."
    )
    story.append(Paragraph(c9_imp, styles["DocBody"]))

    story.append(Paragraph("9.3 Limitations of the Prototype", styles["DocSectionTitle"]))
    c9_lim = (
        "While highly effective, the current prototype possesses specific constraints:<br/>"
        "• <i>Linear Assumption:</i> The linear model assumes additive feature interactions and may not fully capture non-linear thresholds.<br/>"
        "• <i>Static Data Scope:</i> The dataset captures five quantitative variables and omits qualitative social or course difficulty factors.<br/>"
        "• <i>Absence of Longitudinal Tracking:</i> Predictions are cross-sectional; historical time-series performance trends are not tracked across semesters."
    )
    story.append(Paragraph(c9_lim, styles["DocBody"]))

    story.append(Paragraph("9.4 Future Work & Potential Enhancements", styles["DocSectionTitle"]))
    c9_fut = (
        "Future iterations of the platform can build upon this architecture in several promising directions:<br/>"
        "1. <b>Integration with Institutional LMS:</b> Connect via LTI/REST APIs to Canvas, Moodle, or Google Classroom for automated attendance and assignment sync.<br/>"
        "2. <b>Longitudinal Deep Learning Models:</b> Employ Recurrent Neural Networks (RNNs) or LSTMs to track multi-semester academic momentum over time.<br/>"
        "3. <b>Multi-Class Risk Stratification:</b> Augment continuous regression with categorical risk classification (e.g., Dropout Risk probability estimates).<br/>"
        "4. <b>Automated Mentoring Notifications:</b> Implement automated email alerts alerting faculty advisors when student trajectories dip below critical thresholds."
    )
    story.append(Paragraph(c9_fut, styles["DocBody"]))
    story.append(PageBreak())

    # ==================================================================
    # REFERENCES & BIBLIOGRAPHY
    # ==================================================================
    story.append(Paragraph("REFERENCES & ACADEMIC BIBLIOGRAPHY", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    refs = [
        "1. Romero, C., & Ventura, S. (2010). Educational data mining: a review of the state of the art. <i>IEEE Transactions on Systems, Man, and Cybernetics, Part C (Applications and Reviews)</i>, 40(6), 601-618.",
        "2. Hastie, T., Tibshirani, R., & Friedman, J. (2009). <i>The Elements of Statistical Learning: Data Mining, Inference, and Prediction</i>. Springer Science & Business Media.",
        "3. Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., ... & Duchesnay, É. (2011). Scikit-learn: Machine learning in Python. <i>Journal of Machine Learning Research</i>, 12, 2825-2830.",
        "4. Baker, R. S., & Inventado, P. S. (2014). Educational data mining and learning analytics. In <i>Learning Analytics</i> (pp. 61-75). Springer, New York, NY.",
        "5. Cortez, P., & Silva, A. M. G. (2008). Using data mining to predict secondary school student performance. In <i>Proceedings of 5th Annual Future Business Technology Conference</i> (pp. 5-12).",
        "6. McKinney, W. (2010). Data structures for statistical computing in Python. In <i>Proceedings of the 9th Python in Science Conference</i> (Vol. 445, pp. 51-56).",
        "7. Grinberg, M. (2018). <i>Flask Web Development: Developing Web Applications with Python</i>. O'Reilly Media, Inc.",
        "8. Banks, F., & Porcello, E. (2020). <i>Learning React: Modern Patterns for Developing React Apps</i>. O'Reilly Media, Inc.",
        "9. Wold, S., Sjöström, M., & Eriksson, L. (2001). PLS-regression: a basic tool of chemometrics. <i>Chemometrics and Intelligent Laboratory Systems</i>, 58(2), 109-130.",
        "10. Scikit-learn Developers. (2024). <i>Linear Models: Ordinary Least Squares Documentation</i>. https://scikit-learn.org/stable/modules/linear_model.html"
    ]
    for ref in refs:
        story.append(Paragraph(ref, styles["DocBullet"]))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 20))
    story.append(PageBreak())

    # ==================================================================
    # APPENDIX: CODE LISTINGS
    # ==================================================================
    story.append(Paragraph("APPENDIX: CORE SOURCE CODE LISTINGS", styles["DocChapterTitle"]))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#1E3A8A"), spaceAfter=15))

    story.append(Paragraph("Appendix A: Model Training & Evaluation Script (<code>train_model.py</code>)", styles["DocSectionTitle"]))
    
    code_train = (
        "# train_model.py - Multiple Linear Regression Training Script\n"
        "import os, joblib\n"
        "import pandas as pd\n"
        "from sklearn.model_selection import train_test_split\n"
        "from sklearn.linear_model import LinearRegression\n"
        "from sklearn.metrics import mean_absolute_error, r2_score\n\n"
        "# 1. Load Dataset\n"
        "df = pd.read_csv('data/student_performance.csv')\n"
        "features = ['study_hours', 'attendance', 'previous_score', 'assignment_score', 'sleep_hours']\n"
        "X = df[features]\n"
        "y = df['final_score']\n\n"
        "# 2. 80/20 Train-Test Split\n"
        "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\n\n"
        "# 3. Fit OLS Linear Regression\n"
        "model = LinearRegression()\n"
        "model.fit(X_train, y_train)\n\n"
        "# 4. Evaluate Metrics\n"
        "y_pred = model.predict(X_test)\n"
        "mae = mean_absolute_error(y_test, y_pred)  # 1.86 marks\n"
        "r2 = r2_score(y_test, y_pred)              # 0.9685 (96.8% variance)\n\n"
        "# 5. Save Serialized Artifact\n"
        "joblib.dump(model, 'models/student_performance_model.pkl')"
    )
    story.append(build_code_box(code_train, styles))
    story.append(Spacer(1, 15))

    story.append(Paragraph("Appendix B: Flask Defensive Validation Core (<code>backend/app.py</code>)", styles["DocSectionTitle"]))

    code_app = (
        "# backend/app.py - Defensive Input Validation Pipeline\n"
        "for canonical_name, spec in FIELD_VALIDATION_RULES.items():\n"
        "    val = raw_data.get(canonical_name)\n"
        "    if val is None or isinstance(val, bool) or val == '':\n"
        "        return jsonify({'error': f\"{spec['label']} must be a valid number.\"}), 400\n"
        "    try:\n"
        "        numeric_val = float(val)\n"
        "    except (ValueError, TypeError):\n"
        "        return jsonify({'error': f\"{spec['label']} must be a valid number.\"}), 400\n"
        "    if math.isnan(numeric_val) or math.isinf(numeric_val):\n"
        "        return jsonify({'error': f\"{spec['label']} cannot be NaN or Infinite.\"}), 400\n"
        "    if not (spec['min'] <= numeric_val <= spec['max']):\n"
        "        return jsonify({'error': f\"{spec['label']} must be between {spec['min']} and {spec['max']}.\"}), 400\n"
        "    validated_features[canonical_name] = numeric_val\n\n"
        "# Inference & Category Mapping\n"
        "raw_pred = float(model.predict(pd.DataFrame([validated_features]))[0])\n"
        "predicted_score = int(round(max(0.0, min(100.0, raw_pred))))"
    )
    story.append(build_code_box(code_app, styles))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] Successfully generated {output_filename} ({os.path.getsize(output_filename)} bytes)")
    return output_filename


if __name__ == "__main__":
    generate_report()
