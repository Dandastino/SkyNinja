import { apiClient } from './api';

// Booking types
export interface PassengerDetail {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_number?: string;
  nationality: string;
  seat_preference?: string;
  meal_preference?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  booking_reference: string;
  flight_id: number;
  return_flight_id?: number;
  passenger_count: number;
  passenger_details: PassengerDetail[];
  total_price: number;
  currency: string;
  taxes: number;
  fees: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  external_booking_id?: string;
  booking_provider?: string;
  booked_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  special_requests?: string;
  booking_notes?: string;
}

export interface BookingCreate {
  flight_id: number;
  return_flight_id?: number;
  passenger_count: number;
  passenger_details: PassengerDetail[];
  special_requests?: string;
  booking_notes?: string;
}

export interface BookingUpdate {
  booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  special_requests?: string;
  booking_notes?: string;
}

export interface PaymentRequest {
  booking_id: number;
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer';
  payment_details: Record<string, any>;
}

export interface PaymentResponse {
  payment_id: string;
  booking_id: number;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  processed_at?: string;
}

export interface BookingStatus {
  booking_id: number;
  booking_reference: string;
  booking_status: string;
  payment_status: string;
  total_price: number;
  currency: string;
  booked_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
}

// Booking service
export const bookingService = {
  // Create booking
  createBooking: async (bookingData: BookingCreate): Promise<Booking> => {
    const response = await apiClient.post('/bookings/', bookingData);
    return response.data;
  },

  // Get user bookings
  getUserBookings: async (limit: number = 50): Promise<Booking[]> => {
    const response = await apiClient.get(`/bookings/?limit=${limit}`);
    return response.data;
  },

  // Get booking by ID
  getBooking: async (bookingId: number): Promise<Booking> => {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Update booking
  updateBooking: async (bookingId: number, bookingUpdate: BookingUpdate): Promise<Booking> => {
    const response = await apiClient.put(`/bookings/${bookingId}`, bookingUpdate);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId: number): Promise<void> => {
    await apiClient.delete(`/bookings/${bookingId}`);
  },

  // Process payment
  processPayment: async (bookingId: number, paymentRequest: PaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient.post(`/bookings/${bookingId}/payment`, paymentRequest);
    return response.data;
  },

  // Get booking status
  getBookingStatus: async (bookingId: number): Promise<BookingStatus> => {
    const response = await apiClient.get(`/bookings/${bookingId}/status`);
    return response.data;
  },
};

// Booking utilities
export const bookingUtils = {
  // Format booking reference
  formatBookingReference: (reference: string): string => {
    return reference.replace(/(.{4})/g, '$1-').slice(0, -1);
  },

  // Get booking status color
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'text-success-600 bg-success-100';
      case 'pending':
        return 'text-warning-600 bg-warning-100';
      case 'cancelled':
        return 'text-accent-600 bg-accent-100';
      case 'completed':
        return 'text-primary-600 bg-primary-100';
      case 'refunded':
        return 'text-secondary-600 bg-secondary-100';
      default:
        return 'text-secondary-600 bg-secondary-100';
    }
  },

  // Get payment status color
  getPaymentStatusColor: (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-success-600 bg-success-100';
      case 'processing':
        return 'text-warning-600 bg-warning-100';
      case 'failed':
        return 'text-accent-600 bg-accent-100';
      case 'pending':
        return 'text-secondary-600 bg-secondary-100';
      case 'refunded':
        return 'text-primary-600 bg-primary-100';
      default:
        return 'text-secondary-600 bg-secondary-100';
    }
  },

  // Format booking date
  formatBookingDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Calculate days until travel
  getDaysUntilTravel: (departureTime: string): number => {
    const now = new Date();
    const departure = new Date(departureTime);
    const diffMs = departure.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  },

  // Check if booking can be cancelled
  canCancelBooking: (booking: Booking): boolean => {
    const now = new Date();
    const departure = new Date(booking.booked_at); // This should be flight departure time
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return (
      booking.booking_status === 'confirmed' &&
      booking.payment_status === 'completed' &&
      hoursUntilDeparture > 24 // Can cancel up to 24 hours before departure
    );
  },

  // Get passenger display name
  getPassengerDisplayName: (passenger: PassengerDetail): string => {
    return `${passenger.first_name} ${passenger.last_name}`;
  },

  // Validate passenger details
  validatePassengerDetails: (passenger: PassengerDetail): string[] => {
    const errors: string[] = [];
    
    if (!passenger.first_name.trim()) {
      errors.push('First name is required');
    }
    
    if (!passenger.last_name.trim()) {
      errors.push('Last name is required');
    }
    
    if (!passenger.date_of_birth) {
      errors.push('Date of birth is required');
    } else {
      const birthDate = new Date(passenger.date_of_birth);
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 120) {
        errors.push('Invalid date of birth');
      }
    }
    
    if (!passenger.nationality.trim()) {
      errors.push('Nationality is required');
    }
    
    return errors;
  },

  // Calculate total price breakdown
  getPriceBreakdown: (booking: Booking) => {
    const basePrice = booking.total_price - booking.taxes - booking.fees;
    
    return {
      base_price: basePrice,
      taxes: booking.taxes,
      fees: booking.fees,
      total: booking.total_price,
      currency: booking.currency,
    };
  },

  // Sort bookings
  sortBookings: (bookings: Booking[], sortBy: 'date' | 'status' | 'price' = 'date', ascending: boolean = false): Booking[] => {
    return [...bookings].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.booked_at).getTime() - new Date(b.booked_at).getTime();
          break;
        case 'status':
          comparison = a.booking_status.localeCompare(b.booking_status);
          break;
        case 'price':
          comparison = a.total_price - b.total_price;
          break;
      }
      
      return ascending ? comparison : -comparison;
    });
  },

  // Filter bookings
  filterBookings: (bookings: Booking[], filters: {
    status?: string[];
    paymentStatus?: string[];
    dateRange?: { start: string; end: string };
  }): Booking[] => {
    return bookings.filter(booking => {
      if (filters.status && !filters.status.includes(booking.booking_status)) {
        return false;
      }
      
      if (filters.paymentStatus && !filters.paymentStatus.includes(booking.payment_status)) {
        return false;
      }
      
      if (filters.dateRange) {
        const bookingDate = new Date(booking.booked_at);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (bookingDate < startDate || bookingDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  },
};
