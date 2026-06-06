from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.shared.enums import ApprovalStatus


class ApprovalCreateRequest(BaseModel):
    quotation_id: UUID
    approver_id: UUID


class ApprovalDecideRequest(BaseModel):
    status: ApprovalStatus
    remarks: Optional[str] = None


class ApprovalResponse(BaseModel):
    id: UUID
    quotation_id: UUID
    requested_by: UUID
    approver_id: UUID
    status: ApprovalStatus
    remarks: Optional[str] = None
    decided_at: Optional[datetime] = None
    is_active: bool
    created_on: datetime
    updated_on: datetime

    class Config:
        from_attributes = True
