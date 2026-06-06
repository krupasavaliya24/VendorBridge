from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.modules.quotations.models import Quotation, QuotationItem
from app.modules.quotations.repository import QuotationRepository
from app.modules.quotations.schemas import QuotationCreateRequest
from app.modules.vendors.repository import VendorRepository
from app.shared.enums import QuotationStatus
from app.shared.pagination import paginate
from app.shared.utils import generate_number


class QuotationService:
    """Business logic for quotation management."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = QuotationRepository(db)

    def create_quotation(self, data: QuotationCreateRequest, current_user_id: UUID = None) -> Quotation:
        count = self.repo.count() + 1
        quotation_number = generate_number("QTN", count)

        while self.repo.get_by_number(quotation_number):
            count += 1
            quotation_number = generate_number("QTN", count)

        # Calculate total
        total_amount = 0.0
        quotation = Quotation(
            quotation_number=quotation_number,
            rfq_id=data.rfq_id,
            vendor_id=data.vendor_id,
            delivery_days=data.delivery_days,
            notes=data.notes,
            status=QuotationStatus.SUBMITTED,
            created_by=current_user_id,
        )
        self.db.add(quotation)
        self.db.flush()

        for item_data in data.items:
            total_price = round(item_data.quantity * item_data.unit_price, 2)
            total_amount += total_price

            item = QuotationItem(
                quotation_id=quotation.id,
                rfq_item_id=item_data.rfq_item_id,
                item_name=item_data.item_name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=total_price,
                created_by=current_user_id,
            )
            self.db.add(item)

        quotation.total_amount = round(total_amount, 2)

        # Calculate vendor score
        vendor_repo = VendorRepository(self.db)
        vendor = vendor_repo.get_by_id(data.vendor_id)
        vendor_rating = vendor.rating if vendor and vendor.rating else 0.0
        quotation.vendor_score = self._calculate_vendor_score(
            total_amount, data.delivery_days or 0, vendor_rating
        )

        self.db.commit()
        self.db.refresh(quotation)
        return quotation

    def get_quotation(self, quotation_id: UUID) -> Quotation:
        quotation = self.repo.get_by_id(quotation_id)
        if not quotation:
            raise NotFoundError("Quotation not found.")
        return quotation

    def list_quotations(
        self,
        status: Optional[QuotationStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = self.repo.get_all(status=status)
        return paginate(query, page=page, page_size=page_size)

    def compare_quotations(self, rfq_id: UUID) -> List[Quotation]:
        quotations = self.repo.get_by_rfq_id(rfq_id)
        if not quotations:
            return []

        # Recalculate scores for comparison
        vendor_repo = VendorRepository(self.db)
        all_amounts = [q.total_amount for q in quotations if q.total_amount > 0]
        all_delivery = [q.delivery_days for q in quotations if q.delivery_days and q.delivery_days > 0]

        min_amount = min(all_amounts) if all_amounts else 1
        min_delivery = min(all_delivery) if all_delivery else 1

        for q in quotations:
            vendor = vendor_repo.get_by_id(q.vendor_id)
            vendor_rating = vendor.rating if vendor and vendor.rating else 0.0

            # Price score: lower is better (0-100)
            price_score = (min_amount / q.total_amount * 100) if q.total_amount > 0 else 0

            # Delivery score: fewer days is better (0-100)
            delivery_score = (min_delivery / q.delivery_days * 100) if q.delivery_days and q.delivery_days > 0 else 0

            # Rating score: higher is better (0-100)
            rating_score = (vendor_rating / 5.0 * 100) if vendor_rating > 0 else 0

            # Weighted score: 40% price + 30% delivery + 30% rating
            q.vendor_score = round(
                price_score * 0.4 + delivery_score * 0.3 + rating_score * 0.3, 2
            )

        self.db.commit()
        # Return sorted by score desc
        return sorted(quotations, key=lambda q: q.vendor_score or 0, reverse=True)

    def select_quotation(self, quotation_id: UUID, current_user_id: UUID = None) -> Quotation:
        quotation = self.get_quotation(quotation_id)

        if quotation.status != QuotationStatus.SUBMITTED and quotation.status != QuotationStatus.UNDER_REVIEW:
            raise ValidationError("Only submitted or under-review quotations can be selected.")

        quotation.status = QuotationStatus.SELECTED
        quotation.updated_by = current_user_id

        # Reject other quotations for the same RFQ
        other_quotations = self.repo.get_by_rfq_id(quotation.rfq_id)
        for q in other_quotations:
            if q.id != quotation_id and q.status in [QuotationStatus.SUBMITTED, QuotationStatus.UNDER_REVIEW]:
                q.status = QuotationStatus.REJECTED
                q.updated_by = current_user_id

        self.db.commit()
        self.db.refresh(quotation)
        return quotation

    def _calculate_vendor_score(self, total_amount: float, delivery_days: int, vendor_rating: float) -> float:
        """Calculate vendor score: 40% price + 30% delivery + 30% rating."""
        # Normalize scores to 0-100 range
        # For single quotation, use absolute scoring
        price_score = max(0, 100 - (total_amount / 1000))  # Simple normalization
        delivery_score = max(0, 100 - (delivery_days * 2))  # Penalty for longer delivery
        rating_score = (vendor_rating / 5.0 * 100) if vendor_rating > 0 else 0

        return round(price_score * 0.4 + delivery_score * 0.3 + rating_score * 0.3, 2)
