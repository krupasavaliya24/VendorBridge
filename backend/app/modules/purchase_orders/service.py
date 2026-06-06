from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.modules.activity_logs.service import ActivityLogService
from app.modules.purchase_orders.models import PurchaseOrder
from app.modules.purchase_orders.repository import PurchaseOrderRepository
from app.modules.purchase_orders.schemas import POStatusUpdateRequest
from app.modules.quotations.repository import QuotationRepository
from app.shared.enums import POStatus
from app.shared.pagination import paginate
from app.shared.utils import generate_number, calculate_tax


class PurchaseOrderService:
    """Business logic for purchase order management."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = PurchaseOrderRepository(db)

    def create_po_from_quotation(self, quotation_id: UUID, current_user_id: UUID = None) -> PurchaseOrder:
        """Create a Purchase Order from an approved quotation."""
        # Check if PO already exists for this quotation
        existing = self.repo.get_by_quotation_id(quotation_id)
        if existing:
            return existing

        quotation_repo = QuotationRepository(self.db)
        quotation = quotation_repo.get_by_id(quotation_id)
        if not quotation:
            raise NotFoundError("Quotation not found.")

        count = self.repo.count() + 1
        po_number = generate_number("PO", count)

        while self.repo.get_by_number(po_number):
            count += 1
            po_number = generate_number("PO", count)

        tax_info = calculate_tax(quotation.total_amount)

        po = PurchaseOrder(
            po_number=po_number,
            quotation_id=quotation_id,
            vendor_id=quotation.vendor_id,
            subtotal=tax_info["subtotal"],
            tax_rate=tax_info["tax_rate"],
            tax_amount=tax_info["tax_amount"],
            grand_total=tax_info["grand_total"],
            status=POStatus.ISSUED,
            issued_at=datetime.utcnow(),
            created_by=current_user_id,
        )
        po = self.repo.create(po)
        ActivityLogService(self.db).log_action(
            entity_type="purchase_order",
            entity_id=po.id,
            action="purchase_order_created",
            performed_by=current_user_id,
            new_values={"po_number": po.po_number, "quotation_id": str(quotation_id)},
        )
        return po

    def get_po(self, po_id: UUID) -> PurchaseOrder:
        po = self.repo.get_by_id(po_id)
        if not po:
            raise NotFoundError("Purchase Order not found.")
        return po

    def list_pos(
        self,
        status: Optional[POStatus] = None,
        vendor_id: Optional[UUID] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = self.repo.get_all(status=status, vendor_id=vendor_id)
        return paginate(query, page=page, page_size=page_size)

    def update_status(self, po_id: UUID, data: POStatusUpdateRequest, current_user_id: UUID = None) -> PurchaseOrder:
        po = self.get_po(po_id)
        old_status = po.status.value
        po.status = data.status
        po.updated_by = current_user_id

        if data.status == POStatus.ISSUED and not po.issued_at:
            po.issued_at = datetime.utcnow()

        po = self.repo.update(po)
        ActivityLogService(self.db).log_action(
            entity_type="purchase_order",
            entity_id=po.id,
            action="purchase_order_status_updated",
            performed_by=current_user_id,
            old_values={"status": old_status},
            new_values={"status": po.status.value},
        )
        return po
