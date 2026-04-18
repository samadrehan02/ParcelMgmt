import os
import logging
from dotenv import load_dotenv
load_dotenv()  # Load .env before any other app imports read env vars

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from app import models
from app.database import engine, SessionLocal
from app.routers import auth, parcels, admin
from app.auth import get_password_hash

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get absolute path to app directory for static files and templates
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize demo users if they don't exist
def init_demo_users():
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
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

        # Check if demo customer exists
        customer = db.query(models.User).filter(models.User.username == "demo").first()
        if not customer:
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
    except Exception as e:
        logger.error(f"Error creating demo users: {e}")
        db.rollback()
    finally:
        db.close()

init_demo_users()

app = FastAPI(
    title="Parcel Management System",
    description="A comprehensive parcel management system with FastAPI backend",
    version="1.0.0"
)

# CORS middleware
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files using absolute path
app.mount("/static", StaticFiles(directory=os.path.join(APP_DIR, "static")), name="static")

# Templates using absolute path
templates = Jinja2Templates(directory=os.path.join(APP_DIR, "templates"))

# Include routers
app.include_router(auth.router)
app.include_router(parcels.router)
app.include_router(admin.router)


# Frontend routes
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard_page(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/admin", response_class=HTMLResponse)
def admin_page(request: Request):
    return templates.TemplateResponse("admin_dashboard.html", {"request": request})


@app.get("/track", response_class=HTMLResponse)
def track_page(request: Request):
    return templates.TemplateResponse("track.html", {"request": request})


@app.get("/create-parcel", response_class=HTMLResponse)
def create_parcel_page(request: Request):
    return templates.TemplateResponse("create_parcel.html", {"request": request})


@app.get("/my-parcels", response_class=HTMLResponse)
def my_parcels_page(request: Request):
    return templates.TemplateResponse("my_parcels.html", {"request": request})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
