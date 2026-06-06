from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.shared.enums import POStatus


class POStatusUpdateRequest(BaseModel):
    status: POStatus


class PurchaseOrderResponse(BaseModel):
    id: UUID
    po_number: str
    quotation_id: UUID
    vendor_id: UUID
    subtotal: float
    tax_rate: float
    tax_amount: float
    grand_total: float
    status: POStatus
    issued_at: Optional[datetime] = None
    is_active: bool
    created_by: Optional[UUID] = None
    created_on: datetime
    updated_on: datetime

    class Config:
        from_attributes = True
