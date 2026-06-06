from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.modules.vendors.models import Vendor
from app.modules.rfqs.models import RFQ, RFQItem, RFQVendor
from app.modules.quotations.models import Quotation, QuotationItem
from app.modules.approvals.models import ApprovalRequest
from app.modules.purchase_orders.models import PurchaseOrder
from app.modules.invoices.models import Invoice
from app.core.security import hash_password
from app.shared.enums import UserRole, VendorStatus, RFQStatus, QuotationStatus, ApprovalStatus, POStatus, InvoiceStatus
from datetime import datetime, timedelta
import uuid

def seed_db():
    db = SessionLocal()
    try:
        # Check if full seed is already done by checking vendors
        if db.query(Vendor).first():
            print("Database already fully seeded.")
            return

        print("Seeding database with full workflow...")
        
        # 1. Users
        admin_id = uuid.uuid4()
        admin = User(id=admin_id, email="admin@vendorbridge.com", full_name="Admin User", role=UserRole.ADMIN, password_hash=hash_password("password123"))
        po_user = User(id=uuid.uuid4(), email="procurement@vendorbridge.com", full_name="PO User", role=UserRole.PROCUREMENT_OFFICER, password_hash=hash_password("password123"))
        vendor_user = User(id=uuid.uuid4(), email="vendor@vendorbridge.com", full_name="Vendor User", role=UserRole.VENDOR, password_hash=hash_password("password123"))
        approver_user = User(id=uuid.uuid4(), email="approver@vendorbridge.com", full_name="Manager User", role=UserRole.APPROVER, password_hash=hash_password("password123"))

        # Only add users if they don't exist
        if not db.query(User).first():
            db.add_all([admin, po_user, vendor_user, approver_user])
            db.flush()

        # 2. Vendors
        v1_id = vendor_user.id  # Map this vendor directly to the vendor user!
        v2_id = uuid.uuid4()
        vendor1 = Vendor(id=v1_id, vendor_code="VND-0001", name="Acme Electronics", category="Electronics", gst_number="27AACCA1234Z1Z5", email=vendor_user.email, phone="9876543210", status=VendorStatus.ACTIVE, rating=4.5, created_by=admin_id)
        vendor2 = Vendor(id=v2_id, vendor_code="VND-0002", name="TechSupply India", category="IT Hardware", gst_number="27BBCCB1234Z1Z5", email="contact@techsupply.in", phone="9876543211", status=VendorStatus.ACTIVE, rating=4.8, created_by=admin_id)
        db.add_all([vendor1, vendor2])
        db.flush()

        # 3. RFQ
        rfq_id = uuid.uuid4()
        rfq = RFQ(id=rfq_id, rfq_number="RFQ-2025-0001", title="Office Laptops Procurement", description="Need 10 high-performance laptops for the engineering team.", deadline=datetime.utcnow() + timedelta(days=7), status=RFQStatus.OPEN, created_by=po_user.id)
        db.add(rfq)
        db.flush()

        # RFQ Items
        item1_id = uuid.uuid4()
        item1 = RFQItem(id=item1_id, rfq_id=rfq_id, item_name="MacBook Pro 16-inch", specifications="M3 Max, 32GB RAM, 1TB SSD", quantity=10, unit="pcs", estimated_cost=250000.0)
        db.add(item1)
        db.flush()

        # Assign Vendors
        db.add(RFQVendor(rfq_id=rfq_id, vendor_id=v1_id, invitation_sent=True, invited_at=datetime.utcnow()))
        db.add(RFQVendor(rfq_id=rfq_id, vendor_id=v2_id, invitation_sent=True, invited_at=datetime.utcnow()))
        db.flush()

        # 4. Quotations
        q1_id = uuid.uuid4()
        q2_id = uuid.uuid4()

        # Vendor 1 Quotation (Slightly more expensive, faster delivery)
        quotation1 = Quotation(id=q1_id, quotation_number="QTN-2025-0001", rfq_id=rfq_id, vendor_id=v1_id, total_amount=2600000.0, delivery_days=5, notes="Ready stock available.", status=QuotationStatus.SUBMITTED, vendor_score=85.5)
        db.add(quotation1)
        db.flush()
        db.add(QuotationItem(quotation_id=q1_id, rfq_item_id=item1_id, unit_price=260000.0, total_price=2600000.0))

        # Vendor 2 Quotation (Cheaper, selected!)
        quotation2 = Quotation(id=q2_id, quotation_number="QTN-2025-0002", rfq_id=rfq_id, vendor_id=v2_id, total_amount=2400000.0, delivery_days=10, notes="Importing directly from manufacturer.", status=QuotationStatus.SELECTED, vendor_score=92.0)
        db.add(quotation2)
        db.flush()
        db.add(QuotationItem(quotation_id=q2_id, rfq_item_id=item1_id, unit_price=240000.0, total_price=2400000.0))
        db.flush()

        # 5. Approval Request
        app_id = uuid.uuid4()
        approval = ApprovalRequest(id=app_id, quotation_id=q2_id, requested_by=po_user.id, approver_id=approver_user.id, status=ApprovalStatus.APPROVED, remarks="Approved based on lowest price and excellent vendor rating.", decided_at=datetime.utcnow())
        db.add(approval)
        db.flush()

        # 6. Purchase Order
        po_id = uuid.uuid4()
        po = PurchaseOrder(id=po_id, po_number="PO-2025-0001", quotation_id=q2_id, vendor_id=v2_id, subtotal=2400000.0, tax_rate=18.0, tax_amount=432000.0, grand_total=2832000.0, status=POStatus.ACKNOWLEDGED, issued_at=datetime.utcnow())
        db.add(po)
        db.flush()

        # 7. Invoice
        inv_id = uuid.uuid4()
        invoice = Invoice(id=inv_id, invoice_number="INV-2025-0001", po_id=po_id, subtotal=2400000.0, tax_amount=432000.0, grand_total=2832000.0, status=InvoiceStatus.ISSUED, issued_at=datetime.utcnow(), due_date=datetime.utcnow() + timedelta(days=30))
        db.add(invoice)

        db.commit()
        print("Database fully seeded with workflow data successfully.")

    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
