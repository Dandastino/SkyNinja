import { apiClient } from './api';

// Auth types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  preferred_currency: string;
  preferred_language: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  password: string;
  preferred_currency?: string;
  preferred_language?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  preferred_currency?: string;
  preferred_language?: string;
  notification_preferences?: Record<string, any>;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  token: Token;
}

// Auth service
export const authService = {
  // Register new user
  register: async (userData: UserCreate): Promise<User> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: UserLogin): Promise<Token> => {
    const response = await apiClient.post('/auth/login', credentials);
    const token = response.data;
    
    // Store token in localStorage
    localStorage.setItem('access_token', token.access_token);
    
    return token;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: UserUpdate): Promise<User> => {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  },

  // Store user
  storeUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear stored data
  clearStoredData: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};

// Auth utilities
export const authUtils = {
  // Get user initials
  getUserInitials: (user: User): string => {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  },

  // Get user display name
  getDisplayName: (user: User): string => {
    return `${user.first_name} ${user.last_name}`;
  },

  // Check if user has permission
  hasPermission: (user: User, permission: string): boolean => {
    // In a real app, this would check user roles/permissions
    return user.is_active && user.is_verified;
  },

  // Format user for display
  formatUser: (user: User) => ({
    ...user,
    display_name: authUtils.getDisplayName(user),
    initials: authUtils.getUserInitials(user),
  }),
};
