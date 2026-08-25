from typing import List, Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse
from app.core.dependencies import get_current_user, require_super_admin, get_optional_current_user

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("", response_model=List[dict])
async def list_all_users(
    db: AsyncSession = Depends(get_db)
):
    """List all registered platform users."""
    repo = UserRepository(db)
    users = await repo.get_all(limit=200)
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "fullName": u.full_name,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
            "phone": u.phone,
            "avatarUrl": u.avatar_url,
            "points": u.points,
            "isActive": u.is_active,
            "is_active": u.is_active,
            "organizationId": u.organization_id,
            "organizationName": u.organization.name if u.organization else None,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
        })
    return result


@router.patch("/{user_id}/role", response_model=dict)
async def update_user_role_status(
    user_id: str,
    update_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update user role or active status."""
    repo = UserRepository(db)
    user = await repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if "role" in update_data:
        try:
            user.role = UserRole(update_data["role"].upper())
        except ValueError:
            pass

    if "is_active" in update_data:
        user.is_active = bool(update_data["is_active"])

    if "isActive" in update_data:
        user.is_active = bool(update_data["isActive"])

    await repo.update(user)
    return {
        "id": user.id,
        "fullName": user.full_name,
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "isActive": user.is_active,
        "organizationId": user.organization_id,
    }
