from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import AnalyticsOverview
from app.routes.auth_routes import router as auth_router
from app.routes.issue_routes import router as issue_router
from app.routes.citizen_routes import router as citizen_router
from app.routes.admin_routes import router as admin_router
from app.routes.worker_routes import router as worker_router, workers_router
from app.routes.category_routes import router as category_router
from app.routes.organization_routes import router as organization_router
from app.routes.notification_routes import router as notification_router
from app.routes.user_routes import router as user_router

api_router = APIRouter()

analytics_router = APIRouter(prefix="/analytics", tags=["System Analytics"])


@analytics_router.get("", response_model=AnalyticsOverview)
async def get_system_analytics(db: AsyncSession = Depends(get_db)):
    """System-wide analytics overview for dashboards."""
    service = AnalyticsService(db)
    return await service.get_overview_metrics()


api_router.include_router(auth_router)
api_router.include_router(issue_router)
api_router.include_router(citizen_router)
api_router.include_router(admin_router)
api_router.include_router(worker_router)
api_router.include_router(workers_router)
api_router.include_router(user_router)
api_router.include_router(category_router)
api_router.include_router(organization_router)
api_router.include_router(notification_router)
api_router.include_router(analytics_router)

