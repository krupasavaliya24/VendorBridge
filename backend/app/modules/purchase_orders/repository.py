from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session, Query
from sqlalchemy import func

from app.modules.purchase_orders.models import PurchaseOrder
from app.shared.enums import POStatus


class PurchaseOrderRepository:
    """Repository for PurchaseOrder database operations."""

    def __init__(self, db: Session):
        self.db = db

    def _base_query(self) -> Query:
        return self.db.query(PurchaseOrder).filter(PurchaseOrder.is_deleted == False)

    def get_by_id(self, po_id: UUID) -> Optional[PurchaseOrder]:
        return self._base_query().filter(PurchaseOrder.id == po_id).first()

    def get_by_number(self, po_number: str) -> Optional[PurchaseOrder]:
        return self._base_query().filter(PurchaseOrder.po_number == po_number).first()

    def get_by_quotation_id(self, quotation_id: UUID) -> Optional[PurchaseOrder]:
        return self._base_query().filter(PurchaseOrder.quotation_id == quotation_id).first()

    def get_all(self, status: Optional[POStatus] = None, vendor_id: Optional[UUID] = None) -> Query:
        query = self._base_query()
        if status:
            query = query.filter(PurchaseOrder.status == status)
        if vendor_id:
            query = query.filter(PurchaseOrder.vendor_id == vendor_id)
        return query.order_by(PurchaseOrder.created_on.desc())

    def create(self, po: PurchaseOrder) -> PurchaseOrder:
        self.db.add(po)
        self.db.commit()
        self.db.refresh(po)
        return po

    def update(self, po: PurchaseOrder) -> PurchaseOrder:
        self.db.commit()
        self.db.refresh(po)
        return po

    def count(self) -> int:
        return self._base_query().count()

    def total_amount(self) -> float:
        result = self._base_query().with_entities(func.coalesce(func.sum(PurchaseOrder.grand_total), 0.0)).scalar()
        return float(result)
