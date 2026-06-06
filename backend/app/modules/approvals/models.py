from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import BaseEntity
from app.shared.enums import ApprovalStatus


class ApprovalRequest(BaseEntity):
    __tablename__ = "approval_requests"

    quotation_id = Column(UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=False)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    approver_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(
        SAEnum(ApprovalStatus, name="approval_status_enum", create_constraint=False, native_enum=False),
        nullable=False,
        default=ApprovalStatus.PENDING,
    )
    remarks = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)
