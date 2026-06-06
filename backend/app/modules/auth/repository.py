from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.modules.auth.models import User


class UserRepository:
    """Repository for User database operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email, User.is_deleted == False).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all(self) -> list:
        return self.db.query(User).filter(User.is_deleted == False).all()

    def count(self) -> int:
        return self.db.query(User).filter(User.is_deleted == False).count()
