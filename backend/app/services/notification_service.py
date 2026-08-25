from typing import List, Sequence, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationResponse


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notification_repo = NotificationRepository(db)

    async def notify_user(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "status_change",
        issue_id: Optional[str] = None
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            issue_id=issue_id,
            is_read=False
        )
        return await self.notification_repo.create(notification)

    async def get_user_notifications(self, user_id: str) -> Sequence[Notification]:
        return await self.notification_repo.get_by_user(user_id)

    async def mark_read(self, notification_id: str, user_id: str) -> bool:
        return await self.notification_repo.mark_as_read(notification_id, user_id)

    async def mark_all_read(self, user_id: str) -> int:
        return await self.notification_repo.mark_all_as_read(user_id)
