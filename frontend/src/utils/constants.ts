// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORK: import.meta.env.VITE_APTOS_NETWORK || 'testnet',
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  EXPLORER_URL: 'https://explorer.aptoslabs.com',
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Eviden',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Blockchain Event Verification',
};

// Feature Flags
export const FEATURES = {
  PWA_ENABLED: import.meta.env.VITE_ENABLE_PWA === 'true',
  NOTIFICATIONS_ENABLED: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  ANALYTICS_ENABLED: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
};

// Event Categories
export const EVENT_CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Entertainment',
  'Health & Wellness',
  'Sports',
  'Art & Culture',
  'Networking',
  'Community',
  'Other'
] as const;

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// User Roles
export const USER_ROLES = {
  ATTENDEE: 'attendee',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
} as const;

// Certificate Status
export const CERTIFICATE_STATUS = {
  PENDING: 'pending',
  MINTED: 'minted',
  VERIFIED: 'verified',
  REVOKED: 'revoked',
} as const;

// QR Code Security Levels
export const QR_SECURITY_LEVELS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  HIGH: 'high',
  MAXIMUM: 'maximum',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  EVENT_REMINDER: 'event_reminder',
  CERTIFICATE_EARNED: 'certificate_earned',
  PEER_VALIDATION: 'peer_validation',
  EVENT_UPDATE: 'event_update',
  SYSTEM_UPDATE: 'system_update',
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
  MAX_FILES: 5,
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 37.7749, lng: -122.4194 }, // San Francisco
  DEFAULT_ZOOM: 12,
  MAX_DISTANCE_KM: 1, // Maximum distance for event check-in
};

// Time Zones
export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  EVENT_TITLE_MIN_LENGTH: 3,
  EVENT_TITLE_MAX_LENGTH: 100,
  EVENT_DESCRIPTION_MAX_LENGTH: 2000,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};

// Theme Colors
export const THEME_COLORS = {
  LIGHT: {
    PRIMARY: 'rgb(59 130 246)', // blue-500
    SECONDARY: 'rgb(139 92 246)', // violet-500
    SUCCESS: 'rgb(34 197 94)', // green-500
    WARNING: 'rgb(245 158 11)', // amber-500
    ERROR: 'rgb(239 68 68)', // red-500
  },
  DARK: {
    PRIMARY: 'rgb(96 165 250)', // blue-400
    SECONDARY: 'rgb(167 139 250)', // violet-400
    SUCCESS: 'rgb(74 222 128)', // green-400
    WARNING: 'rgb(251 191 36)', // amber-400
    ERROR: 'rgb(248 113 113)', // red-400
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'eviden_auth_token',
  USER_DATA: 'eviden_user_data',
  THEME_PREFERENCE: 'eviden_theme',
  NOTIFICATION_SETTINGS: 'eviden_notifications',
  ONBOARDING_COMPLETED: 'eviden_onboarding',
  RECENT_SEARCHES: 'eviden_recent_searches',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first.',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  INVALID_QR_CODE: 'Invalid QR code format.',
  LOCATION_PERMISSION_DENIED: 'Location permission denied.',
  CAMERA_PERMISSION_DENIED: 'Camera permission denied.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  FORM_VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully!',
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  CHECK_IN_SUCCESS: 'Successfully checked in to the event!',
  CERTIFICATE_MINTED: 'Certificate minted successfully!',
  NOTIFICATION_SENT: 'Notification sent successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
} as const;
