import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Mail, Calendar, MapPin, X } from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';
import { qrCodeService } from '../services/QRCodeService';

interface AttendeeQRCardProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  attendeeName: string;
  attendeeEmail: string;
  userId: string;
  onClose?: () => void;
}

export const AttendeeQRCard: React.FC<AttendeeQRCardProps> = ({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  attendeeName,
  attendeeEmail,
  userId,
  onClose,
}) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [eventId, userId]);

  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const qrCodeService_instance = qrCodeService;
      const qrData = await qrCodeService_instance.generateAttendeeQR(
        eventId,
        userId,
        { email: attendeeEmail, name: attendeeName }
      );
      setQrCode(qrData);
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.download = `${eventTitle}-${attendeeName}-ticket.png`;
    link.href = qrCode;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {onClose && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Event Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      {/* Ticket Card */}
      <GlassCard className="overflow-hidden">
        <div className="relative">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{eventTitle}</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{eventLocation}</span>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <QrCode className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* QR Code */}
              <div className="flex-shrink-0">
                {isLoading ? (
                  <div className="w-48 h-48 bg-white/5 rounded-lg flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : error ? (
                  <div className="w-48 h-48 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center">
                    <p className="text-red-400 text-sm text-center px-4">{error}</p>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={qrCode}
                      alt="Event QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Attendee Info */}
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Attendee Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white font-medium">{attendeeName}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">{attendeeEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-400 mb-2">Check-in Instructions</h5>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Present this QR code at the event entrance</li>
                    <li>• Keep your phone screen bright for scanning</li>
                    <li>• Arrive 15 minutes before the event starts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={downloadQRCode}
                disabled={!qrCode || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Ticket
              </Button>
              
              <Button
                onClick={generateQRCode}
                disabled={isLoading}
                variant="outline"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Regenerate QR
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full"></div>
        </div>
      </GlassCard>

      {/* Security Note */}
      <div className="text-center">
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          This QR code is unique to your registration and cannot be transferred. 
          Each code can only be used once for check-in.
        </p>
      </div>
    </div>
  );
};

export default AttendeeQRCard;
