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
    participant_name?: string;
    participant_email?: string;
    certificate_type?: string;
    skills_acquired?: string[];
    attendance_duration?: string;
    participation_score?: number;
  };
  tx_hash?: string;
  ipfs_url?: string;
  nft_token_id?: number;
  image_url?: string;
  description?: string;
}

const certificates: Map<string, Certificate> = new Map();
const userCertificates: Map<string, Set<string>> = new Map(); // user_address -> Set of certificate IDs

// Mock events data (would come from events service in production)
const mockEvents = new Map([
  ['event_1', { name: 'Blockchain Conference 2025', venue_name: 'Tech Hub' }],
  ['event_2', { name: 'Web3 Workshop', venue_name: 'Innovation Center' }],
  ['event_3', { name: 'DeFi Masterclass', venue_name: 'Digital Campus' }],
  ['event_4', { name: 'Smart Contract Development', venue_name: 'Coding Bootcamp' }],
  ['event_5', { name: 'NFT Design Workshop', venue_name: 'Creative Studio' }],
  ['event_6', { name: 'Cryptocurrency Trading', venue_name: 'Finance Academy' }],
  ['event_7', { name: 'Blockchain for Healthcare', venue_name: 'Medical Institute' }],
  ['event_8', { name: 'Decentralized Finance Summit', venue_name: 'Business Center' }]
]);

