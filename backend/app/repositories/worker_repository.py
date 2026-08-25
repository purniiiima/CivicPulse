from typing import Optional, Sequence
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.worker import Worker, WorkerStatus
from app.models.issue_assignment import IssueAssignment, AssignmentStatus
from app.repositories.base_repository import BaseRepository


class WorkerRepository(BaseRepository[Worker]):
    def __init__(self, db: AsyncSession):
        super().__init__(Worker, db)

    async def get_by_user_id(self, user_id: str) -> Optional[Worker]:
        stmt = select(Worker).where(Worker.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_employee_code(self, code: str) -> Optional[Worker]:
        stmt = select(Worker).where(Worker.employee_code == code.upper().strip())
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_department(self, department: str) -> Sequence[Worker]:
        stmt = select(Worker).where(Worker.department == department)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_status(self, status: WorkerStatus) -> Sequence[Worker]:
        stmt = select(Worker).where(Worker.status == status)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_assignments_for_worker(self, worker_id: str) -> Sequence[IssueAssignment]:
        stmt = select(IssueAssignment).where(IssueAssignment.worker_id == worker_id).order_by(IssueAssignment.assigned_at.desc())
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_assignment_by_id(self, assignment_id: str) -> Optional[IssueAssignment]:
        stmt = select(IssueAssignment).where(IssueAssignment.id == assignment_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_assignment(self, assignment: IssueAssignment) -> IssueAssignment:
        self.db.add(assignment)
        await self.db.flush()
        await self.db.refresh(assignment)
        return assignment
