import httpx
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..config import settings
from ..models.flight import Flight, FlightSearch, PriceHistory
from ..models.user import User
from ..schemas.flight import FlightSearchRequest, FlightResponse, PricePredictionRequest
from .vpn_service import VPNService
import logging
import json

logger = logging.getLogger(__name__)


class FlightService:
    def __init__(self):
        self.skyscanner_api_key = settings.skyscanner_api_key
        self.skyscanner_base_url = settings.skyscanner_base_url
        self.vpn_service = VPNService()

    async def search_flights(self, db: Session, search_request: FlightSearchRequest, user: Optional[User] = None) -> List[FlightResponse]:
        """Search for flights using multiple APIs and regions."""
        try:
            # Create search record
            search_record = FlightSearch(
                user_id=user.id if user else None,
                origin_code=search_request.origin_code,
                destination_code=search_request.destination_code,
                departure_date=search_request.departure_date,
                return_date=search_request.return_date,
                passengers=search_request.passengers,
                flight_type=search_request.flight_type,
                preferred_airlines=json.dumps(search_request.preferred_airlines) if search_request.preferred_airlines else None,
                max_stops=search_request.max_stops,
                max_price=search_request.max_price,
                preferred_currency=search_request.preferred_currency
            )
            db.add(search_record)
            db.commit()
            db.refresh(search_record)

            # Search from multiple regions using VPN
            all_flights = []
            regions = ["US", "UK", "DE", "FR", "IT"]  # Different regions to search from
            
            for region in regions:
                try:
                    # Switch VPN region
                    await self.vpn_service.switch_region(region)
                    search_record.search_region = region
                    
                    # Search flights from this region
                    region_flights = await self._search_skyscanner(search_request, region)
                    all_flights.extend(region_flights)
                    
                    # Store price history
                    for flight_data in region_flights:
                        price_record = PriceHistory(
                            search_id=search_record.id,
                            price=flight_data.get("price", 0),
                            currency=flight_data.get("currency", "USD"),
                            region=region
                        )
                        db.add(price_record)
                    
                except Exception as e:
                    logger.error(f"Error searching from region {region}: {e}")
                    continue

            # Remove duplicates and sort by price
            unique_flights = self._deduplicate_flights(all_flights)
            sorted_flights = sorted(unique_flights, key=lambda x: x.get("price", float('inf')))
            
            # Store flights in database
            stored_flights = []
            for flight_data in sorted_flights[:50]:  # Limit to top 50 results
                flight = Flight(
                    flight_number=flight_data.get("flight_number", ""),
                    airline_code=flight_data.get("airline_code", ""),
                    airline_name=flight_data.get("airline_name", ""),
                    origin_code=flight_data.get("origin_code", ""),
                    origin_name=flight_data.get("origin_name", ""),
                    destination_code=flight_data.get("destination_code", ""),
                    destination_name=flight_data.get("destination_name", ""),
                    departure_time=flight_data.get("departure_time"),
                    arrival_time=flight_data.get("arrival_time"),
                    duration_minutes=flight_data.get("duration_minutes", 0),
                    base_price=flight_data.get("base_price", 0),
                    currency=flight_data.get("currency", "USD"),
                    taxes=flight_data.get("taxes", 0),
                    fees=flight_data.get("fees", 0),
                    total_price=flight_data.get("price", 0),
                    available_seats=flight_data.get("available_seats"),
                    booking_class=flight_data.get("booking_class"),
                    aircraft_type=flight_data.get("aircraft_type"),
                    stops=flight_data.get("stops", 0),
                    is_direct=flight_data.get("is_direct", True),
                    external_id=flight_data.get("external_id"),
                    source_api="skyscanner",
                    raw_data=json.dumps(flight_data)
                )
                db.add(flight)
                stored_flights.append(flight)
            
            db.commit()
            
            # Update search record with results count
            search_record.results_count = len(stored_flights)
            db.commit()
            
            # Convert to response format
            return [FlightResponse.from_orm(flight) for flight in stored_flights]
            
        except Exception as e:
            logger.error(f"Error in flight search: {e}")
            raise

    async def _search_skyscanner(self, search_request: FlightSearchRequest, region: str) -> List[Dict[str, Any]]:
        """Search flights using Skyscanner API."""
        if not self.skyscanner_api_key:
            logger.warning("Skyscanner API key not configured")
            return []
        
        try:
            async with httpx.AsyncClient() as client:
                # Create session
                session_url = f"{self.skyscanner_base_url}/pricing/v1.0"
                session_data = {
                    "country": region,
                    "currency": search_request.preferred_currency,
                    "locale": "en-US",
                    "originPlace": search_request.origin_code,
                    "destinationPlace": search_request.destination_code,
                    "outboundDate": search_request.departure_date.strftime("%Y-%m-%d"),
                    "adults": search_request.passengers
                }
                
                if search_request.return_date:
                    session_data["inboundDate"] = search_request.return_date.strftime("%Y-%m-%d")
                
                headers = {
                    "X-RapidAPI-Key": self.skyscanner_api_key,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
                
                response = await client.post(session_url, data=session_data, headers=headers)
                response.raise_for_status()
                
                # Poll for results
                session_key = response.headers.get("Location", "").split("/")[-1]
                results_url = f"{self.skyscanner_base_url}/pricing/uk2/v1.0/{session_key}"
                
                # Poll for results (simplified - in production, use proper polling)
                await asyncio.sleep(2)
                results_response = await client.get(results_url, headers=headers)
                results_response.raise_for_status()
                
                return self._parse_skyscanner_results(results_response.json())
                
        except Exception as e:
            logger.error(f"Error searching Skyscanner: {e}")
            return []

    def _parse_skyscanner_results(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Skyscanner API results."""
        flights = []
        
        try:
            itineraries = results.get("Itineraries", [])
            legs = results.get("Legs", [])
            carriers = results.get("Carriers", [])
            places = results.get("Places", [])
            
            for itinerary in itineraries:
                pricing_options = itinerary.get("PricingOptions", [])
                if not pricing_options:
                    continue
                
                # Get the cheapest option
                cheapest_option = min(pricing_options, key=lambda x: x.get("Price", float('inf')))
                price = cheapest_option.get("Price", 0)
                
                # Get leg information
                outbound_leg_id = itinerary.get("OutboundLegId")
                inbound_leg_id = itinerary.get("InboundLegId")
                
                for leg in legs:
                    if leg.get("Id") == outbound_leg_id:
                        flight_data = self._parse_leg(leg, carriers, places, price)
                        if flight_data:
                            flights.append(flight_data)
                        break
                        
        except Exception as e:
            logger.error(f"Error parsing Skyscanner results: {e}")
        
        return flights

    def _parse_leg(self, leg: Dict[str, Any], carriers: List[Dict], places: List[Dict], price: float) -> Optional[Dict[str, Any]]:
        """Parse a flight leg into our format."""
        try:
            # Get carrier information
            carrier_id = leg.get("Carriers", [0])[0] if leg.get("Carriers") else None
            carrier = next((c for c in carriers if c.get("Id") == carrier_id), {})
            
            # Get origin and destination
            origin_id = leg.get("OriginStation")
            destination_id = leg.get("DestinationStation")
            
            origin = next((p for p in places if p.get("Id") == origin_id), {})
            destination = next((p for p in places if p.get("Id") == destination_id), {})
            
            # Calculate duration
            departure_time = datetime.fromisoformat(leg.get("Departure", "").replace("Z", "+00:00"))
            arrival_time = datetime.fromisoformat(leg.get("Arrival", "").replace("Z", "+00:00"))
            duration_minutes = int((arrival_time - departure_time).total_seconds() / 60)
            
            return {
                "flight_number": f"{carrier.get('Code', '')}{leg.get('FlightNumber', '')}",
                "airline_code": carrier.get("Code", ""),
                "airline_name": carrier.get("Name", ""),
                "origin_code": origin.get("Code", ""),
                "origin_name": origin.get("Name", ""),
                "destination_code": destination.get("Code", ""),
                "destination_name": destination.get("Name", ""),
                "departure_time": departure_time,
                "arrival_time": arrival_time,
                "duration_minutes": duration_minutes,
                "base_price": price * 0.8,  # Estimate base price
                "currency": "USD",
                "taxes": price * 0.15,  # Estimate taxes
                "fees": price * 0.05,  # Estimate fees
                "price": price,
                "stops": len(leg.get("Stops", [])),
                "is_direct": len(leg.get("Stops", [])) == 0,
                "external_id": str(leg.get("Id", "")),
                "available_seats": None,
                "booking_class": "Economy",
                "aircraft_type": None
            }
            
        except Exception as e:
            logger.error(f"Error parsing leg: {e}")
            return None

    def _deduplicate_flights(self, flights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate flights based on flight number and times."""
        seen = set()
        unique_flights = []
        
        for flight in flights:
            key = (
                flight.get("flight_number", ""),
                flight.get("departure_time"),
                flight.get("arrival_time")
            )
            if key not in seen:
                seen.add(key)
                unique_flights.append(flight)
        
        return unique_flights

    def get_flight_by_id(self, db: Session, flight_id: int) -> Optional[Flight]:
        """Get a flight by ID."""
        return db.query(Flight).filter(Flight.id == flight_id).first()

    def get_price_history(self, db: Session, flight_id: int, days: int = 30) -> List[PriceHistory]:
        """Get price history for a flight."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return db.query(PriceHistory).filter(
            PriceHistory.flight_id == flight_id,
            PriceHistory.recorded_at >= cutoff_date
        ).order_by(PriceHistory.recorded_at.desc()).all()
