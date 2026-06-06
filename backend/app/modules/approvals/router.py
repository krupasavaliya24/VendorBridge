from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.approvals.schemas import (
    ApprovalCreateRequest,
    ApprovalDecideRequest,
    ApprovalResponse,
)
from app.modules.approvals.service import ApprovalService
from app.shared.enums import ApprovalStatus

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("/pending", response_model=List[ApprovalResponse])
def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = ApprovalService(db)
    approvals = service.get_pending_approvals(current_user["id"])
    return [ApprovalResponse.model_validate(a) for a in approvals]


@router.get("")
def list_approvals(
    status: Optional[ApprovalStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = ApprovalService(db)
    result = service.list_approvals(status=status, page=page, page_size=page_size)
    result["items"] = [ApprovalResponse.model_validate(a) for a in result["items"]]
    return result


@router.post("", response_model=ApprovalResponse, status_code=201)
def create_approval(
    data: ApprovalCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = ApprovalService(db)
    approval = service.create_approval(data, current_user_id=current_user["id"])
    return ApprovalResponse.model_validate(approval)


@router.put("/{approval_id}/decide", response_model=ApprovalResponse)
async def decide_approval(
    approval_id: UUID,
    data: ApprovalDecideRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = ApprovalService(db)
    approval = await service.decide_approval(approval_id, data, current_user_id=current_user["id"])
    return ApprovalResponse.model_validate(approval)
