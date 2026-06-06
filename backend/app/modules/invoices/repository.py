from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session, Query
from sqlalchemy import func

from app.modules.invoices.models import Invoice
from app.shared.enums import InvoiceStatus


class InvoiceRepository:
    """Repository for Invoice database operations."""

    def __init__(self, db: Session):
        self.db = db

    def _base_query(self) -> Query:
        return self.db.query(Invoice).filter(Invoice.is_deleted == False)

    def get_by_id(self, invoice_id: UUID) -> Optional[Invoice]:
        return self._base_query().filter(Invoice.id == invoice_id).first()

    def get_by_number(self, invoice_number: str) -> Optional[Invoice]:
        return self._base_query().filter(Invoice.invoice_number == invoice_number).first()

    def get_by_po_id(self, po_id: UUID) -> Optional[Invoice]:
        return self._base_query().filter(Invoice.po_id == po_id).first()

    def get_all(self, status: Optional[InvoiceStatus] = None) -> Query:
        query = self._base_query()
        if status:
            query = query.filter(Invoice.status == status)
        return query.order_by(Invoice.created_on.desc())

    def create(self, invoice: Invoice) -> Invoice:
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def update(self, invoice: Invoice) -> Invoice:
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def count(self) -> int:
        return self._base_query().count()

    def recent_count(self, days: int = 30) -> int:
        from datetime import datetime, timedelta
        cutoff = datetime.utcnow() - timedelta(days=days)
        return self._base_query().filter(Invoice.created_on >= cutoff).count()
