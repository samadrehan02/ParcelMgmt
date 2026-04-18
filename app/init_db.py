"""
Initialize the database with default data.
Run this script to create an admin user.

IMPORTANT: Change default passwords in production!
Set ADMIN_PASSWORD and DEMO_PASSWORD environment variables.
"""
import sys
import os
import logging

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app import models
from app.auth import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
                hashed_password=get_password_hash(os.getenv("ADMIN_PASSWORD", "ChangeMe123!")),
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("Admin user created: admin")
            logger.warning("CHANGE DEFAULT PASSWORD in production!")
        else:
            logger.info("Admin user already exists.")

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
                hashed_password=get_password_hash(os.getenv("DEMO_PASSWORD", "DemoUser123!")),
                is_active=True
            )
            db.add(demo_customer)
            db.commit()
            logger.info("Demo customer created: demo")
        else:
            logger.info("Demo customer already exists.")

    except Exception as e:
        logger.error(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
