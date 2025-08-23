// QR Code Service for Scanning and Generation
export interface QRCodeData {
  eventId: string;
  token: string;
  timestamp: number;
  securityLevel: 'basic' | 'standard' | 'high' | 'maximum';
}

export interface QRScanResult {
  success: boolean;
  data?: QRCodeData;
  error?: string;
}

export class QRCodeService {
  private static instance: QRCodeService;
  private stream: MediaStream | null = null;

  private constructor() {}

  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }

  // Request camera permission
  async requestCameraPermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Back camera preferred
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      this.stream = stream;
      return true;
    } catch (error) {
      console.error('Failed to get camera permission:', error);
      return false;
    }
  }

  // Start camera for QR scanning
  async startCamera(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      if (!this.stream) {
        const hasPermission = await this.requestCameraPermission();
        if (!hasPermission) return false;
      }

      if (this.stream && videoElement) {
        videoElement.srcObject = this.stream;
        await videoElement.play();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to start camera:', error);
      return false;
    }
  }

  // Stop camera
  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  // Generate QR code URL for events
  generateEventQRCodeURL(eventId: string, token: string, securityLevel: string): string {
    const qrData = {
      eventId,
      token,
      timestamp: Date.now(),
      securityLevel,
      type: 'event_checkin'
    };
    
    return `eviden://checkin?data=${encodeURIComponent(JSON.stringify(qrData))}`;
  }

  // Parse QR code data
  parseQRCode(qrString: string): QRScanResult {
    try {
      // Handle different QR code formats
      if (qrString.startsWith('eviden://checkin?data=')) {
        const dataParam = qrString.split('data=')[1];
        const decodedData = decodeURIComponent(dataParam);
        const qrData = JSON.parse(decodedData);
        
        // Validate required fields
        if (!qrData.eventId || !qrData.token) {
          return { success: false, error: 'Invalid QR code format' };
        }

        return {
          success: true,
          data: {
            eventId: qrData.eventId,
            token: qrData.token,
            timestamp: qrData.timestamp || Date.now(),
            securityLevel: qrData.securityLevel || 'basic'
          }
        };
      }

      // Try to parse as direct JSON
      const qrData = JSON.parse(qrString);
      if (qrData.eventId && qrData.token) {
        return { success: true, data: qrData };
      }

      return { success: false, error: 'Unrecognized QR code format' };
    } catch (error) {
      return { success: false, error: 'Failed to parse QR code' };
    }
  }

  // Validate QR code timestamp
  isQRCodeValid(qrData: QRCodeData): boolean {
    const now = Date.now();
    const qrTimestamp = qrData.timestamp;

    // Security level time limits (in milliseconds)
    const timeouts = {
      basic: 24 * 60 * 60 * 1000, // 24 hours
      standard: 5 * 60 * 1000,    // 5 minutes
      high: 60 * 1000,            // 1 minute
      maximum: 30 * 1000          // 30 seconds
    };

    const timeLimit = timeouts[qrData.securityLevel] || timeouts.basic;
    return (now - qrTimestamp) <= timeLimit;
  }

  // Get security level color coding
  getSecurityLevelColor(level: string): string {
    switch (level) {
      case 'basic': return '#6B7280'; // Gray
      case 'standard': return '#3B82F6'; // Blue
      case 'high': return '#EF4444'; // Red
      case 'maximum': return '#8B5CF6'; // Purple
      default: return '#6B7280';
    }
  }

  // Get security level icon
  getSecurityLevelIcon(level: string): string {
    switch (level) {
      case 'basic': return '🖤';
      case 'standard': return '🔵';
      case 'high': return '🔴';
      case 'maximum': return '🟣';
      default: return '⚪';
    }
  }

  // Get security level description
  getSecurityLevelDescription(level: string): string {
    switch (level) {
      case 'basic': return 'Standard QR codes (24h validity)';
      case 'standard': return 'Rotating QR codes (5min intervals)';
      case 'high': return 'High security (1min intervals)';
      case 'maximum': return 'Maximum security (30sec intervals)';
      default: return 'Unknown security level';
    }
  }

  // Generate QR code for display (using external library or API)
  generateQRCodeDataURL(data: string, size: number = 256): Promise<string> {
    return new Promise((resolve, reject) => {
      // This would typically use a QR code generation library
      // For now, using a placeholder QR code API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
      
      // Convert to data URL for offline use
      fetch(qrApiUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to generate QR code'));
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }

  // Check camera availability
  async isCameraAvailable(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return false;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  }

  // Get available cameras
  async getCameraDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch {
      return [];
    }
  }

  // Switch camera (front/back)
  async switchCamera(videoElement: HTMLVideoElement, deviceId?: string): Promise<boolean> {
    try {
      // Stop current stream
      this.stopCamera();

      // Get new stream with specific device
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment' }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      await videoElement.play();
      return true;
    } catch (error) {
      console.error('Failed to switch camera:', error);
      return false;
    }
  }

  // Create canvas from video frame for QR detection
  captureVideoFrame(videoElement: HTMLVideoElement): ImageData | null {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) return null;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      return context.getImageData(0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.error('Failed to capture video frame:', error);
      return null;
    }
  }
}

// Global QR code service instance
export const qrCodeService = QRCodeService.getInstance();
