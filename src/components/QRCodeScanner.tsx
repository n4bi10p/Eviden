import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const { theme } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mock QR codes for demo
  const mockQRCodes = [
    'EVENT_12345_CHECKIN',
    'EVENT_67890_VALIDATION',
    'CERT_ABCDEF_MINT',
    'USER_PROFILE_VIEW'
  ];

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsScanning(true);
        
        // Mock scanning simulation
        setTimeout(() => {
          simulateQRDetection();
        }, 3000);
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const simulateQRDetection = () => {
    const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    setScanResult(randomQR);
    setIsScanning(false);
  };

  const handleConfirmScan = () => {
    if (scanResult) {
      onScan(scanResult);
      onClose();
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setIsScanning(true);
    setTimeout(simulateQRDetection, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
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
              QR Code Scanner
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

          {/* Scanner Area */}
          <div className="relative mb-6">
            <div className="aspect-square rounded-xl overflow-hidden bg-black/20 relative">
              {/* Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Scanning Overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Scanning Frame */}
                  <div className="relative w-48 h-48">
                    {/* Corner Frames */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-green-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-green-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-green-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-green-500 rounded-br-lg" />
                    
                    {/* Scanning Line */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-green-500 animate-pulse shadow-lg shadow-green-500/50 animate-bounce" />
                  </div>
                  
                  {/* Scanning Text */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white text-sm font-medium">
                      Looking for QR code...
                    </p>
                  </div>
                </div>
              )}
              
              {/* No Permission State */}
              {hasPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="text-6xl mb-4">📷</div>
                  <h3 className="text-white font-semibold mb-2">Camera Access Required</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Please allow camera access to scan QR codes
                  </p>
                  <MacOSButton onClick={startCamera} size="sm">
                    Enable Camera
                  </MacOSButton>
                </div>
              )}
              
              {/* Success State */}
              {scanResult && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-green-500/20">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-white font-semibold mb-2">QR Code Detected!</h3>
                  <p className="text-white/90 text-sm font-mono break-all">
                    {scanResult}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security Level Indicator */}
          <div className={`mb-6 p-3 rounded-lg border ${
            theme === 'dark' 
              ? 'border-green-500/30 bg-green-500/10' 
              : 'border-green-600/30 bg-green-50'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">🔒</span>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-green-400' : 'text-green-700'
              }`}>
                High Security Level
              </span>
            </div>
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-green-300/70' : 'text-green-600'
            }`}>
              QR codes rotate every 30 seconds for maximum security
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {scanResult ? (
              <>
                <MacOSButton 
                  onClick={handleConfirmScan}
                  className="w-full"
                  icon="✓"
                >
                  Confirm Scan
                </MacOSButton>
                <MacOSButton 
                  onClick={handleRetry}
                  variant="secondary"
                  className="w-full"
                  icon="🔄"
                >
                  Scan Again
                </MacOSButton>
              </>
            ) : (
              <>
                <MacOSButton 
                  onClick={simulateQRDetection}
                  className="w-full"
                  disabled={!hasPermission || isScanning}
                  icon="📱"
                >
                  {isScanning ? 'Scanning...' : 'Simulate QR Detection'}
                </MacOSButton>
                <MacOSButton 
                  onClick={onClose}
                  variant="secondary"
                  className="w-full"
                >
                  Cancel
                </MacOSButton>
              </>
            )}
          </div>

          {/* Hidden Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </GlassCard>
      </div>
    </div>
  );
};

export default QRCodeScanner;
