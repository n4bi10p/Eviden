import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Check, AlertCircle } from 'lucide-react';

interface WalletOption {
  type: 'petra' | 'martian' | 'pontem';
  name: string;
  icon: string;
  isInstalled: boolean;
  downloadUrl: string;
}

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWallet: (walletType: 'petra' | 'martian' | 'pontem') => void;
  isConnecting: boolean;
}

export default function WalletSelector({ isOpen, onClose, onSelectWallet, isConnecting }: WalletSelectorProps) {
  const [wallets, setWallets] = useState<WalletOption[]>([]);

  useEffect(() => {
    const checkWallets = () => {
      const walletOptions: WalletOption[] = [
        {
          type: 'petra',
          name: 'Petra Wallet',
          icon: '🏛️',
          // @ts-ignore
          isInstalled: typeof window !== 'undefined' && !!(window.aptos && (window.aptos.isPetra || window.aptos.connect)),
          downloadUrl: 'https://petra.app/'
        },
        {
          type: 'martian',
          name: 'Martian Wallet',
          icon: '👽',
          // @ts-ignore
          isInstalled: typeof window !== 'undefined' && !!window.martian,
          downloadUrl: 'https://martianwallet.xyz/'
        },
        {
          type: 'pontem',
          name: 'Pontem Wallet',
          icon: '🌉',
          // @ts-ignore
          isInstalled: typeof window !== 'undefined' && !!window.pontem,
          downloadUrl: 'https://chrome.google.com/webstore/detail/pontem-aptos-wallet/phkbamefinggmakgklpkljjmgibohnba'
        }
      ];
      
      // Debug logging
      console.log('WalletSelector - Available wallets:', walletOptions);
      console.log('WalletSelector - Window objects:', {
        aptos: window.aptos,
        martian: window.martian,
        pontem: window.pontem
      });
      console.log('WalletSelector - Petra check:', {
        'window.aptos': window.aptos,
        'window.aptos?.isPetra': window.aptos?.isPetra,
        'window.aptos?.isConnected': window.aptos?.isConnected,
        'window.aptos?.connect': window.aptos?.connect,
        'typeof window.aptos': typeof window.aptos
      });
      setWallets(walletOptions);
    };

    checkWallets();
  }, [isOpen]);

  const handleWalletSelect = (wallet: WalletOption) => {
    if (wallet.isInstalled && !isConnecting) {
      onSelectWallet(wallet.type);
    } else if (!wallet.isInstalled) {
      window.open(wallet.downloadUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="wallet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="wallet-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Connect Your Wallet
                </h2>
                <p className="text-white/70 text-sm">
                  Choose a wallet to connect to Eviden
                </p>
              </div>

              {/* Wallet Options */}
              <div className="space-y-3">
                {console.log('WalletSelector - Rendering wallets:', wallets)}
                {wallets.map((wallet) => (
                  <motion.button
                    key={wallet.type}
                    onClick={() => handleWalletSelect(wallet)}
                    disabled={isConnecting}
                    whileHover={{ scale: wallet.isInstalled ? 1.02 : 1 }}
                    whileTap={{ scale: wallet.isInstalled ? 0.98 : 1 }}
                    className={`
                      w-full p-4 rounded-xl border transition-all duration-200
                      ${wallet.isInstalled
                        ? 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 cursor-pointer'
                        : 'bg-white/5 border-white/10 opacity-60 cursor-default'
                      }
                      ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <h3 className="text-white font-medium">{wallet.name}</h3>
                        <p className="text-white/60 text-xs">
                          {wallet.isInstalled ? 'Ready to connect' : 'Not installed'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {wallet.isInstalled ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-400" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-white/50 text-xs text-center">
                  Don't have a wallet? Click on any wallet above to install it.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
