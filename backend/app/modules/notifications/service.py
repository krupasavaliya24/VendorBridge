from sqlalchemy.orm import Session
from .repository import NotificationRepository
from .models import Notification
from .schemas import NotificationCreate
from uuid import UUID
from app.core.exceptions import NotFoundError

class NotificationService:
    def __init__(self, db: Session):
        self.repo = NotificationRepository(db)

    def get_user_notifications(self, user_id: UUID):
        return self.repo.get_by_user(user_id)

    def get_unread_count(self, user_id: UUID):
        return self.repo.get_unread_count(user_id)

    def create_notification(self, data: NotificationCreate):
        notif = Notification(**data.model_dump())
        return self.repo.create(notif)

    def mark_as_read(self, id: UUID, user_id: UUID):
        notif = self.repo.get_by_id(id)
        if not notif or notif.user_id != user_id:
            raise NotFoundError("Notification not found")
        notif.is_read = True
        return self.repo.update(notif)

    def mark_all_as_read(self, user_id: UUID):
        notifs = self.repo.get_by_user(user_id).filter(Notification.is_read == False).all()
        for notif in notifs:
            notif.is_read = True
        if notifs:
            self.repo.db.commit()
        return True
