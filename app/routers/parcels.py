from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models
from app import schemas
from app.auth import (
    get_current_active_user,
    get_current_admin,
)
from app.utils import generate_tracking_number

router = APIRouter(prefix="/api/parcels", tags=["parcels"])


# ------------------------------------------------------------------
# Admin endpoints — must come BEFORE /{parcel_id} to avoid shadowing
# ------------------------------------------------------------------

@router.get("/admin/all", response_model=List[schemas.ParcelListResponse])
def get_all_parcels(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    query = db.query(models.Parcel)
    if status:
        query = query.filter(models.Parcel.status == status)
    return query.all()


@router.put("/admin/{parcel_id}", response_model=schemas.ParcelResponse)
def update_parcel(
    parcel_id: int,
    parcel_update: schemas.ParcelUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    parcel = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    # Fix: use .model_dump() instead of deprecated .dict()
    update_data = parcel_update.model_dump(exclude_unset=True)
    old_status = parcel.status

    for field, value in update_data.items():
        setattr(parcel, field, value)

    db.commit()
    db.refresh(parcel)

    if 'status' in update_data and update_data['status'] != old_status:
        event_descriptions = {
            "picked_up": "Parcel picked up from sender",
            "in_transit": "Parcel is in transit",
            "out_for_delivery": "Parcel is out for delivery",
            "delivered": "Parcel delivered successfully",
            "cancelled": "Parcel delivery cancelled"
        }
        tracking_event = models.TrackingEvent(
            parcel_id=parcel.id,
            status=parcel.status.value,
            description=event_descriptions.get(parcel.status.value, f"Status updated to {parcel.status.value}")
        )
        db.add(tracking_event)
        db.commit()

    return parcel


@router.post("/admin/{parcel_id}/tracking", response_model=schemas.TrackingEventResponse)
def add_tracking_event(
    parcel_id: int,
    event: schemas.TrackingEventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    parcel = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    tracking_event = models.TrackingEvent(
        parcel_id=parcel_id,
        status=event.status,
        location=event.location,
        description=event.description
    )
    db.add(tracking_event)
    db.commit()
    db.refresh(tracking_event)
    return tracking_event


@router.delete("/admin/{parcel_id}")
def delete_parcel(
    parcel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    parcel = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    db.query(models.TrackingEvent).filter(
        models.TrackingEvent.parcel_id == parcel_id
    ).delete()
    db.delete(parcel)
    db.commit()
    return {"message": "Parcel deleted successfully"}


# ------------------------------------------------------------------
# Customer endpoints
# ------------------------------------------------------------------

@router.post("/create", response_model=schemas.ParcelResponse)
def create_parcel(
    parcel: schemas.ParcelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    receiver = db.query(models.User).filter(models.User.id == parcel.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver not found")

    tracking_number = generate_tracking_number()
    db_parcel = models.Parcel(
        tracking_number=tracking_number,
        sender_id=current_user.id,
        receiver_id=parcel.receiver_id,
        weight=parcel.weight,
        dimensions=parcel.dimensions,
        description=parcel.description,
        category=parcel.category,
        pickup_address=parcel.pickup_address,
        delivery_address=parcel.delivery_address,
        estimated_delivery=parcel.estimated_delivery,
        shipping_cost=parcel.shipping_cost,
        status=models.ParcelStatus.PENDING
    )
    db.add(db_parcel)
    db.commit()
    db.refresh(db_parcel)

    tracking_event = models.TrackingEvent(
        parcel_id=db_parcel.id,
        status=models.ParcelStatus.PENDING.value,
        location=parcel.pickup_address,
        description="Parcel registered and pending pickup"
    )
    db.add(tracking_event)
    db.commit()
    return db_parcel


@router.get("/customers", response_model=List[schemas.UserResponse])
def get_customers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all customers for receiver selection (excludes current user)"""
    # Fix: use .is_(True) for proper Boolean column comparison
    customers = db.query(models.User).filter(
        models.User.role == models.UserRole.CUSTOMER,
        models.User.id != current_user.id,
        models.User.is_active.is_(True)
    ).all()
    return customers


@router.get("/my-parcels", response_model=List[schemas.ParcelListResponse])
def get_my_parcels(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all parcels where user is either sender or receiver"""
    parcels = db.query(models.Parcel).filter(
        (models.Parcel.sender_id == current_user.id) |
        (models.Parcel.receiver_id == current_user.id)
    ).all()
    return parcels


@router.get("/sent", response_model=List[schemas.ParcelListResponse])
def get_sent_parcels(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get parcels sent by current user"""
    return db.query(models.Parcel).filter(
        models.Parcel.sender_id == current_user.id
    ).all()


@router.get("/received", response_model=List[schemas.ParcelListResponse])
def get_received_parcels(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get parcels received by current user"""
    return db.query(models.Parcel).filter(
        models.Parcel.receiver_id == current_user.id
    ).all()


@router.get("/track/{tracking_number}", response_model=schemas.ParcelResponse)
def track_parcel(
    tracking_number: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    parcel = db.query(models.Parcel).filter(
        models.Parcel.tracking_number == tracking_number
    ).first()

    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    if (parcel.sender_id != current_user.id and
            parcel.receiver_id != current_user.id and
            current_user.role != models.UserRole.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this parcel")

    return parcel


# NOTE: This catch-all integer route must remain LAST
@router.get("/{parcel_id}", response_model=schemas.ParcelResponse)
def get_parcel(
    parcel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    parcel = db.query(models.Parcel).filter(models.Parcel.id == parcel_id).first()

    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    if (parcel.sender_id != current_user.id and
            parcel.receiver_id != current_user.id and
            current_user.role != models.UserRole.ADMIN):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this parcel")

    return parcel
