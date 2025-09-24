import { useQuery, useMutation, useQueryClient } from 'react-query';
// Remove unused types: Booking, BookingCreate
import type { BookingUpdate, PaymentRequest } from '../services/bookings';
import { bookingService } from '../services/bookings';
import toast from 'react-hot-toast';

// Get user bookings hook
export const useUserBookings = (limit: number = 50) => {
  return useQuery(
    ['bookings', 'user', limit],
    () => bookingService.getUserBookings(limit),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error: any) => {
        console.error('Failed to load bookings:', error);
        toast.error('Failed to load your bookings');
      }
    }
  );
};

// Get booking by ID hook
export const useBooking = (bookingId: number) => {
  return useQuery(
    ['bookings', bookingId],
    () => bookingService.getBooking(bookingId),
    {
      enabled: !!bookingId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: any) => {
        console.error('Failed to load booking:', error);
        toast.error('Failed to load booking details');
      }
    }
  );
};

// Get booking status hook
export const useBookingStatus = (bookingId: number) => {
  return useQuery(
    ['bookings', bookingId, 'status'],
    () => bookingService.getBookingStatus(bookingId),
    {
      enabled: !!bookingId,
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
      onError: (error: any) => {
        console.error('Failed to load booking status:', error);
        toast.error('Failed to load booking status');
      }
    }
  );
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation(bookingService.createBooking, {
    onSuccess: (data) => {
      // Invalidate user bookings to refresh the list
      queryClient.invalidateQueries(['bookings', 'user']);
      
      // Cache the new booking
      queryClient.setQueryData(['bookings', data.id], data);
      
      toast.success('Booking created successfully!');
    },
    onError: (error: any) => {
      console.error('Booking creation failed:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  });
};

// Update booking mutation
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ bookingId, bookingUpdate }: { bookingId: number; bookingUpdate: BookingUpdate }) =>
      bookingService.updateBooking(bookingId, bookingUpdate),
    {
      onSuccess: (_, variables) => {
        // Update the booking in cache
        queryClient.setQueryData(['bookings', variables.bookingId], variables.bookingUpdate);
        
        // Invalidate user bookings to refresh the list
        queryClient.invalidateQueries(['bookings', 'user']);
        
        toast.success('Booking updated successfully!');
      },
      onError: (error: any) => {
        console.error('Booking update failed:', error);
        toast.error('Failed to update booking. Please try again.');
      }
    }
  );
};

// Cancel booking mutation
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation(bookingService.cancelBooking, {
    onSuccess: (_, bookingId) => {
      // Invalidate user bookings to refresh the list
      queryClient.invalidateQueries(['bookings', 'user']);
      
      // Invalidate the specific booking
      queryClient.invalidateQueries(['bookings', bookingId]);
      
      toast.success('Booking cancelled successfully!');
    },
    onError: (error: any) => {
      console.error('Booking cancellation failed:', error);
      toast.error('Failed to cancel booking. Please try again.');
    }
  });
};

// Process payment mutation
export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ bookingId, paymentRequest }: { bookingId: number; paymentRequest: PaymentRequest }) =>
      bookingService.processPayment(bookingId, paymentRequest),
    {
      onSuccess: (_, variables) => {
        // Invalidate booking status to refresh it
        queryClient.invalidateQueries(['bookings', variables.bookingId, 'status']);
        
        // Invalidate the booking itself
        queryClient.invalidateQueries(['bookings', variables.bookingId]);
        
        // Invalidate user bookings to refresh the list
        queryClient.invalidateQueries(['bookings', 'user']);
        
        toast.success('Payment processed successfully!');
      },
      onError: (error: any) => {
        console.error('Payment processing failed:', error);
        toast.error('Payment failed. Please try again.');
      }
    }
  );
};
