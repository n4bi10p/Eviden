import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/ApiService';
import { toast } from 'react-hot-toast';

// Generic API hook for data fetching
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { immediate = true, onSuccess, onError } = options;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, refetch: execute };
}

// Events API hooks
export function useEvents(params?: Parameters<typeof apiService.getEvents>[0]) {
  return useApi(() => apiService.getEvents(params), [params]);
}

export function useEvent(eventId: string) {
  return useApi(() => apiService.getEvent(eventId), [eventId]);
}

export function useCreateEvent() {
  const [loading, setLoading] = useState(false);

  const createEvent = useCallback(async (eventData: any) => {
    try {
      setLoading(true);
      const result = await apiService.createEvent(eventData);
      toast.success('Event created successfully!');
      return result;
    } catch (error) {
      toast.error('Failed to create event');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createEvent, loading };
}

// User API hooks
export function useUserProfile(address: string) {
  return useApi(() => apiService.getUserProfile(address), [address]);
}

export function useUserStats(address: string) {
  return useApi(() => apiService.getUserStats(address), [address]);
}

export function useGlobalStats() {
  return useApi(() => apiService.getDashboardStats());
}

// Certificates API hooks
export function useUserCertificates(address: string) {
  return useApi(() => apiService.getUserCertificates(address), [address]);
}

export function useEventCertificates(eventId: string) {
  return useApi(() => apiService.getEventCertificates(eventId), [eventId]);
}

// Authentication hooks
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (loginData: any) => {
    try {
      setLoading(true);
      const result = await apiService.login(loginData);
      apiService.setToken(result.token);
      setUser(result.user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return result;
    } catch (error) {
      toast.error('Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      apiService.clearToken();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    try {
      setLoading(true);
      const result = await apiService.register(userData);
      toast.success('Registration successful!');
      return result;
    } catch (error) {
      toast.error('Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      // Optionally fetch user profile
    }
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
  };
}

// QR Code hooks
export function useGenerateQRCode() {
  const [loading, setLoading] = useState(false);

  const generateQRCode = useCallback(async (eventId: string, securityLevel: any) => {
    try {
      setLoading(true);
      const result = await apiService.generateQRCode(eventId, securityLevel);
      toast.success('QR Code generated successfully!');
      return result;
    } catch (error) {
      toast.error('Failed to generate QR Code');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateQRCode, loading };
}

// Notifications hooks
export function useNotifications() {
  return useApi(() => apiService.getNotifications());
}

export function useMarkNotificationRead() {
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  }, []);

  return { markAsRead };
}
