from app.core.database import Base, engine
from app.seed import seed_db
from app.modules.auth.models import User
from app.modules.vendors.models import Vendor
from app.modules.rfqs.models import RFQ
from app.modules.quotations.models import Quotation
from app.modules.approvals.models import ApprovalRequest
from app.modules.purchase_orders.models import PurchaseOrder
from app.modules.invoices.models import Invoice
from app.modules.notifications.models import Notification
from app.modules.activity_logs.models import ActivityLog
from app.modules.settings.models import GeneralSetting

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Recreating all tables...")
Base.metadata.create_all(bind=engine)

print("Forcing full database seed...")
# Bypass the vendor check by calling seed_db directly on a fresh schema
seed_db()
print("Database reset and seeded successfully!")
