from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.shared.pagination import paginate, PaginatedResponse
from .schemas import NotificationResponse
from .service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=PaginatedResponse[NotificationResponse])
def get_notifications(
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    service = NotificationService(db)
    query = service.get_user_notifications(user.id)
    return paginate(query, page, size)

@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), user=Depends(get_current_user)):
    service = NotificationService(db)
    count = service.get_unread_count(user.id)
    return {"count": count}

@router.put("/{id}/read", response_model=NotificationResponse)
def mark_as_read(id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    service = NotificationService(db)
    return service.mark_as_read(id, user.id)

@router.put("/read-all")
def mark_all_as_read(db: Session = Depends(get_db), user=Depends(get_current_user)):
    service = NotificationService(db)
    service.mark_all_as_read(user.id)
    return {"success": True}
