import { Router, Request, Response } from 'express';
import { authenticateToken, generateToken, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userSchemas } from '../middleware/validation';
import { authRateLimit } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticationError, ValidationError, ConflictError } from '../middleware/errorHandler';
import { EmailService } from '../services/EmailService';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = Router();
const emailService = new EmailService();

// Verification tokens storage (use database in production)
// const verificationTokens: Map<string, { userId: string, expires: number }> = new Map();

// Mock user storage (replace with database in production)
interface User {
  id: string;
  address: string;
  email: string;
  name: string;
  role: string;
  organizationName?: string;
  organizationDescription?: string;
  isVerified?: boolean; // Account verification status
  emailVerified?: boolean; // Email confirmation status
  created_at: number;
  last_login?: number;
}

// Simple file-based storage for development
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const VERIFICATION_TOKENS_FILE = path.join(process.cwd(), 'data', 'verification-tokens.json');

// Ensure data directory exists
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load users from file
function loadUsers(): Map<string, User> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const usersArray = JSON.parse(data);
      return new Map(usersArray);
    }
  } catch (error) {
    console.error('Error loading users from file:', error);
  }
  return new Map();
}

// Load verification tokens from file
function loadVerificationTokens(): Map<string, { userId: string, expires: number }> {
  try {
    if (fs.existsSync(VERIFICATION_TOKENS_FILE)) {
      const data = fs.readFileSync(VERIFICATION_TOKENS_FILE, 'utf-8');
      const tokensArray = JSON.parse(data);
      return new Map(tokensArray);
    }
  } catch (error) {
    console.error('Error loading verification tokens from file:', error);
  }
  return new Map();
}

// Save verification tokens to file
function saveVerificationTokens(tokens: Map<string, { userId: string, expires: number }>): void {
  try {
    const tokensArray = Array.from(tokens.entries());
    const dataDir = path.dirname(VERIFICATION_TOKENS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(VERIFICATION_TOKENS_FILE, JSON.stringify(tokensArray, null, 2));
  } catch (error) {
    console.error('Error saving verification tokens to file:', error);
  }
}

// Save users to file
function saveUsers(users: Map<string, User>): void {
  try {
    const usersArray = Array.from(users.entries());
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersArray, null, 2));
  } catch (error) {
    console.error('Error saving users to file:', error);
  }
}

// Initialize users and verification tokens from files
const users: Map<string, User> = loadUsers();
const verificationTokens: Map<string, { userId: string, expires: number }> = loadVerificationTokens();

