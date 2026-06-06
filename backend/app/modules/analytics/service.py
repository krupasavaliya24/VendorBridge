from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.modules.vendors.models import Vendor
from app.modules.rfqs.models import RFQ
from app.modules.quotations.models import Quotation
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
            PurchaseOrder.status.in_([
                POStatus.ISSUED,
                POStatus.ACKNOWLEDGED,
                POStatus.IN_PROGRESS,
                POStatus.DELIVERED,
                POStatus.COMPLETED,
            ]),
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
        now = datetime.utcnow()
        month_starts = []
        year = now.year
        month = now.month
        for _ in range(6):
            month_starts.append(datetime(year, month, 1))
            month -= 1
            if month == 0:
                month = 12
                year -= 1
        month_starts.reverse()

        first_month = month_starts[0]
        spend_by_month = {month_start.strftime("%b"): 0.0 for month_start in month_starts}
        orders = self.db.query(PurchaseOrder).filter(
            PurchaseOrder.created_on >= first_month,
            PurchaseOrder.status.in_([
                POStatus.ISSUED,
                POStatus.ACKNOWLEDGED,
                POStatus.IN_PROGRESS,
                POStatus.DELIVERED,
                POStatus.COMPLETED,
            ]),
            PurchaseOrder.is_deleted == False,
        ).all()

        for order in orders:
            month_key = order.created_on.strftime("%b")
            if month_key in spend_by_month:
                spend_by_month[month_key] += float(order.grand_total or 0.0)

        return [
            TrendData(month=month_start.strftime("%b"), spend=round(spend_by_month[month_start.strftime("%b")], 2))
            for month_start in month_starts
        ]

    def get_vendor_performance(self):
        vendors = self.db.query(Vendor).filter(Vendor.is_deleted == False).all()
        result = []
        for v in vendors:
            pos = self.db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == v.id, PurchaseOrder.is_deleted == False).all()
            total_spend = sum([po.grand_total for po in pos])
            quotation_ids = [po.quotation_id for po in pos if po.quotation_id]
            deliveries = []
            if quotation_ids:
                quotations = self.db.query(Quotation).filter(Quotation.id.in_(quotation_ids), Quotation.is_deleted == False).all()
                deliveries = [q.delivery_days for q in quotations if q.delivery_days is not None]
            avg_delivery_days = sum(deliveries) / len(deliveries) if deliveries else 0.0
            result.append(VendorPerformance(
                vendor_name=v.name,
                total_pos=len(pos),
                total_spend=float(total_spend),
                avg_delivery_days=round(float(avg_delivery_days), 2),
                rating=float(v.rating or 0)
            ))
        return result
