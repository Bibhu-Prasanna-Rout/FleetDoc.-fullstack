from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from app.core.database import get_db
from app.core.security import decode_token
from app.models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise ValueError()
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired access token")
    user = db.get(User, user_id)
    if not user or user.status != "Active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or unavailable")
    return user

def require_permission(module: str, action: str):
    def dependency(user: User = Depends(get_current_user)):
        if user.role == "Admin":
            return user
        permissions = user.permissions or {}
        role_permissions = permissions.get(user.role, permissions) if isinstance(permissions, dict) else {}
        if not role_permissions.get(action, False):
            raise HTTPException(status_code=403, detail=f"Permission denied: {module}.{action}")
        return user
    return dependency

def require_admin(user: User = Depends(get_current_user)):
    if user.role != "Admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    return user
