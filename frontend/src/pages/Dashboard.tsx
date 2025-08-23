import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';

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
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Responsive Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1">
            <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Welcome back, {user.name}! 👋
            </h1>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Manage your events and certificates
            </p>
          </div>
        </header>

        {/* Responsive Quick Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" aria-label="Quick statistics">
          <GlassCard className="text-center">
            <div className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-blue-600'
            }`}>5</div>
            <div className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Events Attended</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-green-600'
            }`}>490</div>
            <div className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Total Attendees</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-purple-600'
            }`}>2</div>
            <div className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Certificates</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-orange-600'
            }`}>3</div>
            <div className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Events Created</div>
          </GlassCard>
        </section>

        {/* Responsive Content Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8" aria-label="Dashboard content">
          {/* Events List */}
          <GlassCard>
            <h2 className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-3 sm:mb-4 lg:mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Recent Events 📅
            </h2>
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {allEvents.map((event) => (
                <div key={event.id} className={`p-2 sm:p-3 lg:p-4 rounded-lg border touch-friendly ${
                  theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-responsive-sm sm:text-responsive-base truncate ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>{event.name}</h3>
                      <p className={`text-responsive-xs sm:text-responsive-sm ${
                        theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                      }`}>{event.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-1 rounded text-responsive-xs font-medium ${
                        event.status === 'active' 
                          ? (theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                          : event.status === 'upcoming'
                          ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')
                          : (theme === 'dark' ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700')
                      }`}>
                        {event.status}
                      </span>
                      <p className={`text-responsive-xs mt-1 ${
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
            <h2 className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-3 sm:mb-4 lg:mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Recent Certificates 🏆
            </h2>
            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className={`p-2 sm:p-3 lg:p-4 rounded-lg border touch-friendly ${
                  theme === 'dark' ? 'border-cyber-purple/30' : 'border-slate-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold text-responsive-sm sm:text-responsive-base flex-1 min-w-0 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>{cert.event}</h3>
                    {cert.verified && <span className={`text-responsive-sm flex-shrink-0 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>✓</span>}
                  </div>
                  <p className={`text-responsive-xs sm:text-responsive-sm mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                  }`}>{cert.issuer}</p>
                  <p className={`text-responsive-xs ${
                    theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                  }`}>{cert.date}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;
