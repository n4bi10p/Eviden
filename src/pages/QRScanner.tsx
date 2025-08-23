import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import { qrCodeService, QRCodeData } from '../services/QRCodeService';
import { apiService } from '../services/ApiService';
import { locationService } from '../services/LocationService';

interface ScanResult {
  success: boolean;
  message: string;
  data?: any;
}

const QRScanner: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    // Get user location for proximity verification
    const getUserLocation = async () => {
      try {
        const position = await locationService.getCurrentPosition();
        setUserLocation(position);
      } catch (error) {
        console.error('Failed to get user location:', error);
      }
    };

    getUserLocation();
  }, []);

  const startCamera = async () => {
    try {
      setLoading(true);
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }
      
      const granted = await qrCodeService.startCamera(videoRef.current);
      
      if (granted) {
        setIsScanning(true);
        setCameraPermission('granted');
        
        // Start QR code detection
        startQRDetection();
      } else {
        throw new Error('Camera access denied');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraPermission('denied');
      setScanResult({
        success: false,
        message: 'Camera access denied. Please allow camera access to scan QR codes.'
      });
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    qrCodeService.stopCamera();
    setIsScanning(false);
    setScanResult(null);
  };

  const startQRDetection = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const detectQR = async () => {
      if (!videoRef.current || !context || !isScanning) return;

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0);
      
      try {
        const imageData = canvas.toDataURL('image/png');
        const qrResult = qrCodeService.parseQRCode(imageData);
        
        if (qrResult && qrResult.success && qrResult.data) {
          await handleQRDetected(qrResult.data);
        }
      } catch (error) {
        console.error('QR detection error:', error);
      }

      if (isScanning) {
        requestAnimationFrame(detectQR);
      }
    };

    detectQR();
  };

  const handleQRDetected = async (qrData: QRCodeData | string) => {
    setLoading(true);
    stopCamera();

    try {
      let qrInfo: any;
      
      if (typeof qrData === 'string') {
        // Parse QR code data if it's a string
        qrInfo = JSON.parse(qrData);
      } else {
        // Use QRCodeData object directly
        qrInfo = {
          event_id: qrData.eventId,
          timestamp: Math.floor(qrData.timestamp / 1000), // Convert to seconds
          security_level: qrData.securityLevel,
          token: qrData.token
        };
      }
      
      // Validate QR code format
      if (!qrInfo.event_id || !qrInfo.timestamp || !qrInfo.security_level) {
        throw new Error('Invalid QR code format');
      }

      // Check if QR code is still valid (time-based)
      const now = Math.floor(Date.now() / 1000);
      const qrAge = now - qrInfo.timestamp;
      
      const securityLevels: Record<string, number> = {
        'basic': 24 * 60 * 60, // 24 hours
        'standard': 5 * 60,    // 5 minutes
        'high': 60,            // 1 minute
        'maximum': 30          // 30 seconds
      };

      const maxAge = securityLevels[qrInfo.security_level] || 300;

      if (qrAge > maxAge) {
        throw new Error('QR code has expired');
      }

      // Get event details for location verification
      const eventResponse = await apiService.getEvent(qrInfo.event_id);
      if (!eventResponse.success) {
        throw new Error('Event not found');
      }

      const event = eventResponse.data;

      // Verify user is within check-in radius
      if (userLocation) {
        const distance = locationService.calculateDistance(
          userLocation,
          event.location
        );

        if (distance > event.check_in_radius) {
          throw new Error(`You must be within ${event.check_in_radius}m of the event to check in. Current distance: ${Math.round(distance)}m`);
        }
      }

      // Perform check-in - use the required location format
      if (!userLocation) {
        throw new Error('Location is required for check-in');
      }

      const checkInResponse = await apiService.checkInToEvent(qrInfo.event_id, userLocation);

      if (checkInResponse.success) {
        setScanResult({
          success: true,
          message: `✅ Successfully checked in to ${event.name}!`,
          data: {
            event: event.name,
            timestamp: new Date().toLocaleString(),
            location: event.venue_name
          }
        });

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(checkInResponse.message || 'Check-in failed');
      }

    } catch (error) {
      console.error('QR processing error:', error);
      setScanResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process QR code'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (eventCode: string) => {
    if (!eventCode.trim()) return;

    setLoading(true);
    try {
      // For manual entry, try to find the event first
      if (!userLocation) {
        throw new Error('Location is required for check-in');
      }

      // Use the check-in API with event ID (assuming eventCode is the event ID)
      const response = await apiService.checkInToEvent(eventCode.trim(), userLocation);

      if (response.success) {
        setScanResult({
          success: true,
          message: `✅ Successfully checked in!`,
          data: response.data
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(response.message || 'Invalid event code');
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check in with code'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar userType={user?.role || 'attendee'} />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            QR Scanner 📱
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
          }`}>
            Scan QR codes to check in to events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <GlassCard className="h-fit">
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Camera Scanner
            </h2>

            <div className="space-y-4">
              {!isScanning && cameraPermission !== 'denied' && (
                <div className="text-center">
                  <div className={`w-64 h-64 mx-auto mb-4 rounded-lg border-2 border-dashed flex items-center justify-center ${
                    theme === 'dark' 
                      ? 'border-cyber-purple/50 bg-cyber-purple/10' 
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <div className="text-6xl mb-2">📷</div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
                      }`}>
                        Camera preview will appear here
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={startCamera}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      theme === 'dark' 
                        ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Starting Camera...' : 'Start Scanning'}
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover rounded-lg"
                      autoPlay
                      playsInline
                      muted
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 border-2 border-cyber-cyan rounded-lg pointer-events-none">
                      <div className="absolute inset-4 border border-cyber-cyan/50 rounded-lg">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyber-cyan"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyber-cyan"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyber-cyan"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyber-cyan"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={stopCamera}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Stop Scanning
                    </button>
                  </div>

                  <p className={`text-sm text-center ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
                  }`}>
                    Point your camera at the QR code to scan
                  </p>
                </div>
              )}

              {cameraPermission === 'denied' && (
                <div className="text-center space-y-4">
                  <div className="text-6xl">🚫</div>
                  <div>
                    <h3 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Camera Access Denied
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
                    }`}>
                      Please allow camera access in your browser settings to scan QR codes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Manual Entry & Results */}
          <div className="space-y-6">
            {/* Manual Entry */}
            <GlassCard>
              <h2 className={`text-xl font-semibold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Manual Entry
              </h2>

              <div className="space-y-4">
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
                }`}>
                  Can't scan? Enter the event code manually:
                </p>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter event code"
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                        : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        handleManualEntry(target.value);
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleManualEntry(input.value);
                    }}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Check In
                  </button>
                </div>
              </div>
            </GlassCard>

            {/* Scan Result */}
            {scanResult && (
              <GlassCard>
                <h2 className={`text-xl font-semibold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  Scan Result
                </h2>

                <div className={`p-4 rounded-lg ${
                  scanResult.success 
                    ? (theme === 'dark' ? 'bg-green-900/20 border border-green-500/30' : 'bg-green-50 border border-green-200')
                    : (theme === 'dark' ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200')
                }`}>
                  <div className={`font-medium mb-2 ${
                    scanResult.success 
                      ? (theme === 'dark' ? 'text-green-400' : 'text-green-700')
                      : (theme === 'dark' ? 'text-red-400' : 'text-red-700')
                  }`}>
                    {scanResult.message}
                  </div>

                  {scanResult.success && scanResult.data && (
                    <div className={`text-sm space-y-1 ${
                      theme === 'dark' ? 'text-green-300' : 'text-green-600'
                    }`}>
                      {scanResult.data.event && (
                        <p><strong>Event:</strong> {scanResult.data.event}</p>
                      )}
                      {scanResult.data.timestamp && (
                        <p><strong>Time:</strong> {scanResult.data.timestamp}</p>
                      )}
                      {scanResult.data.location && (
                        <p><strong>Location:</strong> {scanResult.data.location}</p>
                      )}
                    </div>
                  )}

                  {scanResult.success && (
                    <p className={`text-xs mt-3 ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-blue-600'
                    }`}>
                      Redirecting to dashboard in 3 seconds...
                    </p>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setScanResult(null)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Location Status */}
            <GlassCard>
              <h2 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Location Status
              </h2>

              <div className={`flex items-center space-x-2 ${
                userLocation 
                  ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                  : (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600')
              }`}>
                <div className="text-xl">
                  {userLocation ? '📍' : '⚠️'}
                </div>
                <span className="text-sm">
                  {userLocation 
                    ? 'Location services enabled' 
                    : 'Location services unavailable'
                  }
                </span>
              </div>

              {userLocation && (
                <p className={`text-xs mt-2 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
                }`}>
                  Lat: {userLocation.latitude.toFixed(6)}, Lng: {userLocation.longitude.toFixed(6)}
                </p>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
