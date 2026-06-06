from sqlalchemy.orm import Session
from .repository import ActivityLogRepository
from .models import ActivityLog
from uuid import UUID

class ActivityLogService:
    def __init__(self, db: Session):
        self.repo = ActivityLogRepository(db)

    def log_action(self, entity_type: str, entity_id: UUID, action: str, performed_by: UUID = None, old_values: dict = None, new_values: dict = None):
        log = ActivityLog(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            performed_by=performed_by,
            old_values=old_values,
            new_values=new_values
        )
        return self.repo.create(log)

    def get_logs(self, entity_type: str = None):
        return self.repo.get_query(entity_type)
