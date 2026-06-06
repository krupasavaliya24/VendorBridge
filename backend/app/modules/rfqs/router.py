from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.rfqs.schemas import (
    RFQCreateRequest,
    RFQUpdateRequest,
    RFQResponse,
    RFQDetailResponse,
)
from app.modules.rfqs.service import RFQService
from app.shared.enums import RFQStatus

router = APIRouter(prefix="/rfqs", tags=["RFQs"])


@router.get("")
def list_rfqs(
    status: Optional[RFQStatus] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = RFQService(db)
    result = service.list_rfqs(status=status, search=search, page=page, page_size=page_size)
    result["items"] = [RFQResponse.model_validate(r) for r in result["items"]]
    return result


@router.post("", response_model=RFQDetailResponse, status_code=201)
def create_rfq(
    data: RFQCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = RFQService(db)
    rfq = service.create_rfq(data, current_user_id=current_user["id"])
    return RFQDetailResponse.model_validate(rfq)


@router.get("/{rfq_id}", response_model=RFQDetailResponse)
def get_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = RFQService(db)
    rfq = service.get_rfq(rfq_id)
    return RFQDetailResponse.model_validate(rfq)


@router.put("/{rfq_id}", response_model=RFQResponse)
def update_rfq(
    rfq_id: UUID,
    data: RFQUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = RFQService(db)
    rfq = service.update_rfq(rfq_id, data, current_user_id=current_user["id"])
    return RFQResponse.model_validate(rfq)


@router.post("/{rfq_id}/publish", response_model=RFQResponse)
def publish_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = RFQService(db)
    rfq = service.publish_rfq(rfq_id, current_user_id=current_user["id"])
    return RFQResponse.model_validate(rfq)


@router.post("/{rfq_id}/close", response_model=RFQResponse)
def close_rfq(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = RFQService(db)
    rfq = service.close_rfq(rfq_id, current_user_id=current_user["id"])
    return RFQResponse.model_validate(rfq)
