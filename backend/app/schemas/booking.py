from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.booking import BookingStatus, PaymentStatus


class PassengerDetail(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: datetime
    passport_number: Optional[str] = None
    nationality: str
    seat_preference: Optional[str] = None
    meal_preference: Optional[str] = None


class BookingCreate(BaseModel):
    flight_id: int
    return_flight_id: Optional[int] = None
    passenger_count: int = 1
    passenger_details: List[PassengerDetail]
    special_requests: Optional[str] = None
    booking_notes: Optional[str] = None


class BookingUpdate(BaseModel):
    booking_status: Optional[BookingStatus] = None
    payment_status: Optional[PaymentStatus] = None
    special_requests: Optional[str] = None
    booking_notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    booking_reference: str
    flight_id: int
    return_flight_id: Optional[int] = None
    passenger_count: int
    passenger_details: List[Dict[str, Any]]  # JSON data
    total_price: float
    currency: str
    taxes: float
    fees: float
    booking_status: BookingStatus
    payment_status: PaymentStatus
    external_booking_id: Optional[str] = None
    booking_provider: Optional[str] = None
    booked_at: datetime
    confirmed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    special_requests: Optional[str] = None
    booking_notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class BookingWithFlights(BookingResponse):
    flight: Optional["FlightResponse"] = None
    return_flight: Optional["FlightResponse"] = None


class PaymentRequest(BaseModel):
    booking_id: int
    payment_method: str  # "credit_card", "paypal", "bank_transfer"
    payment_details: Dict[str, Any]  # Payment method specific data


class PaymentResponse(BaseModel):
    payment_id: str
    booking_id: int
    amount: float
    currency: str
    status: str
    payment_method: str
    transaction_id: Optional[str] = None
    processed_at: Optional[datetime] = None
