from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.vendors.schemas import VendorCreateRequest, VendorUpdateRequest, VendorResponse
from app.modules.vendors.service import VendorService
from app.shared.enums import VendorStatus

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.get("")
def list_vendors(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[VendorStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = VendorService(db)
    result = service.list_vendors(search=search, category=category, status=status, page=page, page_size=page_size)
    result["items"] = [VendorResponse.model_validate(v) for v in result["items"]]
    return result


@router.post("", response_model=VendorResponse, status_code=201)
def create_vendor(
    data: VendorCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = VendorService(db)
    vendor = service.create_vendor(data, current_user_id=current_user["id"])
    return VendorResponse.model_validate(vendor)


@router.get("/{vendor_id}", response_model=VendorResponse)
def get_vendor(
    vendor_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = VendorService(db)
    vendor = service.get_vendor(vendor_id)
    return VendorResponse.model_validate(vendor)


@router.put("/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: UUID,
    data: VendorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = VendorService(db)
    vendor = service.update_vendor(vendor_id, data, current_user_id=current_user["id"])
    return VendorResponse.model_validate(vendor)


@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = VendorService(db)
    service.delete_vendor(vendor_id, current_user_id=current_user["id"])
    return {"message": "Vendor deleted successfully."}
