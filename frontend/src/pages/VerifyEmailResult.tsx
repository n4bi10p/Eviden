import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';

const VerifyEmailResult: React.FC = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const statusParam = searchParams.get('status') || '';
    const messageParam = searchParams.get('message') || '';
    
    setStatus(statusParam);
    setMessage(messageParam);
  }, [searchParams]);

  const getIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'expired':
        return '⏰';
      case 'error':
      default:
        return '❌';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'expired':
        return 'Verification Link Expired';
      case 'error':
      default:
        return 'Verification Failed';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'success':
        return 'Continue to Login';
      case 'expired':
        return 'Request New Link';
      case 'error':
      default:
        return 'Back to Login';
    }
  };

  const getButtonAction = () => {
    switch (status) {
      case 'success':
        return '/login';
      case 'expired':
        return '/login'; // User can login and request new verification
      case 'error':
      default:
        return '/login';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="w-full max-w-md">
        <GlassCard className="p-8 text-center">
          {/* Icon */}
          <div className="text-6xl mb-6">
            {getIcon()}
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>
            {getTitle()}
          </h1>

          {/* Message */}
          <p className={`text-base mb-8 leading-relaxed ${
            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {message || 'Please check the verification status and try again.'}
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link to={getButtonAction()}>
              <MacOSButton 
                size="lg" 
                className="w-full"
                icon={status === 'success' ? '🚀' : '🔙'}
              >
                {getButtonText()}
              </MacOSButton>
            </Link>

            {status === 'expired' && (
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Log in to your account and use the "Resend Verification Email" option.
              </p>
            )}

            <Link to="/">
              <MacOSButton 
                variant="secondary" 
                size="sm" 
                className="w-full"
                icon="🏠"
              >
                Back to Home
              </MacOSButton>
            </Link>
          </div>
        </GlassCard>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Need help? <a href="#" className="underline hover:no-underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailResult;
