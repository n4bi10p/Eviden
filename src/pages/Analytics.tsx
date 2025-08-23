import React from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';

const Analytics: React.FC = () => {
  const stats = {
    totalEvents: 12,
    totalAttendees: 1547,
    verificationRate: 96.8,
    averageRating: 4.7,
    activeEvents: 3,
    upcomingEvents: 5
  };

  const recentEvents = [
    { name: 'Blockchain Summit 2025', attendees: 245, checkedIn: 198, rate: 80.8 },
    { name: 'DeFi Workshop', attendees: 89, checkedIn: 85, rate: 95.5 },
    { name: 'Web3 Bootcamp', attendees: 156, checkedIn: 142, rate: 91.0 }
  ];

  const checkInActivity = [
    { hour: '09:00', count: 12 },
    { hour: '10:00', count: 45 },
    { hour: '11:00', count: 78 },
    { hour: '12:00', count: 65 },
    { hour: '13:00', count: 32 },
    { hour: '14:00', count: 58 },
    { hour: '15:00', count: 71 },
    { hour: '16:00', count: 43 },
    { hour: '17:00', count: 28 }
  ];

  const maxCheckins = Math.max(...checkInActivity.map(item => item.count));

  return (
    <div className="flex min-h-screen bg-pastel-gradient">
      <Sidebar userType="organizer" />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-macos-gray-800 mb-2">
              Analytics Dashboard 📊
            </h1>
            <p className="text-macos-gray-600">
              Track your event performance and attendee engagement
            </p>
          </div>
          
          <div className="flex space-x-3">
            <MacOSButton variant="secondary" size="sm" icon="📊">
              Export Report
            </MacOSButton>
            <MacOSButton size="sm" icon="🔄">
              Refresh Data
            </MacOSButton>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-blue mb-1">{stats.totalEvents}</div>
            <div className="text-sm text-macos-gray-600">Total Events</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-green mb-1">{stats.totalAttendees.toLocaleString()}</div>
            <div className="text-sm text-macos-gray-600">Total Attendees</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-teal mb-1">{stats.verificationRate}%</div>
            <div className="text-sm text-macos-gray-600">Verification Rate</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-purple mb-1">{stats.averageRating}</div>
            <div className="text-sm text-macos-gray-600">Avg Rating</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-orange mb-1">{stats.activeEvents}</div>
            <div className="text-sm text-macos-gray-600">Active Events</div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-pink mb-1">{stats.upcomingEvents}</div>
            <div className="text-sm text-macos-gray-600">Upcoming</div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Check-in Activity Chart */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-macos-gray-800 mb-6">
              Today's Check-in Activity
            </h3>
            
            <div className="space-y-4">
              {checkInActivity.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-12 text-sm text-macos-gray-600">{item.hour}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-macos-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-macos-blue to-macos-teal rounded-full transition-all duration-500"
                          style={{ width: `${(item.count / maxCheckins) * 100}%` }}
                        ></div>
                      </div>
                      <div className="w-8 text-sm font-medium text-macos-gray-800">{item.count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Live Event Status */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-macos-gray-800 mb-6">
              Live Event Status
            </h3>
            
            <div className="space-y-4">
              <div className="glass-dark rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-medium">Blockchain Summit 2025</h4>
                  <span className="px-2 py-1 bg-macos-green/20 text-macos-green text-xs rounded-full">🔴 Live</span>
                </div>
                <div className="text-white/70 text-sm mb-3">Moscone Center, San Francisco</div>
                
                {/* Real-time counter */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-white">198</div>
                    <div className="text-white/70 text-xs">Checked In</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-macos-teal">245</div>
                    <div className="text-white/70 text-xs">Registered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-macos-green">80.8%</div>
                    <div className="text-white/70 text-xs">Attendance</div>
                  </div>
                </div>
                
                <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-macos-green to-macos-teal h-2 rounded-full w-4/5 transition-all duration-300"></div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <MacOSButton variant="secondary" size="sm" className="text-xs">
                  View Live Map
                </MacOSButton>
                <MacOSButton variant="secondary" size="sm" className="text-xs">
                  Send Notification
                </MacOSButton>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Event Performance Table */}
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-macos-gray-800">
              Recent Event Performance
            </h3>
            <MacOSButton variant="secondary" size="sm">
              View All Events
            </MacOSButton>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-macos-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-macos-gray-600">Event Name</th>
                  <th className="text-center py-3 text-sm font-semibold text-macos-gray-600">Registered</th>
                  <th className="text-center py-3 text-sm font-semibold text-macos-gray-600">Checked In</th>
                  <th className="text-center py-3 text-sm font-semibold text-macos-gray-600">Attendance Rate</th>
                  <th className="text-center py-3 text-sm font-semibold text-macos-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event, index) => (
                  <tr key={index} className="border-b border-macos-gray-100 hover:bg-white/30 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-macos-gray-800">{event.name}</div>
                    </td>
                    <td className="text-center py-4 text-macos-gray-700">{event.attendees}</td>
                    <td className="text-center py-4 text-macos-gray-700">{event.checkedIn}</td>
                    <td className="text-center py-4">
                      <span className={`font-medium ${
                        event.rate >= 90 ? 'text-macos-green' : 
                        event.rate >= 80 ? 'text-macos-orange' : 'text-macos-red'
                      }`}>
                        {event.rate}%
                      </span>
                    </td>
                    <td className="text-center py-4">
                      <span className="px-2 py-1 bg-macos-green/20 text-macos-green text-xs rounded-full">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Geographic Distribution */}
        <div className="mt-8">
          <GlassCard>
            <h3 className="text-lg font-semibold text-macos-gray-800 mb-6">
              Geographic Distribution
            </h3>
            
            {/* Map Placeholder */}
            <div className="h-64 glass-dark rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-white">Interactive Heatmap</p>
                <p className="text-white/70 text-sm">Real-time check-ins by location</p>
              </div>
            </div>

            {/* Location Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-macos-blue mb-1">SF Bay Area</div>
                <div className="text-sm text-macos-gray-600">65% of attendees</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-macos-green mb-1">New York</div>
                <div className="text-sm text-macos-gray-600">20% of attendees</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-macos-purple mb-1">Other Cities</div>
                <div className="text-sm text-macos-gray-600">15% of attendees</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
