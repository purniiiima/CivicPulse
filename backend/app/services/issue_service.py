from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.issue import Issue, IssueStatus, IssuePriority
from app.models.user import User, UserRole
from app.models.issue_comment import IssueComment
from app.models.issue_attachment import IssueAttachment
from app.repositories.issue_repository import IssueRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.user_repository import UserRepository
from app.repositories.worker_repository import WorkerRepository
from app.repositories.organization_repository import OrganizationRepository
from app.services.notification_service import NotificationService
from app.core.exceptions import EntityNotFoundException, ForbiddenException, ValidationException
from app.schemas.issue import IssueCreate, IssueUpdate, IssueVerifyRequest, IssueFilterParams
from app.utils.tracking_generator import generate_tracking_number


class IssueService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.issue_repo = IssueRepository(db)
        self.category_repo = CategoryRepository(db)
        self.user_repo = UserRepository(db)
        self.worker_repo = WorkerRepository(db)
        self.org_repo = OrganizationRepository(db)
        self.notification_service = NotificationService(db)

    async def create_issue(self, issue_in: IssueCreate, reporter: User) -> Issue:
        # Resolve category
        category = None
        if issue_in.category_id:
            category = await self.category_repo.get(issue_in.category_id)
            if not category:
                category = await self.category_repo.get_by_slug(issue_in.category_id)

        if not category and issue_in.category:
            cat_str = str(issue_in.category).lower().strip().replace(" ", "_").replace("-", "_")
            category = await self.category_repo.get_by_slug(cat_str)
            if not category:
                categories = await self.category_repo.get_active()
                for c in categories:
                    if c.slug.lower() == cat_str or c.name.lower() == str(issue_in.category).lower():
                        category = c
                        break

        if not category:
            active_cats = await self.category_repo.get_active()
            if active_cats:
                category = active_cats[0]
            else:
                all_cats = await self.category_repo.get_all(limit=1)
                if all_cats:
                    category = all_cats[0]
                else:
                    raise EntityNotFoundException("IssueCategory", issue_in.category_id or issue_in.category or "default")

        # Resolve priority
        priority = IssuePriority.MEDIUM
        if issue_in.priority:
            if isinstance(issue_in.priority, IssuePriority):
                priority = issue_in.priority
            else:
                p_str = str(issue_in.priority).upper().strip()
                try:
                    priority = IssuePriority(p_str)
                except ValueError:
                    priority = IssuePriority.MEDIUM

        # Resolve location fields
        loc = issue_in.location or {}
        address = (issue_in.address or loc.get("address") or "City Central Zone").strip()
        landmark = (issue_in.landmark or loc.get("landmark") or "").strip() or None
        ward = (issue_in.ward or loc.get("wardOrZone") or loc.get("area") or loc.get("ward") or "Ward 1 - Central Metro").strip()

        raw_lat = issue_in.latitude if issue_in.latitude is not None else (loc.get("lat") or loc.get("latitude"))
        raw_lng = issue_in.longitude if issue_in.longitude is not None else (loc.get("lng") or loc.get("longitude"))
        try:
            latitude = float(raw_lat) if raw_lat is not None else 28.6139
        except (ValueError, TypeError):
            latitude = 28.6139

        try:
            longitude = float(raw_lng) if raw_lng is not None else 77.2090
        except (ValueError, TypeError):
            longitude = 77.2090

        # Attachments/images
        attachments = []
        if issue_in.attachments:
            attachments.extend(issue_in.attachments)
        if issue_in.images:
            for img in issue_in.images:
                if img not in attachments:
                    attachments.append(img)

        tracking_num = generate_tracking_number("CP")

        org_id = reporter.organization_id
        if not org_id:
            orgs = await self.org_repo.get_all(limit=1)
            if orgs:
                org_id = orgs[0].id

        new_issue = Issue(
            tracking_number=tracking_num,
            title=issue_in.title.strip(),
            description=issue_in.description.strip(),
            category_id=category.id,
            priority=priority,
            status=IssueStatus.REPORTED,
            address=address,
            landmark=landmark,
            ward=ward,
            latitude=latitude,
            longitude=longitude,
            reporter_id=reporter.id,
            organization_id=org_id
        )

        saved_issue = await self.issue_repo.create(new_issue)

        # Initial Status History
        await self.issue_repo.add_status_history(
            issue_id=saved_issue.id,
            old_status=None,
            new_status=IssueStatus.REPORTED,
            changed_by_user_id=reporter.id,
            notes="Issue submitted by citizen via CivicPulse portal."
        )

        # Attachments if provided
        if attachments:
            for url in attachments:
                await self.issue_repo.add_attachment(
                    issue_id=saved_issue.id,
                    user_id=reporter.id,
                    file_url=url,
                    stage="REPORTED"
                )

        # Reward citizen with points
        reporter.points += 15
        await self.user_repo.update(reporter)

        # Notify citizen
        await self.notification_service.notify_user(
            user_id=reporter.id,
            title="Issue Submitted Successfully",
            message=f"Your report '{saved_issue.title}' ({saved_issue.tracking_number}) has been received and queued for review.",
            notification_type="issue_created",
            issue_id=saved_issue.id
        )

        # Fetch fresh with relationships loaded
        return await self.get_issue_by_id(saved_issue.id)

    async def get_issue_by_id(self, issue_id: str) -> Issue:
        issue = await self.issue_repo.get(issue_id)
        if not issue:
            raise EntityNotFoundException("Issue", issue_id)
        return issue

    async def get_issue_by_tracking(self, tracking_number: str) -> Issue:
        issue = await self.issue_repo.get_by_tracking_number(tracking_number)
        if not issue:
            raise EntityNotFoundException("Issue", tracking_number)
        return issue

    async def list_issues(self, filter_params: IssueFilterParams) -> Tuple[List[Issue], int]:
        return await self.issue_repo.filter_issues(
            status=filter_params.status,
            priority=filter_params.priority,
            category_id=filter_params.category_id,
            ward=filter_params.ward,
            reporter_id=filter_params.reporter_id,
            assigned_worker_id=filter_params.assigned_worker_id,
            search=filter_params.search,
            page=filter_params.page,
            page_size=filter_params.page_size,
            sort_by=filter_params.sort_by,
            sort_order=filter_params.sort_order
        )

    async def add_comment(
        self,
        issue_id: str,
        content: str,
        user: User,
        is_internal: bool = False
    ) -> IssueComment:
        issue = await self.get_issue_by_id(issue_id)

        # Citizens cannot make internal comments
        if is_internal and user.role == UserRole.CITIZEN:
            is_internal = False

        comment = await self.issue_repo.add_comment(
            issue_id=issue.id,
            user_id=user.id,
            content=content.strip(),
            is_internal=is_internal
        )

        # Notify reporter if comment was by staff
        if user.id != issue.reporter_id and not is_internal:
            await self.notification_service.notify_user(
                user_id=issue.reporter_id,
                title="New Update on Your Issue",
                message=f"Official reply on {issue.tracking_number}: {content[:80]}...",
                notification_type="comment_added",
                issue_id=issue.id
            )

        return comment

    async def add_attachment(
        self,
        issue_id: str,
        user: User,
        file_url: str,
        file_type: str = "image/jpeg",
        stage: str = "REPORTED"
    ) -> IssueAttachment:
        issue = await self.get_issue_by_id(issue_id)
        attachment = await self.issue_repo.add_attachment(
            issue_id=issue.id,
            user_id=user.id,
            file_url=file_url,
            file_type=file_type,
            stage=stage
        )
        return attachment

    async def verify_and_rate_issue(
        self,
        issue_id: str,
        verify_data: IssueVerifyRequest,
        user: User
    ) -> Issue:
        issue = await self.get_issue_by_id(issue_id)
        if issue.reporter_id != user.id and user.role not in [UserRole.SUPER_ADMIN, UserRole.ORGANIZATION_ADMIN]:
            raise ForbiddenException("Only the reporting citizen or administrator can verify this issue.")

        old_status = issue.status
        if verify_data.is_satisfactory:
            issue.status = IssueStatus.VERIFIED
            issue.resolution_rating = verify_data.rating
            issue.resolution_feedback = verify_data.feedback
            notes = f"Citizen verified resolution with a rating of {verify_data.rating}/5."
        else:
            issue.status = IssueStatus.IN_PROGRESS
            notes = f"Citizen rejected resolution. Feedback: {verify_data.feedback or 'Work unsatisfactory'}."

        await self.issue_repo.update(issue)

        await self.issue_repo.add_status_history(
            issue_id=issue.id,
            old_status=old_status,
            new_status=issue.status,
            changed_by_user_id=user.id,
            notes=notes
        )

        # Notify assigned worker
        if issue.assigned_worker_id:
            worker = await self.worker_repo.get(issue.assigned_worker_id)
            if worker and worker.user_id:
                await self.notification_service.notify_user(
                    user_id=worker.user_id,
                    title="Citizen Feedback Received",
                    message=f"Rating {verify_data.rating}/5 received on {issue.tracking_number}.",
                    notification_type="verification",
                    issue_id=issue.id
                )

        return await self.get_issue_by_id(issue.id)

    async def upvote_issue(self, issue_id: str, user: User) -> Issue:
        issue = await self.get_issue_by_id(issue_id)
        issue.upvotes_count += 1
        await self.issue_repo.update(issue)
        return issue
