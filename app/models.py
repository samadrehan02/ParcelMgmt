from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"


class ParcelStatus(str, enum.Enum):
    PENDING = "pending"
    PICKED_UP = "pickedup"
    IN_TRANSIT = "intransit"
    OUT_FOR_DELIVERY = "outfordelivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    parcels_sent = relationship("Parcel", foreign_keys="Parcel.sender_id", back_populates="sender")
    parcels_received = relationship("Parcel", foreign_keys="Parcel.receiver_id", back_populates="receiver")


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True, nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional for unregistered receivers

    # Receiver details (for unregistered receivers)
    receiver_name = Column(String, nullable=True)
    receiver_phone = Column(String, nullable=True)
    receiver_email = Column(String, nullable=True)

    # Parcel details
    weight = Column(Float, nullable=False)
    dimensions = Column(String, nullable=True)  # e.g., "10x10x10"
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # e.g., "electronics", "clothing"

    # Addresses
    pickup_address = Column(Text, nullable=False)
    delivery_address = Column(Text, nullable=False)

    # Status and tracking
    status = Column(Enum(ParcelStatus), default=ParcelStatus.PENDING)
    estimated_delivery = Column(DateTime, nullable=True)

    # Pricing
    shipping_cost = Column(Float, nullable=True)
    is_paid = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="parcels_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="parcels_received")
    tracking_history = relationship("TrackingEvent", back_populates="parcel", order_by="TrackingEvent.timestamp.desc()")


class TrackingEvent(Base):
    __tablename__ = "tracking_events"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id"), nullable=False)
    status = Column(String, nullable=False)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utcnow)

    parcel = relationship("Parcel", back_populates="tracking_history")
