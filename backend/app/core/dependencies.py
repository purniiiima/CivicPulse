from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedException("Authentication token is missing.")

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise UnauthorizedException("Invalid or expired token.")

    user_id = payload.get("sub")
    user_repo = UserRepository(db)
    user = await user_repo.get(user_id)

    if not user:
        raise UnauthorizedException("User associated with token no longer exists.")

    if not user.is_active:
        raise ForbiddenException("User account is inactive.")

    return user


async def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        return await get_current_user(token=token, db=db)
    except Exception:
        return None


def require_roles(allowed_roles: List[UserRole]):
    """Role-based access control dependency factory."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == UserRole.SUPER_ADMIN:
            return current_user  # Super admin has global access
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"Access forbidden: User has role '{current_user.role.value}', required one of {[r.value for r in allowed_roles]}."
            )
        return current_user
    return role_checker


# Convenient role dependencies
require_citizen = require_roles([UserRole.CITIZEN, UserRole.ORGANIZATION_ADMIN, UserRole.SUPER_ADMIN])
require_worker = require_roles([UserRole.WORKER, UserRole.ORGANIZATION_ADMIN, UserRole.SUPER_ADMIN])
require_admin = require_roles([UserRole.ORGANIZATION_ADMIN, UserRole.SUPER_ADMIN])
require_super_admin = require_roles([UserRole.SUPER_ADMIN])
