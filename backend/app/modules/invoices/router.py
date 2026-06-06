from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import io

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.invoices.schemas import InvoiceResponse, InvoiceSendEmailRequest
from app.modules.invoices.service import InvoiceService
from app.shared.enums import InvoiceStatus

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("")
def list_invoices(
    status: Optional[InvoiceStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = InvoiceService(db)
    result = service.list_invoices(status=status, page=page, page_size=page_size)
    result["items"] = [InvoiceResponse.model_validate(inv) for inv in result["items"]]
    return result


@router.post("/generate/{po_id}", response_model=InvoiceResponse, status_code=201)
def generate_invoice(
    po_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = InvoiceService(db)
    invoice = service.generate_invoice(po_id, current_user_id=current_user["id"])
    return InvoiceResponse.model_validate(invoice)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = InvoiceService(db)
    invoice = service.get_invoice(invoice_id)
    return InvoiceResponse.model_validate(invoice)


@router.get("/{invoice_id}/pdf")
def get_invoice_pdf(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = InvoiceService(db)
    pdf_bytes = service.generate_pdf(invoice_id)
    invoice = service.get_invoice(invoice_id)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={invoice.invoice_number}.pdf"},
    )


@router.post("/{invoice_id}/send-email")
def send_invoice_email(
    invoice_id: UUID,
    data: InvoiceSendEmailRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = InvoiceService(db)
    result = service.send_email(invoice_id, data.recipient_email, current_user_id=current_user["id"])
    return result


@router.put("/{invoice_id}/mark-paid", response_model=InvoiceResponse)
def mark_invoice_paid(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = InvoiceService(db)
    invoice = service.mark_paid(invoice_id, current_user_id=current_user["id"])
    return InvoiceResponse.model_validate(invoice)
