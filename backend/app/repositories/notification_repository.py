from typing import Sequence
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification import Notification
from app.repositories.base_repository import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, db: AsyncSession):
        super().__init__(Notification, db)

    async def get_by_user(self, user_id: str, limit: int = 50) -> Sequence[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_unread_count(self, user_id: str) -> int:
        stmt = select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
        result = await self.db.execute(stmt)
        return len(result.scalars().all())

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        stmt = update(Notification).where(Notification.id == notification_id, Notification.user_id == user_id).values(is_read=True)
        res = await self.db.execute(stmt)
        return res.rowcount > 0

    async def mark_all_as_read(self, user_id: str) -> int:
        stmt = update(Notification).where(Notification.user_id == user_id, Notification.is_read == False).values(is_read=True)
        res = await self.db.execute(stmt)
        return res.rowcount
