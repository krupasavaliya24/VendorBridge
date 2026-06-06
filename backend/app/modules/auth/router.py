from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.auth.schemas import (
    SignupRequest,
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserResponse,
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


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.get_current_user(current_user["id"])
    return UserResponse.model_validate(user)
