import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Since we now use redirect-based verification,
    // this component should redirect to the verification result page
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    // Redirect to backend verification endpoint
    window.location.href = `http://localhost:5000/api/auth/verify-email?token=${token}`;
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" />
      
      <GlassCard className="w-full max-w-md text-center relative z-10">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">
              Verifying Your Email
            </h1>
            <p className="text-white/80">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-400 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              ✅ Email Verified!
            </h1>
            <p className="text-white/80 mb-6">
              {message}
            </p>
            <p className="text-white/60 text-sm">
              Redirecting to dashboard in 3 seconds...
            </p>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="mt-4"
            >
              Go to Dashboard Now
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-400 mb-6">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              ❌ Verification Failed
            </h1>
            <p className="text-white/80 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/auth'}
                className="w-full"
              >
                Back to Login
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
};

export default VerifyEmail;
