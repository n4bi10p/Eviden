import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { useUser } from './contexts/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EventCreate from './pages/EventCreate';
import EventCheckin from './pages/EventCheckin';
import Certificates from './pages/Certificates';
import Profile from './pages/Profile';
import Events from './pages/Events';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import ComponentsDemo from './pages/ComponentsDemo';

// App Router Component
const AppRouter: React.FC = () => {
  const { user } = useUser();

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
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
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
          
          {/* Default Route */}
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
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
      <UserProvider>
        <AppRouter />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
