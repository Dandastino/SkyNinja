import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Search, 
  Plane, 
  Calendar, 
  Users, 
  Filter, 
  SortAsc,
  ArrowRight,
  Clock,
  MapPin,
  DollarSign,
  TrendingDown,
  Star,
  Wifi,
  Coffee,
  Utensils
} from 'lucide-react';
import { flightService, Flight, FlightSearchRequest } from '../services/flights';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

interface SearchFilters {
  maxPrice: number;
  maxStops: number;
  airlines: string[];
  departureTime: { start: string; end: string };
}

const FlightSearch = () => {
  const [searchParams] = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const searchForm = useForm<FlightSearchRequest>({
    defaultValues: {
      origin_code: searchParams.get('origin') || '',
      destination_code: searchParams.get('destination') || '',
      departure_date: searchParams.get('departure') || '',
      return_date: searchParams.get('return') || '',
      passengers: parseInt(searchParams.get('passengers') || '1'),
      flight_type: (searchParams.get('type') as 'one_way' | 'round_trip') || 'one_way',
      preferred_airlines: [],
      max_stops: 2,
      max_price: undefined,
      preferred_currency: 'USD'
    }
  });

  const [filters, setFilters] = useState<SearchFilters>({
    maxPrice: 0,
    maxStops: 2,
    airlines: [],
    departureTime: { start: '00:00', end: '23:59' }
  });

  const debouncedSearch = useDebounce(searchForm.watch(), 1000);

  const handleSearch = async (data: FlightSearchRequest) => {
    setIsLoading(true);
    try {
      const results = await flightService.searchFlights(data);
      setFlights(results);
      toast.success(`Found ${results.length} flights`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredFlights = flights.filter(flight => {
    if (filters.maxPrice > 0 && flight.total_price > filters.maxPrice) return false;
    if (flight.stops > filters.maxStops) return false;
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline_code)) return false;
    
    const departureTime = new Date(flight.departure_time).getHours();
    const startHour = parseInt(filters.departureTime.start.split(':')[0]);
    const endHour = parseInt(filters.departureTime.end.split(':')[0]);
    
    if (departureTime < startHour || departureTime > endHour) return false;
    
    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'price':
        comparison = a.total_price - b.total_price;
        break;
      case 'duration':
        comparison = a.duration_minutes - b.duration_minutes;
        break;
      case 'departure':
        comparison = new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  useEffect(() => {
    if (debouncedSearch.origin_code && debouncedSearch.destination_code && debouncedSearch.departure_date) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <form onSubmit={searchForm.handleSubmit(handleSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <input
                  {...searchForm.register('origin_code', { required: true })}
                  type="text"
                  placeholder="City or Airport"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  {...searchForm.register('destination_code', { required: true })}
                  type="text"
                  placeholder="City or Airport"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                <input
                  {...searchForm.register('departure_date', { required: true })}
                  type="date"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
                <input
                  {...searchForm.register('return_date')}
                  type="date"
                  className="input"
                  disabled={searchForm.watch('flight_type') === 'one_way'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <select
                  {...searchForm.register('passengers')}
                  className="input"
                >
                  {[1,2,3,4,5,6,7,8,9].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    {...searchForm.register('flight_type')}
                    type="radio"
                    value="one_way"
                    className="mr-2"
                  />
                  One Way
                </label>
                <label className="flex items-center">
                  <input
                    {...searchForm.register('flight_type')}
                    type="radio"
                    value="round_trip"
                    className="mr-2"
                  />
                  Round Trip
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary btn-lg flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>{isLoading ? 'Searching...' : 'Search Flights'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Header */}
        {flights.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {sortedFlights.length} flights found
              </h2>
              <p className="text-gray-600">
                {searchForm.watch('origin_code')} → {searchForm.watch('destination_code')} • {new Date(searchForm.watch('departure_date')).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline btn-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'price' | 'duration' | 'departure');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="input w-auto"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Shortest</option>
                <option value="duration-desc">Duration: Longest</option>
                <option value="departure-asc">Departure: Earliest</option>
                <option value="departure-desc">Departure: Latest</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-soft p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
                
                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price: ${filters.maxPrice || 'Any'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      step="100"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange({ maxPrice: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Stops */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Stops</label>
                    <select
                      value={filters.maxStops}
                      onChange={(e) => handleFilterChange({ maxStops: parseInt(e.target.value) })}
                      className="input"
                    >
                      <option value={0}>Non-stop only</option>
                      <option value={1}>1 stop max</option>
                      <option value={2}>2 stops max</option>
                      <option value={3}>3+ stops</option>
                    </select>
                  </div>
                  
                  {/* Airlines */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Airlines</label>
                    <div className="space-y-2">
                      {['AA', 'UA', 'DL', 'BA', 'LH', 'AF'].map(airline => (
                        <label key={airline} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.airlines.includes(airline)}
                            onChange={(e) => {
                              const newAirlines = e.target.checked
                                ? [...filters.airlines, airline]
                                : filters.airlines.filter(a => a !== airline);
                              handleFilterChange({ airlines: newAirlines });
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Departure Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departure Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={filters.departureTime.start}
                        onChange={(e) => handleFilterChange({ 
                          departureTime: { ...filters.departureTime, start: e.target.value }
                        })}
                        className="input text-sm"
                      />
                      <input
                        type="time"
                        value={filters.departureTime.end}
                        onChange={(e) => handleFilterChange({ 
                          departureTime: { ...filters.departureTime, end: e.target.value }
                        })}
                        className="input text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flight Results */}
          <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedFlights.length > 0 ? (
              <div className="space-y-4">
                {sortedFlights.map((flight) => (
                  <div key={flight.id} className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Airline Logo */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Plane className="w-6 h-6 text-gray-600" />
                        </div>
                        
                        {/* Flight Details */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="font-semibold text-gray-900">{flight.airline_name}</h3>
                            <span className="text-sm text-gray-600">{flight.flight_number}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">4.5</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(flight.duration_minutes)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Wifi className="w-4 h-4" />
                              <span>WiFi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price and Book */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatPrice(flight.total_price)}
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          per person
                        </div>
                        <Link
                          to={`/booking/new?flight=${flight.id}`}
                          className="btn btn-primary"
                        >
                          Select
                        </Link>
                      </div>
                    </div>
                    
                    {/* Flight Times */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(flight.departure_time).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-sm text-gray-600">{flight.origin_code}</div>
                          <div className="text-xs text-gray-500">{flight.origin_name}</div>
                        </div>
                        
                        <div className="flex-1 mx-6">
                          <div className="flex items-center">
                            <div className="flex-1 h-px bg-gray-300"></div>
                            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                              {formatDuration(flight.duration_minutes)}
                            </div>
                            <div className="flex-1 h-px bg-gray-300"></div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(flight.arrival_time).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-sm text-gray-600">{flight.destination_code}</div>
                          <div className="text-xs text-gray-500">{flight.destination_name}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Departure: {formatDateTime(flight.departure_time)}</span>
                        <span>Arrival: {formatDateTime(flight.arrival_time)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4 text-success-600" />
                        <span className="text-success-600">Price dropped 12%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
                <button
                  onClick={() => setShowFilters(true)}
                  className="btn btn-primary"
                >
                  Adjust Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch;
