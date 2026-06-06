from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.purchase_orders.schemas import POStatusUpdateRequest, PurchaseOrderResponse
from app.modules.purchase_orders.service import PurchaseOrderService
from app.shared.enums import POStatus

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])


@router.get("")
def list_purchase_orders(
    status: Optional[POStatus] = Query(None),
    vendor_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = PurchaseOrderService(db)
    result = service.list_pos(status=status, vendor_id=vendor_id, page=page, page_size=page_size)
    result["items"] = [PurchaseOrderResponse.model_validate(po) for po in result["items"]]
    return result


@router.get("/{po_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(
    po_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = PurchaseOrderService(db)
    po = service.get_po(po_id)
    return PurchaseOrderResponse.model_validate(po)


@router.put("/{po_id}/status", response_model=PurchaseOrderResponse)
def update_po_status(
    po_id: UUID,
    data: POStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = PurchaseOrderService(db)
    po = service.update_status(po_id, data, current_user_id=current_user["id"])
    return PurchaseOrderResponse.model_validate(po)
