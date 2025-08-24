import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from './errorHandler';

// Common validation schemas
export const commonSchemas = {
  address: Joi.string().pattern(/^0x[a-fA-F0-9]+$/).required().messages({
    'string.pattern.base': 'Invalid Aptos address format'
  }),
  
  email: Joi.string().email().max(255).messages({
    'string.email': 'Invalid email format'
  }),
  
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }),
  
  timestamp: Joi.number().integer().min(0).required(),
  
  eventId: Joi.string().pattern(/^[0-9]+$/).required().messages({
    'string.pattern.base': 'Event ID must be a numeric string'
  }),
  
  certificateId: Joi.string().pattern(/^[0-9]+$/).required().messages({
    'string.pattern.base': 'Certificate ID must be a numeric string'
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Event validation schemas
export const eventSchemas = {
  createEvent: Joi.object({
    name: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(10).max(2000).required(),
    start_time: commonSchemas.timestamp,
    end_time: commonSchemas.timestamp.greater(Joi.ref('start_time')),
    venue_name: Joi.string().min(3).max(255).required(),
    venue_address: Joi.string().max(500),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    max_attendees: Joi.number().integer().min(1).max(10000).required(),
    check_in_radius: Joi.number().min(1).max(1000).required(),
    tags: Joi.array().items(Joi.string().max(50)).max(10),
    image_url: Joi.string().uri().max(500),
    external_url: Joi.string().uri().max(500),
    is_private: Joi.boolean().default(false),
    requires_approval: Joi.boolean().default(false)
  }),

  updateEvent: Joi.object({
    name: Joi.string().min(3).max(255),
    description: Joi.string().min(10).max(2000),
    venue_name: Joi.string().min(3).max(255),
    venue_address: Joi.string().max(500),
    max_attendees: Joi.number().integer().min(1).max(10000),
    tags: Joi.array().items(Joi.string().max(50)).max(10),
    image_url: Joi.string().uri().max(500),
    external_url: Joi.string().uri().max(500),
    is_private: Joi.boolean(),
    requires_approval: Joi.boolean()
  }).min(1),

  checkIn: Joi.object({
    event_id: commonSchemas.eventId,
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    device_info: Joi.object({
      user_agent: Joi.string().max(500),
      platform: Joi.string().max(50),
      app_version: Joi.string().max(20)
    })
  }),

  peerValidation: Joi.object({
    event_id: commonSchemas.eventId,
    attendee_address: commonSchemas.address
  }),

  getEvents: Joi.object({
    ...commonSchemas.pagination.describe().keys,
    search: Joi.string().max(100),
    category: Joi.string().max(50),
    status: Joi.string().valid('upcoming', 'ongoing', 'completed'),
    organizer: Joi.string().pattern(/^0x[a-fA-F0-9]+$/).optional().messages({
      'string.pattern.base': 'Invalid Aptos address format'
    }),
    start_date: Joi.date(),
    end_date: Joi.date().greater(Joi.ref('start_date')),
    near_location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      radius: Joi.number().min(1).max(100000).default(10000) // radius in meters
    })
  })
};

// User validation schemas
export const userSchemas = {
  updateProfile: Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().pattern(/^[a-zA-Z0-9_-]{3,30}$/).optional().messages({
      'string.pattern.base': 'Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores'
    }),
    full_name: Joi.string().min(2).max(100).optional(),
    bio: Joi.string().max(500).optional(),
    avatar_url: Joi.string().uri().optional(),
    location: Joi.string().max(100).optional(),
    social_links: Joi.object({
      twitter: Joi.string().uri().optional(),
      linkedin: Joi.string().uri().optional(),
      github: Joi.string().uri().optional(),
      website: Joi.string().uri().optional()
    }).optional(),
    preferences: Joi.object({
      email_notifications: Joi.boolean().optional(),
      push_notifications: Joi.boolean().optional(),
      newsletter: Joi.boolean().optional()
    }).optional()
  }).min(1),

  register: Joi.object({
    address: commonSchemas.address,
    signature: Joi.string().required(),
    message: Joi.string().required(),
    nonce: Joi.string().required(),
    timestamp: Joi.number().required(),
    role: Joi.string().valid('attendee', 'organizer').required(),
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    organizationName: Joi.string().min(2).max(100).optional(),
    organizationDescription: Joi.string().max(500).optional()
  }),

  login: Joi.object({
    address: commonSchemas.address,
    signature: Joi.string().required(),
    message: Joi.string().required(),
    nonce: Joi.string().required(),
    timestamp: Joi.number().required()
  })
};

// Certificate validation schemas
export const certificateSchemas = {
  mintCertificate: Joi.object({
    event_id: commonSchemas.eventId,
    recipient_address: commonSchemas.address
  }),

  getCertificates: Joi.object({
    ...commonSchemas.pagination.describe().keys,
    owner: commonSchemas.address,
    event_id: commonSchemas.eventId,
    tier: Joi.number().integer().min(1).max(3)
  })
};

// Notification validation schemas
export const notificationSchemas = {
  sendNotification: Joi.object({
    recipient: commonSchemas.address.required(),
    type: Joi.string().valid(
      'event_reminder', 'check_in_success', 'peer_validation', 
      'certificate_earned', 'event_update', 'system_update'
    ).required(),
    title: Joi.string().min(1).max(100).required(),
    message: Joi.string().min(1).max(500).required(),
    data: Joi.object(),
    scheduled_for: Joi.date().greater('now')
  }),

  getNotifications: Joi.object({
    ...commonSchemas.pagination.describe().keys,
    type: Joi.string().valid(
      'event_reminder', 'check_in_success', 'peer_validation', 
      'certificate_earned', 'event_update', 'system_update'
    ),
    read: Joi.boolean(),
    since: Joi.date()
  }),

  markAsRead: Joi.object({
    notification_ids: Joi.array().items(Joi.string().uuid()).min(1).required()
  })
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      throw new ValidationError(errorMessage);
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

// File upload validation
export const validateFileUpload = (
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: number = 5 * 1024 * 1024 // 5MB
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new ValidationError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (req.file.size > maxSize) {
      throw new ValidationError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }

    next();
  };
};

// Address validation middleware
export const validateAddress = (addressField: string = 'address') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const address = req.body[addressField] || req.params[addressField] || req.query[addressField];
    
    if (!address) {
      throw new ValidationError(`${addressField} is required`);
    }

    const addressPattern = /^0x[a-fA-F0-9]{64}$/;
    if (!addressPattern.test(address)) {
      throw new ValidationError(`Invalid ${addressField} format`);
    }

    next();
  };
};

// Timestamp validation middleware
export const validateTimestamp = (field: string, required: boolean = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timestamp = req.body[field];
    
    if (!timestamp && required) {
      throw new ValidationError(`${field} is required`);
    }

    if (timestamp) {
      const now = Math.floor(Date.now() / 1000);
      
      if (timestamp <= now) {
        throw new ValidationError(`${field} must be in the future`);
      }
    }

    next();
  };
};
