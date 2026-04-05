"""
Initialize the database with default data.
Run this script to create an admin user.
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash


def init_db():
    # Create tables
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if admin user exists
        admin = db.query(models.User).filter(models.User.username == "admin").first()

        if not admin:
            # Create default admin user
            admin_user = models.User(
                email="admin@parcelmgmt.com",
                username="admin",
                full_name="Administrator",
                phone="+1234567890",
                address="Admin Office",
                role=models.UserRole.ADMIN,
                hashed_password=get_password_hash("admin123"),
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created successfully!")
            print("Username: admin")
            print("Password: admin123")
        else:
            print("Admin user already exists.")

        # Check if demo customer exists
        customer = db.query(models.User).filter(models.User.username == "demo").first()

        if not customer:
            # Create demo customer
            demo_customer = models.User(
                email="demo@example.com",
                username="demo",
                full_name="Demo Customer",
                phone="+1987654321",
                address="123 Demo Street, Demo City",
                role=models.UserRole.CUSTOMER,
                hashed_password=get_password_hash("demo123"),
                is_active=True
            )
            db.add(demo_customer)
            db.commit()
            print("\nDemo customer created successfully!")
            print("Username: demo")
            print("Password: demo123")
        else:
            print("\nDemo customer already exists.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
