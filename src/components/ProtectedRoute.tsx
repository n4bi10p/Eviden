import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWalletAuth } from '../contexts/WalletAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: Array<'attendee' | 'organizer' | 'admin'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/',
  allowedRoles
}) => {
  const { user, isLoading } = useWalletAuth();

  // Show loading while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authentication is required and user is not logged in, redirect
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
