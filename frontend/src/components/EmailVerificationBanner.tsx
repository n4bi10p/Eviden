import React, { useState } from 'react';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import { apiService } from '../services/ApiService';
import { toast } from 'react-hot-toast';
import { Mail, X, RefreshCw } from 'lucide-react';

const EmailVerificationBanner: React.FC = () => {
  const { user, refreshUser } = useWalletAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show banner if user is logged in and email is NOT verified
  if (!user || user.emailVerified === true || isDismissed) {
    return null;
  }

  // Debug logging
  console.log('EmailVerificationBanner - User object:', user);
  console.log('EmailVerificationBanner - emailVerified:', user.emailVerified);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      toast.success('✅ Verification status refreshed!');
    } catch (error: any) {
      toast.error('Failed to refresh verification status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await apiService.resendVerificationEmail();
      toast.success('📧 Verification email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              📧 Please verify your email address to access all features
            </p>
            <p className="text-xs opacity-90">
              Check your inbox for a verification link sent to {user.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 
                     rounded-lg text-xs font-medium transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed"
            title="Check if email is already verified"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" />
                <span>Check Status</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 
                     rounded-lg text-sm font-medium transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Resend Email</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
