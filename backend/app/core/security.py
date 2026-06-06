from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Modern Python 3.14 Compatible JOSE Imports
from joserfc import jwt, jwk
from joserfc.errors import JoseError

import bcrypt

from app.core.config import settings

security_scheme = HTTPBearer()

# Pre-compile the symmetric octet key using your configuration secret
_SECRET_KEY = jwk.import_key(settings.JWT_SECRET, "oct")


# ==========================================
# MODERN PASSWORD HASHING UTILITIES (BCRYPT)
# ==========================================

def hash_password(password: str) -> str:
    """Hash a plain-text password safely using native bcrypt."""
    # Convert string to bytes, generate salt, hash, then return back as standard UTF-8 string
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its saved bcrypt hash securely."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except (ValueError, TypeError):
        return False


# ==========================================
# MODERN TOKEN PROCESSING UTILITIES (JOSERFC)
# ==========================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create an explicitly typed JWT access token."""
    header = {"alg": settings.JWT_ALGORITHM}
    
    # Calculate Unix Timestamp expiration natively (Must be an integer for claim compliance)
    expire_time = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    claims = data.copy()
    claims.update({
        "exp": int(expire_time.timestamp()), 
        "type": "access"
    })
    
    # Returns an optimized encoded token string directly
    return jwt.encode(header, claims, _SECRET_KEY)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create an explicitly typed JWT refresh token."""
    header = {"alg": settings.JWT_ALGORITHM}
    
    expire_time = datetime.now(timezone.utc) + (
        expires_delta or timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    claims = data.copy()
    claims.update({
        "exp": int(expire_time.timestamp()), 
        "type": "refresh"
    })
    
    return jwt.encode(header, claims, _SECRET_KEY)


def verify_token(token: str, token_type: str = "access") -> dict:
    """Verify, parse, and validate structural claims of a JWT."""
    try:
        # joserfc returns a comprehensive Token Object containing .claims and .header
        token_obj = jwt.decode(token, _SECRET_KEY)
        payload = token_obj.claims
        
        # Enforce manual scope/typing check from the extracted claims map
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}.",
            )
            
        # Optional: Explicitly evaluate standardized temporal rules (exp, nbf, iat)
        claims_registry = jwt.JWTClaimsRegistry()
        claims_registry.validate(payload)
        
        return payload
        
    except (JoseError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        )


# ==========================================
# FASTAPI SYSTEM SECURITY DEPENDENCIES
# ==========================================

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """FastAPI dependency extracting and validating the current user."""
    payload = verify_token(credentials.credentials, token_type="access")
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
        )
    return {
        "id": uuid.UUID(user_id),
        "email": payload.get("email"),
        "role": payload.get("role"),
        "full_name": payload.get("full_name"),
    }


def require_role(*allowed_roles: str):
    """Dependency factory checking if the active user maintains sufficient authorization."""
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user
    return role_checker
