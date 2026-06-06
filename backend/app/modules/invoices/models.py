from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import BaseEntity
from app.shared.enums import InvoiceStatus


class Invoice(BaseEntity):
    __tablename__ = "invoices"

    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    po_id = Column(UUID(as_uuid=True), ForeignKey("purchase_orders.id"), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"), nullable=True)
    subtotal = Column(Float, nullable=False, default=0.0)
    tax_rate = Column(Float, nullable=False, default=18.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    grand_total = Column(Float, nullable=False, default=0.0)
    status = Column(
        SAEnum(InvoiceStatus, name="invoice_status_enum", create_constraint=False, native_enum=False),
        nullable=False,
        default=InvoiceStatus.DRAFT,
    )
    issued_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
