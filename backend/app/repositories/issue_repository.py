from typing import Optional, Sequence, Tuple, List
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func, desc, asc, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.issue import Issue, IssueStatus, IssuePriority
from app.models.issue_category import IssueCategory
from app.models.issue_status_history import IssueStatusHistory
from app.models.issue_comment import IssueComment
from app.models.issue_attachment import IssueAttachment
from app.models.issue_assignment import IssueAssignment, AssignmentStatus
from app.repositories.base_repository import BaseRepository


class IssueRepository(BaseRepository[Issue]):
    def __init__(self, db: AsyncSession):
        super().__init__(Issue, db)

    async def get_by_tracking_number(self, tracking_number: str) -> Optional[Issue]:
        stmt = select(Issue).where(Issue.tracking_number == tracking_number.upper().strip())
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def filter_issues(
        self,
        status: Optional[IssueStatus] = None,
        priority: Optional[IssuePriority] = None,
        category_id: Optional[str] = None,
        ward: Optional[str] = None,
        organization_id: Optional[str] = None,
        reporter_id: Optional[str] = None,
        assigned_worker_id: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[Issue], int]:
        query = select(Issue)
        count_query = select(func.count(Issue.id))

        conditions = []
        if status:
            conditions.append(Issue.status == status)
        if priority:
            conditions.append(Issue.priority == priority)
        if category_id:
            conditions.append(Issue.category_id == category_id)
        if ward:
            conditions.append(Issue.ward == ward)
        if organization_id:
            conditions.append(Issue.organization_id == organization_id)
        if reporter_id:
            conditions.append(Issue.reporter_id == reporter_id)
        if assigned_worker_id:
            conditions.append(Issue.assigned_worker_id == assigned_worker_id)
        if search:
            search_pattern = f"%{search}%"
            conditions.append(
                or_(
                    Issue.title.ilike(search_pattern),
                    Issue.description.ilike(search_pattern),
                    Issue.tracking_number.ilike(search_pattern),
                    Issue.address.ilike(search_pattern),
                    Issue.landmark.ilike(search_pattern)
                )
            )

        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        # Sorting
        sort_column = getattr(Issue, sort_by, Issue.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # Execute
        total_res = await self.db.execute(count_query)
        total = total_res.scalar_one() or 0

        res = await self.db.execute(query)
        items = list(res.scalars().all())

        return items, total

    async def add_status_history(
        self,
        issue_id: str,
        old_status: Optional[IssueStatus],
        new_status: IssueStatus,
        changed_by_user_id: str,
        notes: Optional[str] = None
    ) -> IssueStatusHistory:
        history = IssueStatusHistory(
            issue_id=issue_id,
            old_status=old_status,
            new_status=new_status,
            changed_by_user_id=changed_by_user_id,
            notes=notes
        )
        self.db.add(history)
        await self.db.flush()
        await self.db.refresh(history)
        return history

    async def add_comment(
        self,
        issue_id: str,
        user_id: str,
        content: str,
        is_internal: bool = False
    ) -> IssueComment:
        comment = IssueComment(
            issue_id=issue_id,
            user_id=user_id,
            content=content,
            is_internal=is_internal
        )
        self.db.add(comment)
        await self.db.flush()
        await self.db.refresh(comment)
        return comment

    async def add_attachment(
        self,
        issue_id: str,
        user_id: str,
        file_url: str,
        file_type: str = "image/jpeg",
        stage: str = "REPORTED"
    ) -> IssueAttachment:
        attachment = IssueAttachment(
            issue_id=issue_id,
            user_id=user_id,
            file_url=file_url,
            file_type=file_type,
            stage=stage
        )
        self.db.add(attachment)
        await self.db.flush()
        await self.db.refresh(attachment)
        return attachment

    async def create_assignment(
        self,
        issue_id: str,
        worker_id: str,
        assigned_by_user_id: str,
        dispatch_notes: Optional[str] = None,
        priority_override: Optional[str] = None
    ) -> IssueAssignment:
        assignment = IssueAssignment(
            issue_id=issue_id,
            worker_id=worker_id,
            assigned_by_user_id=assigned_by_user_id,
            status=AssignmentStatus.PENDING,
            dispatch_notes=dispatch_notes,
            priority_override=priority_override
        )
        self.db.add(assignment)
        await self.db.flush()
        await self.db.refresh(assignment)
        return assignment
