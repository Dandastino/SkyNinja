from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class BookingStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"


class PaymentStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_reference = Column(String(50), unique=True, index=True, nullable=False)
    
    # Flight information
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    return_flight_id = Column(Integer, ForeignKey("flights.id"), nullable=True)
    
    # Passenger information
    passenger_count = Column(Integer, default=1)
    passenger_details = Column(Text, nullable=False)  # JSON string
    
    # Pricing
    total_price = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    taxes = Column(Float, default=0.0)
    fees = Column(Float, default=0.0)
    
    # Status
    booking_status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # External booking data
    external_booking_id = Column(String(100), nullable=True)
    booking_provider = Column(String(50), nullable=True)  # e.g., "skyscanner", "airline_direct"
    
    # Timestamps
    booked_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Additional data
    special_requests = Column(Text, nullable=True)
    booking_notes = Column(Text, nullable=True)
    raw_booking_data = Column(Text, nullable=True)  # JSON string
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    flight = relationship("Flight", foreign_keys=[flight_id])
    return_flight = relationship("Flight", foreign_keys=[return_flight_id])
