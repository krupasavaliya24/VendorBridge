from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.modules.auth.models import User
from app.core.security import hash_password
from app.shared.enums import UserRole
import uuid

def seed_db():
    db = SessionLocal()
    try:
        print("Ensuring bootstrap users...")
        users = [
            ("admin@vendorbridge.com", "Admin User", UserRole.ADMIN),
            ("procurement@vendorbridge.com", "Procurement Manager", UserRole.PROCUREMENT_MANAGER),
            ("vendor@vendorbridge.com", "Vendor User", UserRole.VENDOR),
            ("approver@vendorbridge.com", "Manager User", UserRole.APPROVER),
        ]

        for email, full_name, role in users:
            user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
            if user:
                user.full_name = full_name
                user.role = role
                user.is_active = True
            else:
                db.add(User(
                    email=email,
                    full_name=full_name,
                    role=role,
                    password_hash=hash_password("password123"),
                ))

        db.commit()
        print("Bootstrap users are ready.")

    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
