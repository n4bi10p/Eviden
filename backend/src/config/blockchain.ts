import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import config from './index';

// Initialize Aptos client
export const aptosConfig = new AptosConfig({ 
  network: config.APTOS_NETWORK as Network,
  fullnode: config.APTOS_RPC_URL,
});

export const aptos = new Aptos(aptosConfig);

// Smart contract configuration
export const CONTRACT_CONFIG = {
  MODULE_ADDRESS: config.CONTRACT_ADDRESS,
  MODULE_NAME: 'events_v3',
  
  // Entry function names
  FUNCTIONS: {
    CREATE_EVENT: 'create_event',
    CHECK_IN: 'check_in_to_event', 
    VALIDATE_PEER: 'validate_peer_attendance',
    MINT_CERTIFICATE: 'mint_certificate',
    INITIALIZE_CERT_REGISTRY: 'initialize_certificate_registry',
  },
  
  // View function names
  VIEW_FUNCTIONS: {
    GET_EVENT_DETAILS: 'get_event_details',
    GET_TOTAL_EVENTS: 'get_total_events',
    GET_EVENT_ATTENDEES: 'get_event_attendees',
    GET_PEER_VALIDATION_COUNT: 'get_peer_validation_count',
    GET_PEER_VALIDATORS: 'get_peer_validators',
    IS_CHECKED_IN: 'is_checked_in',
    GET_USER_CERTIFICATES: 'get_user_certificates',
    GET_CERTIFICATE_DETAILS: 'get_certificate_details',
    GET_TOTAL_CERTIFICATES: 'get_total_certificates',
    GET_EVENT_CERTIFICATES: 'get_event_certificates',
    CAN_MINT_CERTIFICATE: 'can_mint_certificate',
    GET_EARNED_CERTIFICATE_TIER: 'get_earned_certificate_tier',
  }
};

// Helper function to get full function name
export const getFullFunctionName = (functionName: string) => {
  return `${CONTRACT_CONFIG.MODULE_ADDRESS}::${CONTRACT_CONFIG.MODULE_NAME}::${functionName}` as const;
};

// Helper function to get full view function name
export const getFullViewFunctionName = (functionName: string) => {
  return `${CONTRACT_CONFIG.MODULE_ADDRESS}::${CONTRACT_CONFIG.MODULE_NAME}::${functionName}` as const;
};

// Certificate tier mapping
export const CERTIFICATE_TIERS = {
  1: 'Bronze',
  2: 'Silver', 
  3: 'Gold',
} as const;

// Certificate tier requirements
export const CERTIFICATE_REQUIREMENTS = {
  BRONZE: 1,
  SILVER: 3,
  GOLD: 5,
} as const;

// Event validation helpers
export const validateEventData = (eventData: any) => {
  const requiredFields = [
    'name', 'description', 'start_time', 'end_time',
    'latitude', 'longitude', 'venue_name', 'max_attendees', 'check_in_radius'
  ];
  
  for (const field of requiredFields) {
    if (!eventData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Validate timestamp
  const now = Math.floor(Date.now() / 1000);
  if (eventData.start_time <= now) {
    throw new Error('Event start time must be in the future');
  }
  
  if (eventData.end_time <= eventData.start_time) {
    throw new Error('Event end time must be after start time');
  }
  
  // Validate coordinates
  if (eventData.latitude < -90 || eventData.latitude > 90) {
    throw new Error('Invalid latitude');
  }
  
  if (eventData.longitude < -180 || eventData.longitude > 180) {
    throw new Error('Invalid longitude');
  }
  
  // Validate numeric fields
  if (eventData.max_attendees <= 0) {
    throw new Error('Max attendees must be positive');
  }
  
  if (eventData.check_in_radius <= 0) {
    throw new Error('Check-in radius must be positive');
  }
};

// Location validation helpers
export const validateLocation = (
  attendeeLat: number,
  attendeeLng: number,
  eventLat: number,
  eventLng: number,
  radius: number
): boolean => {
  // Convert to radians
  const lat1Rad = (attendeeLat * Math.PI) / 180;
  const lat2Rad = (eventLat * Math.PI) / 180;
  const deltaLatRad = ((eventLat - attendeeLat) * Math.PI) / 180;
  const deltaLngRad = ((eventLng - attendeeLng) * Math.PI) / 180;

  // Haversine formula
  const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371000 * c; // Earth's radius in meters

  return distance <= radius;
};

// Format coordinates for blockchain (multiply by 1,000,000)
export const formatCoordinatesForBlockchain = (lat: number, lng: number) => {
  return {
    latitude: Math.round(lat * 1000000),
    longitude: Math.round(lng * 1000000),
  };
};

// Parse coordinates from blockchain (divide by 1,000,000)
export const parseCoordinatesFromBlockchain = (lat: number, lng: number) => {
  return {
    latitude: lat / 1000000,
    longitude: lng / 1000000,
  };
};

// Transaction status helpers
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type TransactionStatus = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];

// Error codes mapping
export const CONTRACT_ERRORS = {
  1: 'User is not authorized to perform this action',
  2: 'Event was not found in the registry', 
  3: 'Event has expired and check-in is no longer allowed',
  4: 'User has already checked in to this event',
  5: 'User location is outside the allowed check-in radius',
  6: 'Event has not started yet',
  7: 'Event has reached maximum capacity',
  8: 'Cannot validate your own attendance',
  9: 'Attendee not checked in to this event',
  10: 'Already validated this attendee',
  11: 'Certificate not yet earned',
  12: 'Certificate already minted',
} as const;

export const getErrorMessage = (errorCode: number): string => {
  return CONTRACT_ERRORS[errorCode as keyof typeof CONTRACT_ERRORS] || 'Unknown error';
};
