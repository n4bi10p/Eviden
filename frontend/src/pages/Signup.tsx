import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import MacOSSwitch from '../components/MacOSSwitch';

const Signup: React.FC = () => {
  const { theme } = useTheme();
  const { login } = useUser();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'role' | 'details' | 'verification'>('role');
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee' as 'attendee' | 'organizer',
    
    // Profile Details
    bio: '',
    organization: '',
    website: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: ''
    },
    
    // Preferences
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profilePublic: true,
      showAttendance: true,
      allowMessages: true
    },
    
    // Verification
    agreeToTerms: false,
    agreeToPrivacy: false,
    subscribeNewsletter: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step !== 'verification') return;
    
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
        throw new Error('Please agree to Terms of Service and Privacy Policy');
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user creation - in real app, this would call your backend API
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        walletAddress: '0x' + Math.random().toString(16).substr(2, 8) + '...',
        createdAt: new Date(),
        bio: formData.bio,
        organization: formData.organization,
        website: formData.website,
        verified: false
      };
      
      login(newUser);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 'role') {
      setStep('details');
    } else if (step === 'details') {
      // Validate details before proceeding
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setError('');
      setStep('verification');
    }
  };

  const prevStep = () => {
    if (step === 'details') {
      setStep('role');
    } else if (step === 'verification') {
      setStep('details');
    }
  };

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-800'
        }`}>
          Choose Your Role
        </h2>
        <p className={`${
          theme === 'dark' ? 'text-white/50' : 'text-slate-600'
        }`}>
          Select how you'll be using Eviden
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendee Card */}
        <div
          onClick={() => setFormData(prev => ({ ...prev, role: 'attendee' }))}
          className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
            formData.role === 'attendee'
              ? theme === 'dark' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-blue-500 bg-blue-50'
              : theme === 'dark'
                ? 'border-white/20 bg-white/5 hover:bg-white/10'
                : 'border-slate-300 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">👤</div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white/80' : 'text-slate-800'
            }`}>
              Attendee
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              Join and attend blockchain events, earn certificates, and build your attendance history
            </p>
          </div>
        </div>

        {/* Organizer Card */}
        <div
          onClick={() => setFormData(prev => ({ ...prev, role: 'organizer' }))}
          className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
            formData.role === 'organizer'
              ? theme === 'dark' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-blue-500 bg-blue-50'
              : theme === 'dark'
                ? 'border-white/20 bg-white/5 hover:bg-white/10'
                : 'border-slate-300 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="text-center">
            <div className="text-4xl mb-3">👨‍💼</div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white/80' : 'text-slate-800'
            }`}>
              Organizer
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              Create and manage blockchain events, verify attendance, and issue certificates
            </p>
          </div>
        </div>
      </div>

      <MacOSButton onClick={nextStep} className="w-full" icon="➡️">
        Continue as {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
      </MacOSButton>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-800'
        }`}>
          Create Your Account
        </h2>
        <p className={`${
          theme === 'dark' ? 'text-white/50' : 'text-slate-600'
        }`}>
          Tell us about yourself as a {formData.role}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Create a strong password"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Confirm your password"
            />
          </div>
        </div>

        {/* Role-specific fields */}
        {formData.role === 'organizer' && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              Organization
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Your organization or company"
            />
          </div>
        )}

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-700'
          }`}>
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border resize-none ${
              theme === 'dark' 
                ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40'
                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Tell us about yourself and your blockchain interests..."
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-white/70' : 'text-slate-700'
          }`}>
            Website/Portfolio (Optional)
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-white/10 border-white/20 text-white/80 placeholder-white/40'
                : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="https://your-website.com"
          />
        </div>
      </form>

      <div className="flex space-x-3">
        <MacOSButton onClick={prevStep} variant="secondary" className="flex-1" icon="⬅️">
          Back
        </MacOSButton>
        <MacOSButton onClick={nextStep} className="flex-1" icon="➡️">
          Continue
        </MacOSButton>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white/80' : 'text-slate-800'
        }`}>
          Final Steps
        </h2>
        <p className={`${
          theme === 'dark' ? 'text-white/50' : 'text-slate-600'
        }`}>
          Almost there! Set your preferences and agree to our terms
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Preferences */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white/80' : 'text-slate-800'
          }`}>
            Notification Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>Email notifications</span>
              <MacOSSwitch
                checked={formData.notifications.email}
                onChange={(checked) => setFormData(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, email: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>Push notifications</span>
              <MacOSSwitch
                checked={formData.notifications.push}
                onChange={(checked) => setFormData(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, push: checked }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white/80' : 'text-slate-800'
          }`}>
            Privacy Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>Make profile public</span>
              <MacOSSwitch
                checked={formData.privacy.profilePublic}
                onChange={(checked) => setFormData(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, profilePublic: checked }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={`${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>Show attendance history</span>
              <MacOSSwitch
                checked={formData.privacy.showAttendance}
                onChange={(checked) => setFormData(prev => ({
                  ...prev,
                  privacy: { ...prev.privacy, showAttendance: checked }
                }))}
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToTerms" className={`text-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              I agree to the{' '}
              <Link to="/terms" className={`${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              } hover:underline`}>
                Terms of Service
              </Link>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToPrivacy"
              name="agreeToPrivacy"
              checked={formData.agreeToPrivacy}
              onChange={handleInputChange}
              required
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeToPrivacy" className={`text-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              I agree to the{' '}
              <Link to="/privacy" className={`${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              } hover:underline`}>
                Privacy Policy
              </Link>
            </label>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="subscribeNewsletter"
              name="subscribeNewsletter"
              checked={formData.subscribeNewsletter}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="subscribeNewsletter" className={`text-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>
              Subscribe to our newsletter for blockchain event updates (optional)
            </label>
          </div>
        </div>

        <div className="flex space-x-3">
          <MacOSButton onClick={prevStep} variant="secondary" className="flex-1" icon="⬅️">
            Back
          </MacOSButton>
          <MacOSButton
            onClick={() => handleSubmit({} as React.FormEvent)}
            disabled={isLoading || !formData.agreeToTerms || !formData.agreeToPrivacy}
            className="flex-1"
            icon={isLoading ? "⏳" : "🎉"}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </MacOSButton>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white/80' : 'text-slate-800'
          }`}>
            🎯 Eviden
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            Join the Blockchain Event Revolution
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['role', 'details', 'verification'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName
                    ? theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
                    : ['role', 'details', 'verification'].indexOf(step) > index
                    ? theme === 'dark' ? 'bg-green-500 text-white' : 'bg-green-600 text-white'
                    : theme === 'dark' ? 'bg-white/20 text-white/60' : 'bg-slate-200 text-slate-500'
                }`}>
                  {['role', 'details', 'verification'].indexOf(step) > index ? '✓' : index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-1 mx-2 ${
                    ['role', 'details', 'verification'].indexOf(step) > index
                      ? theme === 'dark' ? 'bg-green-500' : 'bg-green-600'
                      : theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <GlassCard>
          {step === 'role' && renderRoleSelection()}
          {step === 'details' && renderDetailsForm()}
          {step === 'verification' && renderVerification()}
        </GlassCard>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              className={`font-medium hover:underline ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
