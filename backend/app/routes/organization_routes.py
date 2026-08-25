from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationResponse, OrganizationCreate
from app.models.organization import Organization
from app.core.dependencies import require_super_admin
from app.models.user import User

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(db: AsyncSession = Depends(get_db)):
    """List all registered municipal departments and civic agencies."""
    repo = OrganizationRepository(db)
    orgs = await repo.get_all(limit=100)
    return list(orgs)


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_in: OrganizationCreate,
    current_admin: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """Create a new municipal agency organization."""
    repo = OrganizationRepository(db)
    org = Organization(
        name=org_in.name,
        slug=org_in.slug,
        department_type=org_in.department_type,
        contact_email=org_in.contact_email,
        phone=org_in.phone,
        address=org_in.address
    )
    return await repo.create(org)
