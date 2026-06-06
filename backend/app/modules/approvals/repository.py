from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session, Query

from app.modules.approvals.models import ApprovalRequest
from app.shared.enums import ApprovalStatus


class ApprovalRepository:
    """Repository for ApprovalRequest database operations."""

    def __init__(self, db: Session):
        self.db = db

    def _base_query(self) -> Query:
        return self.db.query(ApprovalRequest).filter(ApprovalRequest.is_deleted == False)

    def get_by_id(self, approval_id: UUID) -> Optional[ApprovalRequest]:
        return self._base_query().filter(ApprovalRequest.id == approval_id).first()

    def get_pending_by_approver(self, approver_id: UUID) -> List[ApprovalRequest]:
        return self._base_query().filter(
            ApprovalRequest.approver_id == approver_id,
            ApprovalRequest.status == ApprovalStatus.PENDING,
        ).order_by(ApprovalRequest.created_on.desc()).all()

    def get_all(self, status: Optional[ApprovalStatus] = None) -> Query:
        query = self._base_query()
        if status:
            query = query.filter(ApprovalRequest.status == status)
        return query.order_by(ApprovalRequest.created_on.desc())

    def get_by_quotation_id(self, quotation_id: UUID) -> Optional[ApprovalRequest]:
        return self._base_query().filter(ApprovalRequest.quotation_id == quotation_id).first()

    def create(self, approval: ApprovalRequest) -> ApprovalRequest:
        self.db.add(approval)
        self.db.commit()
        self.db.refresh(approval)
        return approval

    def update(self, approval: ApprovalRequest) -> ApprovalRequest:
        self.db.commit()
        self.db.refresh(approval)
        return approval

    def count_pending(self) -> int:
        return self._base_query().filter(ApprovalRequest.status == ApprovalStatus.PENDING).count()
