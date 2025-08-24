import { useState, useEffect } from 'react';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import { User, Mail, Building2, Edit3, Save, X, Wallet, Shield, Calendar, Settings } from 'lucide-react';
import Button from './Button';

export default function UserProfile() {
  const { user, updateProfile, isLoading, walletAddress, walletType, isConnected } = useWalletAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    organizationName: user?.organizationName || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        bio: user.bio || '',
        organizationName: user.organizationName || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      organizationName: user?.organizationName || '',
    });
    setIsEditing(false);
  };

  const getWalletIcon = () => {
    console.log('🎨 Getting wallet icon for type:', walletType, 'isConnected:', isConnected);
    
    if (!isConnected || !walletType) {
      return '❌'; // Disconnected state
    }
    
    switch (walletType) {
      case 'petra':
        return '🟠';
      case 'martian':
        return '🔴';
      case 'pontem':
        return '🟣';
      default:
        return '👛';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'organizer':
        return <Building2 className="text-purple-400" size={20} />;
      case 'admin':
        return <Shield className="text-red-400" size={20} />;
      default:
        return <User className="text-blue-400" size={20} />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'organizer':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-400/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
    }
  };

  if (!user) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-white/60">
          <User size={48} className="mx-auto mb-4" />
          <p>Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/70">Manage your account settings and preferences</p>
        </div>
        <div className="flex gap-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              icon={<Edit3 size={18} />}
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                icon={<Save size={18} />}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                icon={<X size={18} />}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
            <div className="flex items-start gap-6 mb-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.full_name?.charAt(0)?.toUpperCase() || user.address?.slice(0, 2) || 'U'}
                </div>
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getRoleIcon()}
                  <span className={`px-3 py-1 rounded-full text-xs border ${getRoleBadgeColor()}`}>
                    {user.role?.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {user.full_name || 'Anonymous User'}
                </h2>
                <p className="text-white/60 text-sm mb-3">{user.email}</p>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Calendar size={14} />
                  <span>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    <User size={16} className="inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {user.full_name || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {user.email || 'Not set'}
                    </div>
                  )}
                </div>
              </div>

              {user.role === 'organizer' && (
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    <Building2 size={16} className="inline mr-2" />
                    Organization Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Enter organization name"
                    />
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                      {user.organizationName || 'Not set'}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-white/80 text-sm mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[100px]">
                    {user.bio || 'No bio added yet'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Info */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet size={20} />
              Wallet Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-2xl">{getWalletIcon()}</span>
                <div>
                  <p className="text-white/60 text-sm">Wallet Type</p>
                  <p className="text-white font-medium capitalize">
                    {isConnected && walletType ? walletType : 'Not Connected'}
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm mb-1">Address</p>
                <p className="text-white font-mono text-sm break-all">
                  {walletAddress || user?.address || 'No wallet address available'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings size={20} />
              Account Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Events Attended</span>
                <span className="text-white font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Certificates Earned</span>
                <span className="text-white font-medium">0</span>
              </div>
              {user.role === 'organizer' && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Events Created</span>
                  <span className="text-white font-medium">0</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Account Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.isVerified 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
