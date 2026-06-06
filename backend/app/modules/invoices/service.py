import io
import smtplib
from datetime import datetime, timedelta
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from uuid import UUID

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.modules.invoices.models import Invoice
from app.modules.invoices.repository import InvoiceRepository
from app.modules.purchase_orders.repository import PurchaseOrderRepository
from app.modules.vendors.repository import VendorRepository
from app.modules.settings.service import SettingsService
from app.shared.enums import InvoiceStatus
from app.shared.pagination import paginate
from app.shared.utils import generate_number, format_currency


class InvoiceService:
    """Business logic for invoice management."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = InvoiceRepository(db)

    def generate_invoice(self, po_id: UUID, current_user_id: UUID = None) -> Invoice:
        """Generate an invoice from a Purchase Order."""
        # Check if invoice already exists
        existing = self.repo.get_by_po_id(po_id)
        if existing:
            return existing

        po_repo = PurchaseOrderRepository(self.db)
        po = po_repo.get_by_id(po_id)
        if not po:
            raise NotFoundError("Purchase Order not found.")

        count = self.repo.count() + 1
        invoice_number = generate_number("INV", count)

        while self.repo.get_by_number(invoice_number):
            count += 1
            invoice_number = generate_number("INV", count)

        invoice = Invoice(
            invoice_number=invoice_number,
            po_id=po_id,
            vendor_id=po.vendor_id,
            subtotal=po.subtotal,
            tax_rate=po.tax_rate,
            tax_amount=po.tax_amount,
            grand_total=po.grand_total,
            status=InvoiceStatus.ISSUED,
            issued_at=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=30),
            created_by=current_user_id,
        )
        return self.repo.create(invoice)

    def get_invoice(self, invoice_id: UUID) -> Invoice:
        invoice = self.repo.get_by_id(invoice_id)
        if not invoice:
            raise NotFoundError("Invoice not found.")
        return invoice

    def list_invoices(
        self,
        status: Optional[InvoiceStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = self.repo.get_all(status=status)
        return paginate(query, page=page, page_size=page_size)

    def mark_paid(self, invoice_id: UUID, current_user_id: UUID = None) -> Invoice:
        invoice = self.get_invoice(invoice_id)
        invoice.status = InvoiceStatus.PAID
        invoice.paid_at = datetime.utcnow()
        invoice.updated_by = current_user_id
        return self.repo.update(invoice)

    def generate_pdf(self, invoice_id: UUID) -> bytes:
        """Generate a professional PDF for the invoice using ReportLab."""
        invoice = self.get_invoice(invoice_id)

        # Fetch vendor info
        vendor_repo = VendorRepository(self.db)
        vendor = vendor_repo.get_by_id(invoice.vendor_id) if invoice.vendor_id else None

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=30*mm, bottomMargin=30*mm, leftMargin=20*mm, rightMargin=20*mm)

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('InvoiceTitle', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#1a237e'), spaceAfter=6)
        header_style = ParagraphStyle('Header', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#616161'))
        normal_style = styles['Normal']

        elements = []

        # Company Header
        elements.append(Paragraph("VendorBridge ERP", title_style))
        elements.append(Paragraph("Procurement & Vendor Management System", header_style))
        elements.append(Spacer(1, 20))

        # Invoice Info
        elements.append(Paragraph(f"<b>INVOICE</b>", ParagraphStyle('InvLabel', parent=styles['Heading2'], fontSize=18, textColor=colors.HexColor('#333333'))))
        elements.append(Spacer(1, 10))

        info_data = [
            ["Invoice Number:", invoice.invoice_number, "Status:", invoice.status.value.upper()],
            ["Issue Date:", invoice.issued_at.strftime("%d %b %Y") if invoice.issued_at else "N/A", "Due Date:", invoice.due_date.strftime("%d %b %Y") if invoice.due_date else "N/A"],
        ]
        info_table = Table(info_data, colWidths=[100, 150, 80, 150])
        info_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#616161')),
            ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#616161')),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTNAME', (3, 0), (3, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 15))

        # Vendor Info
        if vendor:
            elements.append(Paragraph("<b>Bill To:</b>", normal_style))
            elements.append(Paragraph(f"{vendor.name}", ParagraphStyle('VendorName', parent=normal_style, fontSize=12, fontName='Helvetica-Bold')))
            if vendor.address:
                elements.append(Paragraph(f"{vendor.address}", normal_style))
            city_info = ", ".join(filter(None, [vendor.city, vendor.country]))
            if city_info:
                elements.append(Paragraph(city_info, normal_style))
            if vendor.gst_number:
                elements.append(Paragraph(f"GST: {vendor.gst_number}", normal_style))
            elements.append(Spacer(1, 15))

        # Financial Summary Table
        summary_data = [
            ["Description", "Amount"],
            ["Subtotal", format_currency(invoice.subtotal)],
            [f"Tax ({invoice.tax_rate}%)", format_currency(invoice.tax_amount)],
            ["Grand Total", format_currency(invoice.grand_total)],
        ]

        summary_table = Table(summary_data, colWidths=[350, 150])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e0e0e0')),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e8eaf6')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, -1), (-1, -1), 13),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 30))

        # Payment Info
        if invoice.paid_at:
            elements.append(Paragraph(f"<b>Payment Received:</b> {invoice.paid_at.strftime('%d %b %Y')}", ParagraphStyle('Paid', parent=normal_style, textColor=colors.HexColor('#2e7d32'))))
        else:
            elements.append(Paragraph("<b>Payment Terms:</b> Net 30 days from invoice date.", normal_style))

        elements.append(Spacer(1, 30))
        elements.append(Paragraph("Thank you for your business!", ParagraphStyle('Thanks', parent=normal_style, fontSize=12, textColor=colors.HexColor('#1a237e'), alignment=1)))

        doc.build(elements)
        return buffer.getvalue()

    def send_email(self, invoice_id: UUID, recipient_email: str) -> dict:
        """Send invoice PDF via email using SMTP settings from database."""
        invoice = self.get_invoice(invoice_id)

        # Get SMTP settings from database
        settings_service = SettingsService(self.db)
        smtp = settings_service.get_smtp_settings()

        if not smtp.get("smtp_host") or not smtp.get("smtp_from_email"):
            raise ValidationError("SMTP settings are not configured. Please configure them in Settings.")

        # Generate PDF
        pdf_bytes = self.generate_pdf(invoice_id)

        # Build email
        msg = MIMEMultipart()
        msg["From"] = f"{smtp.get('smtp_sender_name', 'VendorBridge')} <{smtp['smtp_from_email']}>"
        msg["To"] = recipient_email
        msg["Subject"] = f"Invoice {invoice.invoice_number} - VendorBridge"

        body = f"""
