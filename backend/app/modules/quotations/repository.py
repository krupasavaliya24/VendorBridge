from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session, Query

from app.modules.quotations.models import Quotation, QuotationItem
from app.shared.enums import QuotationStatus


class QuotationRepository:
    """Repository for Quotation database operations."""

    def __init__(self, db: Session):
        self.db = db

    def _base_query(self) -> Query:
        return self.db.query(Quotation).filter(Quotation.is_deleted == False)

    def get_by_id(self, quotation_id: UUID) -> Optional[Quotation]:
        return self._base_query().filter(Quotation.id == quotation_id).first()

    def get_by_number(self, quotation_number: str) -> Optional[Quotation]:
        return self._base_query().filter(Quotation.quotation_number == quotation_number).first()

    def get_by_rfq_id(self, rfq_id: UUID) -> List[Quotation]:
        return self._base_query().filter(Quotation.rfq_id == rfq_id).order_by(Quotation.vendor_score.desc()).all()

    def get_by_vendor_id(self, vendor_id: UUID) -> List[Quotation]:
        return self._base_query().filter(Quotation.vendor_id == vendor_id).all()

    def get_all(self, status: Optional[QuotationStatus] = None) -> Query:
        query = self._base_query()
        if status:
            query = query.filter(Quotation.status == status)
        return query.order_by(Quotation.created_on.desc())

    def create(self, quotation: Quotation) -> Quotation:
        self.db.add(quotation)
        self.db.commit()
        self.db.refresh(quotation)
        return quotation

    def update(self, quotation: Quotation) -> Quotation:
        self.db.commit()
        self.db.refresh(quotation)
        return quotation

    def count(self) -> int:
        return self._base_query().count()
