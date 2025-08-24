import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletAuthProvider } from './contexts/WalletAuthContext';
import { useWalletAuth } from './contexts/WalletAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmailResult from './pages/VerifyEmailResult';
import EventCreate from './pages/EventCreate';
import EventCheckin from './pages/EventCheckin';
import Certificates from './pages/Certificates';
import Profile from './pages/Profile';
import Events from './pages/Events';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ComponentsDemo from './pages/ComponentsDemo';
import ApiDebugTest from './components/ApiDebugTest';
import AuthTest from './components/AuthTest';

// App Router Component
const AppRouter: React.FC = () => {
  const { user } = useWalletAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
          />
          <Route 
            path="/verify-email-result" 
            element={<VerifyEmailResult />} 
          />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          
          <Route path="/event-create" element={
            <ProtectedRoute>
              <EventCreate />
            </ProtectedRoute>
          } />
          
          <Route path="/event-checkin/:eventId" element={
            <ProtectedRoute>
              <EventCheckin />
            </ProtectedRoute>
          } />
          
          <Route path="/certificates" element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/demo" element={
            <ProtectedRoute>
              <ComponentsDemo />
            </ProtectedRoute>
          } />
          
          <Route path="/debug" element={
            <ApiDebugTest />
          } />
          
          <Route path="/auth-test" element={
            <AuthTest />
          } />
          
          {/* Default Route */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
          />
          
          {/* Catch All Route */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <WalletAuthProvider>
        <AppRouter />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
            },
          }}
        />
      </WalletAuthProvider>
    </ThemeProvider>
  );
}

export default App;
