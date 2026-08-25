from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationResponse
from app.schemas.common import MessageResponse
from app.models.user import User
from app.core.dependencies import get_current_user, get_optional_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
async def get_my_notifications(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve in-app notifications for current authenticated user or empty if guest."""
    if not current_user:
        return []
    service = NotificationService(db)
    notifs = await service.get_user_notifications(current_user.id)
    return list(notifs)


@router.patch("/{notification_id}/read", response_model=MessageResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark single notification as read."""
    service = NotificationService(db)
    await service.mark_read(notification_id, current_user.id)
    return MessageResponse(message="Notification marked as read.")


@router.post("/read-all", response_model=MessageResponse)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all unread notifications as read."""
    service = NotificationService(db)
    count = await service.mark_all_read(current_user.id)
    return MessageResponse(message=f"Marked {count} notifications as read.")
