import { Router, Request, Response } from 'express';
import { authenticateToken, generateToken, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userSchemas } from '../middleware/validation';
import { authRateLimit } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticationError, ValidationError, ConflictError } from '../middleware/errorHandler';

const router = Router();

// Mock user storage (replace with database in production)
interface User {
  id: string;
  address: string;
  email: string;
  name: string;
  role: string;
  organizationName?: string;
  organizationDescription?: string;
  created_at: number;
  last_login?: number;
}

const users: Map<string, User> = new Map();

// Helper function to verify signature (simplified for demo)
const verifySignature = (message: string, signature: string, address: string): boolean => {
  // In production, implement proper signature verification
  // For now, we'll just check if signature is present
  return !!(signature && signature.length > 0);
};

/**
 * @route POST /api/auth/register
 * @desc Register new user with wallet address
 * @access Public
 */
router.post('/register', 
  authRateLimit.middleware,
  validate(userSchemas.register),
  asyncHandler(async (req: Request, res: Response) => {
    const { address, signature, message, nonce, timestamp, role, name, email, organizationName, organizationDescription } = req.body;

    // Verify signature
    const isValidSignature = verifySignature(message, signature, address);
    if (!isValidSignature) {
      throw new AuthenticationError('Invalid signature');
    }

    // Check timestamp (should be within last 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) { // 5 minutes
      throw new AuthenticationError('Signature timestamp expired');
    }

    // Check if user already exists
    if (users.has(address)) {
      throw new ConflictError('User with this address already exists');
    }

    // Check if email is already taken
    for (const user of users.values()) {
      if (user.email === email) {
        throw new ConflictError('Email already registered');
      }
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address,
      email,
      name,
      role: role || 'attendee',
      organizationName,
      organizationDescription,
      created_at: Math.floor(Date.now() / 1000),
    };

    users.set(address, newUser);

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      address: newUser.address,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          address: newUser.address,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          organizationName: newUser.organizationName,
          organizationDescription: newUser.organizationDescription,
          created_at: newUser.created_at
        },
        token,
        tokenType: 'Bearer'
      }
    });
  })
);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user with wallet signature
 * @access Public
 */
router.post('/login',
  authRateLimit.middleware,
  validate(userSchemas.login),
  asyncHandler(async (req: Request, res: Response) => {
    const { address, signature, message, timestamp } = req.body;

    // Check if user exists
    const user = users.get(address);
    if (!user) {
      throw new AuthenticationError('User not found. Please register first.');
    }

    // Verify signature
    const isValidSignature = verifySignature(message, signature, address);
    if (!isValidSignature) {
      throw new AuthenticationError('Invalid signature');
    }

    // Check timestamp (should be within last 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) { // 5 minutes
      throw new AuthenticationError('Signature timestamp expired');
    }

    // Update last login
    user.last_login = now;
    users.set(address, user);

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      address: user.address,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          address: user.address,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationName: user.organizationName,
          organizationDescription: user.organizationDescription,
          last_login: user.last_login
        },
        token,
        tokenType: 'Bearer'
      }
    });
  })
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    // Generate new token
    const token = generateToken({
      id: user.id,
      address: user.address,
      email: user.email,
      role: user.role
    }, '1h');

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
        tokenType: 'Bearer'
      }
    });
  })
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userAddress = req.user!.address;
    const user = users.get(userAddress);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          address: user.address,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationName: user.organizationName,
          organizationDescription: user.organizationDescription,
          created_at: user.created_at,
          last_login: user.last_login
        }
      }
    });
  })
);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  authenticateToken,
  validate(userSchemas.updateProfile),
  asyncHandler(async (req: Request, res: Response) => {
    const userAddress = req.user!.address;
    const user = users.get(userAddress);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const { email, username, full_name, bio, avatar_url, location, social_links, preferences } = req.body;

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      for (const [addr, u] of users.entries()) {
        if (addr !== userAddress && u.email === email) {
          throw new ConflictError('Email already registered');
        }
      }
    }

    // Update user data
    const updatedUser = {
      ...user,
      ...(email && { email }),
      ...(username && { username }),
      ...(full_name && { full_name }),
    };

    users.set(userAddress, updatedUser);

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
          role: updatedUser.role,
          created_at: updatedUser.created_at,
          last_login: updatedUser.last_login
        }
      }
    });
  })
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (invalidate token on client side)
 * @access Private
 */
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    // In a production app, you might want to blacklist the token
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  })
);

/**
 * @route GET /api/auth/nonce/:address
 * @desc Get nonce for wallet signature
 * @access Public
 */
router.get('/nonce/:address',
  asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.params;

    if (!address || !address.match(/^0x[a-fA-F0-9]+$/)) {
      throw new ValidationError('Invalid address format');
    }

    // Generate a nonce for signing
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substr(2, 15);
    const message = `Please sign this message to authenticate with Attestify.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    res.json({
      success: true,
      data: {
        message,
        timestamp,
        nonce
      }
    });
  })
);

/**
 * @route GET /api/auth/verify
 * @desc Verify if token is valid
 * @access Private
 */
router.get('/verify',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user
      }
    });
  })
);

export default router;
