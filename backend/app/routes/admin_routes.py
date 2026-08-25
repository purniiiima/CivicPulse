import math
from typing import Optional, List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.services.admin_service import AdminService
from app.services.issue_service import IssueService
from app.services.analytics_service import AnalyticsService
from app.models.user import User, UserRole
from app.models.issue import IssueStatus, IssuePriority
from app.schemas.issue import (
    IssueResponse,
    IssueFilterParams,
)
from app.schemas.assignment import AssignmentCreate
from app.schemas.history import StatusUpdateRequest
from app.schemas.worker import WorkerResponse
from app.schemas.analytics import AnalyticsOverview
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Municipal Admin Operations"])


@router.get("/issues", response_model=PaginatedResponse[IssueResponse])
async def get_all_issues(
    status: Optional[IssueStatus] = None,
    priority: Optional[IssuePriority] = None,
    category_id: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    assigned_worker_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve and filter issues with pagination, search, status, ward, priority, and sorting."""
    service = IssueService(db)
    filter_params = IssueFilterParams(
        status=status,
        priority=priority,
        category_id=category_id,
        ward=ward,
        search=search,
        assigned_worker_id=assigned_worker_id,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    items, total = await service.list_issues(filter_params)
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1
    )


@router.post("/issues/{issue_id}/assign", response_model=IssueResponse)
async def assign_worker(
    issue_id: str,
    assignment_in: AssignmentCreate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Assign a field specialist or crew to an issue with dispatch instructions."""
    service = AdminService(db)
    return await service.assign_worker(
        issue_id=issue_id,
        assignment_in=assignment_in,
        admin_user=current_admin
    )


@router.patch("/issues/{issue_id}/status", response_model=IssueResponse)
async def update_issue_status(
    issue_id: str,
    status_in: StatusUpdateRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Manually update issue status, add status transition notes or rejection rationale."""
    service = AdminService(db)
    return await service.update_issue_status(
        issue_id=issue_id,
        new_status=status_in.new_status,
        notes=status_in.notes,
        admin_user=current_admin,
        resolution_notes=status_in.resolution_notes
    )


@router.post("/issues/{issue_id}/internal-notes", response_model=MessageResponse)
async def add_internal_note(
    issue_id: str,
    note: str = Query(..., min_length=1),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Add private internal municipal notes visible only to staff."""
    service = IssueService(db)
    await service.add_comment(
        issue_id=issue_id,
        content=note,
        user=current_admin,
        is_internal=True
    )
    return MessageResponse(message="Internal note recorded successfully.")


@router.get("/workers", response_model=List[WorkerResponse])
async def list_workers(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """List all registered municipal field specialists and their real-time dispatch status."""
    service = AdminService(db)
    workers = await service.get_all_workers()
    return list(workers)


@router.get("/analytics", response_model=AnalyticsOverview)
async def get_analytics_dashboard(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get high-level municipal analytics, SLA resolution velocities, ward scores, and trends."""
    service = AnalyticsService(db)
    return await service.get_overview_metrics()
