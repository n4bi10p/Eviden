import React, { useState } from 'react';
import { useUser, UserRole } from '../contexts/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login } = useUser();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    walletAddress: '',
    organizationName: '',
    organizationDescription: '',
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      // Simulate wallet connection - replace with actual wallet integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setFormData(prev => ({ ...prev, walletAddress: mockAddress }));
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !formData.walletAddress) return;

    login({
      role: selectedRole,
      name: formData.name,
      email: formData.email,
      walletAddress: formData.walletAddress,
      ...(selectedRole === 'organizer' && {
        organizationName: formData.organizationName,
        organizationDescription: formData.organizationDescription,
      }),
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setStep('role');
    setSelectedRole(null);
    setFormData({
      name: '',
      email: '',
      walletAddress: '',
      organizationName: '',
      organizationDescription: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 'role' ? 'Choose Your Role' : 'Complete Your Profile'}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {step === 'role' && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Select your role to get started with Eviden
            </p>

            <div
              onClick={() => handleRoleSelection('attendee')}
              className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400">👤</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Attendee</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Attend events, check-in on location, validate peers, and earn certificates
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleRoleSelection('organizer')}
              className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400">🏢</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Organizer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create and manage events, track attendance, and issue certificates
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email address"
              />
            </div>

            {selectedRole === 'organizer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter your organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization Description
                  </label>
                  <textarea
                    name="organizationDescription"
                    value={formData.organizationDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of your organization"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wallet Address *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  required
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                  placeholder="Connect wallet to get address"
                />
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  disabled={isConnectingWallet}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isConnectingWallet ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!formData.name || !formData.email || !formData.walletAddress}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg"
              >
                Create Account
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
