import os
import zipfile
import datetime
from xml.sax.saxutils import escape

REPORT_NAME = "VitaCare_Technical_Report.docx"
REPORT_PATH = os.path.join(r"h:\\ITGP_700", REPORT_NAME)

content = [
    {"text": "VitaCare Application Technical Report", "style": "Title", "align": "center"},
    {"text": ""},
    {"text": "Introduction", "style": "Heading1"},
    {"text": "VitaCare is a cross-platform medical management suite that pairs a Kivy/KivyMD desktop client with a Django REST backend to streamline digital healthcare workflows."},
    {"text": ""},
    {"text": "Architecture Overview", "style": "Heading1"},
    {"text": "- Kivy/KivyMD desktop client orchestrates multi-screen navigation through a centralized ScreenManager and preloaded KV layouts."},
    {"text": "- Django REST backend is segmented into domain apps (users, appointments, consultations, prescriptions, medical) that expose JSON APIs secured with JWT."},
    {"text": "- A reusable REST contract allows additional clients such as the bundled Flask web frontend to authenticate and consume the same endpoints."},
    {"text": "- SQLite underpins the development environment, with CORS and ALLOWED_HOSTS configured for local iteration."},
    {"text": ""},
    {"text": "Functional Capabilities", "style": "Heading1"},
    {"text": "- User authentication for patients and doctors, including registration, password reset, and role-aware dashboards."},
    {"text": "- Appointment lifecycle management: booking with schedule validation, viewing upcoming visits, and completion workflows for clinicians."},
    {"text": "- Consultation and prescription logging so clinicians can record visit summaries and issue digital medication orders."},
    {"text": "- Embedded chat and optional video call flow to support telehealth interactions."},
    {"text": ""},
    {"text": "Frontend–Backend Interaction Flow", "style": "Heading1"},
    {"text": "1. Users authenticate from the Kivy client or Flask web portal; credentials are validated by Django, which returns JWT access and refresh tokens."},
    {"text": "2. The client caches tokens on the ScreenManager/session and injects them into Authorization headers for protected operations such as booking, prescriptions, and records retrieval."},
    {"text": "3. Appointment booking first verifies payment through Stripe, then posts scheduling requests to /api/appointments/book/, where the backend enforces availability rules."},
    {"text": "4. Real-time conversations poll Firebase Realtime Database for updates while posting outbound messages to the appointment-specific path."},
    {"text": ""},
    {"text": "Integrations and External Services", "style": "Heading1"},
    {"text": "- Stripe processes appointment payments before the platform commits bookings."},
    {"text": "- Firebase Realtime Database stores chat transcripts and enables lightweight message polling without burdening the Django stack."},
    {"text": ""},
    {"text": "Security and Configuration Notes", "style": "Heading1"},
    {"text": "- JWT authentication (via Simple JWT) secures protected APIs, with role checks ensuring patients and doctors see only authorized data."},
    {"text": "- Doctor passwords are stored hashed, while password reset codes expire rapidly to reduce attack windows."},
    {"text": "- Logout routines clear tokens, cached credentials, and disable back navigation to protect session data on shared devices."},
    {"text": "- Development settings enable broad CORS and debug logging; hardening for production would constrain hosts and move secrets to environment variables."},
    {"text": ""},
    {"text": "Role Contributions", "style": "Heading1"},
    {"text": "Backend Team – Implemented Django REST endpoints for authentication, scheduling, consultations, prescriptions, and medical record retrieval, encapsulating core business logic."},
    {"text": "Frontend Team – Built the Kivy/KivyMD desktop flows and Flask fallback UI, handling validation, navigation, and data presentation for both patient and doctor personas."},
    {"text": "Integration & Middleware Team – Connected UI interactions with backend services, coordinated Stripe payment flow, and wired Firebase polling for chat synchronization."},
    {"text": "Security Team – Enforced authentication/authorization, hashed credential storage, validation rules, and logout hygiene across clients and APIs."},
    {"text": "DevOps Team – Supplied environment bootstrap scripts, virtual environment guidance, and launch utilities that streamline local development and testing."},
    {"text": "UI Design Team – Produced KV layouts, Material styling, dialogs, and responsive components such as the message bubble design to maintain a consistent visual language."},
    {"text": "Database Team – Shaped the data models for users, doctors, appointments, prescriptions, and consultations, ensuring relational integrity and serializer-friendly structures."},
    {"text": ""},
    {"text": f"Prepared by Cascade AI — {datetime.date.today().isoformat()}"}
]


