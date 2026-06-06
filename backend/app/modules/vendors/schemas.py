from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, EmailStr

from app.shared.enums import VendorStatus


class VendorCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: Optional[str] = None
    gst_number: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = "India"
    status: VendorStatus = VendorStatus.ACTIVE
    rating: Optional[float] = Field(None, ge=0, le=5)


class VendorUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = None
    gst_number: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    status: Optional[VendorStatus] = None
    rating: Optional[float] = Field(None, ge=0, le=5)


class VendorResponse(BaseModel):
    id: UUID
    vendor_code: str
    name: str
    category: Optional[str] = None
    gst_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    status: VendorStatus
    rating: Optional[float] = None
    is_active: bool
    created_on: datetime
    updated_on: datetime

    class Config:
        from_attributes = True
