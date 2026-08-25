from typing import List, Sequence, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.issue import Issue, IssueStatus, IssuePriority
from app.models.worker import Worker, WorkerStatus
from app.models.user import User, UserRole
from app.models.issue_assignment import IssueAssignment, AssignmentStatus
from app.repositories.issue_repository import IssueRepository
from app.repositories.worker_repository import WorkerRepository
from app.repositories.user_repository import UserRepository
from app.services.notification_service import NotificationService
from app.core.exceptions import EntityNotFoundException, ForbiddenException, ValidationException
from app.schemas.issue import IssueFilterParams, IssueUpdate
from app.schemas.assignment import AssignmentCreate


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.issue_repo = IssueRepository(db)
        self.worker_repo = WorkerRepository(db)
        self.user_repo = UserRepository(db)
        self.notification_service = NotificationService(db)

    async def assign_worker(
        self,
        issue_id: str,
        assignment_in: AssignmentCreate,
        admin_user: User
    ) -> Issue:
        issue = await self.issue_repo.get(issue_id)
        if not issue:
            raise EntityNotFoundException("Issue", issue_id)

        worker = await self.worker_repo.get(assignment_in.worker_id)
        if not worker:
            raise EntityNotFoundException("Worker", assignment_in.worker_id)

        # Create Assignment record
        await self.issue_repo.create_assignment(
            issue_id=issue.id,
            worker_id=worker.id,
            assigned_by_user_id=admin_user.id,
            dispatch_notes=assignment_in.dispatch_notes,
            priority_override=assignment_in.priority_override
        )

        old_status = issue.status
        issue.assigned_worker_id = worker.id
        issue.status = IssueStatus.ASSIGNED
        if assignment_in.priority_override:
            try:
                issue.priority = IssuePriority(assignment_in.priority_override)
            except ValueError:
                pass

        await self.issue_repo.update(issue)

        # Worker load update
        worker.active_issues_count += 1
        worker.status = WorkerStatus.ON_JOB
        await self.worker_repo.update(worker)

        # Audit history
        await self.issue_repo.add_status_history(
            issue_id=issue.id,
            old_status=old_status,
            new_status=IssueStatus.ASSIGNED,
            changed_by_user_id=admin_user.id,
            notes=f"Assigned to specialist {worker.employee_code} ({worker.specialization}). Note: {assignment_in.dispatch_notes or 'Standard dispatch'}"
        )

        # Notify Worker
        if worker.user_id:
            await self.notification_service.notify_user(
                user_id=worker.user_id,
                title="New Task Assignment Dispatched",
                message=f"You have been assigned to {issue.tracking_number}: '{issue.title}' at {issue.address}.",
                notification_type="task_assigned",
                issue_id=issue.id
            )

        # Notify Citizen
        # Notify citizen
        await self.notification_service.notify_user(
            user_id=issue.reporter_id,
            title="Field Specialist Assigned",
            message=f"A municipal specialist has been assigned to investigate your report ({issue.tracking_number}).",
            notification_type="status_change",
            issue_id=issue.id
        )

        return await self.issue_repo.get(issue.id)

    async def update_issue_status(
        self,
        issue_id: str,
        new_status: IssueStatus,
        notes: Optional[str],
        admin_user: User,
        resolution_notes: Optional[str] = None
    ) -> Issue:
        issue = await self.issue_repo.get(issue_id)
        if not issue:
            raise EntityNotFoundException("Issue", issue_id)

        old_status = issue.status
        issue.status = new_status
        if resolution_notes:
            issue.resolution_notes = resolution_notes
        if new_status == IssueStatus.RESOLVED:
            issue.resolved_at = datetime.now(timezone.utc)

        await self.issue_repo.update(issue)

        await self.issue_repo.add_status_history(
            issue_id=issue.id,
            old_status=old_status,
            new_status=new_status,
            changed_by_user_id=admin_user.id,
            notes=notes or f"Status transitioned to {new_status.value} by administrator."
        )

        # Notify Citizen
        await self.notification_service.notify_user(
            user_id=issue.reporter_id,
            title=f"Status Updated: {new_status.value}",
            message=f"Your report {issue.tracking_number} is now {new_status.value}. {notes or ''}",
            notification_type="status_change",
            issue_id=issue.id
        )

        return await self.issue_repo.get(issue.id)

    async def get_all_workers(self) -> Sequence[Worker]:
        return await self.worker_repo.get_all(limit=200)
