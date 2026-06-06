from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.modules.settings.schemas import (
    SettingResponse,
    SettingUpdateRequest,
    BulkSettingUpdateRequest,
)
from app.modules.settings.service import SettingsService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=List[SettingResponse])
def list_settings(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    service = SettingsService(db)
    settings = service.get_all(category=category)
    return [SettingResponse.model_validate(s) for s in settings]


@router.get("/{key}", response_model=SettingResponse)
def get_setting(
    key: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    service = SettingsService(db)
    setting = service.get_by_key(key)
    return SettingResponse.model_validate(setting)


@router.put("/{key}", response_model=SettingResponse)
def update_setting(
    key: str,
    data: SettingUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    service = SettingsService(db)
    setting = service.update_by_key(key, data)
    return SettingResponse.model_validate(setting)


@router.post("/bulk", response_model=List[SettingResponse])
def bulk_update_settings(
    data: BulkSettingUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    service = SettingsService(db)
    settings = service.bulk_update(data)
    return [SettingResponse.model_validate(s) for s in settings]
