from sqlalchemy import Column, String, Float, Enum as SAEnum, Text
from app.core.database import BaseEntity
from app.shared.enums import VendorStatus


class Vendor(BaseEntity):
    __tablename__ = "vendors"

    vendor_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    gst_number = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True, default="India")
    status = Column(
        SAEnum(VendorStatus, name="vendor_status_enum", create_constraint=False, native_enum=False),
        nullable=False,
        default=VendorStatus.ACTIVE,
    )
    rating = Column(Float, nullable=True, default=0.0)
