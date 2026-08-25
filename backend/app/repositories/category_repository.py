from typing import Optional, Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.issue_category import IssueCategory
from app.repositories.base_repository import BaseRepository


class CategoryRepository(BaseRepository[IssueCategory]):
    def __init__(self, db: AsyncSession):
        super().__init__(IssueCategory, db)

    async def get_by_slug(self, slug: str) -> Optional[IssueCategory]:
        stmt = select(IssueCategory).where(IssueCategory.slug == slug.lower().strip())
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_active(self) -> Sequence[IssueCategory]:
        stmt = select(IssueCategory).where(IssueCategory.is_active == True).order_by(IssueCategory.name)
        result = await self.db.execute(stmt)
        return result.scalars().all()
