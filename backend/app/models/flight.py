from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class FlightType(enum.Enum):
    ONE_WAY = "one_way"
    ROUND_TRIP = "round_trip"
    MULTI_CITY = "multi_city"


class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    flight_number = Column(String(20), nullable=False)
    airline_code = Column(String(10), nullable=False)
    airline_name = Column(String(100), nullable=False)
    
    # Route information
    origin_code = Column(String(10), nullable=False)
    origin_name = Column(String(100), nullable=False)
    destination_code = Column(String(10), nullable=False)
    destination_name = Column(String(100), nullable=False)
    
    # Flight details
    departure_time = Column(DateTime(timezone=True), nullable=False)
    arrival_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    
    # Pricing
    base_price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    taxes = Column(Float, default=0.0)
    fees = Column(Float, default=0.0)
    total_price = Column(Float, nullable=False)
    
    # Availability
    available_seats = Column(Integer, nullable=True)
    booking_class = Column(String(20), nullable=True)
    
    # Metadata
    aircraft_type = Column(String(50), nullable=True)
    stops = Column(Integer, default=0)
    is_direct = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # External API data
    external_id = Column(String(100), nullable=True)
    source_api = Column(String(50), nullable=True)  # e.g., "skyscanner", "amadeus"
    raw_data = Column(Text, nullable=True)  # JSON string of original API response


class FlightSearch(Base):
    __tablename__ = "flight_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Search parameters
    origin_code = Column(String(10), nullable=False)
    destination_code = Column(String(10), nullable=False)
    departure_date = Column(DateTime(timezone=True), nullable=False)
    return_date = Column(DateTime(timezone=True), nullable=True)
    passengers = Column(Integer, default=1)
    flight_type = Column(Enum(FlightType), default=FlightType.ONE_WAY)
    
    # Search preferences
    preferred_airlines = Column(Text, nullable=True)  # JSON array
    max_stops = Column(Integer, default=2)
    max_price = Column(Float, nullable=True)
    preferred_currency = Column(String(3), default="USD")
    
    # Search metadata
    search_region = Column(String(10), nullable=True)  # VPN region used
    search_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    results_count = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="flight_searches")
    price_history = relationship("PriceHistory", back_populates="search")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    search_id = Column(Integer, ForeignKey("flight_searches.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=True)
    
    # Price data
    price = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    region = Column(String(10), nullable=True)  # VPN region
    
    # Timestamp
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    search = relationship("FlightSearch", back_populates="price_history")
    flight = relationship("Flight")
