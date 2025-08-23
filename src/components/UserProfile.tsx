import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';

const UserProfile: React.FC = () => {
  const { user, updateUserProfile, switchRole } = useUser();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organizationName: user?.organizationName || '',
    organizationDescription: user?.organizationDescription || '',
  });

  if (!user) {
    return (
      <GlassCard className="text-center py-8">
        <p className={`${
          theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
        }`}>No user data available</p>
      </GlassCard>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateUserProfile({
      name: editForm.name,
      email: editForm.email,
      ...(user.role === 'organizer' && {
        organizationName: editForm.organizationName,
        organizationDescription: editForm.organizationDescription,
      }),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      organizationName: user.organizationName || '',
      organizationDescription: user.organizationDescription || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <GlassCard>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              User Profile
            </h2>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                user.role === 'organizer' 
                  ? (theme === 'dark' 
                      ? 'bg-cyber-purple/30 text-cyber-cyan border-cyber-purple/50' 
                      : 'bg-macos-purple/20 text-macos-purple border-macos-purple/50')
                  : (theme === 'dark' 
                      ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50' 
                      : 'bg-macos-blue/20 text-macos-blue border-macos-blue/50')
              }`}>
                {user.role === 'organizer' ? '🏢 Organizer' : '👤 Attendee'}
              </span>
              {user.role === 'organizer' && user.verified && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
          <MacOSButton
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "secondary" : "primary"}
            size="sm"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </MacOSButton>
        </div>
      </GlassCard>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <GlassCard>
          <h3 className={`text-lg font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                      : 'bg-white/80 border border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-white/5 text-white border border-cyber-purple/20' 
                    : 'bg-gray-50 text-slate-900 border border-gray-200'
                }`}>
                  {user.name}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                      : 'bg-white/80 border border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-white/5 text-white border border-cyber-purple/20' 
                    : 'bg-gray-50 text-slate-900 border border-gray-200'
                }`}>
                  {user.email}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Wallet Address
              </label>
              <p className={`px-3 py-2 rounded-lg font-mono text-sm ${
                theme === 'dark' 
                  ? 'bg-white/5 text-white border border-cyber-purple/20' 
                  : 'bg-gray-50 text-slate-900 border border-gray-200'
              }`}>
                {user.walletAddress}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Member Since
              </label>
              <p className={`px-3 py-2 rounded-lg ${
                theme === 'dark' 
                  ? 'bg-white/5 text-white border border-cyber-purple/20' 
                  : 'bg-gray-50 text-slate-900 border border-gray-200'
              }`}>
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Role-specific Information */}
        <GlassCard>
          <h3 className={`text-lg font-semibold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            {user.role === 'organizer' ? 'Organization Details' : 'Activity Stats'}
          </h3>

          {user.role === 'organizer' ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Organization Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="organizationName"
                    value={editForm.organizationName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                        : 'bg-white/80 border border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-white/5 text-white border border-cyber-purple/20' 
                      : 'bg-gray-50 text-slate-900 border border-gray-200'
                  }`}>
                    {user.organizationName || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Organization Description
                </label>
                {isEditing ? (
                  <textarea
                    name="organizationDescription"
                    value={editForm.organizationDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                        : 'bg-white/80 border border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                ) : (
                  <p className={`px-3 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-white/5 text-white border border-cyber-purple/20' 
                      : 'bg-gray-50 text-slate-900 border border-gray-200'
                  }`}>
                    {user.organizationDescription || 'No description provided'}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Verification Status
                </label>
                <p className={`px-3 py-2 rounded-lg ${
                  user.verified 
                    ? (theme === 'dark' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : 'bg-green-100 text-green-800 border border-green-200')
                    : (theme === 'dark' 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200')
                }`}>
                  {user.verified ? '✓ Verified Organization' : '⏳ Pending Verification'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-blue-500/20 border-blue-500/50' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    Events Attended
                  </span>
                  <span className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                  }`}>
                    {user.totalEventsAttended || 0}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                  }`}>
                    Validations Given
                  </span>
                  <span className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-green-300' : 'text-green-700'
                  }`}>
                    {user.totalValidationsGiven || 0}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-purple-500/20 border-purple-500/50' 
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    Validations Received
                  </span>
                  <span className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    {user.totalValidationsReceived || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Save/Cancel Actions */}
      {isEditing && (
        <GlassCard>
          <div className="flex justify-end space-x-3">
            <MacOSButton
              onClick={handleCancel}
              variant="secondary"
            >
              Cancel
            </MacOSButton>
            <MacOSButton
              onClick={handleSave}
              variant="primary"
            >
              Save Changes
            </MacOSButton>
          </div>
        </GlassCard>
      )}

      {/* Role Switch Section */}
      <GlassCard>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          Account Type
        </h3>
        <div className={`flex items-center justify-between p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-white/5 border-cyber-purple/30' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Switch Role
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
            }`}>
              Change your account type to access different features
            </p>
          </div>
          <MacOSButton
            onClick={() => switchRole(user?.role === 'organizer' ? 'attendee' : 'organizer')}
            variant="primary"
            size="sm"
          >
            Switch to {user?.role === 'organizer' ? 'Attendee' : 'Organizer'}
          </MacOSButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserProfile;
