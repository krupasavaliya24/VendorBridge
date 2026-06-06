from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import BaseEntity
from app.shared.enums import QuotationStatus


class Quotation(BaseEntity):
    __tablename__ = "quotations"

    quotation_number = Column(String(50), unique=True, nullable=False, index=True)
    rfq_id = Column(UUID(as_uuid=True), ForeignKey("rfqs.id"), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False)
    total_amount = Column(Float, nullable=False, default=0.0)
    delivery_days = Column(Integer, nullable=True, default=0)
    notes = Column(Text, nullable=True)
    status = Column(
        SAEnum(QuotationStatus, name="quotation_status_enum", create_constraint=False, native_enum=False),
        nullable=False,
        default=QuotationStatus.SUBMITTED,
    )
    vendor_score = Column(Float, nullable=True, default=0.0)

    # Relationships
    items = relationship("QuotationItem", back_populates="quotation", lazy="joined")


class QuotationItem(BaseEntity):
    __tablename__ = "quotation_items"

    quotation_id = Column(UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=False)
    rfq_item_id = Column(UUID(as_uuid=True), ForeignKey("rfq_items.id"), nullable=True)
    item_name = Column(String(255), nullable=True)
    quantity = Column(Float, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)
    total_price = Column(Float, nullable=False, default=0.0)

    # Relationships
    quotation = relationship("Quotation", back_populates="items")
