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
  const { user, isConnected } = useWalletAuth();

  // If authentication is required and user is not logged in, redirect
  if (requireAuth && (!isConnected || !user)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
