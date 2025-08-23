import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import ThemeToggle from '../components/ThemeToggle';
import MacOSButton from '../components/MacOSButton';
import GlassCard from '../components/GlassCard';

const Login: React.FC = () => {
  const { theme } = useTheme();
  const { login } = useUser();
  const navigate = useNavigate();
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    walletAddress: ''
  });
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'wallet'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleLoginClick = async () => {
    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleLogin(mockEvent);
  };

  const handleWalletLoginClick = async () => {
    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleLogin(mockEvent);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock login validation
      if (loginMethod === 'email') {
        if (!loginData.email || !loginData.password) {
          throw new Error('Please fill in all fields');
        }
        if (!loginData.email.includes('@')) {
          throw new Error('Please enter a valid email address');
        }
        if (loginData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
      } else {
        if (!loginData.walletAddress) {
          throw new Error('Please enter your wallet address');
        }
        if (!loginData.walletAddress.startsWith('0x')) {
          throw new Error('Please enter a valid wallet address');
        }
      }

      // Mock user data
      const userData = {
        id: '1',
        name: loginMethod === 'email' ? loginData.email.split('@')[0] : 'Wallet User',
        email: loginData.email || `${loginData.walletAddress.slice(0, 8)}@wallet.eth`,
        role: 'attendee' as const,
        walletAddress: loginData.walletAddress || '0x1234567890abcdef',
        isVerified: true,
        avatar: `https://ui-avatars.com/api/?name=${loginMethod === 'email' ? loginData.email.split('@')[0] : 'User'}&background=8B5CF6&color=fff`,
        joinedAt: new Date().toISOString(),
        eventsAttended: 12,
        certificatesEarned: 8,
        verificationLevel: 'verified' as const
      };

      login(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock wallet connection
      const mockWalletAddress = '0x742d35Cc69A7B2D3F9d4B7A8B4C5E6F7A8B9C0D1';
      setLoginData({
        ...loginData,
        walletAddress: mockWalletAddress
      });
      
      // Auto-login after wallet connection
      const userData = {
        id: '1',
        name: 'Wallet User',
        email: `${mockWalletAddress.slice(0, 8)}@wallet.eth`,
        role: 'attendee' as const,
        walletAddress: mockWalletAddress,
        isVerified: true,
        avatar: 'https://ui-avatars.com/api/?name=Wallet+User&background=8B5CF6&color=fff',
        joinedAt: new Date().toISOString(),
        eventsAttended: 5,
        certificatesEarned: 3,
        verificationLevel: 'pending' as const
      };

      login(userData);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Hero Section */}
      <div className={`hidden lg:flex lg:w-2/5 xl:w-1/2 relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #8B5CF6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #3B82F6 0%, transparent 50%)',
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-8 lg:px-12 xl:px-16 py-12">
          <div className="max-w-lg">
            {/* Logo */}
            <div className="flex items-center mb-10">
              <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-3xl flex items-center justify-center text-2xl lg:text-3xl ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-500'
              } shadow-2xl`}>
                🔐
              </div>
              <div className="ml-4">
                <h1 className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  Eviden
                </h1>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  Blockchain Verification
                </p>
              </div>
            </div>
            
            {/* Hero Text */}
            <h2 className={`text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 lg:mb-8 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Secure Event<br />
              <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>
                Verification
              </span>
            </h2>
            
            <p className={`text-base lg:text-lg mb-8 lg:mb-10 leading-relaxed ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Join the future of event management with blockchain-powered attendance verification and certificate generation.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <span className="text-purple-500">🛡️</span>
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Secure & Tamper-Proof
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Blockchain-based verification
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <span className="text-blue-500">📜</span>
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Digital Certificates
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Instant certificate generation
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <span className="text-green-500">⚡</span>
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Real-time Tracking
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Live attendance monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-64 lg:h-64 opacity-20">
          <div className={`w-full h-full rounded-full ${
            theme === 'dark' 
              ? 'bg-gradient-to-tr from-purple-500 to-blue-500' 
              : 'bg-gradient-to-tr from-blue-400 to-purple-400'
          } blur-3xl transform translate-x-24 translate-y-24 lg:translate-x-32 lg:translate-y-32`}></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={`w-full lg:w-3/5 xl:w-1/2 flex flex-col lg:items-center lg:justify-center p-6 lg:p-12 relative ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-white to-slate-50'
      }`}>
        {/* Mobile Hero Header - Only visible on small screens */}
        <div className={`lg:hidden text-center mb-8 pt-4 ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            } shadow-xl`}>
              🔐
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-bold">Eviden</h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`}>
                Blockchain Verification
              </p>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Secure Event <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Verification</span>
          </h2>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Blockchain-powered attendance verification
          </p>
        </div>

        {/* Theme Toggle - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <div className={`p-2 rounded-lg backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-black/20 border border-white/10' 
              : 'bg-white/30 border border-black/10'
          }`}>
            <ThemeToggle />
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-md flex-shrink-0">
          <GlassCard className="p-6 lg:p-8 xl:p-10">
            {/* Header */}
            <div className="text-center mb-6 lg:mb-8">
              <div className="flex items-center justify-center mb-4 lg:hidden">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  🔐
                </div>
              </div>
              <h1 className={`text-2xl lg:text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white/90' : 'text-slate-800'
              }`}>
                Welcome Back
              </h1>
              <p className={`${
                theme === 'dark' ? 'text-white/60' : 'text-slate-600'
              }`}>
                Sign in to your account
              </p>
            </div>

            {/* Login Method Toggle */}
            <div className="flex mb-6 p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'email'
                    ? theme === 'dark'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-white/70 hover:text-white/90'
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                📧 Email
              </button>
              <button
                onClick={() => setLoginMethod('wallet')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  loginMethod === 'wallet'
                    ? theme === 'dark'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-white/70 hover:text-white/90'
                      : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                👛 Wallet
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-4 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 lg:space-y-5">
              {loginMethod === 'email' ? (
                <>
                  {/* Email Input */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                    }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      disabled={isLoading}
                      className={`w-full px-4 py-3 lg:py-3.5 rounded-xl border transition-all text-base ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40 focus:border-blue-500 focus:bg-white/15'
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none`}
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                    }`}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className={`w-full px-4 py-3.5 rounded-xl border transition-all text-base ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40 focus:border-blue-500 focus:bg-white/15'
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none`}
                    />
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="mr-2 rounded"
                        disabled={isLoading}
                      />
                      <span className={theme === 'dark' ? 'text-white/60' : 'text-slate-600'}>
                        Remember me
                      </span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className={`hover:underline font-medium ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Login Button */}
                  <MacOSButton
                    onClick={handleLoginClick}
                    size="lg"
                    className="w-full mt-6"
                    disabled={isLoading}
                    icon={isLoading ? "⏳" : "🚀"}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </MacOSButton>
                </>
              ) : (
                <>
                  {/* Wallet Address Input */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                    }`}>
                      Wallet Address (Optional)
                    </label>
                    <input
                      type="text"
                      name="walletAddress"
                      value={loginData.walletAddress}
                      onChange={handleInputChange}
                      placeholder="0x742d35Cc69A7B2D3F9d4B7A8B4C5E6F7A8B9C0D1"
                      disabled={isLoading}
                      className={`w-full px-4 py-3.5 rounded-xl border font-mono text-sm transition-all ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40 focus:border-blue-500 focus:bg-white/15'
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none`}
                    />
                    <p className={`text-xs mt-2 ${
                      theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                    }`}>
                      Or connect your wallet automatically below
                    </p>
                  </div>

                  {/* Wallet Connect Button */}
                  <MacOSButton
                    onClick={handleWalletConnect}
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                    icon={isLoading ? "⏳" : "👛"}
                  >
                    {isLoading ? 'Connecting Wallet...' : 'Connect Wallet'}
                  </MacOSButton>

                  {/* Manual Login Button */}
                  <MacOSButton
                    onClick={handleWalletLoginClick}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading || !loginData.walletAddress}
                    icon="🔑"
                  >
                    Login with Address
                  </MacOSButton>
                </>
              )}
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className={`flex-1 h-px ${
                theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
              }`}></div>
              <span className={`px-4 text-sm ${
                theme === 'dark' ? 'text-white/50' : 'text-slate-500'
              }`}>
                or
              </span>
              <div className={`flex-1 h-px ${
                theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
              }`}></div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className={`text-sm ${
                theme === 'dark' ? 'text-white/60' : 'text-slate-600'
              }`}>
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className={`font-medium hover:underline ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Quick Demo Access */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className={`text-xs text-center mb-4 ${
                theme === 'dark' ? 'text-white/50' : 'text-slate-500'
              }`}>
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setLoginData({
                      email: 'attendee@demo.com',
                      password: 'demo123',
                      walletAddress: ''
                    });
                    setLoginMethod('email');
                  }}
                  disabled={isLoading}
                  className={`py-3 px-4 rounded-lg text-xs font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  👤 Demo Attendee
                </button>
                <button
                  onClick={() => {
                    setLoginData({
                      email: 'organizer@demo.com',
                      password: 'demo123',
                      walletAddress: ''
                    });
                    setLoginMethod('email');
                  }}
                  disabled={isLoading}
                  className={`py-3 px-4 rounded-lg text-xs font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🎯 Demo Organizer
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className={`text-xs ${
              theme === 'dark' ? 'text-white/40' : 'text-slate-500'
            }`}>
              Secured by blockchain technology 🔒
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
