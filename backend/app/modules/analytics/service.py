from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.modules.vendors.models import Vendor
from app.modules.rfqs.models import RFQ
from app.modules.approvals.models import ApprovalRequest
from app.modules.purchase_orders.models import PurchaseOrder
from app.modules.invoices.models import Invoice
from app.shared.enums import VendorStatus, RFQStatus, ApprovalStatus, POStatus
from .schemas import DashboardStats, TrendData, VendorPerformance

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_stats(self) -> DashboardStats:
        total_vendors = self.db.query(Vendor).filter(Vendor.status == VendorStatus.ACTIVE, Vendor.is_deleted == False).count()
        active_rfqs = self.db.query(RFQ).filter(RFQ.status == RFQStatus.OPEN, RFQ.is_deleted == False).count()
        pending_approvals = self.db.query(ApprovalRequest).filter(ApprovalRequest.status == ApprovalStatus.PENDING, ApprovalRequest.is_deleted == False).count()
        
        total_po_value = self.db.query(func.sum(PurchaseOrder.grand_total)).filter(
            PurchaseOrder.status.in_([POStatus.ISSUED, POStatus.ACCEPTED, POStatus.COMPLETED]),
            PurchaseOrder.is_deleted == False
        ).scalar() or 0.0

        recent_invoices = self.db.query(Invoice).filter(
            Invoice.created_on >= datetime.utcnow() - timedelta(days=30),
            Invoice.is_deleted == False
        ).count()

        return DashboardStats(
            total_vendors=total_vendors,
            active_rfqs=active_rfqs,
            pending_approvals=pending_approvals,
            total_po_value=float(total_po_value),
            recent_invoices=recent_invoices
        )

    def get_trends(self):
        # A simple mock for trends since doing correct group by month in sqlite/postgres varies.
        # In a real app this would group by date_trunc('month', created_on)
        return [
            TrendData(month="Jan", spend=10000),
            TrendData(month="Feb", spend=15000),
            TrendData(month="Mar", spend=12000),
            TrendData(month="Apr", spend=20000),
            TrendData(month="May", spend=18000),
            TrendData(month="Jun", spend=25000),
        ]

    def get_vendor_performance(self):
        vendors = self.db.query(Vendor).filter(Vendor.is_deleted == False).all()
        result = []
        for v in vendors:
            pos = self.db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == v.id, PurchaseOrder.is_deleted == False).all()
            total_spend = sum([po.grand_total for po in pos])
            result.append(VendorPerformance(
                vendor_name=v.name,
                total_pos=len(pos),
                total_spend=float(total_spend),
                avg_delivery_days=10.0, # Placeholder
                rating=float(v.rating or 0)
            ))
        return result
