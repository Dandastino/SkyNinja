from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class NotificationType(enum.Enum):
    PRICE_DROP = "price_drop"
    PRICE_INCREASE = "price_increase"
    BOOKING_CONFIRMATION = "booking_confirmation"
    BOOKING_CANCELLATION = "booking_cancellation"
    FLIGHT_REMINDER = "flight_reminder"
    SYSTEM_UPDATE = "system_update"


class NotificationStatus(enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Notification content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False)
    
    # Status and delivery
    status = Column(Enum(NotificationStatus), default=NotificationStatus.PENDING)
    is_read = Column(Boolean, default=False)
    
    # Delivery channels
    email_sent = Column(Boolean, default=False)
    push_sent = Column(Boolean, default=False)
    sms_sent = Column(Boolean, default=False)
    
    # Related data
    related_booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    related_flight_id = Column(Integer, ForeignKey("flights.id"), nullable=True)
    related_search_id = Column(Integer, ForeignKey("flight_searches.id"), nullable=True)
    
    # Metadata
    priority = Column(Integer, default=1)  # 1=low, 2=medium, 3=high
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Additional data
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    
    # Relationships
    user = relationship("User", back_populates="notifications")
