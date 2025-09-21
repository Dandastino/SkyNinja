import { apiClient } from './api';

// Flight types
export interface Flight {
  id: number;
  flight_number: string;
  airline_code: string;
  airline_name: string;
  origin_code: string;
  origin_name: string;
  destination_code: string;
  destination_name: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  base_price: number;
  currency: string;
  taxes: number;
  fees: number;
  total_price: number;
  available_seats?: number;
  booking_class?: string;
  aircraft_type?: string;
  stops: number;
  is_direct: boolean;
  created_at: string;
}

export interface FlightSearchRequest {
  origin_code: string;
  destination_code: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  flight_type: 'one_way' | 'round_trip' | 'multi_city';
  preferred_airlines?: string[];
  max_stops: number;
  max_price?: number;
  preferred_currency: string;
}

export interface FlightSearchResponse {
  id: number;
  user_id?: number;
  origin_code: string;
  destination_code: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  flight_type: string;
  search_region?: string;
  search_timestamp: string;
  results_count: number;
  flights: Flight[];
  price_history: PriceHistory[];
}

export interface PriceHistory {
  id: number;
  search_id: number;
  flight_id?: number;
  price: number;
  currency: string;
  region?: string;
  recorded_at: string;
}

export interface PricePredictionRequest {
  flight_id: number;
  prediction_days: number;
}

export interface PricePredictionResponse {
  flight_id: number;
  current_price: number;
  predicted_prices: Array<{
    date: string;
    price: number;
    confidence: number;
  }>;
  recommendation: 'buy_now' | 'wait' | 'price_drop_expected';
  confidence_score: number;
}

export interface PriceAnalysis {
  min_price: number;
  max_price: number;
  avg_price: number;
  current_price: number;
  price_range: number;
  avg_daily_change: number;
  best_buy_date: string;
  worst_buy_date: string;
  data_points: number;
  price_volatility: number;
}

// Flight service
export const flightService = {
  // Search flights
  searchFlights: async (searchRequest: FlightSearchRequest): Promise<Flight[]> => {
    const response = await apiClient.post('/flights/search', searchRequest);
    return response.data;
  },

  // Get flight by ID
  getFlight: async (flightId: number): Promise<Flight> => {
    const response = await apiClient.get(`/flights/${flightId}`);
    return response.data;
  },

  // Get flight price history
  getPriceHistory: async (flightId: number, days: number = 30): Promise<{
    flight_id: number;
    days: number;
    price_history: PriceHistory[];
  }> => {
    const response = await apiClient.get(`/flights/${flightId}/price-history?days=${days}`);
    return response.data;
  },

  // Predict flight price
  predictPrice: async (flightId: number, predictionRequest: PricePredictionRequest): Promise<PricePredictionResponse> => {
    const response = await apiClient.post(`/flights/${flightId}/predict-price`, predictionRequest);
    return response.data;
  },

  // Analyze price patterns
  analyzePricePatterns: async (flightId: number): Promise<PriceAnalysis> => {
    const response = await apiClient.get(`/flights/${flightId}/price-analysis`);
    return response.data;
  },

  // Get search history
  getSearchHistory: async (limit: number = 20): Promise<{
    searches: FlightSearchResponse[];
    total: number;
  }> => {
    const response = await apiClient.get(`/flights/search/history?limit=${limit}`);
    return response.data;
  },
};

// Flight utilities
export const flightUtils = {
  // Format duration
  formatDuration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  // Format price
  formatPrice: (price: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  },

  // Format date and time
  formatDateTime: (dateTime: string): string => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Format date only
  formatDate: (dateTime: string): string => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  },

  // Get flight status
  getFlightStatus: (departureTime: string): 'departed' | 'boarding' | 'scheduled' | 'delayed' => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffMinutes = (departure.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 0) return 'departed';
    if (diffMinutes < 30) return 'boarding';
    if (diffMinutes < 60) return 'scheduled';
    return 'delayed';
  },

  // Calculate time until departure
  getTimeUntilDeparture: (departureTime: string): string => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffMs = departure.getTime() - now.getTime();

    if (diffMs < 0) return 'Departed';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  // Get airline logo URL
  getAirlineLogo: (airlineCode: string): string => {
    return `https://logos.skyscnr.com/images/airlines/favicon/${airlineCode}.png`;
  },

  // Sort flights by price
  sortByPrice: (flights: Flight[], ascending: boolean = true): Flight[] => {
    return [...flights].sort((a, b) => 
      ascending ? a.total_price - b.total_price : b.total_price - a.total_price
    );
  },

  // Sort flights by duration
  sortByDuration: (flights: Flight[], ascending: boolean = true): Flight[] => {
    return [...flights].sort((a, b) => 
      ascending ? a.duration_minutes - b.duration_minutes : b.duration_minutes - a.duration_minutes
    );
  },

  // Sort flights by departure time
  sortByDeparture: (flights: Flight[], ascending: boolean = true): Flight[] => {
    return [...flights].sort((a, b) => {
      const timeA = new Date(a.departure_time).getTime();
      const timeB = new Date(b.departure_time).getTime();
      return ascending ? timeA - timeB : timeB - timeA;
    });
  },

  // Filter flights
  filterFlights: (flights: Flight[], filters: {
    maxPrice?: number;
    maxStops?: number;
    airlines?: string[];
    departureTime?: { start: string; end: string };
  }): Flight[] => {
    return flights.filter(flight => {
      if (filters.maxPrice && flight.total_price > filters.maxPrice) return false;
      if (filters.maxStops !== undefined && flight.stops > filters.maxStops) return false;
      if (filters.airlines && !filters.airlines.includes(flight.airline_code)) return false;
      
      if (filters.departureTime) {
        const departure = new Date(flight.departure_time);
        const start = new Date(filters.departureTime.start);
        const end = new Date(filters.departureTime.end);
        if (departure < start || departure > end) return false;
      }
      
      return true;
    });
  },
};
