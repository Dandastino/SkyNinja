import { useQuery, useMutation, useQueryClient } from 'react-query';
import type { Notification } from '../services/notifications';
import { notificationService } from '../services/notifications';
import toast from 'react-hot-toast';

// Get user notifications hook
export const useUserNotifications = (limit: number = 50, unreadOnly: boolean = false) => {
  return useQuery(
    ['notifications', 'user', limit, unreadOnly],
    () => notificationService.getUserNotifications(limit, unreadOnly),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
      onError: (error: any) => {
        console.error('Failed to load notifications:', error);
        toast.error('Failed to load notifications');
      }
    }
  );
};

// Get unread count hook
export const useUnreadCount = () => {
  return useQuery(
    ['notifications', 'unread-count'],
    () => notificationService.getUnreadCount(),
    {
      staleTime: 30 * 1000, // 30 seconds
      refetchInterval: 10 * 1000, // Refetch every 10 seconds for real-time updates
      onError: (error: any) => {
        console.error('Failed to load unread count:', error);
      }
    }
  );
};

// Get notification preferences hook
export const useNotificationPreferences = () => {
  return useQuery(
    ['notifications', 'preferences'],
    () => notificationService.getNotificationPreferences(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: any) => {
        console.error('Failed to load notification preferences:', error);
        toast.error('Failed to load notification preferences');
      }
    }
  );
};

// Mark notification as read mutation
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation(notificationService.markAsRead, {
    onSuccess: (_, notificationId) => {
      // Update the notification in cache
      queryClient.setQueryData(['notifications', notificationId], (old: Notification | undefined) => {
        if (old) {
          return { ...old, is_read: true, read_at: new Date().toISOString() };
        }
        // Return a default Notification object or keep old (if your app expects Notification, not undefined)
        return old ?? { /* fill with required Notification fields */ };
      });
      
      // Invalidate notifications list to refresh it
      queryClient.invalidateQueries(['notifications', 'user']);
      
      // Invalidate unread count
      queryClient.invalidateQueries(['notifications', 'unread-count']);
    },
    onError: (error: any) => {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  });
};

// Mark all notifications as read mutation
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation(notificationService.markAllAsRead, {
    onSuccess: () => {
      // Invalidate notifications list to refresh it
      queryClient.invalidateQueries(['notifications', 'user']);
      
      // Invalidate unread count
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      
      toast.success('Marked all notifications as read');
    },
    onError: (error: any) => {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  });
};

// Delete notification mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation(notificationService.deleteNotification, {
    onSuccess: (_, notificationId) => {
      // Remove the notification from cache
      queryClient.removeQueries(['notifications', notificationId]);
      
      // Invalidate notifications list to refresh it
      queryClient.invalidateQueries(['notifications', 'user']);
      
      // Invalidate unread count
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      
      toast.success('Notification deleted');
    },
    onError: (error: any) => {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  });
};

// Create notification mutation (admin only)
export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation(notificationService.createNotification, {
    onSuccess: () => {
      // Invalidate notifications list to refresh it
      queryClient.invalidateQueries(['notifications', 'user']);
      
      // Invalidate unread count
      queryClient.invalidateQueries(['notifications', 'unread-count']);
      
      toast.success('Notification created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create notification:', error);
      toast.error('Failed to create notification');
    }
  });
};

// Update notification preferences mutation
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation(notificationService.updateNotificationPreferences, {
    onSuccess: () => {
      // Invalidate notification preferences
      queryClient.invalidateQueries(['notifications', 'preferences']);
      
      toast.success('Notification preferences updated');
    },
    onError: (error: any) => {
      console.error('Failed to update notification preferences:', error);
      toast.error('Failed to update notification preferences');
    }
  });
};
