from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, Field


class SettingResponse(BaseModel):
    id: UUID
    key: str
    value: Optional[str] = None
    description: Optional[str] = None
    category: str
    created_on: datetime
    updated_on: datetime

    class Config:
        from_attributes = True


class SettingUpdateRequest(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None


class BulkSettingUpdateItem(BaseModel):
    key: str
    value: str


class BulkSettingUpdateRequest(BaseModel):
    settings: List[BulkSettingUpdateItem]


class SettingCreateRequest(BaseModel):
    key: str = Field(..., min_length=1, max_length=255)
    value: Optional[str] = None
    description: Optional[str] = None
    category: str = "general"
