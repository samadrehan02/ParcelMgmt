from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, ParcelStatus


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None


# Tracking Event Schemas
class TrackingEventBase(BaseModel):
    status: str
    location: Optional[str] = None
    description: Optional[str] = None


class TrackingEventCreate(TrackingEventBase):
    parcel_id: int


class TrackingEventResponse(TrackingEventBase):
    id: int
    parcel_id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# Parcel Schemas
class ParcelBase(BaseModel):
    weight: float
    dimensions: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    pickup_address: str
    delivery_address: str
    estimated_delivery: Optional[datetime] = None
    shipping_cost: Optional[float] = None


class ParcelCreate(ParcelBase):
    receiver_id: Optional[int] = None
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    receiver_email: Optional[str] = None


class ParcelUpdate(BaseModel):
    status: Optional[ParcelStatus] = None
    estimated_delivery: Optional[datetime] = None
    shipping_cost: Optional[float] = None
    is_paid: Optional[bool] = None


class ParcelResponse(ParcelBase):
    id: int
    tracking_number: str
    sender_id: int
    receiver_id: Optional[int] = None
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    receiver_email: Optional[str] = None
    status: ParcelStatus
    is_paid: bool
    created_at: datetime
    updated_at: datetime
    sender: Optional[UserResponse] = None
    receiver: Optional[UserResponse] = None
    tracking_history: List[TrackingEventResponse] = []

    class Config:
        from_attributes = True


class ParcelListResponse(BaseModel):
    id: int
    tracking_number: str
    status: ParcelStatus
    sender_id: int
    receiver_id: int
    weight: float
    shipping_cost: Optional[float]
    created_at: datetime
    estimated_delivery: Optional[datetime] = None

    class Config:
        from_attributes = True


# Admin Dashboard Schemas
class DashboardStats(BaseModel):
    total_parcels: int
    total_customers: int
    pending_parcels: int
    delivered_parcels: int
    in_transit_parcels: int
    revenue: float


class TrackingRequest(BaseModel):
    tracking_number: str
