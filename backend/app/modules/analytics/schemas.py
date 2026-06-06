from pydantic import BaseModel
from typing import List

class DashboardStats(BaseModel):
    total_vendors: int
    active_rfqs: int
    pending_approvals: int
    total_po_value: float
    recent_invoices: int

class TrendData(BaseModel):
    month: str
    spend: float

class VendorPerformance(BaseModel):
    vendor_name: str
    total_pos: int
    total_spend: float
    avg_delivery_days: float
    rating: float
