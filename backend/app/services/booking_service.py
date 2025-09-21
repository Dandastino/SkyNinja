import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.booking import Booking, BookingStatus, PaymentStatus
from ..models.flight import Flight
from ..models.user import User
from ..schemas.booking import BookingCreate, BookingResponse, BookingUpdate, PaymentRequest
import logging

logger = logging.getLogger(__name__)


class BookingService:
    def __init__(self):
        pass

    def create_booking(self, db: Session, booking_data: BookingCreate, user: User) -> Booking:
        """Create a new booking."""
        try:
            # Generate unique booking reference
            booking_reference = self._generate_booking_reference()
            
            # Get flight information
            flight = db.query(Flight).filter(Flight.id == booking_data.flight_id).first()
            if not flight:
                raise ValueError(f"Flight {booking_data.flight_id} not found")
            
            # Calculate total price
            total_price = flight.total_price * booking_data.passenger_count
            
            # Create booking
            booking = Booking(
                user_id=user.id,
                booking_reference=booking_reference,
                flight_id=booking_data.flight_id,
                return_flight_id=booking_data.return_flight_id,
                passenger_count=booking_data.passenger_count,
                passenger_details=self._serialize_passenger_details(booking_data.passenger_details),
                total_price=total_price,
                currency=flight.currency,
                taxes=flight.taxes * booking_data.passenger_count,
                fees=flight.fees * booking_data.passenger_count,
                booking_status=BookingStatus.PENDING,
                payment_status=PaymentStatus.PENDING,
                special_requests=booking_data.special_requests,
                booking_notes=booking_data.booking_notes
            )
            
            db.add(booking)
            db.commit()
            db.refresh(booking)
            
            logger.info(f"Booking created: {booking_reference} for user {user.username}")
            return booking
            
        except Exception as e:
            logger.error(f"Error creating booking: {e}")
            raise

    def get_booking(self, db: Session, booking_id: int, user: User) -> Optional[Booking]:
        """Get a booking by ID for a specific user."""
        return db.query(Booking).filter(
            Booking.id == booking_id,
            Booking.user_id == user.id
        ).first()

    def get_user_bookings(self, db: Session, user: User, limit: int = 50) -> List[Booking]:
        """Get all bookings for a user."""
        return db.query(Booking).filter(
            Booking.user_id == user.id
        ).order_by(Booking.booked_at.desc()).limit(limit).all()

    def update_booking(self, db: Session, booking_id: int, booking_update: BookingUpdate, user: User) -> Optional[Booking]:
        """Update a booking."""
        try:
            booking = self.get_booking(db, booking_id, user)
            if not booking:
                return None
            
            # Update fields
            if booking_update.booking_status is not None:
                booking.booking_status = booking_update.booking_status
                if booking_update.booking_status == BookingStatus.CONFIRMED:
                    booking.confirmed_at = datetime.utcnow()
                elif booking_update.booking_status == BookingStatus.CANCELLED:
                    booking.cancelled_at = datetime.utcnow()
            
            if booking_update.payment_status is not None:
                booking.payment_status = booking_update.payment_status
            
            if booking_update.special_requests is not None:
                booking.special_requests = booking_update.special_requests
            
            if booking_update.booking_notes is not None:
                booking.booking_notes = booking_update.booking_notes
            
            db.commit()
            db.refresh(booking)
            
            logger.info(f"Booking updated: {booking.booking_reference}")
            return booking
            
        except Exception as e:
            logger.error(f"Error updating booking: {e}")
            raise

    def cancel_booking(self, db: Session, booking_id: int, user: User) -> bool:
        """Cancel a booking."""
        try:
            booking = self.get_booking(db, booking_id, user)
            if not booking:
                return False
            
            if booking.booking_status in [BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
                return False  # Cannot cancel already cancelled or completed bookings
            
            booking.booking_status = BookingStatus.CANCELLED
            booking.cancelled_at = datetime.utcnow()
            
            db.commit()
            
            logger.info(f"Booking cancelled: {booking.booking_reference}")
            return True
            
        except Exception as e:
            logger.error(f"Error cancelling booking: {e}")
            return False

    def process_payment(self, db: Session, payment_request: PaymentRequest, user: User) -> dict:
        """Process payment for a booking."""
        try:
            booking = self.get_booking(db, payment_request.booking_id, user)
            if not booking:
                return {"success": False, "error": "Booking not found"}
            
            if booking.payment_status == PaymentStatus.COMPLETED:
                return {"success": False, "error": "Payment already processed"}
            
            # Simulate payment processing
            # In a real implementation, this would integrate with payment gateways
            payment_result = self._simulate_payment_processing(payment_request)
            
            if payment_result["success"]:
                booking.payment_status = PaymentStatus.COMPLETED
                booking.booking_status = BookingStatus.CONFIRMED
                booking.confirmed_at = datetime.utcnow()
                db.commit()
                
                logger.info(f"Payment processed successfully for booking: {booking.booking_reference}")
            else:
                booking.payment_status = PaymentStatus.FAILED
                db.commit()
                
                logger.warning(f"Payment failed for booking: {booking.booking_reference}")
            
            return payment_result
            
        except Exception as e:
            logger.error(f"Error processing payment: {e}")
            return {"success": False, "error": str(e)}

    def _generate_booking_reference(self) -> str:
        """Generate a unique booking reference."""
        return f"SKY{str(uuid.uuid4()).replace('-', '').upper()[:8]}"

    def _serialize_passenger_details(self, passenger_details: List[dict]) -> str:
        """Serialize passenger details to JSON string."""
        import json
        return json.dumps([passenger.dict() for passenger in passenger_details])

    def _simulate_payment_processing(self, payment_request: PaymentRequest) -> dict:
        """Simulate payment processing."""
        # In a real implementation, this would integrate with payment gateways
        # like Stripe, PayPal, etc.
        
        import random
        
        # Simulate 95% success rate
        success = random.random() < 0.95
        
        if success:
            return {
                "success": True,
                "transaction_id": f"TXN{str(uuid.uuid4()).replace('-', '').upper()[:12]}",
                "payment_method": payment_request.payment_method,
                "amount": 0,  # Would be calculated from booking
                "currency": "USD",
                "processed_at": datetime.utcnow().isoformat()
            }
        else:
            return {
                "success": False,
                "error": "Payment processing failed",
                "error_code": "PAYMENT_FAILED"
            }
