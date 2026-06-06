from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.shared.enums import InvoiceStatus


class InvoiceResponse(BaseModel):
    id: UUID
    invoice_number: str
    po_id: UUID
    vendor_id: Optional[UUID] = None
    subtotal: float
    tax_rate: float
    tax_amount: float
    grand_total: float
    status: InvoiceStatus
    issued_at: Optional[datetime] = None
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    is_active: bool
    created_by: Optional[UUID] = None
    created_on: datetime
    updated_on: datetime

    class Config:
        from_attributes = True


class InvoiceSendEmailRequest(BaseModel):
    recipient_email: str
