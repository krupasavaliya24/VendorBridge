from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session, Query

from app.modules.vendors.models import Vendor
from app.shared.enums import VendorStatus


class VendorRepository:
    """Repository for Vendor database operations."""

    def __init__(self, db: Session):
        self.db = db

    def _base_query(self) -> Query:
        return self.db.query(Vendor).filter(Vendor.is_deleted == False)

    def get_by_id(self, vendor_id: UUID) -> Optional[Vendor]:
        return self._base_query().filter(Vendor.id == vendor_id).first()

    def get_by_code(self, vendor_code: str) -> Optional[Vendor]:
        return self._base_query().filter(Vendor.vendor_code == vendor_code).first()

    def get_all(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[VendorStatus] = None,
    ) -> Query:
        query = self._base_query()
        if search:
            query = query.filter(Vendor.name.ilike(f"%{search}%"))
        if category:
            query = query.filter(Vendor.category == category)
        if status:
            query = query.filter(Vendor.status == status)
        return query.order_by(Vendor.created_on.desc())

    def create(self, vendor: Vendor) -> Vendor:
        self.db.add(vendor)
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def update(self, vendor: Vendor) -> Vendor:
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def soft_delete(self, vendor: Vendor) -> Vendor:
        vendor.is_deleted = True
        self.db.commit()
        self.db.refresh(vendor)
        return vendor

    def count(self) -> int:
        return self._base_query().count()

    def get_by_ids(self, vendor_ids: List[UUID]) -> List[Vendor]:
        return self._base_query().filter(Vendor.id.in_(vendor_ids)).all()
