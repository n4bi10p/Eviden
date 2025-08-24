import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User Store
interface User {
  id: string;
  address: string;
  name: string;
  email: string;
  role: 'attendee' | 'organizer' | 'admin';
  avatar?: string;
  bio?: string;
  organizationName?: string;
  isVerified: boolean;
  createdAt: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Wallet Store
interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  isConnecting: boolean;
  error: string | null;
  setWallet: (address: string, balance: number) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: null,
  balance: 0,
  isConnecting: false,
  error: null,
  setWallet: (address, balance) => set({ 
    address, 
    balance, 
    isConnected: true, 
    error: null 
  }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setError: (error) => set({ error, isConnecting: false }),
  disconnect: () => set({ 
    isConnected: false, 
    address: null, 
    balance: 0, 
    error: null 
  }),
}));

// Notification Store
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isEnabled: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setEnabled: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      isEnabled: true,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),
      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.isRead 
            ? Math.max(0, state.unreadCount - 1) 
            : state.unreadCount,
        };
      }),
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
      setEnabled: (isEnabled) => set({ isEnabled }),
    }),
    {
      name: 'notification-storage',
    }
  )
);

// Event Store
interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  location: {
    type: 'physical' | 'virtual' | 'hybrid';
    venue?: string;
    address?: string;
    virtualLink?: string;
    coordinates?: { lat: number; lng: number };
  };
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendees: number;
  maxAttendees: number;
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  price: number;
  currency: string;
  tags: string[];
  imageUrl?: string;
  requirements?: string;
  isUserRegistered?: boolean;
  isUserCheckedIn?: boolean;
}

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  filters: {
    search: string;
    category: string;
    status: string;
    location: string;
  };
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  removeEvent: (id: string) => void;
  setSelectedEvent: (event: Event | null) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<EventState['filters']>) => void;
  clearFilters: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  filters: {
    search: '',
    category: '',
    status: '',
    location: '',
  },
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ 
    events: [event, ...state.events] 
  })),
  updateEvent: (id, updatedEvent) => set((state) => ({
    events: state.events.map((event) => 
      event.id === id ? { ...event, ...updatedEvent } : event
    ),
  })),
  removeEvent: (id) => set((state) => ({
    events: state.events.filter((event) => event.id !== id),
  })),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  clearFilters: () => set({
    filters: { search: '', category: '', status: '', location: '' }
  }),
}));

// App Store (for global app state)
interface AppState {
  theme: 'light' | 'dark';
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setOnline: (online: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      isOnline: navigator.onLine,
      isLoading: false,
      error: null,
      sidebarOpen: true,
      mobileMenuOpen: false,
      setTheme: (theme) => set({ theme }),
      setOnline: (isOnline) => set({ isOnline }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
);
