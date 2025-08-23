import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import Sidebar from '../components/Sidebar';
import UserProfile from '../components/UserProfile';
import { withRoleProtection } from '../contexts/UserContext';

const Profile: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userType={user.role} />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Profile Settings 👤
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
          }`}>
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Content */}
        <UserProfile />
      </div>
    </div>
  );
};

// Protect this route - require authentication
export default withRoleProtection(Profile, { requireAuth: true });
