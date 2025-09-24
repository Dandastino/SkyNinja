from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..api.dependencies import get_current_user
from ..models.user import User
from ..services.flight_service import FlightService
from ..services.price_prediction_service import PricePredictionService
from ..schemas.flight import (
    FlightSearchRequest, 
    FlightResponse, 
    PricePredictionRequest,
    PricePredictionResponse
)

router = APIRouter(prefix="/flights", tags=["flights"])
flight_service = FlightService()
price_prediction_service = PricePredictionService()


@router.post("/search", response_model=List[FlightResponse])
async def search_flights(
    search_request: FlightSearchRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Search for flights."""
    try:
        flights = await flight_service.search_flights(db, search_request, current_user)
        return flights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Flight search failed: {str(e)}"
        )


@router.get("/{flight_id}", response_model=FlightResponse)
async def get_flight(
    flight_id: int,
    db: Session = Depends(get_db)
):
    """Get flight details by ID."""
    flight = flight_service.get_flight_by_id(db, flight_id)
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    return flight


@router.get("/{flight_id}/price-history")
async def get_flight_price_history(
    flight_id: int,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get price history for a flight."""
    try:
        price_history = flight_service.get_price_history(db, flight_id, days)
        return {
            "flight_id": flight_id,
            "days": days,
            "price_history": price_history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get price history: {str(e)}"
        )


@router.post("/{flight_id}/predict-price", response_model=PricePredictionResponse)
async def predict_flight_price(
    flight_id: int,
    prediction_request: PricePredictionRequest,
    db: Session = Depends(get_db)
):
    """Predict price trends for a flight."""
    try:
        prediction_request.flight_id = flight_id
        prediction = price_prediction_service.predict_price_trend(db, prediction_request)
        return prediction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Price prediction failed: {str(e)}"
        )


@router.get("/{flight_id}/price-analysis")
async def analyze_flight_price_patterns(
    flight_id: int,
    db: Session = Depends(get_db)
):
    """Analyze price patterns for a flight."""
    try:
        analysis = price_prediction_service.analyze_price_patterns(db, flight_id)
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Price analysis failed: {str(e)}"
        )


@router.get("/search/history")
async def get_search_history(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's flight search history."""
    try:
        from ..models.flight import FlightSearch
        searches = db.query(FlightSearch).filter(
            FlightSearch.user_id == current_user.id
        ).order_by(FlightSearch.search_timestamp.desc()).limit(limit).all()
        
        return {
            "searches": searches,
            "total": len(searches)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get search history: {str(e)}"
        )
