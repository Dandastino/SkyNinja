import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authService, User, UserCreate, UserLogin, UserUpdate } from '../services/auth';
import toast from 'react-hot-toast';

// Auth context type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: UserUpdate) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// Auth hook
export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const isAuthenticated = !!user && authService.isAuthenticated();

  // Get current user query
  const { data: currentUser, isLoading: isUserLoading } = useQuery(
    'currentUser',
    authService.getCurrentUser,
    {
      enabled: authService.isAuthenticated(),
      retry: false,
      onError: () => {
        authService.clearStoredData();
        setUser(null);
      },
    }
  );

  // Login mutation
  const loginMutation = useMutation(authService.login, {
    onSuccess: async (token) => {
      // Get user data after successful login
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        authService.storeUser(userData);
        toast.success('Welcome back!');
      } catch (error) {
        console.error('Failed to get user data:', error);
        toast.error('Login successful but failed to load user data');
      }
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.detail || 'Login failed');
    },
  });

  // Register mutation
  const registerMutation = useMutation(authService.register, {
    onSuccess: (userData) => {
      toast.success('Account created successfully! Please login.');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.detail || 'Registration failed');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (userData: UserUpdate) => authService.updateProfile(userData),
    {
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        authService.storeUser(updatedUser);
        queryClient.invalidateQueries('currentUser');
        toast.success('Profile updated successfully!');
      },
      onError: (error: any) => {
        console.error('Profile update failed:', error);
        toast.error(error.response?.data?.detail || 'Profile update failed');
      },
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
      },
      onError: (error: any) => {
        console.error('Password change failed:', error);
        toast.error(error.response?.data?.detail || 'Password change failed');
      },
    }
  );

  // Initialize user from stored data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.clearStoredData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Update user when current user query resolves
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      authService.storeUser(currentUser);
    }
  }, [currentUser]);

  // Update loading state
  useEffect(() => {
    setIsLoading(isUserLoading);
  }, [isUserLoading]);

  // Login function
  const login = useCallback(async (credentials: UserLogin) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  // Register function
  const register = useCallback(async (userData: UserCreate) => {
    await registerMutation.mutateAsync(userData);
  }, [registerMutation]);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    queryClient.clear();
    toast.success('Logged out successfully');
  }, [queryClient]);

  // Update profile function
  const updateProfile = useCallback(async (userData: UserUpdate) => {
    await updateProfileMutation.mutateAsync(userData);
  }, [updateProfileMutation]);

  // Change password function
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
  }, [changePasswordMutation]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
};

// Auth guard hook
export const useAuthGuard = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
};

// User permissions hook
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return authService.hasPermission(user, permission);
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    if (!user) return false;
    // In a real app, this would check user roles
    return user.is_active && user.is_verified;
  }, [user]);

  const canBook = useCallback((): boolean => {
    if (!user) return false;
    return user.is_active && user.is_verified;
  }, [user]);

  return {
    hasPermission,
    isAdmin,
    canBook,
  };
};
