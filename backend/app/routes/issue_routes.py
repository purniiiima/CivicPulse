import math
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.services.issue_service import IssueService
from app.models.user import User
from app.models.issue import IssueStatus, IssuePriority
from app.schemas.issue import (
    IssueCreate,
    IssueResponse,
    IssueFilterParams,
    IssueVerifyRequest,
)
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.common import PaginatedResponse
from app.core.dependencies import get_current_user, get_optional_current_user

router = APIRouter(prefix="/issues", tags=["Issues Operations"])


@router.get("", response_model=List[IssueResponse])
async def get_all_issues(
    status: Optional[IssueStatus] = None,
    priority: Optional[IssuePriority] = None,
    category_id: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all civic issues with optional filtering."""
    service = IssueService(db)
    filter_params = IssueFilterParams(
        status=status,
        priority=priority,
        category_id=category_id,
        ward=ward,
        search=search,
        page=page,
        page_size=page_size
    )
    items, total = await service.list_issues(filter_params)
    return items


@router.get("/my", response_model=List[IssueResponse])
async def get_my_issues(
    status: Optional[IssueStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get issues reported by or assigned to the current user."""
    service = IssueService(db)
    filter_params = IssueFilterParams(
        reporter_id=current_user.id,
        status=status,
        page=1,
        page_size=100
    )
    items, total = await service.list_issues(filter_params)
    return items


@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(
    issue_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get issue details by id or tracking number."""
    service = IssueService(db)
    if issue_id.startswith("CP-"):
        return await service.get_issue_by_tracking(issue_id)
    return await service.get_issue_by_id(issue_id)


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    issue_in: IssueCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new civic issue report."""
    service = IssueService(db)
    if not current_user:
        # Fallback or guest citizen
        current_user = await service.user_repo.get_by_email("guest.citizen@civicpulse.gov.in")
        if not current_user:
            users = await service.user_repo.get_all(limit=1)
            if users:
                current_user = users[0]
            else:
                raise HTTPException(status_code=401, detail="Authentication required to report issue.")
    return await service.create_issue(issue_in, current_user)


@router.post("/{issue_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    issue_id: str,
    comment_in: CommentCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Post a comment on an issue."""
    service = IssueService(db)
    if not current_user:
        users = await service.user_repo.get_all(limit=1)
        current_user = users[0] if users else None
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required to comment.")
    return await service.add_comment(
        issue_id=issue_id,
        content=comment_in.content,
        user=current_user,
        is_internal=comment_in.is_internal
    )


@router.post("/{issue_id}/upvote", response_model=IssueResponse)
async def upvote_issue(
    issue_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upvote an issue."""
    service = IssueService(db)
    if not current_user:
        users = await service.user_repo.get_all(limit=1)
        current_user = users[0] if users else None
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required to upvote.")
    return await service.upvote_issue(issue_id, current_user)


@router.patch("/{issue_id}", response_model=IssueResponse)
async def update_issue(
    issue_id: str,
    update_data: dict,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update issue status, assigned worker, or notes."""
    service = IssueService(db)
    issue = await service.get_issue_by_id(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    if not current_user:
        users = await service.user_repo.get_all(limit=1)
        current_user = users[0] if users else None

    # Handle status change if provided
    if "status" in update_data and update_data["status"]:
        new_status_str = update_data["status"].upper() if isinstance(update_data["status"], str) else update_data["status"]
        try:
            new_status = IssueStatus(new_status_str)
            old_status = issue.status
            issue.status = new_status
            if "remarks" in update_data and update_data["remarks"]:
                issue.resolution_notes = update_data["remarks"]
            if new_status == IssueStatus.RESOLVED:
                issue.resolved_at = datetime.now(timezone.utc)
            await service.issue_repo.update(issue)

            if current_user:
                await service.issue_repo.add_status_history(
                    issue_id=issue.id,
                    old_status=old_status,
                    new_status=new_status,
                    changed_by_user_id=current_user.id,
                    notes=update_data.get("remarks") or f"Status changed to {new_status.value}"
                )
        except Exception:
            pass

    # Handle worker assignment if provided
    worker_id = update_data.get("assignedWorkerId") or update_data.get("assigned_worker_id")
    if worker_id:
        worker = await service.worker_repo.get(worker_id)
        if worker:
            issue.assigned_worker_id = worker.id
            issue.status = IssueStatus.ASSIGNED
            await service.issue_repo.update(issue)
            worker.active_issues_count += 1
            await service.worker_repo.update(worker)

            if current_user:
                await service.issue_repo.add_status_history(
                    issue_id=issue.id,
                    old_status=issue.status,
                    new_status=IssueStatus.ASSIGNED,
                    changed_by_user_id=current_user.id,
                    notes=update_data.get("remarks") or f"Assigned to {worker.employee_code}"
                )

    return await service.get_issue_by_id(issue.id)


@router.post("/{issue_id}/verify", response_model=IssueResponse)
async def verify_issue(
    issue_id: str,
    verify_in: IssueVerifyRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Citizen verification and rating for resolved issue."""
    service = IssueService(db)
    if not current_user:
        users = await service.user_repo.get_all(limit=1)
        current_user = users[0] if users else None
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required to verify.")
    return await service.verify_and_rate_issue(issue_id, verify_in, current_user)