Dear Vendor,

Please find attached the invoice {invoice.invoice_number} for the amount of {format_currency(invoice.grand_total)}.

Due Date: {invoice.due_date.strftime('%d %b %Y') if invoice.due_date else 'N/A'}

Thank you for your business.

Best Regards,
VendorBridge ERP
        """
        msg.attach(MIMEText(body, "plain"))

        # Attach PDF
        pdf_attachment = MIMEApplication(pdf_bytes, _subtype="pdf")
        pdf_attachment.add_header("Content-Disposition", "attachment", filename=f"{invoice.invoice_number}.pdf")
        msg.attach(pdf_attachment)

        # Send email
        try:
            smtp_port = int(smtp.get("smtp_port", 587))
            use_tls = smtp.get("smtp_use_tls", "true").lower() == "true"

            if use_tls:
                server = smtplib.SMTP(smtp["smtp_host"], smtp_port)
                server.starttls()
            else:
                server = smtplib.SMTP(smtp["smtp_host"], smtp_port)

            if smtp.get("smtp_username") and smtp.get("smtp_password"):
                server.login(smtp["smtp_username"], smtp["smtp_password"])

            server.send_message(msg)
            server.quit()

            # Update invoice status
            invoice.status = InvoiceStatus.SENT
            self.db.commit()

            return {"message": f"Invoice {invoice.invoice_number} sent to {recipient_email} successfully."}
        except Exception as e:
            raise ValidationError(f"Failed to send email: {str(e)}")
