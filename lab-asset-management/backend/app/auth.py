"""
Simple username/password auth with three roles: admin, lab_assistant, technician.
Issues a JWT on login. In production, move USERS into a database / Sheet and hash
passwords. Kept intentionally simple and self-contained here.
"""
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import get_settings

settings = get_settings()

# username -> {password, role, name}
USERS: dict[str, dict] = {
    "admin":      {"password": "admin123",      "role": "admin",         "name": "System Admin"},
    "assistant":  {"password": "assistant123",  "role": "lab_assistant", "name": "Lab Assistant"},
    "technician": {"password": "tech123",       "role": "technician",    "name": "Technician"},
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/login")


def authenticate(username: str, password: str) -> dict | None:
    user = USERS.get(username)
    if user and user["password"] == password:
        return {"username": username, "role": user["role"], "name": user["name"]}
    return None


def create_token(user: dict) -> str:
    payload = {
        "sub": user["username"],
        "role": user["role"],
        "name": user["name"],
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    cred_err = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.PyJWTError:
        raise cred_err
    return {"username": payload["sub"], "role": payload["role"], "name": payload["name"]}


def require_role(*roles: str):
    """Dependency factory to gate endpoints by role."""
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if roles and user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker
