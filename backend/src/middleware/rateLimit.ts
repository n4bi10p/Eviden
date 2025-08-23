import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../services/RedisService';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  message?: string;
  headers?: boolean;
}

class RateLimiter {
  private redis: RedisService;
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.redis = RedisService.getInstance();
    this.options = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => req.ip || 'unknown',
      message: 'Too many requests, please try again later',
      headers: true,
      ...options
    };
  }

  middleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate_limit:${this.options.keyGenerator!(req)}`;
      const current = await this.redis.get(key);
      const currentCount = current ? parseInt(current) : 0;

      if (currentCount >= this.options.maxRequests) {
        if (this.options.headers) {
          res.set({
            'X-RateLimit-Limit': this.options.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + this.options.windowMs).toISOString()
          });
        }

        return res.status(429).json({
          success: false,
          message: this.options.message,
          retryAfter: this.options.windowMs
        });
      }

      // Increment counter
      const newCount = currentCount + 1;
      await this.redis.setex(key, Math.ceil(this.options.windowMs / 1000), newCount.toString());

      if (this.options.headers) {
        res.set({
          'X-RateLimit-Limit': this.options.maxRequests.toString(),
          'X-RateLimit-Remaining': (this.options.maxRequests - newCount).toString(),
          'X-RateLimit-Reset': new Date(Date.now() + this.options.windowMs).toISOString()
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On Redis error, allow the request to proceed
      next();
    }
  };
}

// Predefined rate limiters
export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 requests per 15 minutes
});

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  keyGenerator: (req) => `auth:${req.ip}:${req.body.address || req.body.email || 'unknown'}`
});

export const checkInRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // 3 check-in attempts per minute
  keyGenerator: (req) => `checkin:${(req as any).user?.id || req.ip}`
});

export const peerValidationRateLimit = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // 20 validations per 5 minutes
  keyGenerator: (req) => `validation:${(req as any).user?.id || req.ip}`
});

export const certificateRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 certificate operations per hour
  keyGenerator: (req) => `certificate:${(req as any).user?.id || req.ip}`
});

export const emailRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 emails per hour
  keyGenerator: (req) => `email:${req.body.email || (req as any).user?.email || req.ip}`
});

// Advanced rate limiter with user-specific limits
export const createUserRateLimit = (userMaxRequests: number, windowMs: number) => {
  return new RateLimiter({
    windowMs,
    maxRequests: userMaxRequests,
    keyGenerator: (req) => `user:${(req as any).user?.id || req.ip}`
  });
};

// IP-based rate limiter
export const createIPRateLimit = (maxRequests: number, windowMs: number) => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => `ip:${req.ip}`
  });
};

// Endpoint-specific rate limiter
export const createEndpointRateLimit = (endpoint: string, maxRequests: number, windowMs: number) => {
  return new RateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => `endpoint:${endpoint}:${(req as any).user?.id || req.ip}`
  });
};

export { RateLimiter };
