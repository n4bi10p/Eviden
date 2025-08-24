import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';

interface WalletConnectionProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: string, address: string) => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ isOpen, onClose, onConnect }) => {
  const { theme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const walletOptions = [
    {
      name: 'Petra Wallet',
      icon: '🦋',
      description: 'Official Aptos wallet',
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Martian Wallet',
      icon: '🚀',
      description: 'Multi-chain wallet for Aptos',
      color: 'from-red-500 to-orange-600'
    },
    {
      name: 'Pontem Wallet',
      icon: '🌉',
      description: 'Secure Aptos wallet',
      color: 'from-green-500 to-teal-600'
    },
    {
      name: 'Fewcha Wallet',
      icon: '🦊',
      description: 'Easy-to-use Aptos wallet',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const handleWalletConnect = async (walletName: string) => {
    setIsConnecting(true);
    setSelectedWallet(walletName);

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock wallet address generation
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      onConnect(walletName, mockAddress);
      onClose();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Connect Wallet
            </h2>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                  : 'hover:bg-black/10 text-slate-500 hover:text-slate-700'
              }`}
            >
              ✕
            </button>
          </div>

          {/* Wallet Options */}
          <div className="space-y-3 mb-6">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleWalletConnect(wallet.name)}
                disabled={isConnecting}
                className={`
                  w-full p-4 rounded-xl border transition-all duration-200 text-left
                  ${theme === 'dark'
                    ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }
                  ${isConnecting && selectedWallet === wallet.name
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:scale-[1.02] cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center space-x-4">
                  {/* Wallet Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {wallet.icon}
                  </div>
                  
                  {/* Wallet Info */}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {wallet.name}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                    }`}>
                      {wallet.description}
                    </p>
                  </div>
                  
                  {/* Loading State */}
                  {isConnecting && selectedWallet === wallet.name && (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className={`text-xs text-center ${
            theme === 'dark' ? 'text-white/50' : 'text-slate-500'
          }`}>
            <p className="mb-2">🔒 Your wallet will be used for secure authentication</p>
            <p>No transactions will be made without your permission</p>
          </div>

          {/* Cancel Button */}
          <div className="mt-6">
            <MacOSButton
              variant="secondary"
              onClick={onClose}
              className="w-full"
              disabled={isConnecting}
            >
              Cancel
            </MacOSButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default WalletConnection;
