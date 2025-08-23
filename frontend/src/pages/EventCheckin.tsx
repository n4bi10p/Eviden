import React, { useState, useEffect } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import MacOSSwitch from '../components/MacOSSwitch';
import { useTheme } from '../contexts/ThemeContext';

const EventCheckin: React.FC = () => {
  const { theme } = useTheme();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [qrRotation, setQrRotation] = useState(0);
  const [checkInStatus, setCheckInStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending');

  // Rotate QR code every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQrRotation(prev => prev + 360);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const event = {
    name: 'Blockchain Summit 2025',
    organizer: 'TechCorp Events',
    date: 'March 15, 2025',
    time: '10:00 AM - 6:00 PM',
    location: 'Moscone Center, San Francisco',
    description: 'Join industry leaders for a day of blockchain innovation and networking.',
    attendees: 245,
    maxAttendees: 300
  };

  const handleCheckIn = () => {
    setCheckInStatus('verifying');
    
    // Simulate check-in process
    setTimeout(() => {
      if (locationEnabled) {
        setCheckInStatus('success');
      } else {
        setCheckInStatus('failed');
      }
    }, 2000);
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1">
            <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Event Check-in 📍
            </h1>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Verify your attendance with blockchain technology
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Event Details */}
          <GlassCard>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-macos-gray-800 mb-2">{event.name}</h2>
              <p className="text-macos-blue font-medium">by {event.organizer}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="font-medium text-macos-gray-800">{event.date}</p>
                  <p className="text-sm text-macos-gray-600">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-medium text-macos-gray-800">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl">👥</span>
                <div>
                  <p className="font-medium text-macos-gray-800">
                    {event.attendees}/{event.maxAttendees} Attendees
                  </p>
                  <div className="w-full bg-macos-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-macos-blue to-macos-teal h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-macos-gray-700 mb-6">{event.description}</p>

            {/* Location Toggle */}
            <div className="p-4 glass-dark rounded-xl mb-6">
              <MacOSSwitch
                checked={locationEnabled}
                onChange={setLocationEnabled}
                label="Enable Location Services"
              />
              <p className="text-white/70 text-sm mt-2">
                Required for secure check-in verification
              </p>
            </div>

            {/* Map Preview */}
            <div className="h-48 glass-dark rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-white">Event Location Map</p>
                <p className="text-white/70 text-sm">Moscone Center, San Francisco</p>
              </div>
            </div>
          </GlassCard>

          {/* Check-in Section */}
          <GlassCard>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-macos-gray-800 mb-6">
                Secure Check-in
              </h2>

              {/* QR Code */}
              <div className="relative mb-8">
                <div 
                  className="w-48 h-48 mx-auto glass-dark rounded-3xl flex items-center justify-center border-4 border-white/20 transition-transform duration-1000"
                  style={{ transform: `rotate(${qrRotation}deg)` }}
                >
                  <div className="text-6xl">📱</div>
                </div>
                
                {/* Glowing border animation */}
                <div className="absolute inset-0 w-48 h-48 mx-auto rounded-3xl animate-pulse-glow pointer-events-none"></div>
                
                <p className="text-sm text-macos-gray-600 mt-4">
                  QR Code refreshes every 30 seconds
                </p>
              </div>

              {/* Status Messages */}
              {checkInStatus === 'pending' && (
                <div className="mb-6">
                  <p className="text-macos-gray-700 mb-2">Ready to check in</p>
                  <p className="text-sm text-macos-gray-500">
                    Ensure location services are enabled
                  </p>
                </div>
              )}

              {checkInStatus === 'verifying' && (
                <div className="mb-6">
                  <div className="animate-spin mx-auto w-8 h-8 border-4 border-macos-blue border-t-transparent rounded-full mb-2"></div>
                  <p className="text-macos-blue font-medium">Verifying attendance...</p>
                </div>
              )}

              {checkInStatus === 'success' && (
                <div className="mb-6 animate-fade-in">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-macos-green font-medium">Check-in verified!</p>
                  <p className="text-sm text-macos-gray-600">Your attendance has been recorded on the blockchain</p>
                </div>
              )}

              {checkInStatus === 'failed' && (
                <div className="mb-6 animate-fade-in">
                  <div className="text-4xl mb-2">❌</div>
                  <p className="text-macos-red font-medium">Check-in failed</p>
                  <p className="text-sm text-macos-gray-600">Please enable location services and try again</p>
                </div>
              )}

              {/* Action Button */}
              {checkInStatus === 'pending' && (
                <MacOSButton
                  size="lg"
                  className="w-full"
                  onClick={handleCheckIn}
                  disabled={!locationEnabled}
                  icon="📍"
                >
                  Check In Now
                </MacOSButton>
              )}

              {checkInStatus === 'verifying' && (
                <MacOSButton
                  size="lg"
                  className="w-full opacity-50"
                  disabled
                >
                  Verifying...
                </MacOSButton>
              )}

              {checkInStatus === 'success' && (
                <div className="space-y-3">
                  <MacOSButton
                    size="lg"
                    className="w-full"
                    icon="🏆"
                  >
                    View Certificate
                  </MacOSButton>
                  <MacOSButton
                    variant="secondary"
                    size="md"
                    className="w-full"
                    icon="🔗"
                  >
                    View on Blockchain
                  </MacOSButton>
                </div>
              )}

              {checkInStatus === 'failed' && (
                <MacOSButton
                  size="lg"
                  className="w-full"
                  onClick={() => setCheckInStatus('pending')}
                  icon="🔄"
                >
                  Try Again
                </MacOSButton>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Success Toast */}
        {checkInStatus === 'success' && (
          <div className="fixed bottom-8 right-8 animate-slide-up">
            <div className="glass px-6 py-4 rounded-2xl shadow-macos border border-macos-green/30">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>Welcome to {event.name}!</p>
                  <p className={`text-responsive-sm ${
                    theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-600'
                  }`}>Enjoy the event</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default EventCheckin;
