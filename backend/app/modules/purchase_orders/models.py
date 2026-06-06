from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import BaseEntity
from app.shared.enums import POStatus


class PurchaseOrder(BaseEntity):
    __tablename__ = "purchase_orders"

    po_number = Column(String(50), unique=True, nullable=False, index=True)
    quotation_id = Column(UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=False)
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_rate = Column(Float, nullable=False, default=18.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    grand_total = Column(Float, nullable=False, default=0.0)
    status = Column(
        SAEnum(POStatus, name="po_status_enum", create_constraint=False, native_enum=False),
        nullable=False,
        default=POStatus.DRAFT,
    )
    issued_at = Column(DateTime, nullable=True)
