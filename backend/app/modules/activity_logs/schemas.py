from pydantic import BaseModel
from typing import Optional, Any, Dict
from uuid import UUID
from datetime import datetime

class ActivityLogBase(BaseModel):
    entity_type: str
    entity_id: UUID
    action: str
    performed_by: Optional[UUID] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None

class ActivityLogResponse(ActivityLogBase):
    id: UUID
    created_on: datetime

    class Config:
        from_attributes = True
