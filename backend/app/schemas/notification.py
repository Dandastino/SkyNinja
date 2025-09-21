from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ..models.notification import NotificationType, NotificationStatus


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    priority: int = 1
    scheduled_at: Optional[datetime] = None
    related_booking_id: Optional[int] = None
    related_flight_id: Optional[int] = None
    related_search_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    status: NotificationStatus
    is_read: bool
    email_sent: bool
    push_sent: bool
    sms_sent: bool
    related_booking_id: Optional[int] = None
    related_flight_id: Optional[int] = None
    related_search_id: Optional[int] = None
    priority: int
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    status: Optional[NotificationStatus] = None


class NotificationPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    price_drop_alerts: bool = True
    booking_reminders: bool = True
    flight_updates: bool = True
    marketing_emails: bool = False