def paragraph_xml(item):
    text = item.get("text", "")
    style = item.get("style")
    align = item.get("align")

    if not text:
        return "<w:p/>"

    parts = ["<w:p>"]

    ppr_elements = []
    if style:
        ppr_elements.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        ppr_elements.append(f'<w:jc w:val="{align}"/>')
    if ppr_elements:
        parts.append('<w:pPr>' + ''.join(ppr_elements) + '</w:pPr>')

    escaped_text = escape(text)
    parts.append(f'<w:r><w:t xml:space="preserve">{escaped_text}</w:t></w:r>')
    parts.append('</w:p>')
    return ''.join(parts)


def build_document_xml(paragraphs):
    body = ''.join(paragraph_xml(item) for item in paragraphs)
    sect_pr = (
        '<w:sectPr>'
        '<w:pgSz w:w="12240" w:h="15840"/>'
        '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>'
        '<w:cols w:num="1"/>'
        '<w:docGrid w:linePitch="360"/>'
        '</w:sectPr>'
    )
    if not body.endswith(sect_pr):
        body += sect_pr

    document_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document '
        'xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" '
        'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" '
        'xmlns:o="urn:schemas-microsoft-com:office:office" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
        'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" '
        'xmlns:v="urn:schemas-microsoft-com:vml" '
        'xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" '
        'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
        'xmlns:w10="urn:schemas-microsoft-com:office:word" '
        'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" '
        'xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" '
        'xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" '
        'xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" '
        'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" '
        'mc:Ignorable="w14 wp14">'
        f'<w:body>{body}</w:body>'
        '</w:document>'
    )
    return document_xml


def build_core_properties(title):
    timestamp = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<cp:coreProperties '
        'xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/" '
        'xmlns:dcterms="http://purl.org/dc/terms/" '
        'xmlns:dcmitype="http://purl.org/dc/dcmitype/" '
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        f'<dc:title>{escape(title)}</dc:title>'
        '<dc:creator>Cascade AI</dc:creator>'
        '<cp:lastModifiedBy>Cascade AI</cp:lastModifiedBy>'
        f'<dcterms:created xsi:type="dcterms:W3CDTF">{timestamp}</dcterms:created>'
        f'<dcterms:modified xsi:type="dcterms:W3CDTF">{timestamp}</dcterms:modified>'
        '</cp:coreProperties>'
    )


def build_app_properties():
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
        'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
        '<Application>Microsoft Word</Application>'
        '</Properties>'
    )


def build_content_types():
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
        '</Types>'
    )


def build_root_rels():
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
        '</Relationships>'
    )


def create_report():
    document_xml = build_document_xml(content)
    core_xml = build_core_properties("VitaCare Application Technical Report")
    app_xml = build_app_properties()
    content_types_xml = build_content_types()
    root_rels_xml = build_root_rels()

    with zipfile.ZipFile(REPORT_PATH, "w") as docx:
        docx.writestr("[Content_Types].xml", content_types_xml)
        docx.writestr("_rels/.rels", root_rels_xml)
        docx.writestr("docProps/core.xml", core_xml)
        docx.writestr("docProps/app.xml", app_xml)
        docx.writestr("word/document.xml", document_xml)

    print(f"Created {REPORT_PATH}")


if __name__ == "__main__":
    create_report()
