from sqlalchemy import Column, String, Enum as SAEnum
from app.core.database import BaseEntity
from app.shared.enums import UserRole


class User(BaseEntity):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="user_role_enum", create_constraint=False, native_enum=False), nullable=False, default=UserRole.VENDOR)
