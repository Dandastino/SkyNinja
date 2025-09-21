from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.flight import FlightType


class FlightSearchRequest(BaseModel):
    origin_code: str
    destination_code: str
    departure_date: datetime
    return_date: Optional[datetime] = None
    passengers: int = 1
    flight_type: FlightType = FlightType.ONE_WAY
    preferred_airlines: Optional[List[str]] = None
    max_stops: int = 2
    max_price: Optional[float] = None
    preferred_currency: str = "USD"


class FlightResponse(BaseModel):
    id: int
    flight_number: str
    airline_code: str
    airline_name: str
    origin_code: str
    origin_name: str
    destination_code: str
    destination_name: str
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int
    base_price: float
    currency: str
    taxes: float
    fees: float
    total_price: float
    available_seats: Optional[int] = None
    booking_class: Optional[str] = None
    aircraft_type: Optional[str] = None
    stops: int
    is_direct: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class PriceHistoryResponse(BaseModel):
    id: int
    search_id: int
    flight_id: Optional[int] = None
    price: float
    currency: str
    region: Optional[str] = None
    recorded_at: datetime
    
    class Config:
        from_attributes = True


class FlightSearchResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    origin_code: str
    destination_code: str
    departure_date: datetime
    return_date: Optional[datetime] = None
    passengers: int
    flight_type: FlightType
    search_region: Optional[str] = None
    search_timestamp: datetime
    results_count: int
    flights: List[FlightResponse] = []
    price_history: List[PriceHistoryResponse] = []
    
    class Config:
        from_attributes = True


class PricePredictionRequest(BaseModel):
    flight_id: int
    prediction_days: int = 30


class PricePredictionResponse(BaseModel):
    flight_id: int
    current_price: float
    predicted_prices: List[dict]  # [{"date": "2024-01-01", "price": 299.99, "confidence": 0.85}]
    recommendation: str  # "buy_now", "wait", "price_drop_expected"
    confidence_score: float
