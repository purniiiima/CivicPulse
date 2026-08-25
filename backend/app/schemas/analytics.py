from typing import List, Dict, Any
from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class CategoryDistribution(BaseModel):
    category: str
    count: int
    sla_compliance_rate: float


class WardMetric(BaseModel):
    ward: str
    total_issues: int
    resolved_issues: int
    avg_resolution_hours: float
    satisfaction_score: float


class DailyTrend(BaseModel):
    date: str
    reported: int
    resolved: int


class AnalyticsOverview(BaseModel):
    total_issues: int
    open_issues: int
    in_progress_issues: int
    resolved_issues: int
    avg_resolution_hours: float
    citizen_satisfaction_rate: float
    active_workers_count: int
    status_distribution: List[StatusCount]
    category_distribution: List[CategoryDistribution]
    ward_performance: List[WardMetric]
    daily_trends: List[DailyTrend]
