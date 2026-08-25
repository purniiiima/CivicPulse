from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.services.worker_service import WorkerService
from app.models.user import User
from app.models.issue import IssueStatus
from app.schemas.issue import IssueResponse
from app.schemas.assignment import AssignmentResponse
from app.schemas.history import StatusUpdateRequest
from app.schemas.worker import WorkerResponse
from app.core.dependencies import require_worker

from app.repositories.worker_repository import WorkerRepository

router = APIRouter(prefix="/worker", tags=["Worker Operations"])
workers_router = APIRouter(prefix="/workers", tags=["Workers Directory"])


@workers_router.get("", response_model=List[WorkerResponse])
async def list_all_workers(db: AsyncSession = Depends(get_db)):
    """Public/authorized listing of municipal workers for assignment dispatch and directory."""
    repo = WorkerRepository(db)
    workers = await repo.get_all(limit=200)
    return list(workers)


@router.get("/profile", response_model=WorkerResponse)
async def get_worker_profile(
    current_user: User = Depends(require_worker),
    db: AsyncSession = Depends(get_db)
):
    """Get the active worker's profile, active jobs, and rating."""
    service = WorkerService(db)
    return await service.get_worker_profile(current_user.id)


@router.get("/issues", response_model=List[IssueResponse])
async def get_assigned_issues(
    current_user: User = Depends(require_worker),
    db: AsyncSession = Depends(get_db)
):
    """List all issues currently dispatched or assigned to the authenticated worker."""
    service = WorkerService(db)
    return await service.get_assigned_issues(current_user.id)


@router.post("/assignments/{assignment_id}/accept", response_model=AssignmentResponse)
async def accept_assignment(
    assignment_id: str,
    current_user: User = Depends(require_worker),
    db: AsyncSession = Depends(get_db)
):
    """Acknowledge and accept a dispatch task assignment."""
    service = WorkerService(db)
    return await service.accept_assignment(assignment_id, current_user)


@router.post("/issues/{issue_id}/status", response_model=IssueResponse)
async def update_status_and_notes(
    issue_id: str,
    status_in: StatusUpdateRequest,
    current_user: User = Depends(require_worker),
    db: AsyncSession = Depends(get_db)
):
    """Update issue progress status with on-site inspection or completion notes."""
    service = WorkerService(db)
    return await service.update_worker_status(
        issue_id=issue_id,
        new_status=status_in.new_status,
        notes=status_in.notes or f"Updated status to {status_in.new_status.value}",
        user=current_user
    )


@router.post("/issues/{issue_id}/resolve", response_model=IssueResponse)
async def mark_issue_resolved(
    issue_id: str,
    resolution_notes: str,
    proof_photo_url: Optional[str] = None,
    current_user: User = Depends(require_worker),
    db: AsyncSession = Depends(get_db)
):
    """Mark assigned issue as RESOLVED with final resolution notes and photographic proof of work."""
    service = WorkerService(db)
    return await service.update_worker_status(
        issue_id=issue_id,
        new_status=IssueStatus.RESOLVED,
        notes=resolution_notes,
        user=current_user,
        resolution_photo_url=proof_photo_url
    )
