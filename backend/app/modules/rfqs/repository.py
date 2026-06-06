from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session, Query

from app.modules.rfqs.models import RFQ, RFQItem, RFQVendor, RFQAttachment
from app.shared.enums import RFQStatus


class RFQRepository:
    """Repository for RFQ database operations."""

    def __init__(self, db: Session):
        self.db = db

    def _base_query(self) -> Query:
        return self.db.query(RFQ).filter(RFQ.is_deleted == False)

    def get_by_id(self, rfq_id: UUID) -> Optional[RFQ]:
        return self._base_query().filter(RFQ.id == rfq_id).first()

    def get_by_number(self, rfq_number: str) -> Optional[RFQ]:
        return self._base_query().filter(RFQ.rfq_number == rfq_number).first()

    def get_all(self, status: Optional[RFQStatus] = None, search: Optional[str] = None) -> Query:
        query = self._base_query()
        if status:
            query = query.filter(RFQ.status == status)
        if search:
            query = query.filter(RFQ.title.ilike(f"%{search}%"))
        return query.order_by(RFQ.created_on.desc())

    def create(self, rfq: RFQ) -> RFQ:
        self.db.add(rfq)
        self.db.commit()
        self.db.refresh(rfq)
        return rfq

    def update(self, rfq: RFQ) -> RFQ:
        self.db.commit()
        self.db.refresh(rfq)
        return rfq

    def count(self) -> int:
        return self._base_query().count()

    def add_item(self, item: RFQItem) -> RFQItem:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def add_vendor(self, rfq_vendor: RFQVendor) -> RFQVendor:
        self.db.add(rfq_vendor)
        self.db.commit()
        self.db.refresh(rfq_vendor)
        return rfq_vendor

    def get_rfq_vendors(self, rfq_id: UUID) -> List[RFQVendor]:
        return self.db.query(RFQVendor).filter(
            RFQVendor.rfq_id == rfq_id,
            RFQVendor.is_deleted == False,
        ).all()

    def get_rfq_items(self, rfq_id: UUID) -> List[RFQItem]:
        return self.db.query(RFQItem).filter(
            RFQItem.rfq_id == rfq_id,
            RFQItem.is_deleted == False,
        ).all()

    def add_attachment(self, attachment: RFQAttachment) -> RFQAttachment:
        self.db.add(attachment)
        self.db.commit()
        self.db.refresh(attachment)
        return attachment

    def get_attachment(self, rfq_id: UUID, attachment_id: UUID) -> Optional[RFQAttachment]:
        return self.db.query(RFQAttachment).filter(
            RFQAttachment.rfq_id == rfq_id,
            RFQAttachment.id == attachment_id,
            RFQAttachment.is_deleted == False,
        ).first()
