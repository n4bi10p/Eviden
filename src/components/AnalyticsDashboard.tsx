import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';

interface AnalyticsData {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  eventsThisMonth: number;
  attendeesThisMonth: number;
  revenueThisMonth: number;
  topEvents: Array<{
    id: string;
    name: string;
    attendees: number;
    revenue: number;
    rating: number;
  }>;
  attendeeGrowth: Array<{
    month: string;
    attendees: number;
  }>;
  revenueGrowth: Array<{
    month: string;
    revenue: number;
  }>;
  demographics: {
    ageGroups: Array<{ group: string; percentage: number }>;
    locations: Array<{ location: string; percentage: number }>;
    interests: Array<{ interest: string; percentage: number }>;
  };
}

interface AnalyticsDashboardProps {
  userRole?: 'organizer' | 'attendee';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  userRole = 'organizer' 
}) => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'attendees' | 'revenue' | 'events'>('attendees');

  // Mock analytics data
  const mockData: AnalyticsData = {
    totalEvents: 45,
    totalAttendees: 1247,
    totalRevenue: 28750,
    eventsThisMonth: 8,
    attendeesThisMonth: 234,
    revenueThisMonth: 5680,
    topEvents: [
      {
        id: '1',
        name: 'Blockchain Summit 2025',
        attendees: 450,
        revenue: 13500,
        rating: 4.9
      },
      {
        id: '2',
        name: 'Web3 Developer Workshop',
        attendees: 180,
        revenue: 5400,
        rating: 4.8
      },
      {
        id: '3',
        name: 'DeFi Strategy Meetup',
        attendees: 120,
        revenue: 0,
        rating: 4.7
      },
      {
        id: '4',
        name: 'NFT Creation Bootcamp',
        attendees: 85,
        revenue: 4250,
        rating: 4.6
      },
      {
        id: '5',
        name: 'Smart Contract Security',
        attendees: 67,
        revenue: 3350,
        rating: 4.8
      }
    ],
    attendeeGrowth: [
      { month: 'Jan', attendees: 120 },
      { month: 'Feb', attendees: 180 },
      { month: 'Mar', attendees: 220 },
      { month: 'Apr', attendees: 280 },
      { month: 'May', attendees: 350 },
      { month: 'Jun', attendees: 420 }
    ],
    revenueGrowth: [
      { month: 'Jan', revenue: 2500 },
      { month: 'Feb', revenue: 4200 },
      { month: 'Mar', revenue: 3800 },
      { month: 'Apr', revenue: 5600 },
      { month: 'May', revenue: 7200 },
      { month: 'Jun', revenue: 8900 }
    ],
    demographics: {
      ageGroups: [
        { group: '18-25', percentage: 35 },
        { group: '26-35', percentage: 40 },
        { group: '36-45', percentage: 20 },
        { group: '46+', percentage: 5 }
      ],
      locations: [
        { location: 'San Francisco', percentage: 25 },
        { location: 'New York', percentage: 20 },
        { location: 'Austin', percentage: 15 },
        { location: 'Chicago', percentage: 12 },
        { location: 'Others', percentage: 28 }
      ],
      interests: [
        { interest: 'Blockchain', percentage: 45 },
        { interest: 'DeFi', percentage: 30 },
        { interest: 'NFTs', percentage: 25 },
        { interest: 'Gaming', percentage: 20 },
        { interest: 'Art', percentage: 15 }
      ]
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string;
    change?: number;
    icon: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-pink-500',
      orange: 'from-orange-500 to-red-500'
    };

    return (
      <GlassCard className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              {title}
            </p>
            <p className={`text-2xl font-bold mt-1 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {value}
            </p>
            {change !== undefined && (
              <p className={`text-sm mt-1 flex items-center ${
                change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                <span className="mr-1">
                  {change >= 0 ? '↗️' : '↘️'}
                </span>
                {Math.abs(change)}% from last month
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white text-xl`}>
            {icon}
          </div>
        </div>
      </GlassCard>
    );
  };

  const ProgressBar = ({ 
    label, 
    percentage, 
    color = 'blue' 
  }: {
    label: string;
    percentage: number;
    color?: string;
  }) => {
    const colorClass = color === 'blue' ? 'bg-blue-500' : 
                     color === 'green' ? 'bg-green-500' :
                     color === 'purple' ? 'bg-purple-500' :
                     color === 'orange' ? 'bg-orange-500' : 'bg-blue-500';

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={`${
            theme === 'dark' ? 'text-white/80' : 'text-slate-700'
          }`}>
            {label}
          </span>
          <span className={`font-medium ${
            theme === 'dark' ? 'text-white/90' : 'text-slate-800'
          }`}>
            {percentage}%
          </span>
        </div>
        <div className={`h-2 rounded-full ${
          theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
        }`}>
          <div 
            className={`h-full rounded-full ${colorClass} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const SimpleChart = ({ 
    data
  }: {
    data: Array<{ label: string; value: number }>;
    type?: 'line' | 'bar';
    color?: string;
  }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between h-32 space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500`}
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <span className={`text-xs mt-2 ${
                theme === 'dark' ? 'text-white/60' : 'text-slate-600'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Analytics Dashboard 📊
          </h2>
          <p className={`${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            {userRole === 'organizer' 
              ? 'Track your event performance and audience insights'
              : 'Your event participation and achievements'
            }
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex rounded-lg overflow-hidden border border-white/20">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-white/5 text-white/70 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Events"
          value={formatNumber(mockData.totalEvents)}
          change={getGrowthPercentage(mockData.eventsThisMonth, 6)}
          icon="📅"
          color="blue"
        />
        <MetricCard
          title="Total Attendees"
          value={formatNumber(mockData.totalAttendees)}
          change={getGrowthPercentage(mockData.attendeesThisMonth, 189)}
          icon="👥"
          color="green"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(mockData.totalRevenue)}
          change={getGrowthPercentage(mockData.revenueThisMonth, 4200)}
          icon="💰"
          color="purple"
        />
        <MetricCard
          title="Avg Rating"
          value="4.7"
          change={5}
          icon="⭐"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Growth Trends
            </h3>
            <div className="flex rounded-lg overflow-hidden border border-white/20">
              {(['attendees', 'revenue', 'events'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    selectedMetric === metric
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-white/5 text-white/70 hover:bg-white/10'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <SimpleChart
            data={
              selectedMetric === 'attendees' 
                ? mockData.attendeeGrowth.map(d => ({ label: d.month, value: d.attendees }))
                : selectedMetric === 'revenue'
                ? mockData.revenueGrowth.map(d => ({ label: d.month, value: d.revenue / 100 }))
                : [
                    { label: 'Jan', value: 3 },
                    { label: 'Feb', value: 5 },
                    { label: 'Mar', value: 4 },
                    { label: 'Apr', value: 7 },
                    { label: 'May', value: 8 },
                    { label: 'Jun', value: 6 }
                  ]
            }
          />
        </GlassCard>

        {/* Top Events */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Top Performing Events
          </h3>
          
          <div className="space-y-4">
            {mockData.topEvents.slice(0, 5).map((event, index) => (
              <div key={event.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {event.name}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                    }`}>
                      {event.attendees} attendees • ⭐ {event.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {event.revenue > 0 ? formatCurrency(event.revenue) : 'Free'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Demographics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Groups */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Age Demographics
          </h3>
          <div className="space-y-4">
            {mockData.demographics.ageGroups.map((group) => (
              <ProgressBar
                key={group.group}
                label={group.group}
                percentage={group.percentage}
                color="blue"
              />
            ))}
          </div>
        </GlassCard>

        {/* Locations */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Top Locations
          </h3>
          <div className="space-y-4">
            {mockData.demographics.locations.map((location) => (
              <ProgressBar
                key={location.location}
                label={location.location}
                percentage={location.percentage}
                color="green"
              />
            ))}
          </div>
        </GlassCard>

        {/* Interests */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Popular Interests
          </h3>
          <div className="space-y-4">
            {mockData.demographics.interests.map((interest) => (
              <ProgressBar
                key={interest.interest}
                label={interest.interest}
                percentage={interest.percentage}
                color="purple"
              />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Export Options */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Export Analytics
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              Download your analytics data for external analysis
            </p>
          </div>
          
          <div className="flex space-x-3">
            <MacOSButton
              variant="secondary"
              icon="📊"
              onClick={() => {
                // Simulate CSV export
                const csvData = 'data:text/csv;charset=utf-8,Event,Attendees,Revenue\n' +
                  mockData.topEvents.map(e => `${e.name},${e.attendees},${e.revenue}`).join('\n');
                const link = document.createElement('a');
                link.href = encodeURI(csvData);
                link.download = 'analytics-data.csv';
                link.click();
              }}
            >
              Export CSV
            </MacOSButton>
            
            <MacOSButton
              icon="📈"
              onClick={() => {
                // Simulate PDF export
                alert('PDF report generation started! You will receive an email when ready.');
              }}
            >
              Generate Report
            </MacOSButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AnalyticsDashboard;
