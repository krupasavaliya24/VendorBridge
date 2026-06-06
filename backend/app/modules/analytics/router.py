from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import require_role
from app.shared.enums import UserRole
from .schemas import DashboardStats, TrendData, VendorPerformance
from .service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db), 
    # FIXED: Corrected spelling to PROCUREMENT_MANAGER and removed list brackets []
    user=Depends(require_role(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER, UserRole.APPROVER))
):
    service = AnalyticsService(db)
    return service.get_dashboard_stats()

@router.get("/trends", response_model=List[TrendData])
def get_trends(
    db: Session = Depends(get_db), 
    # FIXED: Corrected spelling to PROCUREMENT_MANAGER and removed list brackets []
    user=Depends(require_role(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER))
):
    service = AnalyticsService(db)
    return service.get_trends()

@router.get("/vendor-performance", response_model=List[VendorPerformance])
def get_vendor_performance(
    db: Session = Depends(get_db), 
    # FIXED: Corrected spelling to PROCUREMENT_MANAGER and removed list brackets []
    user=Depends(require_role(UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER))
):
    service = AnalyticsService(db)
    return service.get_vendor_performance()
