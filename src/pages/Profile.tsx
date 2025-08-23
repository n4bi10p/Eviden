import React from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';

const Profile: React.FC = () => {
  const profileData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    walletAddress: '0x1234...abcd',
    joinDate: 'January 2024',
    location: 'San Francisco, CA',
    bio: 'Blockchain enthusiast and developer passionate about decentralized technologies.',
    avatar: '👨‍💻'
  };

  const reputationScore = 850;
  const maxScore = 1000;
  const reputationLevel = 'Expert';

  const badges = [
    { name: 'Early Adopter', icon: '🌟', earned: true },
    { name: 'Event Regular', icon: '🎫', earned: true },
    { name: 'Community Leader', icon: '👑', earned: true },
    { name: 'Tech Innovator', icon: '💡', earned: false },
    { name: 'Blockchain Master', icon: '⛓️', earned: false },
    { name: 'Global Speaker', icon: '🎤', earned: false }
  ];

  const recentActivity = [
    { action: 'Attended Blockchain Summit 2025', date: 'March 15, 2025', points: '+50' },
    { action: 'Completed DeFi Workshop', date: 'March 10, 2025', points: '+30' },
    { action: 'Verified attendance at Web3 Meetup', date: 'March 5, 2025', points: '+20' },
    { action: 'Earned Early Adopter badge', date: 'February 28, 2025', points: '+100' }
  ];

  const progressPercentage = (reputationScore / maxScore) * 100;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="flex min-h-screen bg-pastel-gradient">
      <Sidebar userType="attendee" />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-macos-gray-800 mb-2">
            My Profile 👤
          </h1>
          <p className="text-macos-gray-600">
            Manage your account and track your reputation
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <GlassCard>
                <div className="flex items-start space-x-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-br from-macos-blue to-macos-teal rounded-full flex items-center justify-center text-4xl shadow-glow-blue">
                    {profileData.avatar}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-macos-gray-800 mb-2">
                      {profileData.name}
                    </h2>
                    <p className="text-macos-gray-600 mb-4">{profileData.email}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-macos-gray-500">Wallet:</span>
                        <p className="text-macos-gray-800 font-mono">{profileData.walletAddress}</p>
                      </div>
                      <div>
                        <span className="text-macos-gray-500">Member since:</span>
                        <p className="text-macos-gray-800">{profileData.joinDate}</p>
                      </div>
                      <div>
                        <span className="text-macos-gray-500">Location:</span>
                        <p className="text-macos-gray-800">{profileData.location}</p>
                      </div>
                      <div>
                        <span className="text-macos-gray-500">Level:</span>
                        <p className="text-macos-purple font-semibold">{reputationLevel}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="text-macos-gray-500">Bio:</span>
                      <p className="text-macos-gray-700 mt-1">{profileData.bio}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex space-x-4">
                  <MacOSButton icon="✏️">Edit Profile</MacOSButton>
                  <MacOSButton variant="secondary" icon="🔗">Connect Wallet</MacOSButton>
                  <MacOSButton variant="secondary" icon="📤">Share Profile</MacOSButton>
                </div>
              </GlassCard>
            </div>

            {/* Reputation Score */}
            <GlassCard className="text-center">
              <h3 className="text-lg font-semibold text-macos-gray-800 mb-6">
                Reputation Score
              </h3>
              
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="rgba(156, 163, 175, 0.3)"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-2000 ease-out"
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#007AFF" />
                      <stop offset="100%" stopColor="#5AC8FA" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Score in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-4xl font-bold text-macos-gray-800">{reputationScore}</div>
                    <div className="text-sm text-macos-gray-600">/{maxScore}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-lg font-semibold text-macos-purple mb-2">
                {reputationLevel}
              </div>
              <p className="text-sm text-macos-gray-600">
                {maxScore - reputationScore} points to next level
              </p>
            </GlassCard>
          </div>

          {/* Badges Section */}
          <GlassCard>
            <h3 className="text-xl font-semibold text-macos-gray-800 mb-6">
              Achievement Badges
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className={`
                    text-center p-4 rounded-xl transition-all duration-300
                    ${badge.earned 
                      ? 'glass-dark bg-gradient-to-br from-macos-blue/20 to-macos-teal/20 shadow-glow-blue' 
                      : 'bg-macos-gray-100 opacity-50'
                    }
                  `}
                >
                  <div className={`text-3xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <p className={`text-xs font-medium ${badge.earned ? 'text-white' : 'text-macos-gray-500'}`}>
                    {badge.name}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Activity & History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-macos-gray-800 mb-4">
                Recent Activity
              </h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-macos-gray-800">{activity.action}</p>
                      <p className="text-xs text-macos-gray-500">{activity.date}</p>
                    </div>
                    <span className="text-sm font-medium text-macos-green">
                      {activity.points}
                    </span>
                  </div>
                ))}
              </div>
              
              <MacOSButton variant="secondary" size="sm" className="w-full mt-4">
                View All Activity
              </MacOSButton>
            </GlassCard>

            {/* Statistics */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-macos-gray-800 mb-4">
                Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-macos-gray-600">Events Attended</span>
                  <span className="text-lg font-semibold text-macos-blue">12</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-macos-gray-600">Certificates Earned</span>
                  <span className="text-lg font-semibold text-macos-green">8</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-macos-gray-600">Community Rank</span>
                  <span className="text-lg font-semibold text-macos-purple">#247</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-macos-gray-600">Verification Rate</span>
                  <span className="text-lg font-semibold text-macos-teal">96%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-macos-gray-600">Network Connections</span>
                  <span className="text-lg font-semibold text-macos-orange">156</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
