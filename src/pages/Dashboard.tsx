
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import { Link } from 'react-router-dom';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';
import { useEvents } from '../contexts/EventContext';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useWalletAuth();
  const { theme } = useTheme();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user but not loading, show minimal loading (should be handled by ProtectedRoute)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Mock data matching the inspirational UI
  const stats = [
    { id: 1, title: 'Upcoming Events', value: '12', icon: '📅', color: 'blue' },
    { id: 2, title: 'Total Attendees', value: '3.2K', icon: '👥', color: 'green' },
    { id: 3, title: 'Cities Worldwide', value: '45', icon: '🌍', color: 'purple' },
    { id: 4, title: 'Verification Rate', value: '98%', icon: '✅', color: 'cyan' }
  ];

  // Use events from context
  const { events } = useEvents();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatColor = (color: string) => {
    const colors = {
      blue: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      green: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      purple: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      cyan: theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6 lg:space-y-8">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Discover Events 🎯
            </h1>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Find and attend blockchain events with verified certificates
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/events"
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-cyber-purple/50 text-cyber-cyan hover:bg-cyber-purple/20'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              🔍 Advanced Search
            </Link>
            <Link
              to="/event-create"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-cyber-purple to-cyber-cyan text-white hover:shadow-lg hover:shadow-cyber-cyan/25'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
              }`}
            >
              ➕ Create Event
            </Link>
          </div>
        </header>

        {/* Statistics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <GlassCard key={stat.id} className="text-center hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-center mb-3">
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <div className={`text-3xl font-bold mb-2 ${getStatColor(stat.color)}`}>
                {stat.value}
              </div>
              <div className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-600'
              }`}>
                {stat.title}
              </div>
            </GlassCard>
          ))}
        </section>

        {/* Featured Events */}
        <section>
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Featured Events
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <GlassCard key={event.id} className="hover:scale-105 transition-all duration-300 group">
                <div className="space-y-4">
                  {/* Event Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                        theme === 'dark' ? 'bg-cyber-purple/20' : 'bg-blue-100'
                      }`}>
                        {event.image}
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(event.status)}`}>
                          📅 {event.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <h3 className={`text-lg font-bold group-hover:text-cyber-cyan transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {event.title}
                    </h3>
                    
                    <div className={`text-sm ${theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'}`}>
                      by {event.organizer}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>
                          {event.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🕒</span>
                        <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📍</span>
                        <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>💰</span>
                        <span className={`font-medium ${
                          event.price === 'Free' 
                            ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                            : (theme === 'dark' ? 'text-white/80' : 'text-slate-700')
                        }`}>
                          {event.price}
                        </span>
                      </div>
                    </div>

                    <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                      {event.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {event.tags && event.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            theme === 'dark'
                              ? 'bg-cyber-purple/20 text-cyber-cyan'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Attendees Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                          Attendees
                        </span>
                        <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                          {event.attendees}/{event.maxAttendees}
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      event.status === 'completed'
                        ? (theme === 'dark'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                            : 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200')
                        : (theme === 'dark'
                            ? 'bg-gradient-to-r from-cyber-purple to-cyber-cyan text-white hover:shadow-lg hover:shadow-cyber-cyan/25'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg')
                    }`}>
                      {event.status === 'completed' ? '🏆 View Certificate' : '📝 Register Now'}
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Host Your Own Event CTA */}
        <section>
          <GlassCard className="text-center py-12">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                Host Your Own Event
              </h2>
              <p className={`text-lg ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                Create verifiable attendance certificates for your events. Build trust and provide lasting value to your attendees with blockchain verification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/event-create"
                  className={`px-8 py-4 rounded-lg font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-cyber-purple to-cyber-cyan text-white hover:shadow-lg hover:shadow-cyber-cyan/25'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
                  }`}
                >
                  ➕ Create Event
                </Link>
                <button className={`px-8 py-4 rounded-lg font-medium border transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-cyber-purple/50 text-cyber-cyan hover:bg-cyber-purple/20'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}>
                  📚 Learn More
                </button>
              </div>
            </div>
          </GlassCard>
        </section>
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;
