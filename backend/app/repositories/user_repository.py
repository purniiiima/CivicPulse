from typing import Optional, Sequence
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> Optional[User]:
        clean_email = email.lower().strip()
        stmt = select(User).where(func.lower(User.email) == clean_email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_role(self, role: UserRole) -> Sequence[User]:
        stmt = select(User).where(User.role == role)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_organization(self, organization_id: str) -> Sequence[User]:
        stmt = select(User).where(User.organization_id == organization_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()
