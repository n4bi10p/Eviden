import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        address: string;
        email?: string;
        name?: string;
        role: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user: {
    id: string;
    address: string;
    email?: string;
    name?: string;
    role: string;
  };
}

// JWT authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded as any;
    next();
  });
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded as any;
    }
    next();
  });
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin authorization
export const requireAdmin = requireRole(['admin', 'super_admin']);

// Event organizer authorization
export const requireOrganizer = requireRole(['organizer', 'admin', 'super_admin']);

// Helper function to generate JWT token
export const generateToken = (payload: any, expiresIn: string = '24h'): string => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

// Helper function to verify token
export const verifyToken = (token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// Refresh token middleware
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = await verifyToken(refreshToken);
    
    // Generate new access token
    const newAccessToken = generateToken({
      id: decoded.id,
      address: decoded.address,
      email: decoded.email,
      role: decoded.role
    }, '1h');

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        tokenType: 'Bearer'
      }
    });

  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};
