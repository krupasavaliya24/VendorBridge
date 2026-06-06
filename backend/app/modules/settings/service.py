from typing import Optional, List

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ConflictError
from app.modules.settings.models import GeneralSetting
from app.modules.settings.repository import SettingsRepository
from app.modules.settings.schemas import SettingUpdateRequest, BulkSettingUpdateRequest, SettingCreateRequest


DEFAULT_SETTINGS = [
    ("company_name", "VendorBridge", "Company name shown on generated documents.", "general"),
    ("frontend_base_url", "http://localhost:3000", "Public frontend URL used in email links.", "general"),
    ("smtp_host", "", "SMTP server host for transactional email.", "smtp"),
    ("smtp_port", "587", "SMTP server port.", "smtp"),
    ("smtp_username", "", "SMTP username, if authentication is required.", "smtp"),
    ("smtp_password", "", "SMTP password, if authentication is required.", "smtp"),
    ("smtp_from_email", "", "Sender email address for outgoing mail.", "smtp"),
    ("smtp_sender_name", "VendorBridge", "Sender display name for outgoing mail.", "smtp"),
    ("smtp_use_tls", "true", "Use STARTTLS when sending email.", "smtp"),
    ("notification_poll_seconds", "30", "Frontend notification refresh interval in seconds.", "notifications"),
]


class SettingsService:
    """Business logic for settings management."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = SettingsRepository(db)

    def get_all(self, category: Optional[str] = None) -> List[GeneralSetting]:
        self.ensure_defaults()
        return self.repo.get_all(category=category)

    def get_by_key(self, key: str) -> GeneralSetting:
        setting = self.repo.get_by_key(key)
        if not setting:
            raise NotFoundError(f"Setting with key '{key}' not found.")
        return setting

    def get_value(self, key: str, default: str = None) -> Optional[str]:
        """Get a setting value by key, returning default if not found."""
        setting = self.repo.get_by_key(key)
        if setting:
            return setting.value
        return default

    def update_by_key(self, key: str, data: SettingUpdateRequest) -> GeneralSetting:
        setting = self.repo.get_by_key(key)
        if not setting:
            raise NotFoundError(f"Setting with key '{key}' not found.")

        if data.value is not None:
            setting.value = data.value
        if data.description is not None:
            setting.description = data.description

        return self.repo.update(setting)

    def bulk_update(self, data: BulkSettingUpdateRequest) -> List[GeneralSetting]:
        updated = []
        for item in data.settings:
            setting = self.repo.get_by_key(item.key)
            if setting:
                setting.value = item.value
                self.db.commit()
                self.db.refresh(setting)
                updated.append(setting)
        return updated

    def create_setting(self, data: SettingCreateRequest) -> GeneralSetting:
        existing = self.repo.get_by_key(data.key)
        if existing:
            raise ConflictError(f"Setting with key '{data.key}' already exists.")

        setting = GeneralSetting(
            key=data.key,
            value=data.value,
            description=data.description,
            category=data.category,
        )
        return self.repo.create(setting)

    def get_smtp_settings(self) -> dict:
        """Get all SMTP settings as a dictionary."""
        smtp_keys = [
            "smtp_host", "smtp_port", "smtp_username", "smtp_password",
            "smtp_from_email", "smtp_sender_name", "smtp_use_tls",
        ]
        result = {}
        for key in smtp_keys:
            setting = self.repo.get_by_key(key)
            result[key] = setting.value if setting else None
        return result

    def ensure_defaults(self) -> None:
        for key, value, description, category in DEFAULT_SETTINGS:
            if not self.repo.get_by_key(key):
                self.repo.create_or_update(key, value, description=description, category=category)
