import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { certificateSchemas } from '../middleware/validation';
import { certificateRateLimit } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, AuthorizationError, ValidationError, BlockchainError } from '../middleware/errorHandler';
import { BlockchainService } from '../services/BlockchainService';

const router = Router();
const blockchainService = new BlockchainService();

// Mock certificate storage (replace with database in production)
interface Certificate {
  id: string;
  event_id: string;
  owner: string;
  tier: number;
  tier_name: string;
  metadata: {
    event_name: string;
    venue_name: string;
    issued_at: number;
    validations_received: number;
  };
  tx_hash?: string;
  ipfs_url?: string;
}

const certificates: Map<string, Certificate> = new Map();
const userCertificates: Map<string, Set<string>> = new Map(); // user_address -> Set of certificate IDs

// Mock events data (would come from events service in production)
const mockEvents = new Map([
  ['event_1', { name: 'Blockchain Conference 2025', venue_name: 'Tech Hub' }],
  ['event_2', { name: 'Web3 Workshop', venue_name: 'Innovation Center' }]
]);

/**
 * @route POST /api/certificates/mint
 * @desc Mint a new certificate for an attendee
 * @access Private (Admin only)
 */
router.post('/mint',
  authenticateToken,
  requireAdmin,
  certificateRateLimit.middleware,
  validate(certificateSchemas.mintCertificate),
  asyncHandler(async (req: Request, res: Response) => {
    const { event_id, recipient_address } = req.body;

    // Mock validation - check if recipient attended event
    // In production, this would check blockchain state
    const validationCount = Math.floor(Math.random() * 6); // Mock 0-5 validations
    
    if (validationCount === 0) {
      throw new ValidationError('Recipient has not attended this event');
    }

    // Determine certificate tier based on validations
    let tier = 1; // Bronze
    if (validationCount >= 5) tier = 3; // Gold
    else if (validationCount >= 3) tier = 2; // Silver

    const tierNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold' };

    // Create certificate
    const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const eventData = mockEvents.get(event_id);

    const certificate: Certificate = {
      id: certificateId,
      event_id,
      owner: recipient_address,
      tier,
      tier_name: tierNames[tier as keyof typeof tierNames],
      metadata: {
        event_name: eventData?.name || 'Unknown Event',
        venue_name: eventData?.venue_name || 'Unknown Venue',
        issued_at: Math.floor(Date.now() / 1000),
        validations_received: validationCount
      },
      tx_hash: `mock_tx_${Math.random().toString(36).substr(2, 16)}`,
      ipfs_url: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`
    };

    // Store certificate
    certificates.set(certificateId, certificate);
    
    // Add to user's certificates
    const userCerts = userCertificates.get(recipient_address) || new Set();
    userCerts.add(certificateId);
    userCertificates.set(recipient_address, userCerts);

    res.status(201).json({
      success: true,
      message: 'Certificate minted successfully',
      data: { certificate }
    });
  })
);

/**
 * @route GET /api/certificates
 * @desc Get certificates with pagination and filtering
 * @access Public
 */
router.get('/',
  optionalAuth,
  validate(certificateSchemas.getCertificates, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      owner,
      event_id,
      tier
    } = req.query as any;

    let filteredCertificates = Array.from(certificates.values());

    // Apply filters
    if (owner) {
      filteredCertificates = filteredCertificates.filter(cert => cert.owner === owner);
    }

    if (event_id) {
      filteredCertificates = filteredCertificates.filter(cert => cert.event_id === event_id);
    }

    if (tier) {
      filteredCertificates = filteredCertificates.filter(cert => cert.tier === parseInt(tier));
    }

    // Calculate pagination
    const total = filteredCertificates.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedCertificates = filteredCertificates.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        certificates: paginatedCertificates,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  })
);

/**
 * @route GET /api/certificates/:id
 * @desc Get certificate details by ID
 * @access Public
 */
router.get('/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const certificate = certificates.get(id);

    if (!certificate) {
      throw new NotFoundError('Certificate');
    }

    res.json({
      success: true,
      data: { certificate }
    });
  })
);

/**
 * @route GET /api/certificates/user/:address
 * @desc Get all certificates for a specific user
 * @access Public
 */
router.get('/user/:address',
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    
    // Basic address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new ValidationError('Invalid address format');
    }
    
    const userCerts = userCertificates.get(address) || new Set();
    
    const certificateList = Array.from(userCerts).map(certId => certificates.get(certId)).filter(Boolean);

    // Group by tier for statistics
    const stats = {
      total: certificateList.length,
      bronze: certificateList.filter(cert => cert!.tier === 1).length,
      silver: certificateList.filter(cert => cert!.tier === 2).length,
      gold: certificateList.filter(cert => cert!.tier === 3).length
    };

    res.json({
      success: true,
      data: {
        certificates: certificateList,
        stats
      }
    });
  })
);

/**
 * @route GET /api/certificates/event/:eventId
 * @desc Get all certificates for a specific event
 * @access Public
 */
router.get('/event/:eventId',
  asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    
    const eventCertificates = Array.from(certificates.values())
      .filter(cert => cert.event_id === eventId);

    // Group by tier for statistics
    const stats = {
      total: eventCertificates.length,
      bronze: eventCertificates.filter(cert => cert.tier === 1).length,
      silver: eventCertificates.filter(cert => cert.tier === 2).length,
      gold: eventCertificates.filter(cert => cert.tier === 3).length
    };

    res.json({
      success: true,
      data: {
        event_id: eventId,
        certificates: eventCertificates,
        stats
      }
    });
  })
);

/**
 * @route POST /api/certificates/check-eligibility
 * @desc Check if user is eligible for certificate minting
 * @access Private
 */
router.post('/check-eligibility',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { event_id } = req.body;
    const user = req.user!;

    if (!event_id) {
      throw new ValidationError('Event ID is required');
    }

    // Mock eligibility check
    const validationCount = Math.floor(Math.random() * 6); // Mock 0-5 validations
    const isEligible = validationCount > 0;
    
    let tier = 0;
    if (validationCount >= 5) tier = 3; // Gold
    else if (validationCount >= 3) tier = 2; // Silver
    else if (validationCount >= 1) tier = 1; // Bronze

    const tierNames = { 0: 'None', 1: 'Bronze', 2: 'Silver', 3: 'Gold' };

    res.json({
      success: true,
      data: {
        eligible: isEligible,
        user_address: user.address,
        event_id,
        validations_received: validationCount,
        earned_tier: tier,
        earned_tier_name: tierNames[tier as keyof typeof tierNames],
        requirements: {
          bronze: 1,
          silver: 3,
          gold: 5
        }
      }
    });
  })
);

/**
 * @route POST /api/certificates/verify
 * @desc Verify certificate authenticity
 * @access Public
 */
router.post('/verify',
  asyncHandler(async (req: Request, res: Response) => {
    const { certificate_id, tx_hash } = req.body;

    if (!certificate_id && !tx_hash) {
      throw new ValidationError('Certificate ID or transaction hash is required');
    }

    let certificate: Certificate | undefined;

    if (certificate_id) {
      certificate = certificates.get(certificate_id);
    } else if (tx_hash) {
      // Find certificate by transaction hash
      certificate = Array.from(certificates.values())
        .find(cert => cert.tx_hash === tx_hash);
    }

    if (!certificate) {
      return res.json({
        success: true,
        data: {
          verified: false,
          message: 'Certificate not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        verified: true,
        certificate,
        verification_time: new Date().toISOString()
      }
    });
  })
);

/**
 * @route GET /api/certificates/stats/global
 * @desc Get global certificate statistics
 * @access Public
 */
router.get('/stats/global',
  asyncHandler(async (req: Request, res: Response) => {
    const allCertificates = Array.from(certificates.values());
    
    const stats = {
      total_certificates: allCertificates.length,
      certificates_by_tier: {
        bronze: allCertificates.filter(cert => cert.tier === 1).length,
        silver: allCertificates.filter(cert => cert.tier === 2).length,
        gold: allCertificates.filter(cert => cert.tier === 3).length
      },
      unique_recipients: new Set(allCertificates.map(cert => cert.owner)).size,
      unique_events: new Set(allCertificates.map(cert => cert.event_id)).size,
      recent_certificates: allCertificates
        .sort((a, b) => b.metadata.issued_at - a.metadata.issued_at)
        .slice(0, 5)
        .map(cert => ({
          id: cert.id,
          tier_name: cert.tier_name,
          event_name: cert.metadata.event_name,
          issued_at: cert.metadata.issued_at
        }))
    };

    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * @route DELETE /api/certificates/:id
 * @desc Revoke a certificate (Admin only)
 * @access Private (Admin only)
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const certificate = certificates.get(id);

    if (!certificate) {
      throw new NotFoundError('Certificate');
    }

    // Remove from storage
    certificates.delete(id);
    
    // Remove from user's certificates
    const userCerts = userCertificates.get(certificate.owner);
    if (userCerts) {
      userCerts.delete(id);
      if (userCerts.size === 0) {
        userCertificates.delete(certificate.owner);
      } else {
        userCertificates.set(certificate.owner, userCerts);
      }
    }

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: {
        revoked_certificate: certificate
      }
    });
  })
);

export default router;
