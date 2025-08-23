import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import EventCreate from './pages/EventCreate';
import EventCheckin from './pages/EventCheckin';
import Certificates from './pages/Certificates';
import Profile from './pages/Profile';
import Events from './pages/Events';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/event/create" element={<EventCreate />} />
            <Route path="/event/checkin" element={<EventCheckin />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
