import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User role types
export type UserRole = 'attendee' | 'organizer';

// User interface
export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: string;
  // Organizer specific fields
  organizationName?: string;
  organizationDescription?: string;
  verified?: boolean;
  // Attendee specific fields
  totalEventsAttended?: number;
  totalValidationsGiven?: number;
  totalValidationsReceived?: number;
}

// User context interface
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  setUser: (user: User | null) => void;
  login: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  // Permission checks
  canCreateEvents: () => boolean;
  canManageEvent: (eventOrganizerAddress: string) => boolean;
  canCheckInToEvents: () => boolean;
  canValidateAttendance: () => boolean;
  canMintCertificates: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper function to generate user ID
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// User provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('eviden_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserState(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('eviden_user');
      }
    }
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('eviden_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eviden_user');
    }
  }, [user]);

  const setUser = (userData: User | null) => {
    setUserState(userData);
    setIsAuthenticated(!!userData);
  };

  const login = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateUserId(),
      createdAt: new Date().toISOString(),
      // Set default values based on role
      ...(userData.role === 'attendee' && {
        totalEventsAttended: 0,
        totalValidationsGiven: 0,
        totalValidationsReceived: 0,
      }),
      ...(userData.role === 'organizer' && {
        verified: false,
      }),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eviden_user');
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    
    const updatedUser: User = {
      ...user,
      role: newRole,
      // Reset role-specific fields
      ...(newRole === 'attendee' && {
        totalEventsAttended: user.totalEventsAttended || 0,
        totalValidationsGiven: user.totalValidationsGiven || 0,
        totalValidationsReceived: user.totalValidationsReceived || 0,
        organizationName: undefined,
        organizationDescription: undefined,
        verified: undefined,
      }),
      ...(newRole === 'organizer' && {
        organizationName: user.organizationName || '',
        organizationDescription: user.organizationDescription || '',
        verified: user.verified || false,
        totalEventsAttended: undefined,
        totalValidationsGiven: undefined,
        totalValidationsReceived: undefined,
      }),
    };
    setUser(updatedUser);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  // Permission check functions
  const canCreateEvents = (): boolean => {
    return user?.role === 'organizer';
  };

  const canManageEvent = (eventOrganizerAddress: string): boolean => {
    return user?.role === 'organizer' && user.walletAddress === eventOrganizerAddress;
  };

  const canCheckInToEvents = (): boolean => {
    return user?.role === 'attendee';
  };

  const canValidateAttendance = (): boolean => {
    return user?.role === 'attendee';
  };

  const canMintCertificates = (): boolean => {
    return user?.role === 'attendee';
  };

  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    userRole: user?.role || null,
    setUser,
    login,
    logout,
    switchRole,
    updateUserProfile,
    canCreateEvents,
    canManageEvent,
    canCheckInToEvents,
    canValidateAttendance,
    canMintCertificates,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// HOC for role-based access control
interface WithRoleProtectionProps {
  requiredRole?: UserRole;
  requireAuth?: boolean;
  fallback?: React.ComponentType;
}

export const withRoleProtection = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProtectionProps = {}
) => {
  return (props: P) => {
    const { user, isAuthenticated } = useUser();
    const { requiredRole, requireAuth = true, fallback: Fallback } = options;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      if (Fallback) {
        return <Fallback />;
      }
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please connect your wallet and set up your profile to access this feature.
            </p>
          </div>
        </div>
      );
    }

    // Check role
    if (requiredRole && user?.role !== requiredRole) {
      if (Fallback) {
        return <Fallback />;
      }
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Insufficient Permissions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This feature is only available for {requiredRole}s.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default UserContext;
