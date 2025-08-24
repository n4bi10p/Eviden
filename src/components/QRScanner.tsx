import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, CheckCircle, AlertCircle, Scan, Users, Clock } from 'lucide-react';
import { qrCodeService, AttendeeQRData } from '../services/QRCodeService';
import GlassCard from './GlassCard';

interface QRScannerProps {
  onScan: (data: AttendeeQRData) => void;
  onClose: () => void;
  isOpen: boolean;
  eventId: string;
  eventTitle: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  isOpen,
  eventId,
  eventTitle,
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<string>('');
  const [scanError, setScanError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      initScanner();
    } else {
      cleanupScanner();
    }

    return () => {
      cleanupScanner();
    };
  }, [isOpen]);

  const initScanner = () => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      'qr-scanner-container',
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      },
      false
    );

    scanner.render(
      (decodedText) => handleScanSuccess(decodedText),
      (error) => handleScanError(error)
    );

    scannerRef.current = scanner;
    setIsScanning(true);
  };

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.warn('Scanner cleanup error:', error);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    const now = Date.now();
    
    // Prevent duplicate scans within 3 seconds
    if (now - lastScanTime < 3000) {
      return;
    }

    try {
      const qrData = qrCodeService.parseAttendanceQR(decodedText);
      
      if (qrCodeService.validateQRForEvent(qrData, eventId)) {
        setScanResult(`✅ Valid attendee: ${qrData.name}`);
        setScanError('');
        setLastScanTime(now);
        onScan(qrData);
      } else {
        setScanError('❌ Invalid QR code for this event');
        setScanResult('');
      }
    } catch (error) {
      setScanError('❌ Invalid QR code format');
      setScanResult('');
    }
  };

  const handleScanError = (error: string) => {
    // Suppress frequent scan errors (normal during scanning)
    if (!error.includes('No QR code found')) {
      console.warn('Scan error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md mx-4"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Scan className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Check-in Scanner
                  </h3>
                  <p className="text-sm text-gray-400">
                    {eventTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Scanner Container */}
            <div className="relative mb-4">
              <div
                id="qr-scanner-container"
                className="overflow-hidden rounded-lg bg-black/50"
              />
              
              {/* Scanning Overlay */}
              {isScanning && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
                >
                  <div className="p-4 bg-blue-500/20 rounded-full">
                    <Camera className="w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Scan Results */}
            <AnimatePresence>
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg mb-4"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-sm">{scanResult}</p>
                </motion.div>
              )}

              {scanError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg mb-4"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{scanError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Position QR code within the frame</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Scanner will automatically detect codes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                Close Scanner
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QRScanner;
