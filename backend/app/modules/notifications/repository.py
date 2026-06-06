from sqlalchemy.orm import Session
from .models import Notification
from uuid import UUID

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: UUID):
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_deleted == False
        ).order_by(Notification.created_on.desc())

    def get_unread_count(self, user_id: UUID):
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False,
            Notification.is_deleted == False
        ).count()

    def get_by_id(self, id: UUID):
        return self.db.query(Notification).filter(Notification.id == id, Notification.is_deleted == False).first()

    def create(self, notif: Notification):
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def update(self, notif: Notification):
        self.db.commit()
        self.db.refresh(notif)
        return notif
