import { useState } from 'react';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import { Wallet, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from './Button';
import AuthModal from './AuthModal';
import { debugWallets, detectWallets } from '../utils/walletDebug';

export default function AuthTest() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedWallet, setSelectedWallet] = useState<'petra' | 'martian' | 'pontem'>('pontem');
  
  const {
    user,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    logout,
    walletAddress,
    walletType
  } = useWalletAuth();

  const getStatusIcon = () => {
    if (user) return <CheckCircle className="text-green-400" size={24} />;
    if (isConnected) return <AlertCircle className="text-yellow-400" size={24} />;
    return <XCircle className="text-red-400" size={24} />;
  };

  const getStatusText = () => {
    if (user) return "Authenticated & Ready";
    if (isConnected) return "Wallet Connected - Need to Login";
    return "Not Connected";
  };

  const getWalletIcon = () => {
    switch (walletType) {
      case 'petra': return '🟠';
      case 'martian': return '🔴';
      case 'pontem': return '🟣';
      default: return '👛';
    }
  };

  const handleConnectWallet = async () => {
    await connectWallet(selectedWallet);
  };

  const handleDebugWallets = () => {
    debugWallets();
    const available = detectWallets();
    console.log('Available wallets:', available);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🧪 Wallet Authentication Test</h1>
        <p className="text-white/70">Test the complete wallet authentication flow</p>
      </div>

      {/* Status Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          {getStatusIcon()}
          <div>
            <h2 className="text-xl font-semibold text-white">{getStatusText()}</h2>
            <p className="text-white/60 text-sm">Current authentication status</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Wallet Info */}
      {(isConnected || user) && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet size={20} />
            Wallet Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Wallet Type</p>
              <p className="text-white font-medium flex items-center gap-2">
                <span className="text-xl">{getWalletIcon()}</span>
                {walletType ? walletType.charAt(0).toUpperCase() + walletType.slice(1) : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Connection Status</p>
              <p className="text-white font-medium">{isConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-white/60 text-sm">Wallet Address</p>
              <p className="text-white font-mono text-sm break-all bg-white/5 rounded-lg p-2">
                {walletAddress || 'Not available'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      {user && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User size={20} />
            User Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-white/60 text-sm">Full Name</p>
              <p className="text-white font-medium">{user.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Email</p>
              <p className="text-white font-medium">{user.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Role</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs border ${
                user.role === 'organizer' 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
              }`}>
                {user.role?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white/60 text-sm">Verification Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                user.isVerified 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {user.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            {user.organizationName && (
              <div className="md:col-span-2">
                <p className="text-white/60 text-sm">Organization</p>
                <p className="text-white font-medium">{user.organizationName}</p>
              </div>
            )}
            {user.bio && (
              <div className="md:col-span-2">
                <p className="text-white/60 text-sm">Bio</p>
                <p className="text-white">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wallet Selection */}
      {!isConnected && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏦 Select Wallet Type</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-white/80 text-sm font-medium">Choose your wallet:</label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value as 'petra' | 'martian' | 'pontem')}
              className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pontem" className="bg-gray-800">🟣 Pontem Wallet</option>
              <option value="petra" className="bg-gray-800">🟠 Petra Wallet</option>
              <option value="martian" className="bg-gray-800">🔴 Martian Wallet</option>
            </select>
            <div className="text-white/60 text-xs">
              Make sure you have {selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)} wallet installed
            </div>
            <Button
              onClick={handleDebugWallets}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Debug Wallets
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Test Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {!isConnected ? (
            <Button
              onClick={handleConnectWallet}
              disabled={isLoading}
              className="w-full"
              icon={<Wallet size={18} />}
            >
              {isLoading ? 'Connecting...' : `Connect ${selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)}`}
            </Button>
          ) : (
            <Button
              onClick={disconnectWallet}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          )}

          {isConnected && !user && (
            <>
              <Button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                disabled={isLoading}
                className="w-full"
              >
                Login
              </Button>
              <Button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Register
              </Button>
            </>
          )}

          {user && (
            <Button
              onClick={logout}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Test Instructions */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📋 Test Instructions</h3>
        <div className="space-y-3 text-white/80">
          <div className="flex items-start gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
            <div>
              <strong>Install a Wallet:</strong> Make sure you have Petra, Martian, or Pontem wallet installed
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
            <div>
              <strong>Connect Wallet:</strong> Click "Connect Wallet" and approve the connection
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
            <div>
              <strong>Register/Login:</strong> Create a new account or sign in with signature
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
            <div>
              <strong>Test Features:</strong> Navigate to profile, events, etc. to test protected routes
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}
