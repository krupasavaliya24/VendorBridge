from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field

from app.shared.enums import RFQStatus


class RFQItemCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=255)
    specifications: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit: Optional[str] = "units"
    estimated_cost: Optional[float] = Field(None, ge=0)


class RFQItemResponse(BaseModel):
    id: UUID
    rfq_id: UUID
    item_name: str
    specifications: Optional[str] = None
    quantity: float
    unit: Optional[str] = None
    estimated_cost: Optional[float] = None
    created_on: datetime

    class Config:
        from_attributes = True


class RFQVendorResponse(BaseModel):
    id: UUID
    rfq_id: UUID
    vendor_id: UUID
    invitation_sent: bool
    invited_at: Optional[datetime] = None
    created_on: datetime

    class Config:
        from_attributes = True


class RFQCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    items: List[RFQItemCreate] = Field(..., min_length=1)
    vendor_ids: List[UUID] = Field(default_factory=list)


class RFQUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[RFQStatus] = None


class RFQResponse(BaseModel):
    id: UUID
    rfq_number: str
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: RFQStatus
    created_by: Optional[UUID] = None
    is_active: bool
    created_on: datetime
    updated_on: datetime

    class Config:
        from_attributes = True


class RFQDetailResponse(BaseModel):
    id: UUID
    rfq_number: str
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    status: RFQStatus
    created_by: Optional[UUID] = None
    is_active: bool
    created_on: datetime
    updated_on: datetime
    items: List[RFQItemResponse] = []
    vendors: List[RFQVendorResponse] = []

    class Config:
        from_attributes = True
