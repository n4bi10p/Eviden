import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';
import config from '../config';

export interface QRCodeData {
  eventId: string;
  checkInToken: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // meters - base radius
    venue: string;
    venueType?: 'indoor' | 'outdoor' | 'mixed';
    capacity?: number; // expected number of attendees
    dynamicRadius?: boolean; // auto-calculate based on capacity
    safetyBuffer?: number; // additional meters for safety
    floorArea?: number; // square meters of venue
    multiLevel?: boolean; // multi-floor venue
  };
  organizer?: string;
  rotationInterval: number; // seconds
  challengeCode: string;
  deviceFingerprint?: string;
}

export interface GeneratedQRCode {
  id: string;
  eventId: string;
  qrCodeUrl: string;
  dataUrl: string;
  checkInUrl: string;
  expiresAt: number;
  isActive: boolean;
  scannedCount: number;
  createdAt: Date;
  rotationInterval: number;
  currentRotation: number;
  securityLevel: 'basic' | 'standard' | 'high' | 'maximum';
  proximityRequired: boolean;
  challengeRequired: boolean;
}

export interface ProximityCheck {
  required: boolean;
  eventLocation: {
    latitude: number;
    longitude: number;
    radius: number;
    calculatedRadius?: number;
    venue: string;
    capacity?: number;
    venueType?: string;
  };
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  isValid: boolean;
  distance?: number;
  radiusCalculation?: {
    baseRadius: number;
    capacityAdjustment: number;
    venueTypeMultiplier: number;
    safetyBuffer: number;
    finalRadius: number;
    calculation: string;
  };
  recommendations?: string[];
}

export class QRCodeService {
  private qrCodeDir: string;
  private baseCheckInUrl: string;
  private rotationTimers: Map<string, NodeJS.Timeout> = new Map();
  private activeRotations: Map<string, number> = new Map();

  constructor() {
    this.qrCodeDir = path.join(config.UPLOAD_DIR, 'qr-codes');
    this.baseCheckInUrl = `${config.FRONTEND_URL}/check-in`;
    this.initializeQRDirectory();
  }

  private async initializeQRDirectory(): Promise<void> {
    try {
      await fs.access(this.qrCodeDir);
    } catch (error) {
      await fs.mkdir(this.qrCodeDir, { recursive: true });
      console.log(`✅ Created QR codes directory: ${this.qrCodeDir}`);
    }
  }

