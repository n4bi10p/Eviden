import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import ResponsiveLayout from '../components/ResponsiveLayout';
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
    <ResponsiveLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Welcome back, {user.name}! 👋
            </h1>
            <p className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Manage your events and certificates
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <GlassCard className="text-center">
            <div className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-blue-600'
            }`}>5</div>
            <div className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Events Attended</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-green-600'
            }`}>490</div>
            <div className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Total Attendees</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-purple-600'
            }`}>2</div>
            <div className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Certificates</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-orange-600'
            }`}>3</div>
            <div className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Events Created</div>
          </GlassCard>
        </div>

        {/* Recent Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Events List */}
          <GlassCard>
            <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Recent Events 📅
            </h2>
            <div className="space-y-3 md:space-y-4">
              {allEvents.map((event) => (
                <div key={event.id} className={`p-3 md:p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm md:text-base ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>{event.name}</h3>
                      <p className={`text-xs md:text-sm ${
                        theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                      }`}>{event.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'active' 
                          ? (theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                          : event.status === 'upcoming'
                          ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                          : (theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700')
                      }`}>
                        {event.status}
                      </span>
                      <p className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                      }`}>
                        {event.attendees}/{event.maxAttendees}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Certificates */}
          <GlassCard>
            <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Recent Certificates 🏆
            </h2>
            <div className="space-y-3 md:space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className={`p-3 md:p-4 rounded-lg border ${
                  theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <h3 className={`font-semibold text-sm md:text-base flex-1 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>{cert.event}</h3>
                    {cert.verified && <span className={`text-sm ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>✓</span>}
                  </div>
                  <p className={`text-xs md:text-sm mb-1 ${
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
    </ResponsiveLayout>
  );
};

export default Dashboard;
