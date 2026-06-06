from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field

from app.shared.enums import QuotationStatus


class QuotationItemCreate(BaseModel):
    rfq_item_id: Optional[UUID] = None
    item_name: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)


class QuotationItemResponse(BaseModel):
    id: UUID
    quotation_id: UUID
    rfq_item_id: Optional[UUID] = None
    item_name: Optional[str] = None
    quantity: float
    unit_price: float
    total_price: float
    created_on: datetime

    class Config:
        from_attributes = True


class QuotationCreateRequest(BaseModel):
    rfq_id: UUID
    vendor_id: UUID
    delivery_days: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    items: List[QuotationItemCreate] = Field(..., min_length=1)


class QuotationResponse(BaseModel):
    id: UUID
    quotation_number: str
    rfq_id: UUID
    vendor_id: UUID
    total_amount: float
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    status: QuotationStatus
    vendor_score: Optional[float] = None
    is_active: bool
    created_on: datetime
    updated_on: datetime

    class Config:
        from_attributes = True


class QuotationDetailResponse(BaseModel):
    id: UUID
    quotation_number: str
    rfq_id: UUID
    vendor_id: UUID
    total_amount: float
    delivery_days: Optional[int] = None
    notes: Optional[str] = None
    status: QuotationStatus
    vendor_score: Optional[float] = None
    is_active: bool
    created_on: datetime
    updated_on: datetime
    items: List[QuotationItemResponse] = []

    class Config:
        from_attributes = True


class QuotationCompareResponse(BaseModel):
    rfq_id: UUID
    quotations: List[QuotationDetailResponse]
