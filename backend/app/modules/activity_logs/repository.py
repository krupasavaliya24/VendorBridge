from sqlalchemy.orm import Session
from .models import ActivityLog

class ActivityLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_query(self, entity_type: str = None):
        query = self.db.query(ActivityLog).filter(ActivityLog.is_deleted == False)
        if entity_type:
            query = query.filter(ActivityLog.entity_type == entity_type)
        return query.order_by(ActivityLog.created_on.desc())

    def create(self, log: ActivityLog):
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log
