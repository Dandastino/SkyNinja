from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.notification import Notification, NotificationType, NotificationStatus
from ..models.user import User
from ..schemas.notification import NotificationCreate, NotificationResponse, NotificationUpdate
import logging
import json

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self):
        pass

    def create_notification(self, db: Session, notification_data: NotificationCreate) -> Notification:
        """Create a new notification."""
        try:
            notification = Notification(
                user_id=notification_data.user_id,
                title=notification_data.title,
                message=notification_data.message,
                notification_type=notification_data.notification_type,
                priority=notification_data.priority,
                scheduled_at=notification_data.scheduled_at,
                related_booking_id=notification_data.related_booking_id,
                related_flight_id=notification_data.related_flight_id,
                related_search_id=notification_data.related_search_id,
                extra_metadata=json.dumps(notification_data.metadata) if notification_data.metadata else None
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            logger.info(f"Notification created for user {notification_data.user_id}: {notification_data.title}")
            return notification
            
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            raise

    def get_user_notifications(self, db: Session, user: User, limit: int = 50, unread_only: bool = False) -> List[Notification]:
        """Get notifications for a user."""
        query = db.query(Notification).filter(Notification.user_id == user.id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        return query.order_by(Notification.created_at.desc()).limit(limit).all()

    def mark_notification_read(self, db: Session, notification_id: int, user: User) -> bool:
        """Mark a notification as read."""
        try:
            notification = db.query(Notification).filter(
                Notification.id == notification_id,
                Notification.user_id == user.id
            ).first()
            
            if not notification:
                return False
            
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False

    def mark_all_notifications_read(self, db: Session, user: User) -> int:
        """Mark all notifications as read for a user."""
        try:
            updated_count = db.query(Notification).filter(
                Notification.user_id == user.id,
                Notification.is_read == False
            ).update({
                "is_read": True,
                "read_at": datetime.utcnow()
            })
            
            db.commit()
            logger.info(f"Marked {updated_count} notifications as read for user {user.username}")
            return updated_count
            
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return 0

    def delete_notification(self, db: Session, notification_id: int, user: User) -> bool:
        """Delete a notification."""
        try:
            notification = db.query(Notification).filter(
                Notification.id == notification_id,
                Notification.user_id == user.id
            ).first()
            
            if not notification:
                return False
            
            db.delete(notification)
            db.commit()
            
            logger.info(f"Notification deleted: {notification_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting notification: {e}")
            return False

    def send_price_drop_notification(self, db: Session, user: User, flight_id: int, old_price: float, new_price: float) -> Notification:
        """Send a price drop notification."""
        price_drop_percent = ((old_price - new_price) / old_price) * 100
        
        notification_data = NotificationCreate(
            user_id=user.id,
            title="Price Drop Alert! 🎉",
            message=f"Great news! The price for your tracked flight has dropped by {price_drop_percent:.1f}% from ${old_price:.2f} to ${new_price:.2f}.",
            notification_type=NotificationType.PRICE_DROP,
            priority=2,  # High priority
            related_flight_id=flight_id,
            extra_metadata={
                "old_price": old_price,
                "new_price": new_price,
                "price_drop_percent": price_drop_percent
            }
        )
        
        return self.create_notification(db, notification_data)

    def send_booking_confirmation(self, db: Session, user: User, booking_id: int, booking_reference: str) -> Notification:
        """Send booking confirmation notification."""
        notification_data = NotificationCreate(
            user_id=user.id,
            title="Booking Confirmed! ✈️",
            message=f"Your booking has been confirmed! Reference: {booking_reference}. Check your email for details.",
            notification_type=NotificationType.BOOKING_CONFIRMATION,
            priority=3,  # Highest priority
            related_booking_id=booking_id,
            extra_metadata={
                "booking_reference": booking_reference
            }
        )
        
        return self.create_notification(db, notification_data)

    def send_flight_reminder(self, db: Session, user: User, flight_id: int, departure_time: datetime) -> Notification:
        """Send flight reminder notification."""
        hours_until_departure = (departure_time - datetime.utcnow()).total_seconds() / 3600
        
        if hours_until_departure <= 24:
            title = "Flight Tomorrow! 🛫"
            message = f"Your flight departs tomorrow at {departure_time.strftime('%H:%M')}. Don't forget to check in!"
        elif hours_until_departure <= 2:
            title = "Flight Departing Soon! ⏰"
            message = f"Your flight departs in {hours_until_departure:.1f} hours. Time to head to the airport!"
        else:
            title = "Flight Reminder 📅"
            message = f"Your flight departs in {hours_until_departure:.1f} hours. Safe travels!"
        
        notification_data = NotificationCreate(
            user_id=user.id,
            title=title,
            message=message,
            notification_type=NotificationType.FLIGHT_REMINDER,
            priority=2,
            related_flight_id=flight_id,
            extra_metadata={
                "departure_time": departure_time.isoformat(),
                "hours_until_departure": hours_until_departure
            }
        )
        
        return self.create_notification(db, notification_data)

    def get_unread_count(self, db: Session, user: User) -> int:
        """Get count of unread notifications for a user."""
        return db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read == False
        ).count()

    def cleanup_old_notifications(self, db: Session, days_old: int = 30) -> int:
        """Clean up old notifications."""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_old)
            
            deleted_count = db.query(Notification).filter(
                Notification.created_at < cutoff_date,
                Notification.is_read == True
            ).delete()
            
            db.commit()
            
            if deleted_count > 0:
                logger.info(f"Cleaned up {deleted_count} old notifications")
            
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up old notifications: {e}")
            return 0
