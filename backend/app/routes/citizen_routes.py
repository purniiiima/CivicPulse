import math
from typing import Optional, List
from fastapi import APIRouter, Depends, status, Query, UploadFile, File
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
from app.schemas.attachment import AttachmentCreate, AttachmentResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.dependencies import get_current_user, require_citizen, get_optional_current_user

router = APIRouter(prefix="/citizen", tags=["Citizen Operations"])


@router.post("/issues", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(
    issue_in: IssueCreate,
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db)
):
    """Report a new public infrastructure or civic issue."""
    service = IssueService(db)
    return await service.create_issue(issue_in, current_user)


@router.get("/issues/my", response_model=PaginatedResponse[IssueResponse])
async def get_my_issues(
    status: Optional[IssueStatus] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all issues reported by the current citizen."""
    service = IssueService(db)
    filter_params = IssueFilterParams(
        reporter_id=current_user.id,
        status=status,
        page=page,
        page_size=page_size
    )
    items, total = await service.list_issues(filter_params)
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total > 0 else 1
    )


@router.get("/issues/{issue_id}", response_model=IssueResponse)
async def get_issue_details(
    issue_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Get full details, audit history timeline, comments, and attachments for an issue."""
    service = IssueService(db)
    return await service.get_issue_by_id(issue_id)


@router.get("/track/{tracking_number}", response_model=IssueResponse)
async def track_issue_by_number(
    tracking_number: str,
    db: AsyncSession = Depends(get_db)
):
    """Track issue resolution status by public tracking number (e.g. CP-2026-08429)."""
    service = IssueService(db)
    return await service.get_issue_by_tracking(tracking_number)


@router.post("/issues/{issue_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    issue_id: str,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Post a citizen update comment or enquiry on an issue."""
    service = IssueService(db)
    return await service.add_comment(
        issue_id=issue_id,
        content=comment_in.content,
        user=current_user,
        is_internal=comment_in.is_internal
    )


@router.post("/issues/{issue_id}/attachments", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def add_attachment(
    issue_id: str,
    attachment_in: AttachmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload or attach supplementary photographic evidence to an issue."""
    service = IssueService(db)
    return await service.add_attachment(
        issue_id=issue_id,
        user=current_user,
        file_url=attachment_in.file_url,
        file_type=attachment_in.file_type,
        stage=attachment_in.stage
    )


@router.post("/issues/{issue_id}/verify", response_model=IssueResponse)
async def verify_and_rate_issue(
    issue_id: str,
    verify_in: IssueVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Verify resolved issue and submit 1-5 star citizen satisfaction rating."""
    service = IssueService(db)
    return await service.verify_and_rate_issue(
        issue_id=issue_id,
        verify_data=verify_in,
        user=current_user
    )


@router.post("/issues/{issue_id}/upvote", response_model=IssueResponse)
async def upvote_issue(
    issue_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upvote an issue to signal community priority to the municipal council."""
    service = IssueService(db)
    return await service.upvote_issue(issue_id, current_user)
