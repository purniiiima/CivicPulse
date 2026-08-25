from typing import List, Sequence, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.worker import Worker, WorkerStatus
from app.models.issue import Issue, IssueStatus
from app.models.issue_assignment import IssueAssignment, AssignmentStatus
from app.models.user import User
from app.repositories.worker_repository import WorkerRepository
from app.repositories.issue_repository import IssueRepository
from app.services.notification_service import NotificationService
from app.core.exceptions import EntityNotFoundException, ForbiddenException, ValidationException


class WorkerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.worker_repo = WorkerRepository(db)
        self.issue_repo = IssueRepository(db)
        self.notification_service = NotificationService(db)

    async def get_worker_profile(self, user_id: str) -> Worker:
        worker = await self.worker_repo.get_by_user_id(user_id)
        if not worker:
            raise EntityNotFoundException("Worker profile for user", user_id)
        return worker

    async def get_assigned_issues(self, user_id: str) -> List[Issue]:
        worker = await self.get_worker_profile(user_id)
        issues, _ = await self.issue_repo.filter_issues(
            assigned_worker_id=worker.id,
            page_size=100
        )
        return issues

    async def accept_assignment(self, assignment_id: str, user: User) -> IssueAssignment:
        assignment = await self.worker_repo.get_assignment_by_id(assignment_id)
        if not assignment:
            raise EntityNotFoundException("IssueAssignment", assignment_id)

        worker = await self.get_worker_profile(user.id)
        if assignment.worker_id != worker.id:
            raise ForbiddenException("You are not assigned to this task.")

        assignment.status = AssignmentStatus.ACCEPTED
        assignment.acknowledged_at = datetime.now(timezone.utc)
        await self.worker_repo.update_assignment(assignment)

        # Update Issue Status to IN_PROGRESS
        issue = await self.issue_repo.get(assignment.issue_id)
        if issue and issue.status != IssueStatus.IN_PROGRESS:
            old_status = issue.status
            issue.status = IssueStatus.IN_PROGRESS
            await self.issue_repo.update(issue)

            await self.issue_repo.add_status_history(
                issue_id=issue.id,
                old_status=old_status,
                new_status=IssueStatus.IN_PROGRESS,
                changed_by_user_id=user.id,
                notes=f"Worker {worker.employee_code} accepted dispatch and started on-site work."
            )

            # Notify Citizen
            await self.notification_service.notify_user(
                user_id=issue.reporter_id,
                title="Field Specialist On The Way",
                message=f"Work has started on your reported issue {issue.tracking_number}.",
                notification_type="in_progress",
                issue_id=issue.id
            )

        return assignment

    async def update_worker_status(
        self,
        issue_id: str,
        new_status: IssueStatus,
        notes: str,
        user: User,
        resolution_photo_url: Optional[str] = None
    ) -> Issue:
        worker = await self.get_worker_profile(user.id)
        issue = await self.issue_repo.get(issue_id)
        if not issue:
            raise EntityNotFoundException("Issue", issue_id)

        if issue.assigned_worker_id != worker.id:
            raise ForbiddenException("You are not the designated worker for this issue.")

        old_status = issue.status
        issue.status = new_status

        if new_status == IssueStatus.RESOLVED:
            issue.resolved_at = datetime.now(timezone.utc)
            issue.resolution_notes = notes
            worker.completed_jobs += 1
            worker.active_issues_count = max(0, worker.active_issues_count - 1)
            worker.status = WorkerStatus.AVAILABLE
            await self.worker_repo.update(worker)

            if resolution_photo_url:
                await self.issue_repo.add_attachment(
                    issue_id=issue.id,
                    user_id=user.id,
                    file_url=resolution_photo_url,
                    stage="RESOLVED"
                )

        await self.issue_repo.update(issue)

        await self.issue_repo.add_status_history(
            issue_id=issue.id,
            old_status=old_status,
            new_status=new_status,
            changed_by_user_id=user.id,
            notes=notes
        )

        # Notify Citizen
        notif_msg = f"Your issue {issue.tracking_number} status changed to {new_status.value}."
        if new_status == IssueStatus.RESOLVED:
            notif_msg = f"Your issue {issue.tracking_number} has been resolved! Please verify and rate the resolution."

        await self.notification_service.notify_user(
            user_id=issue.reporter_id,
            title=f"Status Update: {new_status.value}",
            message=notif_msg,
            notification_type="status_change",
            issue_id=issue.id
        )

        return issue
