from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.issue import IssueStatus, IssuePriority
from app.schemas.user import UserResponse
from app.schemas.category import CategoryResponse
from app.schemas.worker import WorkerResponse
from app.schemas.history import StatusHistoryResponse
from app.schemas.comment import CommentResponse
from app.schemas.attachment import AttachmentResponse
from app.schemas.assignment import AssignmentResponse


class IssueBase(BaseModel):
    title: str
    description: str
    category_id: Optional[str] = None
    priority: IssuePriority = IssuePriority.MEDIUM
    address: Optional[str] = None
    landmark: Optional[str] = None
    ward: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class IssueCreate(BaseModel):
    title: str
    description: str
    category_id: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str | IssuePriority] = IssuePriority.MEDIUM
    status: Optional[str] = None
    address: Optional[str] = None
    landmark: Optional[str] = None
    ward: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[dict] = None
    attachments: Optional[List[str]] = None
    images: Optional[List[str]] = None
    reporter: Optional[dict] = None
    department: Optional[str] = None
    aiSuggestion: Optional[dict] = None


class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    priority: Optional[IssuePriority] = None
    status: Optional[IssueStatus] = None
    address: Optional[str] = None
    landmark: Optional[str] = None
    ward: Optional[str] = None
    resolution_notes: Optional[str] = None
    assigned_worker_id: Optional[str] = None


class IssueVerifyRequest(BaseModel):
    rating: int  # 1 to 5
    feedback: Optional[str] = None
    is_satisfactory: bool = True


class IssueResponse(IssueBase):
    id: str
    tracking_number: str
    status: IssueStatus
    reporter_id: str
    organization_id: Optional[str] = None
    assigned_worker_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolution_rating: Optional[int] = None
    resolution_feedback: Optional[str] = None
    upvotes_count: int = 0
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    # Nested associations
    reporter: Optional[UserResponse] = None
    category: Optional[CategoryResponse] = None
    assigned_worker: Optional[WorkerResponse] = None
    attachments: List[AttachmentResponse] = []
    status_history: List[StatusHistoryResponse] = []
    comments: List[CommentResponse] = []
    assignments: List[AssignmentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class IssueFilterParams(BaseModel):
    status: Optional[IssueStatus] = None
    priority: Optional[IssuePriority] = None
    category_id: Optional[str] = None
    ward: Optional[str] = None
    search: Optional[str] = None
    reporter_id: Optional[str] = None
    assigned_worker_id: Optional[str] = None
    page: int = 1
    page_size: int = 10
    sort_by: str = "created_at"
    sort_order: str = "desc"
