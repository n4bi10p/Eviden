import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import StatCard from './ui/StatCard';
import Chart from './ui/Chart';
import { cn } from '../utils';
import { Calendar, Users, Award, TrendingUp, Activity } from 'lucide-react';
import { ApiService } from '../services/ApiService';

interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalCertificates: number;
  activeEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  growthRate: number;
  engagementRate: number;
}

export function LiveAnalyticsDashboard() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalUsers: 0,
    totalCertificates: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    growthRate: 0,
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Fetch real-time data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const apiService = new ApiService();
        
        // Try to fetch dashboard stats
        try {
          const statsResponse = await apiService.getDashboardStats();
          if (statsResponse.success) {
            setDashboardStats(statsResponse.data);
          } else {
            throw new Error('Failed to fetch stats');
          }
        } catch (statsError) {
          // Fallback to mock data if API doesn't exist yet
          setDashboardStats({
            totalEvents: 156,
            totalUsers: 2847,
            totalCertificates: 1293,
            activeEvents: 23,
            upcomingEvents: 47,
            completedEvents: 86,
            growthRate: 24.5,
            engagementRate: 87.3,
          });
        }

        // Set mock chart data (would be fetched from API in real implementation)
        setChartData([
          { name: 'Jan', events: 45, users: 234, certificates: 123 },
          { name: 'Feb', events: 52, users: 345, certificates: 156 },
          { name: 'Mar', events: 38, users: 289, certificates: 134 },
          { name: 'Apr', events: 67, users: 456, certificates: 234 },
          { name: 'May', events: 84, users: 567, certificates: 345 },
          { name: 'Jun', events: 92, users: 678, certificates: 456 },
        ]);

      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchData = async () => {
        try {
          const apiService = new ApiService();
          const statsResponse = await apiService.getDashboardStats();
          if (statsResponse.success) {
            setDashboardStats(statsResponse.data);
          }
        } catch (error) {
          console.error('Error refreshing analytics data:', error);
        }
      };
      
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events' },
    { id: 'users', label: 'Users' },
    { id: 'certificates', label: 'Certificates' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen p-6 transition-all duration-300',
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={cn(
            'text-4xl font-bold mb-2',
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          )}>
            Live Analytics Dashboard
          </h1>
          <p className={cn(
            'text-lg',
            theme === 'dark' ? 'text-white/70' : 'text-slate-600'
          )}>
            Real-time insights and performance metrics
          </p>
          {loading && (
            <div className="inline-flex items-center mt-2 text-sm text-blue-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              Loading real-time data...
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 rounded-xl bg-black/5 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'bg-white text-slate-800 shadow-sm'
                    : theme === 'dark'
                      ? 'text-white/60 hover:text-white/80'
                      : 'text-slate-600 hover:text-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Events"
                value={dashboardStats.totalEvents}
                change={{
                  value: `+${dashboardStats.growthRate}%`,
                  isPositive: true
                }}
                icon={Calendar}
              />
              <StatCard
                title="Total Users"
                value={dashboardStats.totalUsers}
                change={{
                  value: "+18.2%",
                  isPositive: true
                }}
                icon={Users}
              />
              <StatCard
                title="Certificates Issued"
                value={dashboardStats.totalCertificates}
                change={{
                  value: "+23.1%",
                  isPositive: true
                }}
                icon={Award}
              />
              <StatCard
                title="Engagement Rate"
                value={`${dashboardStats.engagementRate}%`}
                change={{
                  value: "+5.2%",
                  isPositive: true
                }}
                icon={TrendingUp}
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  Platform Growth
                </h3>
                <Chart
                  data={chartData}
                  type="area"
                  height={300}
                />
              </div>

              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  Recent Events Performance
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 1, title: 'Web3 Summit 2025', attendees: 245 },
                    { id: 2, title: 'Blockchain Conference', attendees: 189 },
                    { id: 3, title: 'DeFi Workshop', attendees: 156 },
                    { id: 4, title: 'Smart Contracts 101', attendees: 134 },
                    { id: 5, title: 'NFT Masterclass', attendees: 123 }
                  ].map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                      )}>
                        {event.title}
                      </span>
                      <span className={cn(
                        'text-sm font-medium',
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      )}>
                        {event.attendees} attendees
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Active Events"
                value={dashboardStats.activeEvents}
                change={{
                  value: "+12%",
                  isPositive: true
                }}
                icon={Activity}
              />
              <StatCard
                title="Upcoming Events"
                value={dashboardStats.upcomingEvents}
                change={{
                  value: "+8%",
                  isPositive: true
                }}
                icon={Calendar}
              />
              <StatCard
                title="Completed Events"
                value={dashboardStats.completedEvents}
                change={{
                  value: "+15%",
                  isPositive: true
                }}
                icon={Award}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  Events by Category
                </h3>
                <Chart
                  data={[
                    { name: 'Technology', value: 45 },
                    { name: 'Business', value: 32 },
                    { name: 'Education', value: 28 },
                    { name: 'Healthcare', value: 24 },
                    { name: 'Finance', value: 19 },
                  ]}
                  type="pie"
                  height={250}
                />
              </div>

              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  Event Attendance Trends
                </h3>
                <Chart
                  data={chartData.map(item => ({
                    name: item.name,
                    attendance: item.users,
                    capacity: item.users + 50,
                  }))}
                  type="bar"
                  height={250}
                />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="New Users"
                value={234}
                change={{
                  value: "+28%",
                  isPositive: true
                }}
                icon={Users}
              />
              <StatCard
                title="Active Users"
                value={1847}
                change={{
                  value: "+12%",
                  isPositive: true
                }}
                icon={Activity}
              />
              <StatCard
                title="User Retention"
                value="84.2%"
                change={{
                  value: "+3.1%",
                  isPositive: true
                }}
                icon={TrendingUp}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  User Registration Trends
                </h3>
                <Chart
                  data={chartData.map(item => ({
                    name: item.name,
                    registrations: item.users,
                  }))}
                  type="line"
                  height={250}
                />
              </div>

              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  User Activity
                </h3>
                <Chart
                  data={[
                    { hour: '00:00', activity: 12 },
                    { hour: '06:00', activity: 34 },
                    { hour: '12:00', activity: 89 },
                    { hour: '18:00', activity: 156 },
                    { hour: '24:00', activity: 67 },
                  ]}
                  type="bar"
                  height={250}
                />
              </div>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Certificates Minted"
                value={dashboardStats.totalCertificates}
                change={{
                  value: "+23%",
                  isPositive: true
                }}
                icon={Award}
              />
              <StatCard
                title="Verification Rate"
                value="96.8%"
                change={{
                  value: "+2.1%",
                  isPositive: true
                }}
                icon={TrendingUp}
              />
              <StatCard
                title="Blockchain Confirmations"
                value="100%"
                change={{
                  value: "0%",
                  isPositive: false
                }}
                icon={Activity}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  Certificate Issuance
                </h3>
                <Chart
                  data={chartData.map(item => ({
                    name: item.name,
                    certificates: item.certificates,
                  }))}
                  type="area"
                  height={250}
                />
              </div>

              <div className={cn(
                'rounded-xl p-6',
                theme === 'dark'
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20'
                  : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg'
              )}>
                <h3 className={cn(
                  'text-lg font-semibold mb-4',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  Top Certificate Categories
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Workshop Completion', value: 456 },
                    { name: 'Conference Attendance', value: 234 },
                    { name: 'Speaker Recognition', value: 189 },
                    { name: 'Volunteer Service', value: 145 },
                    { name: 'Achievement Awards', value: 98 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                      )}>
                        {item.name}
                      </span>
                      <span className={cn(
                        'text-sm font-medium',
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      )}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveAnalyticsDashboard;