// Initialize mock certificates with Indian names
function initializeMockCertificates() {
  console.log('🎓 Initializing mock certificates with Indian names...');
  
  if (certificates.size > 0) {
    console.log(`📜 Already have ${certificates.size} certificates, skipping initialization`);
    return;
  }

  const indianNames = [
    'Arjun Sharma', 'Priya Patel', 'Ravi Kumar', 'Anjali Singh', 'Vikram Yadav',
    'Neha Gupta', 'Raj Malhotra', 'Kavya Reddy', 'Sanjay Verma', 'Pooja Agarwal',
    'Rohit Jain', 'Shreya Nair', 'Amit Pandey', 'Ritu Kapoor', 'Manish Thakur'
  ];

  console.log(`👥 Creating certificates for ${indianNames.length} participants...`);

  indianNames.forEach((name, index) => {
    const participant_email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
    
    // Create 1-3 certificates per person
    const numCerts = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numCerts; i++) {
      const certificateId = `cert_${Date.now()}_${index}_${i}`;
      const tier = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
      const eventId = `event_${Math.floor(Math.random() * 8) + 1}`;
      const event = mockEvents.get(eventId) || { name: 'Unknown Event', venue_name: 'Unknown Venue' };
      
      const certificate: Certificate = {
        id: certificateId,
        event_id: eventId,
        owner: participant_email, // Use email as owner
        tier,
        tier_name: getTierName(tier),
        metadata: {
          event_name: event.name,
          venue_name: event.venue_name,
          issued_at: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random date within last 30 days
          validations_received: Math.floor(Math.random() * 5),
          participant_name: name,
          participant_email: participant_email,
          certificate_type: Math.random() > 0.5 ? 'completion' : 'participation',
          skills_acquired: getRandomSkills(),
          attendance_duration: `${Math.floor(Math.random() * 8) + 1} hours`,
          participation_score: Math.floor(Math.random() * 41) + 60, // 60-100
        },
        tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        ipfs_url: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`,
        nft_token_id: parseInt(`${Date.now()}${index}${i}`),
        image_url: getRandomCertificateImage(tier),
        description: getRandomDescription(tier, name)
      };

      certificates.set(certificateId, certificate);
      
      // Add to user's certificate list
      if (!userCertificates.has(participant_email)) {
        userCertificates.set(participant_email, new Set());
      }
      userCertificates.get(participant_email)!.add(certificateId);
    }
  });

  console.log(`✅ Created ${certificates.size} certificates for ${userCertificates.size} participants`);
  console.log(`📊 Distribution: Bronze: ${Array.from(certificates.values()).filter(c => c.tier === 1).length}, Silver: ${Array.from(certificates.values()).filter(c => c.tier === 2).length}, Gold: ${Array.from(certificates.values()).filter(c => c.tier === 3).length}`);
}

// Helper functions for generating random data
const getTierName = (tier: number): string => {
  switch (tier) {
    case 1: return 'Bronze Certificate';
    case 2: return 'Silver Certificate';
    case 3: return 'Gold Certificate';
    default: return 'Certificate';
  }
};

const getRandomSkills = (): string[] => {
  const allSkills = [
    'Blockchain Fundamentals', 'Smart Contracts', 'DeFi Protocols', 'NFT Development',
    'Cryptocurrency Trading', 'Web3 Development', 'Solidity Programming', 'Ethereum',
    'Aptos Move', 'Consensus Mechanisms', 'Cryptography', 'Tokenomics', 'DAOs',
    'Cross-chain Bridges', 'Layer 2 Solutions', 'Metamask Integration', 'Wallet Security'
  ];
  
  const skillCount = Math.floor(Math.random() * 4) + 2; // 2-5 skills
  const shuffled = allSkills.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, skillCount);
};

const getRandomCertificateImage = (tier: number): string => {
  const baseUrl = 'https://images.unsplash.com/';
  const images = {
    1: [ // Bronze
      '800x600/?blockchain,certificate,bronze',
      '800x600/?achievement,award,bronze',
      '800x600/?diploma,education,bronze'
    ],
    2: [ // Silver
      '800x600/?blockchain,certificate,silver',
      '800x600/?achievement,award,silver',
      '800x600/?diploma,education,silver'
    ],
    3: [ // Gold
      '800x600/?blockchain,certificate,gold',
      '800x600/?achievement,award,gold',
      '800x600/?diploma,education,gold'
    ]
  };
  
  const tierImages = images[tier as keyof typeof images] || images[1];
  return baseUrl + tierImages[Math.floor(Math.random() * tierImages.length)];
};

const getRandomDescription = (tier: string | number, participantName: string): string => {
  const tierNum = typeof tier === 'string' ? parseInt(tier) : tier;
  const achievements = {
    1: ['completed the program', 'demonstrated basic understanding', 'participated actively'],
    2: ['excelled in the program', 'showed advanced knowledge', 'contributed significantly'],
    3: ['mastered the curriculum', 'exhibited exceptional performance', 'led by example']
  };
  
  const tierAchievements = achievements[tierNum as keyof typeof achievements] || achievements[1];
  const achievement = tierAchievements[Math.floor(Math.random() * tierAchievements.length)];
  
  return `This certificate acknowledges that ${participantName} has ${achievement} in the blockchain and Web3 technology program, demonstrating commitment to learning and professional development.`;
};

// Initialize mock certificates on module load
initializeMockCertificates();

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
 * @route GET /api/certificates/demo
 * @desc Get demo certificates with Indian names for showcase
 * @access Public
 */
router.get('/demo',
  asyncHandler(async (req: Request, res: Response) => {
    // Get all certificates and return them for demo purposes
    const allCertificates = Array.from(certificates.values());
    
    // Group by participant for better display
    const certificatesByParticipant = allCertificates.reduce((acc, cert) => {
      const participantName = cert.metadata.participant_name || 'Unknown';
      if (!acc[participantName]) {
        acc[participantName] = [];
      }
      acc[participantName].push(cert);
      return acc;
    }, {} as Record<string, Certificate[]>);

    // Statistics
    const stats = {
      total_certificates: allCertificates.length,
      total_participants: Object.keys(certificatesByParticipant).length,
      certificates_by_tier: {
        bronze: allCertificates.filter(cert => cert.tier === 1).length,
        silver: allCertificates.filter(cert => cert.tier === 2).length,
        gold: allCertificates.filter(cert => cert.tier === 3).length
      },
      certificates_by_type: {
        completion: allCertificates.filter(cert => cert.metadata.certificate_type === 'completion').length,
        participation: allCertificates.filter(cert => cert.metadata.certificate_type === 'participation').length
      }
    };

    res.json({
      success: true,
      data: {
        certificates: allCertificates,
        certificates_by_participant: certificatesByParticipant,
        stats
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
    
    // Support both wallet addresses and email addresses
    const isEmail = address.includes('@');
    
    if (!isEmail) {
      // Basic address validation for wallet addresses
      if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
        throw new ValidationError('Invalid address format');
      }
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

// Initialize mock certificates when the module loads
initializeMockCertificates();

export default router;
