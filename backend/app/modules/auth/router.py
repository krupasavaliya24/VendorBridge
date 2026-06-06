from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.modules.auth.schemas import (
    SignupRequest,
    LoginRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    UserListResponse,
    UserUpdateRequest,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=dict)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.signup(data)
    return {
        "user": UserResponse.model_validate(result["user"]),
        "tokens": result["tokens"],
    }


@router.post("/login", response_model=dict)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.login(data)
    return {
        "user": UserResponse.model_validate(result["user"]),
        "tokens": result["tokens"],
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    result = service.refresh_token(data.refresh_token)
    return result["tokens"]


@router.post("/forgot-password", response_model=dict)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.forgot_password(data.email)


@router.post("/reset-password", response_model=dict)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.reset_password(data.token, data.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.get_current_user(current_user["id"])
    return UserResponse.model_validate(user)


@router.get("/users", response_model=list[UserListResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    service = AuthService(db)
    return [UserListResponse.model_validate(user) for user in service.list_users()]


@router.get("/approvers", response_model=list[UserListResponse])
def list_approvers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "procurement_officer")),
):
    service = AuthService(db)
    return [UserListResponse.model_validate(user) for user in service.list_approvers()]


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    service = AuthService(db)
    user = service.update_user(user_id, data, current_user_id=current_user["id"])
    return UserResponse.model_validate(user)
