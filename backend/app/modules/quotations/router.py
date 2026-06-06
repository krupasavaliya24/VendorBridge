from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.quotations.schemas import (
    QuotationCreateRequest,
    QuotationResponse,
    QuotationDetailResponse,
    QuotationCompareResponse,
)
from app.modules.quotations.service import QuotationService
from app.shared.enums import QuotationStatus

router = APIRouter(prefix="/quotations", tags=["Quotations"])


@router.get("")
def list_quotations(
    status: Optional[QuotationStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = QuotationService(db)
    result = service.list_quotations(status=status, page=page, page_size=page_size)
    result["items"] = [QuotationResponse.model_validate(q) for q in result["items"]]
    return result


@router.post("", response_model=QuotationDetailResponse, status_code=201)
def create_quotation(
    data: QuotationCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = QuotationService(db)
    quotation = service.create_quotation(data, current_user_id=current_user["id"])
    return QuotationDetailResponse.model_validate(quotation)


@router.get("/compare/{rfq_id}", response_model=QuotationCompareResponse)
def compare_quotations(
    rfq_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = QuotationService(db)
    quotations = service.compare_quotations(rfq_id)
    return QuotationCompareResponse(
        rfq_id=rfq_id,
        quotations=[QuotationDetailResponse.model_validate(q) for q in quotations],
    )


@router.get("/{quotation_id}", response_model=QuotationDetailResponse)
def get_quotation(
    quotation_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = QuotationService(db)
    quotation = service.get_quotation(quotation_id)
    return QuotationDetailResponse.model_validate(quotation)


@router.post("/{quotation_id}/select", response_model=QuotationResponse)
def select_quotation(
    quotation_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = QuotationService(db)
    quotation = service.select_quotation(quotation_id, current_user_id=current_user["id"])
    return QuotationResponse.model_validate(quotation)
