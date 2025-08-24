import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';
import { 
  StatCard, 
  Chart, 
  Tabs, 
  TopPerformingList 
} from './ui';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header with Time Range Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className={`text-3xl font-bold flex items-center gap-3 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Analytics Dashboard 📊
            </h2>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              {userRole === 'organizer' 
                ? 'Track your event performance and audience insights'
                : 'Your event participation and achievements'
              }
            </p>
          </div>
        </div>

        {/* Time Range Tabs */}
        <Tabs
          tabs={[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: 'year', label: 'Year' }
          ]}
          defaultTab={timeRange}
          onChange={(tabId) => setTimeRange(tabId as 'week' | 'month' | 'year')}
          variant="pills"
          className="w-fit"
        />
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={mockData.totalEvents}
          change={{
            value: "33% from last month",
            isPositive: true
          }}
          icon={Calendar}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Total Attendees"
          value={mockData.totalAttendees.toLocaleString()}
          change={{
            value: "24% from last month",
            isPositive: true
          }}
          icon={Users}
          iconColor="text-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${mockData.totalRevenue.toLocaleString()}`}
          change={{
            value: "35% from last month",
            isPositive: true
          }}
          icon={DollarSign}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Avg Rating"
          value="4.7"
          change={{
            value: "5% from last month",
            isPositive: true
          }}
          icon={Star}
          iconColor="text-yellow-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Growth Trends
            </h3>
            <Tabs
              tabs={[
                { id: 'attendees', label: 'Attendees' },
                { id: 'revenue', label: 'Revenue' },
                { id: 'events', label: 'Events' }
              ]}
              defaultTab={selectedMetric}
              onChange={(tabId) => setSelectedMetric(tabId as 'attendees' | 'revenue' | 'events')}
              variant="pills"
              size="sm"
            />
          </div>
          <Chart
            type="area"
            data={selectedMetric === 'attendees' ? mockData.attendeeGrowth : mockData.revenueGrowth}
            height={300}
            xAxisKey="month"
            dataKey={selectedMetric === 'attendees' ? 'attendees' : 'revenue'}
            color={selectedMetric === 'attendees' ? '#3B82F6' : '#10B981'}
            gradient={true}
          />
        </GlassCard>

        {/* Top Performing Events */}
        <GlassCard className="p-6">
          <TopPerformingList
            title="Top Performing Events"
            items={mockData.topEvents.map((event, index) => ({
              id: event.id,
              rank: index + 1,
              title: event.name,
              subtitle: `${event.attendees} attendees`,
              value: event.revenue,
              valueType: 'currency' as const,
              rating: event.rating,
              attendees: event.attendees,
              status: 'completed' as const
            }))}
            showRank={true}
            showMetrics={true}
            maxItems={5}
          />
        </GlassCard>
      </div>

      {/* Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Age Demographics */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Age Demographics
          </h3>
          <div className="space-y-4">
            {mockData.demographics.ageGroups.map((group, index) => (
              <ProgressBar
                key={index}
                label={group.group}
                percentage={group.percentage}
                color={
                  index === 0 ? 'blue' :
                  index === 1 ? 'green' :
                  index === 2 ? 'purple' :
                  'orange'
                }
              />
            ))}
          </div>
        </GlassCard>

        {/* Top Locations */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            <PieChart className="w-5 h-5 text-green-500" />
            Top Locations
          </h3>
          <div className="space-y-4">
            {mockData.demographics.locations.map((location, index) => (
              <ProgressBar
                key={index}
                label={location.location}
                percentage={location.percentage}
                color={
                  index === 0 ? 'green' :
                  index === 1 ? 'blue' :
                  index === 2 ? 'purple' :
                  'orange'
                }
              />
            ))}
          </div>
        </GlassCard>

        {/* Popular Interests */}
        <GlassCard className="p-6">
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            <Activity className="w-5 h-5 text-orange-500" />
            Popular Interests
          </h3>
          <div className="space-y-4">
            {mockData.demographics.interests.map((interest, index) => (
              <ProgressBar
                key={index}
                label={interest.interest}
                percentage={interest.percentage}
                color={
                  index === 0 ? 'orange' :
                  index === 1 ? 'purple' :
                  index === 2 ? 'blue' :
                  'green'
                }
              />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <MacOSButton size="lg" className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Export Report
        </MacOSButton>
        <MacOSButton variant="secondary" size="lg" className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          View Detailed Analytics
        </MacOSButton>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
