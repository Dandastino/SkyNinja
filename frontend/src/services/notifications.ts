import { apiClient } from './api';

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'price_drop' | 'price_increase' | 'booking_confirmation' | 'booking_cancellation' | 'flight_reminder' | 'system_update';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  is_read: boolean;
  email_sent: boolean;
  push_sent: boolean;
  sms_sent: boolean;
  related_booking_id?: number;
  related_flight_id?: number;
  related_search_id?: number;
  priority: number;
  scheduled_at?: string;
  sent_at?: string;
  read_at?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface NotificationCreate {
  user_id: number;
  title: string;
  message: string;
  notification_type: 'price_drop' | 'price_increase' | 'booking_confirmation' | 'booking_cancellation' | 'flight_reminder' | 'system_update';
  priority?: number;
  scheduled_at?: string;
  related_booking_id?: number;
  related_flight_id?: number;
  related_search_id?: number;
  metadata?: Record<string, any>;
}

export interface NotificationUpdate {
  is_read?: boolean;
  status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  price_drop_alerts: boolean;
  booking_reminders: boolean;
  flight_updates: boolean;
  marketing_emails: boolean;
}

// Notification service
export const notificationService = {
  // Get user notifications
  getUserNotifications: async (limit: number = 50, unreadOnly: boolean = false): Promise<Notification[]> => {
    const response = await apiClient.get(`/notifications/?limit=${limit}&unread_only=${unreadOnly}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string; updated_count: number }> => {
    const response = await apiClient.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`/notifications/${notificationId}`);
  },

  // Create notification (admin only)
  createNotification: async (notificationData: NotificationCreate): Promise<Notification> => {
    const response = await apiClient.post('/notifications/', notificationData);
    return response.data;
  },

  // Get notification preferences
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences: NotificationPreferences): Promise<void> => {
    await apiClient.put('/notifications/preferences', preferences);
  },
};

// Notification utilities
export const notificationUtils = {
  // Get notification type icon
  getNotificationIcon: (type: string): string => {
    switch (type) {
      case 'price_drop':
        return '📉';
      case 'price_increase':
        return '📈';
      case 'booking_confirmation':
        return '✈️';
      case 'booking_cancellation':
        return '❌';
      case 'flight_reminder':
        return '⏰';
      case 'system_update':
        return '🔔';
      default:
        return '📢';
    }
  },

  // Get notification type color
  getNotificationColor: (type: string): string => {
    switch (type) {
      case 'price_drop':
        return 'text-success-600 bg-success-100';
      case 'price_increase':
        return 'text-warning-600 bg-warning-100';
      case 'booking_confirmation':
        return 'text-primary-600 bg-primary-100';
      case 'booking_cancellation':
        return 'text-accent-600 bg-accent-100';
      case 'flight_reminder':
        return 'text-secondary-600 bg-secondary-100';
      case 'system_update':
        return 'text-primary-600 bg-primary-100';
      default:
        return 'text-secondary-600 bg-secondary-100';
    }
  },

  // Get priority color
  getPriorityColor: (priority: number): string => {
    switch (priority) {
      case 3:
        return 'text-accent-600 bg-accent-100'; // High priority
      case 2:
        return 'text-warning-600 bg-warning-100'; // Medium priority
      case 1:
        return 'text-secondary-600 bg-secondary-100'; // Low priority
      default:
        return 'text-secondary-600 bg-secondary-100';
    }
  },

  // Format notification time
  formatNotificationTime: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  },

  // Get notification status text
  getStatusText: (status: string): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'failed':
        return 'Failed';
      case 'read':
        return 'Read';
      default:
        return 'Unknown';
    }
  },

  // Check if notification is recent
  isRecent: (dateString: string, hours: number = 24): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= hours;
  },

  // Group notifications by date
  groupByDate: (notifications: Notification[]): Record<string, Notification[]> => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(notification);
    });
    
    return groups;
  },

  // Sort notifications
  sortNotifications: (notifications: Notification[], sortBy: 'date' | 'priority' | 'type' = 'date', ascending: boolean = false): Notification[] => {
    return [...notifications].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'type':
          comparison = a.notification_type.localeCompare(b.notification_type);
          break;
      }
      
      return ascending ? comparison : -comparison;
    });
  },

  // Filter notifications
  filterNotifications: (notifications: Notification[], filters: {
    type?: string[];
    status?: string[];
    priority?: number[];
    unreadOnly?: boolean;
    dateRange?: { start: string; end: string };
  }): Notification[] => {
    return notifications.filter(notification => {
      if (filters.type && !filters.type.includes(notification.notification_type)) {
        return false;
      }
      
      if (filters.status && !filters.status.includes(notification.status)) {
        return false;
      }
      
      if (filters.priority && !filters.priority.includes(notification.priority)) {
        return false;
      }
      
      if (filters.unreadOnly && notification.is_read) {
        return false;
      }
      
      if (filters.dateRange) {
        const notificationDate = new Date(notification.created_at);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        
        if (notificationDate < startDate || notificationDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  },

  // Get notification summary
  getNotificationSummary: (notifications: Notification[]) => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.is_read).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.notification_type] = (acc[n.notification_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      unread,
      byType,
      readRate: total > 0 ? ((total - unread) / total) * 100 : 0,
    };
  },
};
