import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import ResponsiveLayout from '../components/ResponsiveLayout';
import UserProfile from '../components/UserProfile';
import { withRoleProtection } from '../contexts/UserContext';

const Profile: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Profile Settings 👤
          </h1>
          <p className={`text-responsive-sm sm:text-responsive-base ${
            theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
          }`}>
            Manage your account information and preferences
          </p>
        </header>

        {/* Profile Content */}
        <UserProfile />
      </div>
    </ResponsiveLayout>
  );
};

// Protect this route - require authentication
export default withRoleProtection(Profile, { requireAuth: true });
