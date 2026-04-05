from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app import models
from app import schemas
from app.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    # Total parcels
    total_parcels = db.query(models.Parcel).count()

    # Total customers (non-admin users)
    total_customers = db.query(models.User).filter(
        models.User.role == models.UserRole.CUSTOMER
    ).count()

    # Pending parcels
    pending_parcels = db.query(models.Parcel).filter(
        models.Parcel.status == models.ParcelStatus.PENDING
    ).count()

    # Delivered parcels
    delivered_parcels = db.query(models.Parcel).filter(
        models.Parcel.status == models.ParcelStatus.DELIVERED
    ).count()

    # In transit parcels
    in_transit_parcels = db.query(models.Parcel).filter(
        models.Parcel.status.in_([
            models.ParcelStatus.IN_TRANSIT,
            models.ParcelStatus.OUT_FOR_DELIVERY
        ])
    ).count()

    # Total revenue from paid parcels
    revenue = db.query(func.sum(models.Parcel.shipping_cost)).filter(
        models.Parcel.is_paid == True
    ).scalar() or 0.0

    return schemas.DashboardStats(
        total_parcels=total_parcels,
        total_customers=total_customers,
        pending_parcels=pending_parcels,
        delivered_parcels=delivered_parcels,
        in_transit_parcels=in_transit_parcels,
        revenue=revenue
    )


@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    users = db.query(models.User).all()
    return users


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


@router.get("/recent-parcels", response_model=List[schemas.ParcelListResponse])
def get_recent_parcels(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    parcels = db.query(models.Parcel).order_by(
        models.Parcel.created_at.desc()
    ).limit(limit).all()
    return parcels
