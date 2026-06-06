from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ConflictError
from app.modules.vendors.models import Vendor
from app.modules.vendors.repository import VendorRepository
from app.modules.vendors.schemas import VendorCreateRequest, VendorUpdateRequest
from app.shared.enums import VendorStatus
from app.shared.pagination import paginate
from app.shared.utils import generate_number


class VendorService:
    """Business logic for vendor management."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = VendorRepository(db)

    def create_vendor(self, data: VendorCreateRequest, current_user_id: UUID = None) -> Vendor:
        count = self.repo.count() + 1
        vendor_code = generate_number("VND", count)

        # Ensure unique code
        while self.repo.get_by_code(vendor_code):
            count += 1
            vendor_code = generate_number("VND", count)

        vendor = Vendor(
            vendor_code=vendor_code,
            name=data.name,
            category=data.category,
            gst_number=data.gst_number,
            email=data.email,
            phone=data.phone,
            address=data.address,
            city=data.city,
            country=data.country,
            status=data.status,
            rating=data.rating or 0.0,
            created_by=current_user_id,
        )
        return self.repo.create(vendor)

    def get_vendor(self, vendor_id: UUID) -> Vendor:
        vendor = self.repo.get_by_id(vendor_id)
        if not vendor:
            raise NotFoundError("Vendor not found.")
        return vendor

    def list_vendors(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[VendorStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = self.repo.get_all(search=search, category=category, status=status)
        return paginate(query, page=page, page_size=page_size)

    def update_vendor(self, vendor_id: UUID, data: VendorUpdateRequest, current_user_id: UUID = None) -> Vendor:
        vendor = self.get_vendor(vendor_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(vendor, field, value)

        vendor.updated_by = current_user_id
        return self.repo.update(vendor)

    def delete_vendor(self, vendor_id: UUID, current_user_id: UUID = None) -> Vendor:
        vendor = self.get_vendor(vendor_id)
        vendor.updated_by = current_user_id
        return self.repo.soft_delete(vendor)
