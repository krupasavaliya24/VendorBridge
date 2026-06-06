from typing import Optional, List

from sqlalchemy.orm import Session

from app.modules.settings.models import GeneralSetting


class SettingsRepository:
    """Repository for GeneralSetting database operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, category: Optional[str] = None) -> List[GeneralSetting]:
        query = self.db.query(GeneralSetting).filter(GeneralSetting.is_deleted == False)
        if category:
            query = query.filter(GeneralSetting.category == category)
        return query.order_by(GeneralSetting.category, GeneralSetting.key).all()

    def get_by_key(self, key: str) -> Optional[GeneralSetting]:
        return self.db.query(GeneralSetting).filter(
            GeneralSetting.key == key,
            GeneralSetting.is_deleted == False,
        ).first()

    def create(self, setting: GeneralSetting) -> GeneralSetting:
        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update(self, setting: GeneralSetting) -> GeneralSetting:
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def create_or_update(self, key: str, value: str, description: str = None, category: str = "general") -> GeneralSetting:
        setting = self.get_by_key(key)
        if setting:
            setting.value = value
            if description is not None:
                setting.description = description
        else:
            setting = GeneralSetting(key=key, value=value, description=description, category=category)
            self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting
