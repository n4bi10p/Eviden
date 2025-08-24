import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from '../components/AuthModal';

const Login: React.FC = () => {
  const { user } = useWalletAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    } else {
      // Show auth modal after component mounts
      setShowAuth(true);
    }
  }, [user, navigate]);

  // If user is already logged in, don't show login page
  if (user) {
    return null;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Welcome Back
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-600'
          }`}>
            Connect your wallet to continue
          </p>
        </div>

        {showAuth && (
          <AuthModal 
            isOpen={true} 
            onClose={() => navigate('/')} 
            initialMode="login"
          />
        )}
      </div>
    </div>
  );
};

export default Login;
