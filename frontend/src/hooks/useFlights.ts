import { useQuery, useMutation, useQueryClient } from 'react-query';
import { flightService, FlightSearchRequest, Flight, PricePredictionRequest } from '../services/flights';
import toast from 'react-hot-toast';

// Flight search hook
export const useFlightSearch = (searchRequest: FlightSearchRequest) => {
  return useQuery(
    ['flights', 'search', searchRequest],
    () => flightService.searchFlights(searchRequest),
    {
      enabled: !!(searchRequest.origin_code && searchRequest.destination_code && searchRequest.departure_date),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      onError: (error: any) => {
        console.error('Flight search failed:', error);
        toast.error('Failed to search flights. Please try again.');
      }
    }
  );
};

// Get flight by ID hook
export const useFlight = (flightId: number) => {
  return useQuery(
    ['flights', flightId],
    () => flightService.getFlight(flightId),
    {
      enabled: !!flightId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error: any) => {
        console.error('Failed to load flight:', error);
        toast.error('Failed to load flight details');
      }
    }
  );
};

// Price history hook
export const usePriceHistory = (flightId: number, days: number = 30) => {
  return useQuery(
    ['flights', flightId, 'price-history', days],
    () => flightService.getPriceHistory(flightId, days),
    {
      enabled: !!flightId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error: any) => {
        console.error('Failed to load price history:', error);
        toast.error('Failed to load price history');
      }
    }
  );
};

// Price prediction hook
export const usePricePrediction = (predictionRequest: PricePredictionRequest) => {
  return useQuery(
    ['flights', predictionRequest.flight_id, 'prediction', predictionRequest.prediction_days],
    () => flightService.predictPrice(predictionRequest.flight_id, predictionRequest),
    {
      enabled: !!predictionRequest.flight_id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: any) => {
        console.error('Price prediction failed:', error);
        toast.error('Failed to get price prediction');
      }
    }
  );
};

// Price analysis hook
export const usePriceAnalysis = (flightId: number) => {
  return useQuery(
    ['flights', flightId, 'analysis'],
    () => flightService.analyzePricePatterns(flightId),
    {
      enabled: !!flightId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error: any) => {
        console.error('Price analysis failed:', error);
        toast.error('Failed to analyze price patterns');
      }
    }
  );
};

// Search history hook
export const useSearchHistory = (limit: number = 20) => {
  return useQuery(
    ['flights', 'search-history', limit],
    () => flightService.getSearchHistory(limit),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error: any) => {
        console.error('Failed to load search history:', error);
        toast.error('Failed to load search history');
      }
    }
  );
};

// Flight search mutation
export const useFlightSearchMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(flightService.searchFlights, {
    onSuccess: (data, variables) => {
      // Cache the search results
      queryClient.setQueryData(['flights', 'search', variables], data);
      
      // Invalidate search history to refresh it
      queryClient.invalidateQueries(['flights', 'search-history']);
      
      toast.success(`Found ${data.length} flights`);
    },
    onError: (error: any) => {
      console.error('Flight search failed:', error);
      toast.error('Search failed. Please try again.');
    }
  });
};

// Price prediction mutation
export const usePricePredictionMutation = () => {
  return useMutation(
    ({ flightId, predictionRequest }: { flightId: number; predictionRequest: PricePredictionRequest }) =>
      flightService.predictPrice(flightId, predictionRequest),
    {
      onError: (error: any) => {
        console.error('Price prediction failed:', error);
        toast.error('Failed to get price prediction');
      }
    }
  );
};
