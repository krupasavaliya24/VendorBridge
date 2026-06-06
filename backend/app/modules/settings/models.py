from sqlalchemy import Column, String, Text
from app.core.database import BaseEntity


class GeneralSetting(BaseEntity):
    __tablename__ = "general_settings"

    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, default="general")
