from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import BaseEntity
from app.shared.enums import UserRole


class User(BaseEntity):
    __tablename__ = "users"

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="user_role_enum", create_constraint=False, native_enum=False), nullable=False, default=UserRole.VENDOR)


class PasswordResetToken(BaseEntity):
    __tablename__ = "password_reset_tokens"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
