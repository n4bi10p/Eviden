import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import CyberButton from '../components/MacOSButton';

const Dashboard: React.FC = () => {
  const [userType, setUserType] = useState<'organizer' | 'attendee'>('attendee');
  const { theme } = useTheme();

  const organizerEvents = [
    { id: 1, name: 'Blockchain Summit 2025', attendees: 245, maxAttendees: 300, status: 'active' },
    { id: 2, name: 'DeFi Workshop', attendees: 89, maxAttendees: 100, status: 'upcoming' },
    { id: 3, name: 'Web3 Hackathon', attendees: 156, maxAttendees: 200, status: 'completed' }
  ];

  const attendeeEvents = [
    { id: 1, name: 'Blockchain Summit 2025', date: 'March 15, 2025', location: 'San Francisco', status: 'upcoming' },
    { id: 2, name: 'DeFi Workshop', date: 'March 20, 2025', location: 'New York', status: 'registered' },
    { id: 3, name: 'Web3 Hackathon', date: 'February 28, 2025', location: 'Austin', status: 'completed' }
  ];

  const certificates = [
    { id: 1, event: 'Web3 Fundamentals', issuer: 'TechCorp', date: 'Feb 2025', verified: true },
    { id: 2, event: 'Smart Contract Security', issuer: 'BlockchainEdu', date: 'Jan 2025', verified: true }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar userType={userType} />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Welcome back! 👋
            </h1>
            <p className={`${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              {userType === 'organizer' ? 'Manage your events and track attendance' : 'Discover events and manage your certificates'}
            </p>
          </div>
          
          {/* User Type Switcher */}
          <div className="flex space-x-2">
            <CyberButton
              variant={userType === 'attendee' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setUserType('attendee')}
            >
              Attendee View
            </CyberButton>
            <CyberButton
              variant={userType === 'organizer' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setUserType('organizer')}
            >
              Organizer View
            </CyberButton>
          </div>
        </div>

        {userType === 'organizer' ? (
          // Organizer Dashboard
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-cyber-cyan' : 'text-blue-600'
                }`}>3</div>
                <div className={`${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>Active Events</div>
              </GlassCard>
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-cyber-cyan' : 'text-green-600'
                }`}>490</div>
                <div className={`${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>Total Attendees</div>
              </GlassCard>
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-cyber-cyan' : 'text-purple-600'
                }`}>98%</div>
                <div className={`${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>Verification Rate</div>
              </GlassCard>
            </div>

            {/* Events List */}
            <GlassCard>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>Your Events</h2>
                <CyberButton icon="➕">Create Event</CyberButton>
              </div>
              
              <div className="space-y-4">
                {organizerEvents.map((event) => (
                  <div key={event.id} className={`glass-dark rounded-lg p-4 flex justify-between items-center border ${
                    theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                  }`}>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>{event.name}</h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                      }`}>
                        {event.attendees}/{event.maxAttendees} attendees
                      </p>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium border
                      ${event.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 
                        event.status === 'upcoming' ? (theme === 'dark' 
                          ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50' 
                          : 'bg-macos-blue/20 text-macos-blue border-macos-blue/50') :
                        'bg-gray-500/20 text-gray-400 border-gray-500/50'}
                    `}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ) : (
          // Attendee Dashboard
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-cyber-cyan' : 'text-blue-600'
                }`}>5</div>
                <div className={`${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>Events Attended</div>
              </GlassCard>
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-cyber-cyan' : 'text-green-600'
                }`}>850</div>
                <div className={`${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>Reputation Score</div>
              </GlassCard>
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-cyber-cyan' : 'text-purple-600'
                }`}>3</div>
                <div className={`${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>Upcoming Events</div>
              </GlassCard>
            </div>

            {/* Upcoming Events */}
            <GlassCard>
              <h2 className={`text-xl font-semibold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Upcoming Events</h2>
              <div className="space-y-4">
                {attendeeEvents.filter(e => e.status !== 'completed').map((event) => (
                  <div key={event.id} className={`glass-dark rounded-lg p-4 flex justify-between items-center border ${
                    theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                  }`}>
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>{event.name}</h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                      }`}>{event.date} • {event.location}</p>
                    </div>
                    <CyberButton size="sm">Check In</CyberButton>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Certificates */}
            <GlassCard>
              <h2 className={`text-xl font-semibold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Recent Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className={`glass-dark rounded-lg p-4 border ${
                    theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>{cert.event}</h3>
                      {cert.verified && <span className={`${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}>✓</span>}
                    </div>
                    <p className={`text-sm mb-1 ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                    }`}>{cert.issuer}</p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                    }`}>{cert.date}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
