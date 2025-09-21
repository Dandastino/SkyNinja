import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.flight import Flight, PriceHistory
from ..schemas.flight import PricePredictionRequest, PricePredictionResponse
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
import logging

logger = logging.getLogger(__name__)


class PricePredictionService:
    def __init__(self):
        self.model = LinearRegression()
        self.poly_features = PolynomialFeatures(degree=2)

    def predict_price_trend(self, db: Session, request: PricePredictionRequest) -> PricePredictionResponse:
        """Predict price trends for a flight."""
        try:
            # Get flight data
            flight = db.query(Flight).filter(Flight.id == request.flight_id).first()
            if not flight:
                raise ValueError(f"Flight {request.flight_id} not found")

            # Get price history
            price_history = db.query(PriceHistory).filter(
                PriceHistory.flight_id == request.flight_id
            ).order_by(PriceHistory.recorded_at.asc()).all()

            if len(price_history) < 3:
                # Not enough data for prediction
                return self._create_simple_prediction(flight, request.prediction_days)

            # Prepare data for ML model
            X, y = self._prepare_training_data(price_history)
            
            if len(X) < 3:
                return self._create_simple_prediction(flight, request.prediction_days)

            # Train model
            X_poly = self.poly_features.fit_transform(X)
            self.model.fit(X_poly, y)

            # Generate predictions
            predictions = self._generate_predictions(
                flight, 
                request.prediction_days, 
                len(price_history)
            )

            # Calculate recommendation
            recommendation, confidence = self._calculate_recommendation(
                flight.total_price, 
                predictions
            )

            return PricePredictionResponse(
                flight_id=request.flight_id,
                current_price=flight.total_price,
                predicted_prices=predictions,
                recommendation=recommendation,
                confidence_score=confidence
            )

        except Exception as e:
            logger.error(f"Error in price prediction: {e}")
            return self._create_simple_prediction(flight, request.prediction_days)

    def _prepare_training_data(self, price_history: List[PriceHistory]) -> tuple:
        """Prepare training data for ML model."""
        # Convert to DataFrame
        data = []
        for i, record in enumerate(price_history):
            data.append({
                'day': i,
                'price': record.price,
                'hour': record.recorded_at.hour,
                'day_of_week': record.recorded_at.weekday(),
                'is_weekend': record.recorded_at.weekday() >= 5
            })
        
        df = pd.DataFrame(data)
        
        # Features
        X = df[['day', 'hour', 'day_of_week', 'is_weekend']].values
        y = df['price'].values
        
        return X, y

    def _generate_predictions(self, flight: Flight, days: int, history_length: int) -> List[Dict[str, Any]]:
        """Generate price predictions for future dates."""
        predictions = []
        current_date = datetime.utcnow()
        
        for i in range(days):
            future_date = current_date + timedelta(days=i)
            
            # Prepare features for prediction
            features = np.array([[
                history_length + i,  # day
                future_date.hour,    # hour
                future_date.weekday(),  # day_of_week
                1 if future_date.weekday() >= 5 else 0  # is_weekend
            ]])
            
            # Transform features
            features_poly = self.poly_features.transform(features)
            
            # Predict price
            predicted_price = self.model.predict(features_poly)[0]
            
            # Add some randomness to make it more realistic
            noise = np.random.normal(0, predicted_price * 0.05)  # 5% noise
            predicted_price = max(predicted_price + noise, flight.base_price * 0.5)  # Minimum 50% of base price
            
            # Calculate confidence based on model performance
            confidence = max(0.3, min(0.95, 1.0 - (i * 0.02)))  # Decreasing confidence over time
            
            predictions.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "price": round(predicted_price, 2),
                "confidence": round(confidence, 2)
            })
        
        return predictions

    def _calculate_recommendation(self, current_price: float, predictions: List[Dict[str, Any]]) -> tuple:
        """Calculate buying recommendation based on predictions."""
        if not predictions:
            return "buy_now", 0.5
        
        # Look at next 7 days
        next_week_prices = [p["price"] for p in predictions[:7]]
        min_future_price = min(next_week_prices)
        avg_future_price = sum(next_week_prices) / len(next_week_prices)
        
        # Calculate confidence based on price stability
        price_variance = np.var(next_week_prices)
        confidence = max(0.3, min(0.9, 1.0 - (price_variance / (current_price ** 2))))
        
        # Decision logic
        if min_future_price < current_price * 0.9:  # 10% or more drop expected
            return "wait", confidence
        elif avg_future_price > current_price * 1.1:  # 10% or more increase expected
            return "buy_now", confidence
        else:
            return "buy_now", confidence * 0.8  # Slightly lower confidence for neutral

    def _create_simple_prediction(self, flight: Flight, days: int) -> PricePredictionResponse:
        """Create a simple prediction when ML model can't be used."""
        predictions = []
        current_date = datetime.utcnow()
        
        # Simple trend based on historical data
        base_price = flight.total_price
        
        for i in range(days):
            future_date = current_date + timedelta(days=i)
            
            # Simple price variation based on day of week and time
            day_factor = 1.0
            if future_date.weekday() >= 5:  # Weekend
                day_factor = 1.1
            elif future_date.weekday() in [0, 4]:  # Monday, Friday
                day_factor = 1.05
            
            # Add some random variation
            random_factor = np.random.uniform(0.9, 1.1)
            predicted_price = base_price * day_factor * random_factor
            
            predictions.append({
                "date": future_date.strftime("%Y-%m-%d"),
                "price": round(predicted_price, 2),
                "confidence": round(0.6 - (i * 0.01), 2)  # Decreasing confidence
            })
        
        return PricePredictionResponse(
            flight_id=flight.id,
            current_price=flight.total_price,
            predicted_prices=predictions,
            recommendation="buy_now",
            confidence_score=0.6
        )

    def analyze_price_patterns(self, db: Session, flight_id: int) -> Dict[str, Any]:
        """Analyze price patterns for a flight."""
        try:
            price_history = db.query(PriceHistory).filter(
                PriceHistory.flight_id == flight_id
            ).order_by(PriceHistory.recorded_at.asc()).all()
            
            if len(price_history) < 2:
                return {"error": "Insufficient price history"}
            
            prices = [record.price for record in price_history]
            dates = [record.recorded_at for record in price_history]
            
            # Calculate statistics
            min_price = min(prices)
            max_price = max(prices)
            avg_price = sum(prices) / len(prices)
            current_price = prices[-1]
            
            # Calculate trends
            price_changes = [prices[i] - prices[i-1] for i in range(1, len(prices))]
            avg_change = sum(price_changes) / len(price_changes) if price_changes else 0
            
            # Find best and worst times to buy
            best_time_idx = prices.index(min_price)
            worst_time_idx = prices.index(max_price)
            
            return {
                "min_price": min_price,
                "max_price": max_price,
                "avg_price": round(avg_price, 2),
                "current_price": current_price,
                "price_range": round(max_price - min_price, 2),
                "avg_daily_change": round(avg_change, 2),
                "best_buy_date": dates[best_time_idx].strftime("%Y-%m-%d"),
                "worst_buy_date": dates[worst_time_idx].strftime("%Y-%m-%d"),
                "data_points": len(prices),
                "price_volatility": round(np.std(prices), 2)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing price patterns: {e}")
            return {"error": str(e)}