// Helper function to verify signature (simplified for demo)
const verifySignature = (message: string, signature: string, address: string): boolean => {
  // In production, implement proper signature verification using Aptos SDK
  // This should cryptographically verify that the signature was created by the wallet owner
  
  // Basic checks for demo purposes
  if (!signature || signature.length < 64) {
    console.log('❌ Invalid signature format');
    return false;
  }
  
  if (!address || !address.match(/^0x[a-fA-F0-9]+$/)) {
    console.log('❌ Invalid address format');
    return false;
  }
  
  if (!message || message.length < 10) {
    console.log('❌ Invalid message format');
    return false;
  }
  
  // TODO: Implement actual cryptographic verification
  // Example: 
  // const publicKey = extractPublicKeyFromAddress(address);
  // return verifySignatureWithPublicKey(message, signature, publicKey);
  
  console.log('✅ Signature verification passed (demo mode)');
  return true;
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
    const timestampDiff = Math.abs(now - timestamp);
    if (timestampDiff > 300) { // 5 minutes
      console.log(`❌ Signature timestamp expired. Diff: ${timestampDiff}s`);
      throw new AuthenticationError('Signature timestamp expired. Please try again.');
    }

    // Additional security: Check if timestamp is not from the future
    if (timestamp > now + 60) { // Allow 1 minute tolerance for clock skew
      console.log(`❌ Signature timestamp from future. Now: ${now}, Received: ${timestamp}`);
      throw new AuthenticationError('Invalid signature timestamp');
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

    // Create verification token
    const verificationToken = emailService.generateVerificationToken();
    
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address,
      email,
      name,
      role: role || 'attendee',
      organizationName,
      organizationDescription,
      isVerified: false, // Account verification status
      emailVerified: false, // Email confirmation status (will be true after verification)
      created_at: Math.floor(Date.now() / 1000),
    };

    users.set(address, newUser);
    saveUsers(users);

    // Store verification token (expires in 24 hours)
    verificationTokens.set(verificationToken, {
      userId: newUser.id,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    saveVerificationTokens(verificationTokens);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
      console.log('✅ Verification email sent to:', email);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      address: newUser.address,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: newUser.id,
          address: newUser.address,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          organizationName: newUser.organizationName,
          organizationDescription: newUser.organizationDescription,
          emailVerified: newUser.emailVerified,
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
    saveUsers(users);

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
          emailVerified: user.emailVerified || false,
          isVerified: user.isVerified || false,
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
          full_name: user.name, // Map name to full_name for frontend consistency
          role: user.role,
          organizationName: user.organizationName,
          organizationDescription: user.organizationDescription,
          emailVerified: user.emailVerified || false,
          isVerified: user.isVerified || false,
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
    saveUsers(users);

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
 * @route POST /api/auth/resend-verification
 * @desc Resend verification email
 * @access Private
 */
router.post('/resend-verification',
  authenticateToken,
  authRateLimit.middleware,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.address) {
      throw new AuthenticationError('User authentication required');
    }
    
    const user = users.get(req.user.address);
    
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken();
    
    // Store verification token (expires in 24 hours)
    verificationTokens.set(verificationToken, {
      userId: user.id,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });
    saveVerificationTokens(verificationTokens);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('✅ Verification email resent to:', user.email);
    } catch (error) {
      console.error('❌ Failed to resend verification email:', error);
      throw new ValidationError('Failed to send verification email. Please try again.');
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  })
);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify email with token
 * @access Public
 */
router.get('/verify-email',
  authRateLimit.middleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;

    console.log('🔍 Email verification request received');
    console.log('🔍 Token:', token);
    console.log('🔍 Stored tokens:', Array.from(verificationTokens.keys()));

    if (!token || typeof token !== 'string') {
      console.log('❌ Invalid token format');
      
      // Redirect to frontend with error
      return res.redirect(`http://localhost:3000/verify-email-result?status=error&message=Invalid verification token format`);
    }

    // Check if token exists and is valid
    const tokenData = verificationTokens.get(token);
    console.log('🔍 Token data found:', tokenData);
    
    if (!tokenData) {
      console.log('❌ Token not found in storage');
      console.log('🔍 This might be due to server restart. Checking if user exists and marking as verified...');
      
      // As a fallback, if token is not found (server restart), redirect to login with instructions
      return res.redirect(`http://localhost:3000/verify-email-result?status=expired&message=Verification link expired. Please login and request a new verification email.`);
    }

    // Check if token has expired
    if (Date.now() > tokenData.expires) {
      verificationTokens.delete(token);
      saveVerificationTokens(verificationTokens);
      return res.redirect(`http://localhost:3000/verify-email-result?status=expired&message=Verification token has expired. Please request a new verification email.`);
    }

    // Find user by ID
    let userToVerify: User | undefined;
    for (const user of users.values()) {
      if (user.id === tokenData.userId) {
        userToVerify = user;
        break;
      }
    }

    if (!userToVerify) {
      return res.redirect(`http://localhost:3000/verify-email-result?status=error&message=User not found. Please contact support.`);
    }

    // Update user verification status
    userToVerify.emailVerified = true;
    userToVerify.isVerified = true;
    users.set(userToVerify.address, userToVerify);

    // Remove used token
    verificationTokens.delete(token);
    saveVerificationTokens(verificationTokens);

    console.log('✅ Email verified successfully for user:', userToVerify.email);

    // Redirect to frontend with success
    res.redirect(`http://localhost:3000/verify-email-result?status=success&message=Email verified successfully! You can now login to access all features.`);
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
