import express, { Request, Response } from 'express';
import { qrCodeService } from '../services/QRCodeService';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Generate QR code for event check-in with security features
router.post('/generate/:eventId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { 
      expirationHours = 24, 
      location,
      organizer,
      customData,
      securityLevel = 'standard',
      rotationInterval
    } = req.body;

    // Validate and enhance location if provided
    if (location) {
      // Required fields
      if (!location.latitude || !location.longitude || !location.venue) {
        return res.status(400).json({
          success: false,
          message: 'Location must include latitude, longitude, and venue name'
        });
      }

      // Set smart defaults
      if (!location.radius) {
        location.radius = 50; // Default 50m radius
      }

      // Enable dynamic radius calculation if capacity is provided
      if (location.capacity && !location.hasOwnProperty('dynamicRadius')) {
        location.dynamicRadius = true;
      }

      // Set default venue type if not specified
      if (!location.venueType) {
        location.venueType = 'mixed';
      }

      // Set default safety buffer
      if (!location.safetyBuffer) {
        location.safetyBuffer = 10;
      }

      // Validate capacity range
      if (location.capacity && (location.capacity < 1 || location.capacity > 10000)) {
        return res.status(400).json({
          success: false,
          message: 'Event capacity must be between 1 and 10,000 attendees'
        });
      }

      // Validate venue type
      const validVenueTypes = ['indoor', 'outdoor', 'mixed'];
      if (location.venueType && !validVenueTypes.includes(location.venueType)) {
        return res.status(400).json({
          success: false,
          message: `Venue type must be one of: ${validVenueTypes.join(', ')}`
        });
      }
    }

    const qrCode = await qrCodeService.generateEventCheckInQR(eventId, {
      expirationHours,
      location,
      organizer,
      customData,
      securityLevel,
      rotationInterval
    });

    res.json({
      success: true,
      message: `Secure QR code generated with ${securityLevel} security`,
      data: {
        ...qrCode,
        securityFeatures: {
          timeRotation: securityLevel !== 'basic',
          proximityRequired: !!location,
          challengeRequired: securityLevel !== 'basic',
          rotationInterval: qrCode.rotationInterval,
          smartRadius: location?.dynamicRadius || false,
          expectedAttendees: location?.capacity
        },
        locationInfo: location ? {
          venue: location.venue,
          venueType: location.venueType,
          baseRadius: location.radius,
          capacity: location.capacity,
          smartRadiusEnabled: location.dynamicRadius,
          estimatedFinalRadius: location.capacity ? 
            estimateRadius(location.radius, location.capacity, location.venueType) : 
            location.radius
        } : undefined
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Helper function to estimate radius (add this as a separate function)
function estimateRadius(baseRadius: number, capacity: number, venueType: string = 'mixed'): number {
  let adjustment = 0;
  
  if (capacity <= 50) adjustment = 0;
  else if (capacity <= 200) adjustment = baseRadius * 0.20;
  else if (capacity <= 500) adjustment = baseRadius * 0.40;
  else adjustment = baseRadius * 0.60;
  
  const venueMultiplier = venueType === 'indoor' ? 0.8 : venueType === 'outdoor' ? 1.2 : 1.1;
  return Math.round((baseRadius + adjustment) * venueMultiplier + 10);
}

// Generate dynamic QR code for user-specific check-in
router.post('/generate-dynamic/:eventId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.id;
    const { sessionData } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const qrCode = await qrCodeService.generateDynamicQR(eventId, userId, sessionData);

    res.json({
      success: true,
      message: 'Dynamic QR code generated successfully',
      data: qrCode
    });

  } catch (error: any) {
    console.error('❌ Error generating dynamic QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dynamic QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Validate QR code for check-in with security verification
router.post('/validate', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      token, 
      eventId, 
      qrId,
      userLocation,
      deviceFingerprint,
      challengeResponse
    } = req.body;

    if (!token || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Token and eventId are required'
      });
    }

    const validation = await qrCodeService.validateQRCode(
      token, 
      eventId, 
      qrId,
      userLocation,
      deviceFingerprint,
      challengeResponse
    );

    if (validation.isValid) {
      res.json({
        success: true,
        message: validation.message,
        data: validation.data,
        securityChecks: validation.securityChecks
      });
    } else {
      res.status(400).json({
        success: false,
        message: validation.message,
        securityChecks: validation.securityChecks
      });
    }

  } catch (error: any) {
    console.error('❌ Error validating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get QR code analytics for an event
router.get('/analytics/:eventId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const analytics = await qrCodeService.getQRAnalytics(eventId);

    res.json({
      success: true,
      message: 'QR code analytics retrieved successfully',
      data: analytics
    });

  } catch (error: any) {
    console.error('❌ Error getting QR analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get QR analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Generate bulk QR codes for multiple events
router.post('/generate-bulk', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { eventIds } = req.body;

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'eventIds array is required'
      });
    }

    const qrCodes = await qrCodeService.generateBulkQRCodes(eventIds);

    res.json({
      success: true,
      message: `Generated ${qrCodes.length} QR codes`,
      data: qrCodes
    });

  } catch (error: any) {
    console.error('❌ Error generating bulk QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bulk QR codes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Cleanup expired QR codes (admin only)
router.post('/cleanup', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    // In production, add admin role check here
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const cleanedCount = await qrCodeService.cleanupExpiredQRCodes();

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired QR codes`,
      data: { cleanedCount }
    });

  } catch (error: any) {
    console.error('❌ Error cleaning up QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired QR codes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Check-in endpoint for QR code scanning
router.post('/check-in', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { token, eventId, qrId, userInfo } = req.body;

    // Validate QR code first
    const validation = await qrCodeService.validateQRCode(token, eventId, qrId);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Here you would normally:
    // 1. Record the check-in in the database
    // 2. Send notifications if needed
    // 3. Update attendance records
    // 4. Generate any certificates if applicable

    // For now, return success response
    res.json({
      success: true,
      message: 'Check-in successful',
      data: {
        checkInTime: new Date().toISOString(),
        eventId,
        qrData: validation.data
      }
    });

  } catch (error: any) {
    console.error('❌ Error processing check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process check-in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get QR code info (for frontend display)
router.get('/info/:qrId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { qrId } = req.params;

    // This would normally fetch from database
    // For now, try to get metadata from file system
    const metadata = await qrCodeService['getQRMetadata'](qrId);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    res.json({
      success: true,
      message: 'QR code info retrieved',
      data: {
        id: metadata.qr.id,
        eventId: metadata.qr.eventId,
        isActive: metadata.qr.isActive,
        expiresAt: metadata.qr.expiresAt,
        scannedCount: metadata.qr.scannedCount,
        createdAt: metadata.qr.createdAt,
        securityLevel: metadata.qr.securityLevel,
        rotationInterval: metadata.qr.rotationInterval,
        proximityRequired: metadata.qr.proximityRequired,
        challengeRequired: metadata.qr.challengeRequired
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting QR info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get QR code info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get current rotation status for time-rotating QR codes
router.get('/rotation-status/:qrId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { qrId } = req.params;
    
    const currentRotation = qrCodeService['activeRotations'].get(qrId) || 0;
    const hasTimer = qrCodeService['rotationTimers'].has(qrId);
    
    res.json({
      success: true,
      message: 'Rotation status retrieved',
      data: {
        qrId,
        currentRotation,
        isRotating: hasTimer,
        timestamp: Date.now()
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting rotation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rotation status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Generate challenge response for anti-spoofing
router.post('/generate-challenge-response', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { challengeCode } = req.body;

    if (!challengeCode) {
      return res.status(400).json({
        success: false,
        message: 'Challenge code is required'
      });
    }

    // Generate expected response (in production, this would be more sophisticated)
    const challengeResponse = Buffer.from(challengeCode).toString('base64');

    res.json({
      success: true,
      message: 'Challenge response generated',
      data: {
        challengeResponse,
        timestamp: Date.now()
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating challenge response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate challenge response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Check proximity for an event location
router.post('/check-proximity', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      eventLocation,
      userLocation 
    } = req.body;

    if (!eventLocation || !userLocation) {
      return res.status(400).json({
        success: false,
        message: 'Event location and user location are required'
      });
    }

    const proximityCheck = await qrCodeService['verifyProximity'](eventLocation, userLocation);

    res.json({
      success: true,
      message: 'Proximity check completed',
      data: proximityCheck
    });

  } catch (error: any) {
    console.error('❌ Error checking proximity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check proximity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Test endpoint for smart radius calculation (no auth required)
router.post('/test-smart-radius', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      baseRadius = 50,
      capacity,
      venueType = 'mixed',
      floorArea,
      multiLevel = false
    } = req.body;

    // Validate inputs
    if (capacity && (capacity < 1 || capacity > 10000)) {
      return res.status(400).json({
        success: false,
        message: 'Event capacity must be between 1 and 10,000 attendees'
      });
    }

    const validVenueTypes = ['indoor', 'outdoor', 'mixed'];
    if (!validVenueTypes.includes(venueType)) {
      return res.status(400).json({
        success: false,
        message: `Venue type must be one of: ${validVenueTypes.join(', ')}`
      });
    }

    // Calculate smart radius using the helper function
    const smartRadius = estimateRadius(baseRadius, capacity || 0, venueType);
    
    // Calculate additional metrics
    let densityAdjustment = 0;
    if (floorArea && capacity) {
      const density = capacity / floorArea;
      if (density > 0.5) densityAdjustment = baseRadius * 0.15;
      else if (density > 0.3) densityAdjustment = baseRadius * 0.10;
      else if (density > 0.1) densityAdjustment = baseRadius * 0.05;
    }

    const multiLevelAdjustment = multiLevel ? smartRadius * 0.25 : 0;
    const finalRadius = Math.round(smartRadius + densityAdjustment + multiLevelAdjustment);

    res.json({
      success: true,
      message: 'Smart radius calculation completed',
      data: {
        input: {
          baseRadius,
          capacity: capacity || 0,
          venueType,
          floorArea,
          multiLevel
        },
        calculation: {
          baseRadius,
          capacityAdjustment: smartRadius - baseRadius - 10, // Minus safety buffer
          venueMultiplier: venueType === 'indoor' ? 0.8 : venueType === 'outdoor' ? 1.2 : 1.1,
          safetyBuffer: 10,
          densityAdjustment: Math.round(densityAdjustment),
          multiLevelAdjustment: Math.round(multiLevelAdjustment),
          smartRadius,
          finalRadius
        },
        recommendations: {
          radiusCategory: finalRadius <= 30 ? 'tight' : finalRadius <= 60 ? 'moderate' : finalRadius <= 100 ? 'flexible' : 'extended',
          suggestedCheckPoints: Math.ceil(finalRadius / 25),
          estimatedCoverage: `${Math.round(Math.PI * finalRadius * finalRadius / 1000)}k sq meters`,
          densityLevel: floorArea && capacity ? 
            (capacity / floorArea > 0.5 ? 'high' : capacity / floorArea > 0.3 ? 'medium' : 'low') : 
            'unknown'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error calculating smart radius:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate smart radius',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

export default router;
