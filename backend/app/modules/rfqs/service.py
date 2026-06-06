from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.modules.rfqs.models import RFQ, RFQItem, RFQVendor
from app.modules.rfqs.repository import RFQRepository
from app.modules.rfqs.schemas import RFQCreateRequest, RFQUpdateRequest
from app.shared.enums import RFQStatus
from app.shared.pagination import paginate
from app.shared.utils import generate_number


class RFQService:
    """Business logic for RFQ management."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = RFQRepository(db)

    def create_rfq(self, data: RFQCreateRequest, current_user_id: UUID = None) -> RFQ:
        count = self.repo.count() + 1
        rfq_number = generate_number("RFQ", count)

        while self.repo.get_by_number(rfq_number):
            count += 1
            rfq_number = generate_number("RFQ", count)

        rfq = RFQ(
            rfq_number=rfq_number,
            title=data.title,
            description=data.description,
            deadline=data.deadline,
            status=RFQStatus.DRAFT,
            created_by=current_user_id,
        )
        self.db.add(rfq)
        self.db.flush()

        # Add items
        for item_data in data.items:
            item = RFQItem(
                rfq_id=rfq.id,
                item_name=item_data.item_name,
                specifications=item_data.specifications,
                quantity=item_data.quantity,
                unit=item_data.unit,
                estimated_cost=item_data.estimated_cost,
                created_by=current_user_id,
            )
            self.db.add(item)

        # Add vendor invitations
        for vendor_id in data.vendor_ids:
            rfq_vendor = RFQVendor(
                rfq_id=rfq.id,
                vendor_id=vendor_id,
                invitation_sent=False,
                created_by=current_user_id,
            )
            self.db.add(rfq_vendor)

        self.db.commit()
        self.db.refresh(rfq)
        return rfq

    def get_rfq(self, rfq_id: UUID) -> RFQ:
        rfq = self.repo.get_by_id(rfq_id)
        if not rfq:
            raise NotFoundError("RFQ not found.")
        return rfq

    def list_rfqs(
        self,
        status: Optional[RFQStatus] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = self.repo.get_all(status=status, search=search)
        return paginate(query, page=page, page_size=page_size)

    def update_rfq(self, rfq_id: UUID, data: RFQUpdateRequest, current_user_id: UUID = None) -> RFQ:
        rfq = self.get_rfq(rfq_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(rfq, field, value)

        rfq.updated_by = current_user_id
        return self.repo.update(rfq)

    def publish_rfq(self, rfq_id: UUID, current_user_id: UUID = None) -> RFQ:
        rfq = self.get_rfq(rfq_id)

        if rfq.status != RFQStatus.DRAFT:
            raise ValidationError("Only draft RFQs can be published.")

        rfq.status = RFQStatus.OPEN
        rfq.updated_by = current_user_id

        # Mark invitations as sent
        rfq_vendors = self.repo.get_rfq_vendors(rfq_id)
        vendor_ids = []
        for rv in rfq_vendors:
            rv.invitation_sent = True
            rv.invited_at = datetime.utcnow()
            vendor_ids.append(rv.vendor_id)

        self.db.commit()
        self.db.refresh(rfq)
        return rfq

    def close_rfq(self, rfq_id: UUID, current_user_id: UUID = None) -> RFQ:
        rfq = self.get_rfq(rfq_id)

        if rfq.status != RFQStatus.OPEN:
            raise ValidationError("Only open RFQs can be closed.")

        rfq.status = RFQStatus.CLOSED
        rfq.updated_by = current_user_id
        self.db.commit()
        self.db.refresh(rfq)
        return rfq
