import { useState } from 'react';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import { Wallet, User, LogOut } from 'lucide-react';
import Button from './Button';
import AuthModal from './AuthModal';

export default function WalletConnectButton() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isConnected, isLoading, disconnectWallet, logout, walletAddress, walletType } = useWalletAuth();

  const getWalletIcon = () => {
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

  const handleDisconnect = async () => {
    if (user) {
      await logout();
    }
    await disconnectWallet();
  };

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.full_name?.charAt(0)?.toUpperCase() || user.address?.slice(0, 1)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-white font-medium">{user.full_name || 'Anonymous User'}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getWalletIcon()}</span>
              <span className="text-white/60 text-sm font-mono">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          icon={<LogOut size={18} />}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  if (isConnected && !user) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">{getWalletIcon()}</span>
          <div>
            <p className="text-white font-medium">Wallet Connected</p>
            <p className="text-white/60 text-sm font-mono">
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAuthModal(true)}
          icon={<User size={18} />}
        >
          Sign In / Register
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        disabled={isLoading}
        icon={<Wallet size={18} />}
        size="lg"
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
}
