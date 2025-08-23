import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, AuthorizationError, ValidationError } from '../middleware/errorHandler';

const router = Router();

// Mock user storage (replace with database in production)
interface UserProfile {
  id: string;
  address: string;
  email?: string;
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    email_notifications: boolean;
    push_notifications: boolean;
    newsletter: boolean;
  };
  role: string;
  created_at: number;
  last_login?: number;
  is_active: boolean;
  stats?: {
    events_created: number;
    events_attended: number;
    certificates_earned: number;
    validations_given: number;
    validations_received: number;
  };
}

const users: Map<string, UserProfile> = new Map();

// Initialize with some mock data
const mockUser1: UserProfile = {
  id: 'user_1',
  address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  email: 'alice@example.com',
  username: 'alice_crypto',
  full_name: 'Alice Johnson',
  bio: 'Blockchain enthusiast and event organizer',
  role: 'organizer',
  created_at: Math.floor(Date.now() / 1000) - 86400,
  is_active: true,
  preferences: {
    email_notifications: true,
    push_notifications: true,
    newsletter: false
  },
  stats: {
    events_created: 5,
    events_attended: 12,
    certificates_earned: 8,
    validations_given: 45,
    validations_received: 38
  }
};

users.set(mockUser1.address, mockUser1);

/**
 * @route GET /api/users
 * @desc Get all users with pagination
 * @access Private (Admin only)
 */
router.get('/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query as any;

    let filteredUsers = Array.from(users.values());

    // Apply filters
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username?.toLowerCase().includes(searchLower) ||
        user.full_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      const aValue = (a as any)[sort_by] || 0;
      const bValue = (b as any)[sort_by] || 0;
      
      if (sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    // Remove sensitive information
    const sanitizedUsers = paginatedUsers.map(user => ({
      id: user.id,
      address: user.address,
      username: user.username,
      full_name: user.full_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      location: user.location,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login,
      is_active: user.is_active,
      stats: user.stats
    }));

    res.json({
      success: true,
      data: {
        users: sanitizedUsers,
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
 * @route GET /api/users/:address
 * @desc Get user profile by address
 * @access Public
 */
router.get('/:address',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    
    // Basic address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new ValidationError('Invalid address format');
    }

    const user = users.get(address);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Return different information based on if it's the user's own profile
    const isOwnProfile = req.user?.address === address;
    const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';

    let userProfile: any = {
      id: user.id,
      address: user.address,
      username: user.username,
      full_name: user.full_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      location: user.location,
      social_links: user.social_links,
      role: user.role,
      created_at: user.created_at,
      stats: user.stats
    };

    // Include sensitive information for own profile or admin
    if (isOwnProfile || isAdmin) {
      userProfile = {
        ...userProfile,
        email: user.email,
        preferences: user.preferences,
        last_login: user.last_login,
        is_active: user.is_active
      };
    }

    res.json({
      success: true,
      data: { user: userProfile }
    });
  })
);

/**
 * @route PUT /api/users/:address
 * @desc Update user profile
 * @access Private (Own profile or Admin)
 */
router.put('/:address',
  authenticateToken,
  validate(userSchemas.updateProfile),
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    const currentUser = req.user!;
    
    // Basic address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new ValidationError('Invalid address format');
    }

    const user = users.get(address);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Check authorization
    const isOwnProfile = currentUser.address === address;
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

    if (!isOwnProfile && !isAdmin) {
      throw new AuthorizationError('Can only update your own profile');
    }

    const {
      email,
      username,
      full_name,
      bio,
      avatar_url,
      location,
      social_links,
      preferences
    } = req.body;

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      for (const [addr, u] of users.entries()) {
        if (addr !== address && u.email === email) {
          throw new ValidationError('Email already registered');
        }
      }
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      for (const [addr, u] of users.entries()) {
        if (addr !== address && u.username === username) {
          throw new ValidationError('Username already taken');
        }
      }
    }

    // Update user data
    const updatedUser: UserProfile = {
      ...user,
      ...(email && { email }),
      ...(username && { username }),
      ...(full_name && { full_name }),
      ...(bio && { bio }),
      ...(avatar_url && { avatar_url }),
      ...(location && { location }),
      ...(social_links && { social_links }),
      ...(preferences && { preferences })
    };

    users.set(address, updatedUser);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          address: updatedUser.address,
          email: updatedUser.email,
          username: updatedUser.username,
          full_name: updatedUser.full_name,
          bio: updatedUser.bio,
          avatar_url: updatedUser.avatar_url,
          location: updatedUser.location,
          social_links: updatedUser.social_links,
          preferences: updatedUser.preferences,
          role: updatedUser.role
        }
      }
    });
  })
);

/**
 * @route GET /api/users/:address/stats
 * @desc Get detailed user statistics
 * @access Public
 */
