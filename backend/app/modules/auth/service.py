import hashlib
import secrets
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError, ValidationError
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.modules.auth.models import User, PasswordResetToken
from app.modules.auth.repository import UserRepository
from app.modules.auth.schemas import SignupRequest, LoginRequest, UserUpdateRequest
from app.modules.settings.service import SettingsService
from app.shared.enums import UserRole


class AuthService:
    """Business logic for authentication."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def signup(self, data: SignupRequest) -> dict:
        existing = self.repo.get_by_email(data.email)
        if existing:
            raise ConflictError("A user with this email already exists.")

        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            role=data.role,
        )
        user = self.repo.create(user)

        if user.role == UserRole.VENDOR:
            from app.modules.vendors.models import Vendor
            from app.shared.enums import VendorStatus
            import random
            vendor = Vendor(
                id=user.id,
                vendor_code=f"VND-{random.randint(1000, 9999)}",
                name=user.full_name,
                email=user.email,
                status=VendorStatus.ACTIVE,
                created_by=user.id
            )
            self.db.add(vendor)
            self.db.commit()

        tokens = self._generate_tokens(user)
        return {"user": user, "tokens": tokens}

    def login(self, data: LoginRequest) -> dict:
        user = self.repo.get_by_email(data.email)
        if not user:
            raise UnauthorizedError("Invalid email or password.")

        if not verify_password(data.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedError("Your account has been deactivated.")

        tokens = self._generate_tokens(user)
        return {"user": user, "tokens": tokens}

    def refresh_token(self, refresh_token: str) -> dict:
        payload = verify_token(refresh_token, token_type="refresh")
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedError("Invalid refresh token.")

        user = self.repo.get_by_id(UUID(user_id))
        if not user:
            raise NotFoundError("User not found.")

        tokens = self._generate_tokens(user)
        return {"user": user, "tokens": tokens}

    def forgot_password(self, email: str) -> dict:
        user = self.repo.get_by_email(email)
        if not user:
            return {"message": "If an account exists for this email, a reset link has been sent."}

        raw_token = secrets.token_urlsafe(32)
        token_hash = self._hash_reset_token(raw_token)

        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(minutes=30),
            created_by=user.id,
        )
        self.db.add(reset_token)
        self.db.commit()

        self._send_password_reset_email(user.email, user.full_name, raw_token)
        return {"message": "If an account exists for this email, a reset link has been sent."}

    def reset_password(self, token: str, password: str) -> dict:
        token_hash = self._hash_reset_token(token)
        reset_token = self.db.query(PasswordResetToken).filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.is_deleted == False,
        ).first()

        if not reset_token or reset_token.used_at is not None or reset_token.expires_at < datetime.utcnow():
            raise UnauthorizedError("This password reset link is invalid or has expired.")

        user = self.repo.get_by_id(reset_token.user_id)
        if not user:
            raise NotFoundError("User not found.")

        user.password_hash = hash_password(password)
        user.updated_by = user.id
        reset_token.used_at = datetime.utcnow()
        self.db.commit()
        return {"message": "Password reset successfully. You can now sign in."}

    def get_current_user(self, user_id: UUID) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found.")
        return user

    def list_users(self) -> List[User]:
        return self.repo.get_all()

    def list_approvers(self) -> List[User]:
        return [
            user for user in self.repo.get_all()
            if user.is_active and user.role.value in {"admin", "approver"}
        ]

    def update_user(self, user_id: UUID, data: UserUpdateRequest, current_user_id: UUID = None) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found.")
        if current_user_id == user_id and data.is_active is False:
            raise ValidationError("You cannot deactivate your own account.")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        user.updated_by = current_user_id
        self.db.commit()
        self.db.refresh(user)
        return user

    def _generate_tokens(self, user: User) -> dict:
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
            "full_name": user.full_name,
        }
        return {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token(token_data),
            "token_type": "bearer",
        }

    def _hash_reset_token(self, token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def _send_password_reset_email(self, email: str, full_name: str, token: str) -> None:
        settings_service = SettingsService(self.db)
        smtp = settings_service.get_smtp_settings()
        if not smtp.get("smtp_host") or not smtp.get("smtp_from_email"):
            raise ValidationError("SMTP settings are not configured. Configure SMTP settings before sending password reset emails.")

        frontend_base_url = settings_service.get_value("frontend_base_url", "http://localhost:3000")
        reset_link = f"{frontend_base_url.rstrip('/')}/reset-password?token={token}"

        msg = MIMEText(
            f"Hello {full_name},\n\n"
            f"Use this link to reset your VendorBridge password. The link expires in 30 minutes:\n\n"
            f"{reset_link}\n\n"
            "If you did not request this, you can ignore this email.\n",
            "plain",
        )
        msg["From"] = f"{smtp.get('smtp_sender_name', 'VendorBridge')} <{smtp['smtp_from_email']}>"
        msg["To"] = email
        msg["Subject"] = "Reset your VendorBridge password"

        smtp_port = int(smtp.get("smtp_port") or 587)
        use_tls = (smtp.get("smtp_use_tls") or "true").lower() == "true"

        try:
            server = smtplib.SMTP(smtp["smtp_host"], smtp_port)
            if use_tls:
                server.starttls()
            if smtp.get("smtp_username") and smtp.get("smtp_password"):
                server.login(smtp["smtp_username"], smtp["smtp_password"])
            server.send_message(msg)
            server.quit()
        except Exception as exc:
            raise ValidationError(f"Failed to send password reset email: {exc}")
