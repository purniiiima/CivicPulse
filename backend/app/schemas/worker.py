from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.worker import WorkerStatus
from app.schemas.user import UserResponse


class WorkerBase(BaseModel):
    employee_code: str
    specialization: str
    department: str
    phone: str
    status: WorkerStatus = WorkerStatus.AVAILABLE


class WorkerCreate(WorkerBase):
    user_id: str
    organization_id: str


class WorkerUpdate(BaseModel):
    specialization: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[WorkerStatus] = None
    rating: Optional[float] = None


class WorkerResponse(WorkerBase):
    id: str
    user_id: str
    organization_id: str
    rating: float
    completed_jobs: int
    active_issues_count: int
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
