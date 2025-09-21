import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Plane, 
  User, 
  CreditCard, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Users
} from 'lucide-react';
import { bookingService, Booking, PassengerDetail } from '../services/bookings';
import { flightService, Flight } from '../services/flights';
import toast from 'react-hot-toast';

interface BookingForm {
  passengers: PassengerDetail[];
  special_requests?: string;
  booking_notes?: string;
}

const BookingPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<BookingForm>({
    defaultValues: {
      passengers: [
        {
          first_name: '',
          last_name: '',
          date_of_birth: '',
          nationality: '',
          passport_number: '',
          seat_preference: '',
          meal_preference: ''
        }
      ],
      special_requests: '',
      booking_notes: ''
    }
  });

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setIsLoading(true);
      const bookingData = await bookingService.getBooking(parseInt(bookingId!));
      setBooking(bookingData);
      
      if (bookingData.flight_id) {
        const flightData = await flightService.getFlight(bookingData.flight_id);
        setFlight(flightData);
      }
    } catch (error) {
      console.error('Failed to load booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: BookingForm) => {
    if (!flight) return;
    
    setIsProcessing(true);
    try {
      const newBooking = await bookingService.createBooking({
        flight_id: flight.id,
        passenger_count: data.passengers.length,
        passenger_details: data.passengers,
        special_requests: data.special_requests,
        booking_notes: data.booking_notes
      });
      
      setBooking(newBooking);
      setCurrentStep(3);
      toast.success('Booking created successfully!');
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsProcessing(false);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking && !flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {booking ? 'Booking Details' : 'Complete Your Booking'}
          </h1>
          <p className="text-gray-600 mt-2">
            {booking ? 'Review your booking information' : 'Fill in your details to complete the booking'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, label: 'Flight Details', icon: <Plane className="w-5 h-5" /> },
              { step: 2, label: 'Passenger Info', icon: <User className="w-5 h-5" /> },
              { step: 3, label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
              { step: 4, label: 'Confirmation', icon: <CheckCircle className="w-5 h-5" /> }
            ].map((step) => (
              <div key={step.step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.step
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.step ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {step.step < 4 && (
                  <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && flight && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Flight Details</h2>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Plane className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{flight.airline_name}</h3>
                        <p className="text-sm text-gray-600">{flight.flight_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(flight.total_price)}
                      </div>
                      <div className="text-sm text-gray-600">per person</div>
                    </div>
                  </div>
                  
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
                          {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m
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
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Departure: {formatDateTime(flight.departure_time)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Arrival: {formatDateTime(flight.arrival_time)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Duration: {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn btn-primary"
                  >
                    Continue to Passenger Details
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <form onSubmit={form.handleSubmit(handleSubmit)} className="bg-white rounded-xl shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Passenger Information</h2>
                
                <div className="space-y-6">
                  {form.watch('passengers').map((_, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Passenger {index + 1}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            {...form.register(`passengers.${index}.first_name`, { required: true })}
                            type="text"
                            className="input"
                            placeholder="John"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            {...form.register(`passengers.${index}.last_name`, { required: true })}
                            type="text"
                            className="input"
                            placeholder="Doe"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth *
                          </label>
                          <input
                            {...form.register(`passengers.${index}.date_of_birth`, { required: true })}
                            type="date"
                            className="input"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nationality *
                          </label>
                          <select
                            {...form.register(`passengers.${index}.nationality`, { required: true })}
                            className="input"
                          >
                            <option value="">Select Nationality</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IT">Italy</option>
                            <option value="ES">Spain</option>
                            <option value="AU">Australia</option>
                            <option value="JP">Japan</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passport Number
                          </label>
                          <input
                            {...form.register(`passengers.${index}.passport_number`)}
                            type="text"
                            className="input"
                            placeholder="A1234567"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seat Preference
                          </label>
                          <select
                            {...form.register(`passengers.${index}.seat_preference`)}
                            className="input"
                          >
                            <option value="">No preference</option>
                            <option value="window">Window</option>
                            <option value="aisle">Aisle</option>
                            <option value="middle">Middle</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    {...form.register('special_requests')}
                    rows={3}
                    className="input"
                    placeholder="Any special requests or requirements..."
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Notes
                  </label>
                  <textarea
                    {...form.register('booking_notes')}
                    rows={2}
                    className="input"
                    placeholder="Additional notes for your booking..."
                  />
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="btn btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn btn-primary"
                  >
                    {isProcessing ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            )}

            {currentStep === 3 && booking && (
              <div className="bg-white rounded-xl shadow-soft p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                  <p className="text-gray-600 mb-6">
                    Your booking has been successfully created. You will receive a confirmation email shortly.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600">Booking Reference</p>
                    <p className="text-lg font-semibold text-gray-900">{booking.booking_reference}</p>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Link to="/dashboard" className="btn btn-primary">
                      View in Dashboard
                    </Link>
                    <button className="btn btn-outline">
                      Download Ticket
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              {flight && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Flight</span>
                    <span className="font-medium">{flight.airline_name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Route</span>
                    <span className="font-medium">{flight.origin_code} → {flight.destination_code}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Passengers</span>
                    <span className="font-medium">{form.watch('passengers').length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">{formatPrice(flight.base_price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium">{formatPrice(flight.taxes + flight.fees)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(flight.total_price * form.watch('passengers').length)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Secure booking protected by SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
