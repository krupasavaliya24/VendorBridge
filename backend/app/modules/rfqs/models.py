import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey, Boolean, Integer, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import BaseEntity
from app.shared.enums import RFQStatus


class RFQ(BaseEntity):
    __tablename__ = "rfqs"

    rfq_number = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True)
    status = Column(
        SAEnum(RFQStatus, name="rfq_status_enum", create_constraint=False, native_enum=False),
        nullable=False,
        default=RFQStatus.DRAFT,
    )

    # Relationships
    items = relationship("RFQItem", back_populates="rfq", lazy="joined")
    vendors = relationship("RFQVendor", back_populates="rfq", lazy="joined")


class RFQItem(BaseEntity):
    __tablename__ = "rfq_items"

    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False)
    item_name = Column(String(255), nullable=False)
    specifications = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False, default=1)
    unit = Column(String(50), nullable=True, default="units")
    estimated_cost = Column(Float, nullable=True, default=0.0)

    # Relationships
    rfq = relationship("RFQ", back_populates="items")


class RFQVendor(BaseEntity):
    __tablename__ = "rfq_vendors"

    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False)
    invitation_sent = Column(Boolean, default=False)
    invited_at = Column(DateTime, nullable=True)

    # Relationships
    rfq = relationship("RFQ", back_populates="vendors")
