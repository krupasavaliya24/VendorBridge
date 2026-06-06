from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.modules.auth.models import User
from app.modules.auth.repository import UserRepository
from app.modules.auth.schemas import SignupRequest, LoginRequest


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

    def get_current_user(self, user_id: UUID) -> User:
        user = self.repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found.")
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
