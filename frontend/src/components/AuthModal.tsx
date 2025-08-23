import { useState, useEffect } from 'react';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, UserPlus, LogIn, User, Building2, Mail } from 'lucide-react';
import Button from './Button';
import WalletSelector from './WalletSelector';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'connect' | 'login' | 'register'>(initialMode);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'attendee' as 'attendee' | 'organizer',
    organizationName: '',
    bio: '',
  });

  const { 
    isConnected, 
    isLoading, 
    error, 
    connectWallet, 
    login, 
    register, 
    walletAddress,
    walletType,
    user
  } = useWalletAuth();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(isConnected ? initialMode : 'connect');
      setFormData({
        full_name: '',
        email: '',
        role: 'attendee',
        organizationName: '',
        bio: '',
      });
    }
  }, [isOpen, isConnected, initialMode]);

  // Auto-close modal if user successfully logs in
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleConnectWallet = async () => {
    setShowWalletSelector(true);
  };

  const handleWalletSelected = async (walletType: 'petra' | 'martian' | 'pontem') => {
    setShowWalletSelector(false);
    await connectWallet(walletType);
  };

  const handleLogin = async () => {
    await login();
  };

  const handleRegister = async () => {
    await register(formData);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 50 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const getWalletIcon = () => {
    switch (walletType) {
      case 'petra':
        return '🟠'; // Petra orange
      case 'martian':
        return '🔴'; // Martian red
      case 'pontem':
        return '🟣'; // Pontem purple
      default:
        return '👛';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="auth-modal"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="auth-content"
          variants={modalVariants}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <Wallet className="mx-auto text-blue-400" size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {mode === 'connect' && 'Connect Wallet'}
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
            </h2>
            <p className="text-white/70">
              {mode === 'connect' && 'Connect your Aptos wallet to continue'}
              {mode === 'login' && 'Sign in with your wallet to access your account'}
              {mode === 'register' && 'Create your Eviden profile'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {mode === 'connect' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-4">
                    Supported wallets: Petra, Martian, Pontem
                  </p>
                </div>
                <Button
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  className="w-full py-3 text-lg"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </div>
            )}

            {mode === 'login' && isConnected && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getWalletIcon()}</span>
                    <div>
                      <p className="text-white/60 text-sm">Connected Wallet</p>
                      <p className="text-white font-mono text-sm">
                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </p>
                      <p className="text-blue-400 text-xs capitalize">{walletType}</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full py-3 text-lg"
                  icon={<LogIn size={20} />}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setMode('register')}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Don't have an account? Register
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && isConnected && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getWalletIcon()}</span>
                    <div>
                      <p className="text-white/60 text-sm">Connected Wallet</p>
                      <p className="text-white font-mono text-sm">
                        {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      <User size={16} className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Account Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'attendee' })}
                        className={`p-3 rounded-xl border transition-all ${
                          formData.role === 'attendee'
                            ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <User size={20} className="mx-auto mb-1" />
                        <div className="text-xs">Attendee</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'organizer' })}
                        className={`p-3 rounded-xl border transition-all ${
                          formData.role === 'organizer'
                            ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <Building2 size={20} className="mx-auto mb-1" />
                        <div className="text-xs">Organizer</div>
                      </button>
                    </div>
                  </div>

                  {formData.role === 'organizer' && (
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        <Building2 size={16} className="inline mr-2" />
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="Enter organization name"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-white/80 text-sm mb-2">Bio (Optional)</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={isLoading || !formData.full_name || !formData.email}
                  className="w-full py-3 text-lg"
                  icon={<UserPlus size={20} />}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setMode('login')}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Wallet Selector Modal */}
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onSelectWallet={handleWalletSelected}
        isConnecting={isLoading}
      />
    </AnimatePresence>
  );
}
