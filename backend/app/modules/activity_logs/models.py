from sqlalchemy import Column, String, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import BaseEntity

class ActivityLog(BaseEntity):
    __tablename__ = "activity_logs"

    entity_type = Column(String, index=True)
    entity_id = Column(UUID(as_uuid=True), index=True)
    action = Column(String)
    performed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
