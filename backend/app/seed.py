from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.core.security import hash_password
from app.shared.enums import UserRole
import uuid

def seed_db():
    db = SessionLocal()
    try:
        # Check if users already exist
        if db.query(User).first():
            print("Database already seeded")
            return

        print("Seeding database...")
        admin = User(email="admin@vendorbridge.com", full_name="Admin User", role=UserRole.ADMIN, password_hash=hash_password("password123"))
        po = User(email="procurement@vendorbridge.com", full_name="PO User", role=UserRole.PROCUREMENT_OFFICER, password_hash=hash_password("password123"))
        vendor = User(email="vendor@vendorbridge.com", full_name="Vendor User", role=UserRole.VENDOR, password_hash=hash_password("password123"))
        approver = User(email="approver@vendorbridge.com", full_name="Manager User", role=UserRole.APPROVER, password_hash=hash_password("password123"))

        db.add_all([admin, po, vendor, approver])
        db.commit()
        print("Database seeded successfully.")

    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
