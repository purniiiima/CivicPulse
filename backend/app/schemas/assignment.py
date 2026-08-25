from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.issue_assignment import AssignmentStatus
from app.schemas.worker import WorkerResponse
from app.schemas.user import UserResponse


class AssignmentCreate(BaseModel):
    worker_id: str
    dispatch_notes: Optional[str] = None
    priority_override: Optional[str] = None


class AssignmentUpdate(BaseModel):
    status: AssignmentStatus
    dispatch_notes: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: str
    issue_id: str
    worker_id: str
    assigned_by_user_id: str
    status: AssignmentStatus
    dispatch_notes: Optional[str] = None
    priority_override: Optional[str] = None
    assigned_at: datetime
    acknowledged_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    worker: Optional[WorkerResponse] = None
    assigned_by: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
