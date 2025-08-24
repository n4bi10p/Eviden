import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletService } from '../services/WalletService';
import { apiService } from '../services/ApiService';
import { toast } from 'react-hot-toast';

// Types for our authentication system
interface User {
  address: string;
  username?: string;
  full_name?: string;
  email?: string;
  role: 'attendee' | 'organizer' | 'admin';
  bio?: string;
  organizationName?: string;
  avatar?: string;
  created_at?: number;
  isVerified?: boolean;
  emailVerified?: boolean;
}

interface WalletAuthContextType {
  // Authentication state
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Wallet operations
  connectWallet: (walletType?: 'petra' | 'martian' | 'pontem') => Promise<void>;
  disconnectWallet: () => Promise<void>;
  
  // Authentication operations
  login: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  
  // User operations
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;

  // Wallet info
  walletAddress: string | null;
  walletType: 'petra' | 'martian' | 'pontem' | null;
}

const WalletAuthContext = createContext<WalletAuthContextType | null>(null);

interface WalletAuthProviderProps {
  children: ReactNode;
}

export function WalletAuthProvider({ children }: WalletAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<'petra' | 'martian' | 'pontem' | null>(null);

  const walletService = WalletService.getInstance();

  // Detect wallet type
  const detectWalletType = (): 'petra' | 'martian' | 'pontem' | null => {
    if (typeof window !== 'undefined') {
      // Check Pontem first (most specific)
      // @ts-ignore
      if (window.pontem) return 'pontem';
      // Check Martian
      // @ts-ignore
      if (window.martian) return 'martian';
      // Check Petra (multiple ways)
      // @ts-ignore
      if (window.aptos?.isPetra) return 'petra';
      // @ts-ignore
      if (window.petra) return 'petra';
      // @ts-ignore
      // If only aptos exists and no other wallets, assume Petra
      if (window.aptos && !window.pontem && !window.martian) return 'petra';
    }
    return null;
  };

  // Get wallet provider based on type
  const getWalletProvider = (type: 'petra' | 'martian' | 'pontem' | null) => {
    if (typeof window === 'undefined') return null;
    
    // @ts-ignore
    const windowObj = window as any;
    
    switch (type) {
      case 'petra':
        // Check multiple ways Petra can be injected (same as WalletService)
        if (windowObj.aptos?.isPetra) {
          return windowObj.aptos;
        }
        if (windowObj.petra) {
          return windowObj.petra;
        }
        if (windowObj.aptos && !windowObj.pontem && !windowObj.martian) {
          return windowObj.aptos;
        }
        return null;
      case 'martian':
        return windowObj.martian || null;
      case 'pontem':
        return windowObj.pontem || null;
      default:
        return null;
    }
  };

  // Check if wallet is already connected on app load
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        setIsLoading(true);
        const detectedWalletType = detectWalletType();
        setWalletType(detectedWalletType);

        // Check if wallet is connected using the correct provider
        const walletProvider = getWalletProvider(detectedWalletType);
        if (walletProvider) {
          try {
            const account = await walletProvider.account();
            if (account?.address) {
              setWalletAddress(account.address);
              setIsConnected(true);

              // Check if user is logged in
              const token = localStorage.getItem('authToken');
              if (token) {
                apiService.setToken(token);
                await refreshUserProfile();
              }
            }
          } catch (err) {
            // Wallet not connected or no permission
            console.log('Wallet not connected');
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletConnection();
  }, []);

  // Connect wallet
  const connectWallet = async (specificWalletType?: 'petra' | 'martian' | 'pontem') => {
    try {
      setIsLoading(true);
      setError(null);

      let address: string | null = null;
      let detectedWalletType: 'petra' | 'martian' | 'pontem' | null = null;

      if (specificWalletType) {
        // Connect to specific wallet type
        address = await walletService.connectSpecificWallet(specificWalletType);
        detectedWalletType = specificWalletType;
      } else {
        // Auto-detect and connect
        detectedWalletType = detectWalletType();
        if (!detectedWalletType) {
          throw new Error('No Aptos wallet detected. Please install Petra, Martian, or Pontem wallet.');
        }
        address = await walletService.connectSpecificWallet(detectedWalletType);
      }

      if (address && detectedWalletType) {
        setWalletAddress(address);
        setIsConnected(true);
        setWalletType(detectedWalletType);
        toast.success(`${detectedWalletType.charAt(0).toUpperCase() + detectedWalletType.slice(1)} wallet connected successfully!`);
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      await walletService.disconnectWallet();
      setWalletAddress(null);
      setIsConnected(false);
      setWalletType(null);
      
      // Also logout user
      await logout();
      
      toast.success('Wallet disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      toast.error('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Get nonce and sign message for authentication
  const signAuthMessage = async (): Promise<{ signature: string; message: string; nonce: string; timestamp: number }> => {
    if (!walletAddress || !walletType) {
      throw new Error('Wallet not connected');
    }

    // Get nonce from backend
    console.log('🔍 Calling getNonce for wallet:', walletAddress);
    try {
      const nonceResponse = await apiService.getNonce(walletAddress) as any;
      console.log('🔍 Nonce response received:', nonceResponse);
      
      // Handle both direct response and wrapped response formats
      let message, nonce, timestamp;
      
      if (nonceResponse.success && nonceResponse.data) {
        // Backend returns { success: true, data: { message, nonce, timestamp } }
        ({ message, nonce, timestamp } = nonceResponse.data);
      } else if (nonceResponse.message && nonceResponse.nonce && nonceResponse.timestamp) {
        // Backend returns { message, nonce, timestamp } directly
        ({ message, nonce, timestamp } = nonceResponse);
      } else {
        // Fallback: try to extract from any nested structure
        message = nonceResponse.message || nonceResponse.data?.message;
        nonce = nonceResponse.nonce || nonceResponse.data?.nonce;
        timestamp = nonceResponse.timestamp || nonceResponse.data?.timestamp;
      }
      
      console.log('🔍 Destructured nonce data:', { message, nonce, timestamp });
      
      if (!message || !nonce || !timestamp) {
        console.error('🔥 Invalid nonce response structure:', nonceResponse);
        throw new Error('Invalid nonce response: missing required fields');
      }

      // Use the correct wallet provider for signing
      const walletProvider = getWalletProvider(walletType);
      if (!walletProvider) {
        throw new Error(`${walletType} wallet provider not found`);
      }

      let signResponse;
      try {
        if (walletType === 'pontem') {
          // Pontem wallet requires new format and might need different parameters
          signResponse = await walletProvider.signMessage({
            message,
          }, { useNewFormat: true });
        } else if (walletType === 'petra') {
          // Petra wallet typically uses standard format with message and nonce
          signResponse = await walletProvider.signMessage({
            message,
            nonce,
          });
        } else {
          // Martian and other wallets use standard format
          signResponse = await walletProvider.signMessage({
            message,
            nonce,
          });
        }
      } catch (error) {
        console.error(`Signing error with ${walletType}:`, error);
        // If new format fails with Pontem, try old format
        if (walletType === 'pontem') {
          console.log('Retrying Pontem with old format...');
          signResponse = await walletProvider.signMessage({
            message,
            nonce,
          });
        } else if (walletType === 'petra') {
          // If standard format fails with Petra, try with just message
          console.log('Retrying Petra with message only...');
          signResponse = await walletProvider.signMessage({
            message,
          });
        } else {
          throw error;
        }
      }

      const result = {
        signature: signResponse.signature,
        message,
        nonce,
        timestamp,
      };
      
      console.log('🔍 signAuthMessage returning:', result);
      return result;
    } catch (error) {
      console.error('🔥 signAuthMessage failed:', error);
      throw error;
    }
  };

  // Login with wallet signature
  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      const { signature, message, nonce, timestamp } = await signAuthMessage();

      const loginResponse = await apiService.login({
        address: walletAddress,
        signature,
        message,
        nonce,
        timestamp,
      }) as any;

      // Handle wrapped response format from backend
      let token, user;
      if (loginResponse.success && loginResponse.data) {
        // Backend returns { success: true, data: { user, token } }
        token = loginResponse.data.token;
        user = loginResponse.data.user;
      } else {
        // Fallback for direct format
        token = loginResponse.token;
        user = loginResponse.user;
      }

      // Store token and set user
      apiService.setToken(token);
      setUser(user);
      
      // Store token in localStorage for persistence
      localStorage.setItem('authToken', token);
      
      toast.success('Login successful!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      // Validate required fields
      if (!userData.full_name || userData.full_name.trim().length < 2) {
        throw new Error('Full name must be at least 2 characters long');
      }
      
      if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }

      const { signature, message, nonce, timestamp } = await signAuthMessage();
      console.log('🔍 Destructured values:', { signature, message, nonce, timestamp });

      const registerResponse = await apiService.register({
        address: walletAddress,
        signature,
        message,
        nonce,
        timestamp,
        role: (userData.role === 'admin' ? 'organizer' : userData.role) || 'attendee',
        name: userData.full_name || 'Anonymous User',
        email: userData.email || '',
        organizationName: userData.organizationName || undefined,
        organizationDescription: userData.bio || undefined,
      }) as any;

      // Store token and set user
      console.log('🎉 Registration response:', registerResponse);
      
      // Handle wrapped response format from backend
      let token, user;
      if (registerResponse.success && registerResponse.data) {
        // Backend returns { success: true, data: { user, token } }
        token = registerResponse.data.token;
        user = registerResponse.data.user;
      } else {
        // Fallback for direct format
        token = registerResponse.token;
        user = registerResponse.user;
      }
      
      console.log('🎉 Extracted token:', token);
      console.log('🎉 Extracted user:', user);
      
      if (!token || !user) {
        throw new Error('Invalid registration response format');
      }
      
      apiService.setToken(token);
      setUser(user);
      
      // Store token in localStorage for persistence
      localStorage.setItem('authToken', token);
      
      toast.success('Registration successful! Welcome to Eviden!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      apiService.clearToken();
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('User not logged in');
      }

      const updatedUser = await apiService.updateUserProfile(user.address, updates);
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    try {
      if (!walletAddress) return;
      
      const userProfile = await apiService.getUserProfile(walletAddress);
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const refreshUser = refreshUserProfile;

  const contextValue: WalletAuthContextType = {
    user,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    walletAddress,
    walletType,
  };

  return (
    <WalletAuthContext.Provider value={contextValue}>
      {children}
    </WalletAuthContext.Provider>
  );
}

// Custom hook to use wallet authentication
export function useWalletAuth() {
  const context = useContext(WalletAuthContext);
  if (!context) {
    throw new Error('useWalletAuth must be used within a WalletAuthProvider');
  }
  return context;
}

export default WalletAuthProvider;
