from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..api.dependencies import get_current_user
from ..models.user import User
from ..services.booking_service import BookingService
from ..schemas.booking import (
    BookingCreate, 
    BookingResponse, 
    BookingUpdate,
    PaymentRequest,
    PaymentResponse
)

router = APIRouter(prefix="/bookings", tags=["bookings"])
booking_service = BookingService()


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new booking."""
    try:
        booking = booking_service.create_booking(db, booking_data, current_user)
        return booking
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Booking creation failed: {str(e)}"
        )


@router.get("/", response_model=List[BookingResponse])
async def get_user_bookings(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bookings for the current user."""
    try:
        bookings = booking_service.get_user_bookings(db, current_user, limit)
        return bookings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get bookings: {str(e)}"
        )


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific booking by ID."""
    booking = booking_service.get_booking(db, booking_id, current_user)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a booking."""
    try:
        booking = booking_service.update_booking(db, booking_id, booking_update, current_user)
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        return booking
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Booking update failed: {str(e)}"
        )


@router.delete("/{booking_id}")
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a booking."""
    try:
        success = booking_service.cancel_booking(db, booking_id, current_user)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found or cannot be cancelled"
            )
        return {"message": "Booking cancelled successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Booking cancellation failed: {str(e)}"
        )


@router.post("/{booking_id}/payment", response_model=PaymentResponse)
async def process_payment(
    booking_id: int,
    payment_request: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process payment for a booking."""
    try:
        payment_request.booking_id = booking_id
        result = booking_service.process_payment(db, payment_request, current_user)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Payment processing failed")
            )
        
        return PaymentResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing failed: {str(e)}"
        )


@router.get("/{booking_id}/status")
async def get_booking_status(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get booking status and details."""
    booking = booking_service.get_booking(db, booking_id, current_user)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return {
        "booking_id": booking.id,
        "booking_reference": booking.booking_reference,
        "booking_status": booking.booking_status.value,
        "payment_status": booking.payment_status.value,
        "total_price": booking.total_price,
        "currency": booking.currency,
        "booked_at": booking.booked_at,
        "confirmed_at": booking.confirmed_at,
        "cancelled_at": booking.cancelled_at
    }
