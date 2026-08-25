from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryResponse, CategoryCreate
from app.models.issue_category import IssueCategory
from app.core.dependencies import require_admin
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
async def get_all_categories(db: AsyncSession = Depends(get_db)):
    """List all available municipal issue categories and their department SLA definitions."""
    repo = CategoryRepository(db)
    categories = await repo.get_active()
    return list(categories)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new municipal service category."""
    repo = CategoryRepository(db)
    cat = IssueCategory(
        name=category_in.name,
        slug=category_in.slug,
        department=category_in.department,
        icon=category_in.icon,
        default_priority=category_in.default_priority,
        sla_hours=category_in.sla_hours,
        description=category_in.description,
        is_active=category_in.is_active
    )
    return await repo.create(cat)
