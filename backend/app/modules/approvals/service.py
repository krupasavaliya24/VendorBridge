from datetime import datetime
from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.core.events import EventBus, ApprovalApprovedEvent
from app.modules.approvals.models import ApprovalRequest
from app.modules.approvals.repository import ApprovalRepository
from app.modules.approvals.schemas import ApprovalCreateRequest, ApprovalDecideRequest
from app.modules.activity_logs.service import ActivityLogService
from app.modules.notifications.schemas import NotificationCreate
from app.modules.notifications.service import NotificationService
from app.modules.purchase_orders.service import PurchaseOrderService
from app.shared.enums import ApprovalStatus
from app.shared.pagination import paginate


class ApprovalService:
    """Business logic for approval management."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = ApprovalRepository(db)

    def create_approval(self, data: ApprovalCreateRequest, current_user_id: UUID = None) -> ApprovalRequest:
        # Check if approval already exists for this quotation
        existing = self.repo.get_by_quotation_id(data.quotation_id)
        if existing:
            raise ValidationError("An approval request already exists for this quotation.")

        approval = ApprovalRequest(
            quotation_id=data.quotation_id,
            requested_by=current_user_id or data.approver_id,
            approver_id=data.approver_id,
            status=ApprovalStatus.PENDING,
            created_by=current_user_id,
        )
        approval = self.repo.create(approval)
        ActivityLogService(self.db).log_action(
            entity_type="approval",
            entity_id=approval.id,
            action="approval_requested",
            performed_by=current_user_id,
            new_values={"quotation_id": str(data.quotation_id), "approver_id": str(data.approver_id)},
        )
        NotificationService(self.db).create_notification(NotificationCreate(
            user_id=data.approver_id,
            title="Approval requested",
            message="A procurement quotation is waiting for your decision.",
            type="approval_request",
            link="/approvals",
        ))
        return approval

    def get_approval(self, approval_id: UUID) -> ApprovalRequest:
        approval = self.repo.get_by_id(approval_id)
        if not approval:
            raise NotFoundError("Approval request not found.")
        return approval

    def get_pending_approvals(self, approver_id: UUID) -> List[ApprovalRequest]:
        return self.repo.get_pending_by_approver(approver_id)

    def list_approvals(
        self,
        status: Optional[ApprovalStatus] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        query = self.repo.get_all(status=status)
        return paginate(query, page=page, page_size=page_size)

    async def decide_approval(self, approval_id: UUID, data: ApprovalDecideRequest, current_user_id: UUID = None) -> ApprovalRequest:
        approval = self.get_approval(approval_id)

        if approval.status != ApprovalStatus.PENDING:
            raise ValidationError("This approval has already been decided.")

        if data.status not in [ApprovalStatus.APPROVED, ApprovalStatus.REJECTED]:
            raise ValidationError("Decision must be either 'approved' or 'rejected'.")

        approval.status = data.status
        approval.remarks = data.remarks
        approval.decided_at = datetime.utcnow()
        approval.updated_by = current_user_id

        self.db.commit()
        self.db.refresh(approval)

        ActivityLogService(self.db).log_action(
            entity_type="approval",
            entity_id=approval.id,
            action=f"approval_{data.status.value}",
            performed_by=current_user_id,
            new_values={"status": data.status.value, "remarks": data.remarks},
        )
        if approval.requested_by:
            NotificationService(self.db).create_notification(NotificationCreate(
                user_id=approval.requested_by,
                title=f"Approval {data.status.value}",
                message=f"Your procurement approval request was {data.status.value}.",
                type="approval_decided",
                link="/approvals",
            ))

        if data.status == ApprovalStatus.APPROVED:
            PurchaseOrderService(self.db).create_po_from_quotation(
                approval.quotation_id,
                current_user_id=current_user_id,
            )
            event = ApprovalApprovedEvent(
                approval_id=approval.id,
                quotation_id=approval.quotation_id,
                approved_by=current_user_id,
            )
            await EventBus.publish(event)

        return approval
