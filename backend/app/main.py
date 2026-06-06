from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.core.config import settings
from app.core.exceptions import register_exception_handlers

# Import all models to ensure Alembic/SQLAlchemy knows about them before create_all
from app.modules.auth.models import User
from app.modules.settings.models import GeneralSetting
from app.modules.vendors.models import Vendor
from app.modules.rfqs.models import RFQ, RFQItem, RFQVendor
from app.modules.quotations.models import Quotation, QuotationItem
from app.modules.approvals.models import ApprovalRequest
from app.modules.purchase_orders.models import PurchaseOrder
from app.modules.invoices.models import Invoice
from app.modules.notifications.models import Notification
from app.modules.activity_logs.models import ActivityLog

# Import routers
from app.modules.auth.router import router as auth_router
from app.modules.settings.router import router as settings_router
from app.modules.vendors.router import router as vendors_router
from app.modules.rfqs.router import router as rfqs_router
from app.modules.quotations.router import router as quotations_router
from app.modules.approvals.router import router as approvals_router
from app.modules.purchase_orders.router import router as po_router
from app.modules.invoices.router import router as invoices_router
from app.modules.notifications.router import router as notifications_router
from app.modules.activity_logs.router import router as activity_logs_router
from app.modules.analytics.router import router as analytics_router

# Create tables (for hackathon/demo purposes. Use Alembic in real prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorBridge ERP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

api_prefix = "/api/v1"

app.include_router(auth_router, prefix=api_prefix)
app.include_router(settings_router, prefix=api_prefix)
app.include_router(vendors_router, prefix=api_prefix)
app.include_router(rfqs_router, prefix=api_prefix)
app.include_router(quotations_router, prefix=api_prefix)
app.include_router(approvals_router, prefix=api_prefix)
app.include_router(po_router, prefix=api_prefix)
app.include_router(invoices_router, prefix=api_prefix)
app.include_router(notifications_router, prefix=api_prefix)
app.include_router(activity_logs_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)

@app.get("/")
def root():
    return {"message": "VendorBridge API is running."}