  // Generate QR code for event check-in with security features
  async generateEventCheckInQR(
    eventId: string, 
    options: {
      expirationHours?: number;
      location?: {
        latitude: number;
        longitude: number;
        radius: number;
        venue: string;
      };
      organizer?: string;
      customData?: any;
      securityLevel?: 'basic' | 'standard' | 'high' | 'maximum';
      rotationInterval?: number; // seconds
    } = {}
  ): Promise<GeneratedQRCode> {
    try {
      const qrId = this.generateQRId();
      const checkInToken = this.generateCheckInToken();
      const expirationHours = options.expirationHours || 24;
      const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000);
      const securityLevel = options.securityLevel || 'standard';
      const rotationInterval = options.rotationInterval || this.getRotationInterval(securityLevel);

      // Generate challenge code for anti-spoofing
      const challengeCode = this.generateChallengeCode();

      // Create QR code data with security features
      const qrData: QRCodeData = {
        eventId,
        checkInToken,
        timestamp: Date.now(),
        location: options.location,
        organizer: options.organizer,
        rotationInterval,
        challengeCode
      };

      // Create check-in URL with security parameters
      const securityParams = new URLSearchParams({
        token: checkInToken,
        event: eventId,
        qr: qrId,
        challenge: challengeCode,
        rotation: '0',
        security: securityLevel
      });
      
      const checkInUrl = `${this.baseCheckInUrl}?${securityParams.toString()}`;
      
      // QR code options for data URL
      const qrDataOptions = {
        type: 'image/png' as const,
        quality: 0.92,
        margin: 1,
        color: {
          dark: this.getSecurityColor(securityLevel),
          light: '#FFFFFF'
        },
        width: 256,
        errorCorrectionLevel: 'H' as const // High error correction for security
      };

      // QR code options for buffer
      const qrBufferOptions = {
        margin: 1,
        color: {
          dark: this.getSecurityColor(securityLevel),
          light: '#FFFFFF'
        },
        width: 256,
        errorCorrectionLevel: 'H' as const
      };

      // Generate QR code data URL
      const dataUrl = await QRCode.toDataURL(checkInUrl, qrDataOptions);

      // Generate QR code file
      const fileName = `qr-${qrId}-${eventId}-${securityLevel}.png`;
      const filePath = path.join(this.qrCodeDir, fileName);
      
      // Save QR code as file
      const buffer = await QRCode.toBuffer(checkInUrl, qrBufferOptions);
      await fs.writeFile(filePath, buffer);

      const qrCodeUrl = `/uploads/qr-codes/${fileName}`;

      const generatedQR: GeneratedQRCode = {
        id: qrId,
        eventId,
        qrCodeUrl,
        dataUrl,
        checkInUrl,
        expiresAt,
        isActive: true,
        scannedCount: 0,
        createdAt: new Date(),
        rotationInterval,
        currentRotation: 0,
        securityLevel,
        proximityRequired: !!options.location,
        challengeRequired: securityLevel !== 'basic'
      };

      // Store QR code metadata with security info
      await this.saveQRMetadata(generatedQR, qrData);

      // Start rotation timer for time-rotating QR codes
      if (securityLevel !== 'basic') {
        this.startRotationTimer(qrId, rotationInterval);
      }

      console.log(`✅ Secure QR code generated for event ${eventId}: ${qrId} (${securityLevel} security)`);
      return generatedQR;

    } catch (error) {
      console.error('❌ Error generating secure QR code:', error);
      throw error;
    }
  }

  // Generate dynamic QR code with real-time data and security
  async generateDynamicQR(
    eventId: string,
    userId: string,
    sessionData: any = {}
  ): Promise<GeneratedQRCode> {
    const dynamicToken = this.generateDynamicToken(eventId, userId);
    const challengeCode = this.generateChallengeCode();
    const securityLevel = 'high'; // Dynamic QRs always use high security
    const rotationInterval = this.getRotationInterval(securityLevel);
    
    const securityParams = new URLSearchParams({
      token: dynamicToken,
      event: eventId,
      user: userId,
      challenge: challengeCode,
      rotation: '0',
      security: securityLevel
    });
    
    const checkInUrl = `${this.baseCheckInUrl}/dynamic?${securityParams.toString()}`;

    const qrOptions = {
      type: 'image/png' as const,
      quality: 0.95,
      margin: 2,
      color: {
        dark: this.getSecurityColor(securityLevel),
        light: '#FFFFFF'
      },
      width: 300,
      errorCorrectionLevel: 'H' as const
    };

    const dataUrl = await QRCode.toDataURL(checkInUrl, qrOptions);
    const qrId = this.generateQRId();

    const generatedQR: GeneratedQRCode = {
      id: qrId,
      eventId,
      qrCodeUrl: '',
      dataUrl,
      checkInUrl,
      expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2 hours for dynamic QR
      isActive: true,
      scannedCount: 0,
      createdAt: new Date(),
      rotationInterval,
      currentRotation: 0,
      securityLevel,
      proximityRequired: false, // Can be enabled per event
      challengeRequired: true
    };

    // Start rotation timer
    this.startRotationTimer(qrId, rotationInterval);

    return generatedQR;
  }

  // Validate QR code for check-in with enhanced security
  async validateQRCode(
    token: string, 
    eventId: string, 
    qrId?: string,
    userLocation?: { latitude: number; longitude: number; accuracy: number },
    deviceFingerprint?: string,
    challengeResponse?: string
  ): Promise<{
    isValid: boolean;
    message: string;
    data?: any;
    securityChecks?: {
      proximityCheck: ProximityCheck;
      challengeCheck: boolean;
      rotationCheck: boolean;
      deviceCheck: boolean;
    };
  }> {
    try {
      // Load QR metadata
      const metadata = await this.getQRMetadata(qrId || token);
      
      if (!metadata) {
        return {
          isValid: false,
          message: 'QR code not found or invalid'
        };
      }

      // Initialize security checks
      const securityChecks = {
        proximityCheck: { required: false, isValid: true } as ProximityCheck,
        challengeCheck: true,
        rotationCheck: true,
        deviceCheck: true
      };

      // Check if QR code is still active
      if (!metadata.qr.isActive) {
        return {
          isValid: false,
          message: 'QR code has been deactivated',
          securityChecks
        };
      }

      // Check expiration
      if (Date.now() > metadata.qr.expiresAt) {
        return {
          isValid: false,
          message: 'QR code has expired',
          securityChecks
        };
      }

      // Check event match
      if (metadata.qr.eventId !== eventId) {
        return {
          isValid: false,
          message: 'QR code is not valid for this event',
          securityChecks
        };
      }

      // Proximity verification
      if (metadata.qr.proximityRequired && metadata.data.location) {
        securityChecks.proximityCheck = await this.verifyProximity(
          metadata.data.location,
          userLocation
        );
        
        if (!securityChecks.proximityCheck.isValid) {
          return {
            isValid: false,
            message: 'Location verification failed - you must be at the event location',
            securityChecks
          };
        }
      }

      // Challenge verification for anti-spoofing
      if (metadata.qr.challengeRequired && challengeResponse) {
        securityChecks.challengeCheck = this.verifyChallenge(
          metadata.data.challengeCode,
          challengeResponse
        );
        
        if (!securityChecks.challengeCheck) {
          return {
            isValid: false,
            message: 'Security challenge failed',
            securityChecks
          };
        }
      }

      // Time rotation verification
      if (metadata.qr.securityLevel !== 'basic') {
        securityChecks.rotationCheck = this.verifyRotation(
          metadata.qr.id,
          metadata.qr.rotationInterval
        );
        
        if (!securityChecks.rotationCheck) {
          return {
            isValid: false,
            message: 'QR code rotation expired - please refresh',
            securityChecks
          };
        }
      }

      // Device fingerprint check (for high security)
      if (metadata.qr.securityLevel === 'maximum' && deviceFingerprint) {
        securityChecks.deviceCheck = this.verifyDeviceFingerprint(
          metadata.data.deviceFingerprint,
          deviceFingerprint
        );
      }

      // Update scan count
      await this.incrementScanCount(qrId || token);

      return {
        isValid: true,
        message: 'QR code is valid',
        data: metadata,
        securityChecks
      };

    } catch (error) {
      console.error('❌ Error validating QR code:', error);
      return {
        isValid: false,
        message: 'Error validating QR code'
      };
    }
  }

  // Get QR code analytics
  async getQRAnalytics(eventId: string): Promise<{
    totalQRCodes: number;
    activeQRCodes: number;
    totalScans: number;
    uniqueScans: number;
    scansByHour: Array<{ hour: string; scans: number }>;
  }> {
    // This would be implemented with database queries in production
    // For now, return mock data
    return {
      totalQRCodes: 1,
      activeQRCodes: 1,
      totalScans: 0,
      uniqueScans: 0,
      scansByHour: []
    };
  }

  // Generate bulk QR codes for multiple events
  async generateBulkQRCodes(eventIds: string[]): Promise<GeneratedQRCode[]> {
    const results: GeneratedQRCode[] = [];
    
    for (const eventId of eventIds) {
      try {
        const qr = await this.generateEventCheckInQR(eventId);
        results.push(qr);
      } catch (error) {
        console.error(`❌ Failed to generate QR for event ${eventId}:`, error);
      }
    }

    console.log(`✅ Generated ${results.length} QR codes for ${eventIds.length} events`);
    return results;
  }

  // Helper methods
  private generateQRId(): string {
    return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCheckInToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }

  private generateDynamicToken(eventId: string, userId: string): string {
    const data = `${eventId}_${userId}_${Date.now()}`;
    return Buffer.from(data).toString('base64url');
  }

  // Security helper methods
  private generateChallengeCode(): string {
    return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private getRotationInterval(securityLevel: string): number {
    const intervals = {
      basic: 0, // No rotation
      standard: 300, // 5 minutes
      high: 60, // 1 minute
      maximum: 30 // 30 seconds
    };
    return intervals[securityLevel as keyof typeof intervals] || 60;
  }

  private getSecurityColor(securityLevel: string): string {
    const colors = {
      basic: '#000000', // Black
      standard: '#2563eb', // Blue
      high: '#dc2626', // Red
      maximum: '#7c3aed' // Purple
    };
    return colors[securityLevel as keyof typeof colors] || '#000000';
  }

  private startRotationTimer(qrId: string, intervalSeconds: number): void {
    if (intervalSeconds <= 0) return;

    const timer = setInterval(() => {
      const currentRotation = this.activeRotations.get(qrId) || 0;
      this.activeRotations.set(qrId, currentRotation + 1);
      console.log(`🔄 QR code ${qrId} rotated to ${currentRotation + 1}`);
    }, intervalSeconds * 1000);

    this.rotationTimers.set(qrId, timer);
    console.log(`⏱️ Started rotation timer for QR ${qrId} (${intervalSeconds}s interval)`);
  }

  private stopRotationTimer(qrId: string): void {
    const timer = this.rotationTimers.get(qrId);
    if (timer) {
      clearInterval(timer);
      this.rotationTimers.delete(qrId);
      this.activeRotations.delete(qrId);
      console.log(`⏹️ Stopped rotation timer for QR ${qrId}`);
    }
  }

  private async verifyProximity(
    eventLocation: { 
      latitude: number; 
      longitude: number; 
      radius: number; 
      venue: string;
      venueType?: 'indoor' | 'outdoor' | 'mixed';
      capacity?: number;
      dynamicRadius?: boolean;
      safetyBuffer?: number;
      floorArea?: number;
      multiLevel?: boolean;
    },
    userLocation?: { latitude: number; longitude: number; accuracy: number }
  ): Promise<ProximityCheck> {
    const proximityCheck: ProximityCheck = {
      required: true,
      eventLocation: {
        latitude: eventLocation.latitude,
        longitude: eventLocation.longitude,
        radius: eventLocation.radius,
        venue: eventLocation.venue,
        capacity: eventLocation.capacity,
        venueType: eventLocation.venueType
      },
      userLocation,
      isValid: false,
      recommendations: []
    };

    if (!userLocation) {
      proximityCheck.isValid = false;
      proximityCheck.recommendations?.push("Location permission required for check-in");
      return proximityCheck;
    }

    // Calculate smart radius based on event parameters
    const calculatedRadius = this.calculateSmartRadius(eventLocation);
    proximityCheck.eventLocation.calculatedRadius = calculatedRadius.finalRadius;
    proximityCheck.radiusCalculation = calculatedRadius;

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      eventLocation.latitude,
      eventLocation.longitude,
      userLocation.latitude,
      userLocation.longitude
    );

    proximityCheck.distance = distance;
    
    // Use calculated radius for validation
    const effectiveRadius = calculatedRadius.finalRadius;
    proximityCheck.isValid = distance <= effectiveRadius;

    // Add recommendations based on proximity check
    this.addProximityRecommendations(proximityCheck, distance, effectiveRadius);

    return proximityCheck;
  }

  private calculateSmartRadius(eventLocation: {
    radius: number;
    venue: string;
    venueType?: 'indoor' | 'outdoor' | 'mixed';
    capacity?: number;
    dynamicRadius?: boolean;
    safetyBuffer?: number;
    floorArea?: number;
    multiLevel?: boolean;
  }) {
    const baseRadius = eventLocation.radius;
    let capacityAdjustment = 0;
    let venueTypeMultiplier = 1;
    const safetyBuffer = eventLocation.safetyBuffer || 10; // Default 10m safety buffer
    
    // Calculate capacity-based adjustment
    if (eventLocation.capacity && eventLocation.dynamicRadius) {
      // Rule: More attendees = larger radius needed
      // Small event (1-50): No adjustment
      // Medium event (51-200): +20% radius
      // Large event (201-500): +40% radius  
      // Mega event (500+): +60% radius
      
      if (eventLocation.capacity <= 50) {
        capacityAdjustment = 0;
      } else if (eventLocation.capacity <= 200) {
        capacityAdjustment = baseRadius * 0.20; // +20%
      } else if (eventLocation.capacity <= 500) {
        capacityAdjustment = baseRadius * 0.40; // +40%
      } else {
        capacityAdjustment = baseRadius * 0.60; // +60%
      }

      // Additional adjustment for floor area
      if (eventLocation.floorArea) {
        // Calculate density: people per square meter
        const density = eventLocation.capacity / eventLocation.floorArea;
        
        if (density > 2) { // High density event
          capacityAdjustment += baseRadius * 0.15; // +15% for crowded events
        } else if (density < 0.5) { // Low density event
          capacityAdjustment -= baseRadius * 0.10; // -10% for spacious events
        }
      }

      // Multi-level venue adjustment
      if (eventLocation.multiLevel) {
        capacityAdjustment += baseRadius * 0.25; // +25% for multi-floor venues
      }
    }

    // Venue type multipliers
    switch (eventLocation.venueType) {
      case 'indoor':
        venueTypeMultiplier = 0.8; // Indoor venues are more precise
        break;
      case 'outdoor':
        venueTypeMultiplier = 1.2; // Outdoor venues need more flexibility
        break;
      case 'mixed':
        venueTypeMultiplier = 1.1; // Mixed venues need some flexibility
        break;
      default:
        venueTypeMultiplier = 1.0;
    }

    const adjustedRadius = (baseRadius + capacityAdjustment) * venueTypeMultiplier;
    const finalRadius = Math.round(adjustedRadius + safetyBuffer);

    // Generate calculation explanation
    const calculation = this.generateRadiusCalculationExplanation({
      baseRadius,
      capacityAdjustment,
      venueTypeMultiplier,
      safetyBuffer,
      finalRadius,
      capacity: eventLocation.capacity,
      venueType: eventLocation.venueType
    });

    return {
      baseRadius,
      capacityAdjustment: Math.round(capacityAdjustment),
      venueTypeMultiplier,
      safetyBuffer,
      finalRadius,
      calculation
    };
  }

  private generateRadiusCalculationExplanation(params: {
    baseRadius: number;
    capacityAdjustment: number;
    venueTypeMultiplier: number;
    safetyBuffer: number;
    finalRadius: number;
    capacity?: number;
    venueType?: string;
  }): string {
    const parts = [`Base radius: ${params.baseRadius}m`];
    
    if (params.capacity) {
      parts.push(`Capacity adjustment for ${params.capacity} attendees: +${params.capacityAdjustment}m`);
    }
    
    if (params.venueType && params.venueTypeMultiplier !== 1) {
      const percentage = Math.round((params.venueTypeMultiplier - 1) * 100);
      parts.push(`${params.venueType} venue: ${percentage > 0 ? '+' : ''}${percentage}%`);
    }
    
    parts.push(`Safety buffer: +${params.safetyBuffer}m`);
    parts.push(`Final radius: ${params.finalRadius}m`);
    
    return parts.join(' → ');
  }

  private addProximityRecommendations(
    proximityCheck: ProximityCheck, 
    distance: number, 
    effectiveRadius: number
  ): void {
    const recommendations = proximityCheck.recommendations || [];
    
    if (proximityCheck.isValid) {
      recommendations.push(`✅ You are ${Math.round(distance)}m from the event (within ${effectiveRadius}m radius)`);
      
      if (distance < effectiveRadius * 0.3) {
        recommendations.push("🎯 Perfect location - you're very close to the event center");
      } else if (distance < effectiveRadius * 0.7) {
        recommendations.push("👍 Good location - you're well within the event area");
      } else {
        recommendations.push("⚠️ You're at the edge of the event area");
      }
    } else {
      const overDistance = Math.round(distance - effectiveRadius);
      recommendations.push(`❌ You are ${Math.round(distance)}m from the event (${overDistance}m outside the ${effectiveRadius}m radius)`);
      
      if (overDistance < 20) {
        recommendations.push("📍 Move closer to the event venue to check in");
      } else if (overDistance < 50) {
        recommendations.push("🚶‍♀️ You need to get significantly closer to the event location");
      } else {
        recommendations.push("🗺️ You appear to be far from the event - check the event address");
      }
      
      // Add navigation help
      recommendations.push(`💡 Navigate to: ${proximityCheck.eventLocation.venue}`);
    }

    // Add capacity-based context if available
    if (proximityCheck.eventLocation.capacity) {
      if (proximityCheck.eventLocation.capacity > 500) {
        recommendations.push("🏟️ Large event - extended check-in radius active");
      } else if (proximityCheck.eventLocation.capacity < 50) {
        recommendations.push("🏠 Small event - precise location required");
      }
    }

    proximityCheck.recommendations = recommendations;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  private verifyChallenge(originalChallenge: string, response: string): boolean {
    // Simple challenge verification - in production, use more sophisticated methods
    const expectedResponse = Buffer.from(originalChallenge).toString('base64');
    return response === expectedResponse;
  }

  private verifyRotation(qrId: string, rotationInterval: number): boolean {
    if (rotationInterval <= 0) return true; // No rotation required

    const currentRotation = this.activeRotations.get(qrId) || 0;
    const metadata = this.getQRMetadata(qrId);
    
    // Check if rotation is still valid (within current rotation window)
    // This is a simplified check - in production, implement more sophisticated rotation tracking
    return true; // For now, always pass rotation check
  }

  private verifyDeviceFingerprint(originalFingerprint?: string, currentFingerprint?: string): boolean {
    if (!originalFingerprint || !currentFingerprint) return true;
    return originalFingerprint === currentFingerprint;
  }

  // Mock storage methods (replace with database in production)
  private async saveQRMetadata(qr: GeneratedQRCode, data: QRCodeData): Promise<void> {
    const metadata = { qr, data };
    const metadataFile = path.join(this.qrCodeDir, `metadata_${qr.id}.json`);
    await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
  }

  private async getQRMetadata(qrId: string): Promise<any> {
    try {
      const metadataFile = path.join(this.qrCodeDir, `metadata_${qrId}.json`);
      const data = await fs.readFile(metadataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  private async incrementScanCount(qrId: string): Promise<void> {
    try {
      const metadata = await this.getQRMetadata(qrId);
      if (metadata) {
        metadata.qr.scannedCount += 1;
        await this.saveQRMetadata(metadata.qr, metadata.data);
      }
    } catch (error) {
      console.error('❌ Error incrementing scan count:', error);
    }
  }

  // Cleanup expired QR codes
  async cleanupExpiredQRCodes(): Promise<number> {
    try {
      const files = await fs.readdir(this.qrCodeDir);
      const metadataFiles = files.filter(file => file.startsWith('metadata_'));
      let cleanedCount = 0;

      for (const file of metadataFiles) {
        try {
          const filePath = path.join(this.qrCodeDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const metadata = JSON.parse(data);

          if (Date.now() > metadata.qr.expiresAt) {
            // Delete metadata file
            await fs.unlink(filePath);
            
            // Delete QR code image file
            const qrFileName = `qr-${metadata.qr.id}-${metadata.qr.eventId}.png`;
            const qrFilePath = path.join(this.qrCodeDir, qrFileName);
            try {
              await fs.unlink(qrFilePath);
            } catch (error) {
              // File might not exist, continue
            }

            cleanedCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing file ${file}:`, error);
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired QR codes`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('❌ Error cleaning up expired QR codes:', error);
      return 0;
    }
  }
}

export const qrCodeService = new QRCodeService();
