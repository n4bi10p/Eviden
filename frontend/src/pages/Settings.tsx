import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import MacOSButton from '../components/MacOSButton';
import MacOSSwitch from '../components/MacOSSwitch';
import GlassCard from '../components/GlassCard';

const Settings: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useWalletAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    twoFactorAuth: false,
    profilePrivacy: 'public' as 'public' | 'private',
    dataSharing: false
  });

  const handleSettingChange = (key: keyof typeof settings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <MacOSButton
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            size="md"
            icon="🏠"
            className="mb-4 hover:scale-105 transition-transform"
          >
            ← Back to Dashboard
          </MacOSButton>
        </div>
        
        {/* Breadcrumb */}
        <div className={`flex items-center text-sm mb-4 ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <button 
            onClick={() => navigate('/dashboard')}
            className={`hover:underline ${
              theme === 'dark' ? 'hover:text-white' : 'hover:text-slate-800'
            }`}
          >
            Dashboard
          </button>
          <span className="mx-2">›</span>
          <span className={theme === 'dark' ? 'text-white' : 'text-slate-800'}>
            Settings
          </span>
        </div>
        
        <h1 className={`text-3xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          Settings
        </h1>
        <p className={`text-lg ${
          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          Manage your account preferences and privacy settings
        </p>
      </div>

      {/* Account Settings */}
      <GlassCard className="p-6">
        <h2 className={`text-xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          Account Settings
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Display Name
              </label>
              <input
                type="text"
                defaultValue={user?.full_name || user?.username}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                } focus:outline-none`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Email Address
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                } focus:outline-none`}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Notification Settings */}
      <GlassCard className="p-6">
        <h2 className={`text-xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          Notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Email Notifications
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Receive event updates via email
              </p>
            </div>
            <MacOSSwitch
              checked={settings.emailNotifications}
              onChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Push Notifications
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Get real-time notifications in your browser
              </p>
            </div>
            <MacOSSwitch
              checked={settings.pushNotifications}
              onChange={(checked) => handleSettingChange('pushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Marketing Emails
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Receive promotional content and updates
              </p>
            </div>
            <MacOSSwitch
              checked={settings.marketingEmails}
              onChange={(checked) => handleSettingChange('marketingEmails', checked)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Privacy Settings */}
      <GlassCard className="p-6">
        <h2 className={`text-xl font-semibold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          Privacy & Security
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Two-Factor Authentication
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Add an extra layer of security to your account
              </p>
            </div>
            <MacOSSwitch
              checked={settings.twoFactorAuth}
              onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Data Sharing
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Share anonymous usage data to improve the platform
              </p>
            </div>
            <MacOSSwitch
              checked={settings.dataSharing}
              onChange={(checked) => handleSettingChange('dataSharing', checked)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <MacOSButton size="lg" icon="💾">
          Save Changes
        </MacOSButton>
        <MacOSButton variant="secondary" size="lg" icon="🔄">
          Reset to Defaults
        </MacOSButton>
        <MacOSButton 
          onClick={() => navigate('/dashboard')}
          variant="secondary" 
          size="lg" 
          icon="🏠"
          className="sm:ml-auto"
        >
          Dashboard
        </MacOSButton>
      </div>
    </div>
  );
};

export default Settings;
