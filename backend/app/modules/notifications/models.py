from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import BaseEntity

class Notification(BaseEntity):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    title = Column(String)
    message = Column(String)
    type = Column(String)
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
