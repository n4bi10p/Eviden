import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RotateCcw, Flashlight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import GlassCard from '../GlassCard';
import MacOSButton from '../MacOSButton';
import { showToast } from '../ui/Toast';

interface RealQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
  title?: string;
  description?: string;
}

export const RealQRScanner: React.FC<RealQRScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = "Scan QR Code",
  description = "Position the QR code within the frame"
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        
        // Check if torch is supported
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        setTorchSupported('torch' in capabilities);
        
        setHasPermission(true);
        startScanning();
      }
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      setHasPermission(false);
      setIsScanning(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please ensure your device has a camera.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
    }
  }, []);

  // Start QR code scanning
  const startScanning = useCallback(() => {
    const scan = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            setScanResult(code.data);
            setIsScanning(false);
            showToast.success('QR Code Detected!', 'Processing scan result...');
            return;
          }
        }
      }
      
      if (isScanning) {
        animationRef.current = requestAnimationFrame(scan);
      }
    };
    
    scan();
  }, [isScanning]);

  // Toggle torch/flashlight
  const toggleTorch = useCallback(async () => {
    if (streamRef.current && torchSupported) {
      try {
        const track = streamRef.current.getVideoTracks()[0];
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled } as any]
        });
        setTorchEnabled(!torchEnabled);
      } catch (err) {
        console.error('Failed to toggle torch:', err);
        showToast.error('Failed to toggle flashlight');
      }
    }
  }, [torchEnabled, torchSupported]);

  // Stop camera and cleanup
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsScanning(false);
    setTorchEnabled(false);
  }, []);

  // Retry scanning
  const retryScanning = () => {
    setScanResult(null);
    setError(null);
    initializeCamera();
  };

  // Confirm scan result
  const confirmScan = () => {
    if (scanResult) {
      onScan(scanResult);
      onClose();
    }
  };

  // Handle modal close
  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setError(null);
    onClose();
  };

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, initializeCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md">
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                {title}
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-600'
              }`}>
                {description}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-white/10 text-white/70' 
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera View */}
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden mb-4">
            {hasPermission === null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Requesting camera access...</p>
                </div>
              </div>
            )}

            {hasPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{error}</p>
                  <MacOSButton
                    onClick={retryScanning}
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                  >
                    Retry
                  </MacOSButton>
                </div>
              </div>
            )}

            {hasPermission && !scanResult && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Scanning frame */}
                    <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                    </div>
                    
                    {/* Scanning line animation */}
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-44 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Torch button */}
                {torchSupported && (
                  <button
                    onClick={toggleTorch}
                    className={`absolute bottom-4 right-4 p-3 rounded-full transition-colors ${
                      torchEnabled 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-black/30 text-white/70 hover:bg-black/50'
                    }`}
                  >
                    <Flashlight className="w-5 h-5" />
                  </button>
                )}
              </>
            )}

            {scanResult && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold mb-2">QR Code Detected!</p>
                  <p className="text-sm opacity-75 mb-4 break-all">{scanResult}</p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden canvas for QR processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Actions */}
          <div className="flex space-x-3">
            {scanResult ? (
              <>
                <MacOSButton
                  onClick={retryScanning}
                  variant="secondary"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Scan Again
                </MacOSButton>
                <MacOSButton
                  onClick={confirmScan}
                  variant="primary"
                  className="flex-1"
                >
                  Confirm
                </MacOSButton>
              </>
            ) : (
              <MacOSButton
                onClick={handleClose}
                variant="secondary"
                className="w-full"
              >
                Cancel
              </MacOSButton>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// Export RealQRScanner as default
export default RealQRScanner;
