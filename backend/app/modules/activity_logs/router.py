from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import require_role
from app.shared.pagination import paginate, PaginatedResponse
from app.shared.enums import UserRole
from .schemas import ActivityLogResponse
from .service import ActivityLogService

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])

@router.get("", response_model=PaginatedResponse[ActivityLogResponse])
def get_activity_logs(
    entity_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(require_role([UserRole.ADMIN, UserRole.PROCUREMENT_OFFICER]))
):
    service = ActivityLogService(db)
    query = service.get_logs(entity_type)
    return paginate(query, page, size)
