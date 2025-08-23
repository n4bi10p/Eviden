import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import CyberButton from '../components/MacOSButton';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();

  // If user is not authenticated, show loading or redirect (handled by route protection)
  if (!user) {
    return <div>Loading...</div>;
  }

  const allEvents = [
    { id: 1, name: 'Blockchain Summit 2025', date: 'March 15, 2025', attendees: 245, maxAttendees: 300, status: 'active' },
    { id: 2, name: 'DeFi Workshop', date: 'March 20, 2025', attendees: 89, maxAttendees: 100, status: 'upcoming' },
    { id: 3, name: 'Web3 Hackathon', date: 'February 28, 2025', attendees: 156, maxAttendees: 200, status: 'completed' }
  ];

  const certificates = [
    { id: 1, event: 'Web3 Fundamentals', issuer: 'TechCorp', date: 'Feb 2025', verified: true },
    { id: 2, event: 'Smart Contract Security', issuer: 'BlockchainEdu', date: 'Jan 2025', verified: true }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Welcome back, {user.name}! 👋
            </h1>
            <p className={`${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Manage your events and certificates
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              }`}>490</div>
              <div className={`${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>Total Attendees</div>
            </GlassCard>
            <GlassCard className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-cyber-cyan' : 'text-purple-600'
              }`}>3</div>
              <div className={`${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>Certificates Earned</div>
            </GlassCard>
            <GlassCard className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-cyber-cyan' : 'text-orange-600'
              }`}>98%</div>
              <div className={`${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>Verification Rate</div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Quick Actions</h2>
              <div className="space-y-3">
                <CyberButton className="w-full" icon="➕">Create New Event</CyberButton>
                <CyberButton className="w-full" variant="secondary" icon="�">Discover Events</CyberButton>
                <CyberButton className="w-full" variant="secondary" icon="�">Check In to Event</CyberButton>
                <CyberButton className="w-full" variant="secondary" icon="📊">View Analytics</CyberButton>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Recent Activity</h2>
              <div className="space-y-3">
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                }`}>
                  <p>• New attendee registered for Blockchain Summit</p>
                  <p>• Checked in to Web3 Summit</p>
                  <p>• Certificate issued to 0x123...abc</p>
                  <p>• Validated 3 peers at DeFi Workshop</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Events */}
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>Events</h2>
              <CyberButton icon="➕">Create Event</CyberButton>
            </div>
            
            <div className="space-y-4">
              {allEvents.map((event) => (
                <div key={event.id} className={`glass-dark rounded-lg p-4 flex justify-between items-center border ${
                  theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                }`}>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>{event.name}</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                    }`}>
                      {event.date} • {event.attendees}/{event.maxAttendees} attendees
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
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
                    <CyberButton size="sm" variant="secondary">
                      {event.status === 'upcoming' ? 'Check In' : 'Manage'}
                    </CyberButton>
                  </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
