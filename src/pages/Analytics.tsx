import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useTheme } from '../contexts/ThemeContext';

const Analytics: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1">
            <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Analytics Dashboard 📊
            </h1>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Track your event performance and attendee engagement
            </p>
          </div>
        </header>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard userRole="organizer" />
      </div>
    </ResponsiveLayout>
  );
};

export default Analytics;