router.get('/:address/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    
    // Basic address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new ValidationError('Invalid address format');
    }

    const user = users.get(address);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Mock detailed statistics
    const detailedStats = {
      ...user.stats,
      recent_activity: [
        {
          type: 'event_attended',
          event_name: 'Web3 Summit 2025',
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          details: { certificate_tier: 'Gold' }
        },
        {
          type: 'peer_validation_given',
          event_name: 'Blockchain Workshop',
          timestamp: Math.floor(Date.now() / 1000) - 7200,
          details: { validated_user: '0xabc...def' }
        },
        {
          type: 'event_created',
          event_name: 'DeFi Meetup',
          timestamp: Math.floor(Date.now() / 1000) - 86400,
          details: { attendees: 25 }
        }
      ],
      badges: [
        { name: 'Early Adopter', earned_at: user.created_at },
        { name: 'Event Organizer', earned_at: user.created_at + 86400 },
        { name: 'Active Validator', earned_at: user.created_at + 172800 }
      ],
      monthly_activity: {
        '2025-08': { events: 3, validations: 12, certificates: 2 },
        '2025-07': { events: 2, validations: 8, certificates: 1 },
        '2025-06': { events: 4, validations: 15, certificates: 3 }
      }
    };

    res.json({
      success: true,
      data: {
        user_address: address,
        stats: detailedStats
      }
    });
  })
);

/**
 * @route GET /api/users/:address/events
 * @desc Get user's events (created and attended)
 * @access Public
 */
router.get('/:address/events',
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    const { type = 'all', page = 1, limit = 10 } = req.query as any;
    
    // Basic address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new ValidationError('Invalid address format');
    }

    const user = users.get(address);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Mock events data
    const mockEvents = {
      created: [
        {
          id: 'event_1',
          name: 'DeFi Workshop Series',
          description: 'Learn about decentralized finance',
          start_time: Math.floor(Date.now() / 1000) + 86400,
          attendee_count: 25,
          status: 'upcoming'
        },
        {
          id: 'event_2',
          name: 'Blockchain Basics',
          description: 'Introduction to blockchain technology',
          start_time: Math.floor(Date.now() / 1000) - 86400,
          attendee_count: 40,
          status: 'completed'
        }
      ],
      attended: [
        {
          id: 'event_3',
          name: 'Web3 Summit 2025',
          description: 'The future of the decentralized web',
          start_time: Math.floor(Date.now() / 1000) - 3600,
          checked_in: true,
          certificate_earned: 'Gold',
          validations_received: 5
        },
        {
          id: 'event_4',
          name: 'NFT Art Exhibition',
          description: 'Showcasing digital art on blockchain',
          start_time: Math.floor(Date.now() / 1000) - 172800,
          checked_in: true,
          certificate_earned: 'Silver',
          validations_received: 3
        }
      ]
    };

    let events: any[] = [];
    
    switch (type) {
      case 'created':
        events = mockEvents.created;
        break;
      case 'attended':
        events = mockEvents.attended;
        break;
      default:
        events = [
          ...mockEvents.created.map(e => ({ ...e, type: 'created' })),
          ...mockEvents.attended.map(e => ({ ...e, type: 'attended' }))
        ];
    }

    // Calculate pagination
    const total = events.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedEvents = events.slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        user_address: address,
        events: paginatedEvents,
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
 * @route POST /api/users/:address/deactivate
 * @desc Deactivate user account
 * @access Private (Admin only)
 */
router.post('/:address/deactivate',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    
    // Basic address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new ValidationError('Invalid address format');
    }

    const user = users.get(address);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Deactivate user
    user.is_active = false;
    users.set(address, user);

    res.json({
      success: true,
      message: 'User account deactivated successfully',
      data: {
        user_address: address,
        is_active: false
      }
    });
  })
);

/**
 * @route POST /api/users/:address/activate
 * @desc Activate user account
 * @access Private (Admin only)
 */
router.post('/:address/activate',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;
    
    // Basic address validation
    if (!address || !address.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new ValidationError('Invalid address format');
    }

    const user = users.get(address);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Activate user
    user.is_active = true;
    users.set(address, user);

    res.json({
      success: true,
      message: 'User account activated successfully',
      data: {
        user_address: address,
        is_active: true
      }
    });
  })
);

/**
 * @route GET /api/users/stats/global
 * @desc Get global user statistics
 * @access Public
 */
router.get('/stats/global',
  asyncHandler(async (req: Request, res: Response) => {
    const allUsers = Array.from(users.values());
    
    const stats = {
      total_users: allUsers.length,
      active_users: allUsers.filter(user => user.is_active).length,
      users_by_role: {
        user: allUsers.filter(user => user.role === 'user').length,
        organizer: allUsers.filter(user => user.role === 'organizer').length,
        admin: allUsers.filter(user => user.role === 'admin').length
      },
      recent_registrations: allUsers
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 5)
        .map(user => ({
          address: user.address,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          created_at: user.created_at
        })),
      top_event_creators: allUsers
        .filter(user => user.stats?.events_created)
        .sort((a, b) => (b.stats?.events_created || 0) - (a.stats?.events_created || 0))
        .slice(0, 5)
        .map(user => ({
          address: user.address,
          username: user.username,
          events_created: user.stats?.events_created || 0
        }))
    };

    res.json({
      success: true,
      data: stats
    });
  })
);

export default router;
