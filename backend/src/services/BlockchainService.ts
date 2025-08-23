import { 
  Account, 
  Ed25519PrivateKey, 
  UserTransactionResponse,
  PendingTransactionResponse,
  CommittedTransactionResponse
} from '@aptos-labs/ts-sdk';
import { 
  aptos, 
  CONTRACT_CONFIG, 
  getFullFunctionName, 
  getFullViewFunctionName,
  validateEventData,
  validateLocation,
  formatCoordinatesForBlockchain,
  parseCoordinatesFromBlockchain,
  CERTIFICATE_TIERS,
  CERTIFICATE_REQUIREMENTS,
  getErrorMessage
} from '../config/blockchain';
import { RedisService } from './RedisService';

export interface EventData {
  name: string;
  description: string;
  start_time: number;
  end_time: number;
  venue_name: string;
  venue_address?: string;
  latitude: number;
  longitude: number;
  max_attendees: number;
  check_in_radius: number;
  image_url?: string;
  external_url?: string;
}

export interface CheckInData {
  event_id: string;
  attendee_address: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Certificate {
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
}

export interface EventDetails {
  id: string;
  name: string;
  description: string;
  organizer: string;
  start_time: number;
  end_time: number;
  venue_name: string;
  venue_address?: string;
  latitude: number;
  longitude: number;
  max_attendees: number;
  check_in_radius: number;
  total_attendees: number;
  image_url?: string;
  external_url?: string;
  created_at: number;
}

export class BlockchainService {
  private redis: RedisService;
  private adminAccount?: Account;

  constructor() {
    this.redis = RedisService.getInstance();
    this.initializeAdminAccount();
  }

  private initializeAdminAccount(): void {
    try {
      // This should be loaded from secure environment variable in production
      const privateKeyHex = process.env.ADMIN_PRIVATE_KEY;
      if (privateKeyHex) {
        const privateKey = new Ed25519PrivateKey(privateKeyHex);
        this.adminAccount = Account.fromPrivateKey({ privateKey });
      }
    } catch (error) {
      console.warn('Admin account not configured:', error);
    }
  }

  // ==================== EVENT OPERATIONS ====================

  /**
   * Create a new event on the blockchain
   */
  async createEvent(eventData: EventData, organizerAccount: Account): Promise<string> {
    try {
      // Validate event data
      validateEventData(eventData);

      // Format coordinates for blockchain
      const coords = formatCoordinatesForBlockchain(eventData.latitude, eventData.longitude);

      // Build transaction
      const transaction = await aptos.transaction.build.simple({
        sender: organizerAccount.accountAddress,
        data: {
          function: getFullFunctionName(CONTRACT_CONFIG.FUNCTIONS.CREATE_EVENT),
          functionArguments: [
            eventData.name,
            eventData.description,
            eventData.start_time,
            eventData.end_time,
            eventData.venue_name,
            coords.latitude,
            coords.longitude,
            eventData.max_attendees,
            eventData.check_in_radius,
          ],
        },
      });

      // Sign and submit transaction
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: organizerAccount,
        transaction,
      });

      // Wait for transaction to be processed
      const pendingTxn = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      // Extract event ID from transaction events
      const eventId = this.extractEventIdFromTransaction(pendingTxn);

      // Cache event details
      await this.cacheEventDetails(eventId, eventData, organizerAccount.accountAddress.toString());

      return eventId;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error(`Failed to create event: ${error}`);
    }
  }

  /**
   * Check in to an event
   */
  async checkInToEvent(
    checkInData: CheckInData,
    attendeeAccount: Account
  ): Promise<string> {
    try {
      // Get event details first
      const eventDetails = await this.getEventDetails(checkInData.event_id);
      if (!eventDetails) {
        throw new Error('Event not found');
      }

      // Validate location
      const isWithinRadius = validateLocation(
        checkInData.latitude,
        checkInData.longitude,
        eventDetails.latitude,
        eventDetails.longitude,
        eventDetails.check_in_radius
      );

      if (!isWithinRadius) {
        throw new Error('Location is outside check-in radius');
      }

      // Format coordinates for blockchain
      const coords = formatCoordinatesForBlockchain(checkInData.latitude, checkInData.longitude);

      // Build transaction
      const transaction = await aptos.transaction.build.simple({
        sender: attendeeAccount.accountAddress,
        data: {
          function: getFullFunctionName(CONTRACT_CONFIG.FUNCTIONS.CHECK_IN),
          functionArguments: [
            checkInData.event_id,
            coords.latitude,
            coords.longitude,
          ],
        },
      });

      // Sign and submit transaction
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: attendeeAccount,
        transaction,
      });

      // Wait for transaction to be processed
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      // Cache the check-in
      await this.cacheCheckIn(checkInData);

      return committedTxn.hash;
    } catch (error) {
      console.error('Error checking in to event:', error);
      
      // Parse contract error if possible
      const errorMessage = this.parseContractError(error);
      throw new Error(errorMessage || `Failed to check in: ${error}`);
    }
  }

  /**
   * Validate peer attendance
   */
  async validatePeerAttendance(
    eventId: string,
    attendeeAddress: string,
    validatorAccount: Account
  ): Promise<string> {
    try {
      // Build transaction
      const transaction = await aptos.transaction.build.simple({
        sender: validatorAccount.accountAddress,
        data: {
          function: getFullFunctionName(CONTRACT_CONFIG.FUNCTIONS.VALIDATE_PEER),
          functionArguments: [eventId, attendeeAddress],
        },
      });

      // Sign and submit transaction
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: validatorAccount,
        transaction,
      });

      // Wait for transaction to be processed
      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      // Invalidate cache for peer validation count
      await this.redis.del(`peer_validations:${eventId}:${attendeeAddress}`);

      return committedTxn.hash;
    } catch (error) {
      console.error('Error validating peer attendance:', error);
      
      const errorMessage = this.parseContractError(error);
      throw new Error(errorMessage || `Failed to validate attendance: ${error}`);
    }
  }

  // ==================== CERTIFICATE OPERATIONS ====================

  /**
   * Mint a certificate for an attendee
   */
  async mintCertificate(
    eventId: string,
    recipientAddress: string,
    signerAccount?: Account
  ): Promise<string> {
    try {
      const account = signerAccount || this.adminAccount;
      if (!account) {
        throw new Error('No authorized account available for minting');
      }

      // Check if certificate can be minted
      const canMint = await this.canMintCertificate(eventId, recipientAddress);
      if (!canMint) {
        throw new Error('Certificate cannot be minted - insufficient validations');
      }

      // Build transaction
      const transaction = await aptos.transaction.build.simple({
        sender: account.accountAddress,
        data: {
          function: getFullFunctionName(CONTRACT_CONFIG.FUNCTIONS.MINT_CERTIFICATE),
          functionArguments: [eventId, recipientAddress],
        },
      });

      // Sign and submit transaction
      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: account,
        transaction,
      });

      // Wait for transaction to be processed
      const pendingTxn = await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      // Invalidate certificate cache
      await this.redis.del(`certificates:${recipientAddress}`);
      await this.redis.del(`certificates:event:${eventId}`);

      return committedTxn.hash;
    } catch (error) {
      console.error('Error minting certificate:', error);
      
      const errorMessage = this.parseContractError(error);
      throw new Error(errorMessage || `Failed to mint certificate: ${error}`);
    }
  }

  // ==================== VIEW FUNCTIONS ====================

  /**
   * Get event details by ID
   */
  async getEventDetails(eventId: string): Promise<EventDetails | null> {
    try {
      // Try cache first
      const cacheKey = `event:${eventId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from blockchain
      const response = await aptos.view({
        payload: {
          function: getFullViewFunctionName(CONTRACT_CONFIG.VIEW_FUNCTIONS.GET_EVENT_DETAILS),
          functionArguments: [eventId],
        },
      });

      if (!response || !response[0]) {
        return null;
      }

      const eventData = response[0] as any;
      
      // Parse coordinates from blockchain format
      const coords = parseCoordinatesFromBlockchain(
        parseInt(eventData.latitude),
        parseInt(eventData.longitude)
      );

      const eventDetails: EventDetails = {
        id: eventId,
        name: eventData.name,
        description: eventData.description,
        organizer: eventData.organizer,
        start_time: parseInt(eventData.start_time),
        end_time: parseInt(eventData.end_time),
        venue_name: eventData.venue_name,
        latitude: coords.latitude,
        longitude: coords.longitude,
        max_attendees: parseInt(eventData.max_attendees),
        check_in_radius: parseInt(eventData.check_in_radius),
        total_attendees: parseInt(eventData.total_attendees),
        created_at: parseInt(eventData.created_at),
      };

      // Cache for 1 hour
      await this.redis.setex(cacheKey, 3600, JSON.stringify(eventDetails));

      return eventDetails;
    } catch (error) {
      console.error(`Error getting event details for ${eventId}:`, error);
      return null;
    }
  }

  /**
   * Get total number of events
   */
  async getTotalEvents(): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: getFullViewFunctionName(CONTRACT_CONFIG.VIEW_FUNCTIONS.GET_TOTAL_EVENTS),
          functionArguments: [],
        },
      });

      return parseInt(response[0] as string);
    } catch (error) {
      console.error('Error getting total events:', error);
      return 0;
    }
  }

  /**
   * Check if user is checked in to an event
   */
  async isCheckedIn(eventId: string, userAddress: string): Promise<boolean> {
    try {
      const response = await aptos.view({
        payload: {
          function: getFullViewFunctionName(CONTRACT_CONFIG.VIEW_FUNCTIONS.IS_CHECKED_IN),
          functionArguments: [eventId, userAddress],
        },
      });

      return response[0] as boolean;
    } catch (error) {
      console.error(`Error checking attendance for ${userAddress} in event ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Get peer validation count for a user in an event
   */
  async getPeerValidationCount(eventId: string, userAddress: string): Promise<number> {
    try {
      const cacheKey = `peer_validations:${eventId}:${userAddress}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return parseInt(cached);
      }

      const response = await aptos.view({
        payload: {
          function: getFullViewFunctionName(CONTRACT_CONFIG.VIEW_FUNCTIONS.GET_PEER_VALIDATION_COUNT),
          functionArguments: [eventId, userAddress],
        },
      });

      const count = parseInt(response[0] as string);
      
      // Cache for 5 minutes
      await this.redis.setex(cacheKey, 300, count.toString());

      return count;
    } catch (error) {
      console.error(`Error getting peer validation count for ${userAddress} in event ${eventId}:`, error);
      return 0;
    }
  }

  /**
   * Get user certificates
   */
  async getUserCertificates(userAddress: string): Promise<Certificate[]> {
    try {
      const cacheKey = `certificates:${userAddress}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await aptos.view({
        payload: {
          function: getFullViewFunctionName(CONTRACT_CONFIG.VIEW_FUNCTIONS.GET_USER_CERTIFICATES),
          functionArguments: [userAddress],
        },
      });

      const certificates: Certificate[] = (response[0] as any[]).map((cert: any) => ({
        id: cert.id,
        event_id: cert.event_id,
        owner: cert.owner,
        tier: cert.tier,
        tier_name: CERTIFICATE_TIERS[cert.tier as keyof typeof CERTIFICATE_TIERS],
        metadata: {
          event_name: cert.metadata.event_name,
          venue_name: cert.metadata.venue_name,
          issued_at: parseInt(cert.metadata.issued_at),
          validations_received: parseInt(cert.metadata.validations_received),
        },
      }));

      // Cache for 30 minutes
      await this.redis.setex(cacheKey, 1800, JSON.stringify(certificates));

      return certificates;
    } catch (error) {
      console.error(`Error getting certificates for ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Check if a certificate can be minted
   */
  async canMintCertificate(eventId: string, userAddress: string): Promise<boolean> {
    try {
      const response = await aptos.view({
        payload: {
          function: getFullViewFunctionName(CONTRACT_CONFIG.VIEW_FUNCTIONS.CAN_MINT_CERTIFICATE),
          functionArguments: [eventId, userAddress],
        },
      });

      return response[0] as boolean;
    } catch (error) {
      console.error(`Error checking certificate eligibility for ${userAddress} in event ${eventId}:`, error);
      return false;
    }
  }

  /**
   * Get earned certificate tier
   */
  async getEarnedCertificateTier(eventId: string, userAddress: string): Promise<number> {
    try {
      const response = await aptos.view({
        payload: {
          function: getFullViewFunctionName(CONTRACT_CONFIG.VIEW_FUNCTIONS.GET_EARNED_CERTIFICATE_TIER),
          functionArguments: [eventId, userAddress],
        },
      });

      return parseInt(response[0] as string);
    } catch (error) {
      console.error(`Error getting certificate tier for ${userAddress} in event ${eventId}:`, error);
      return 0;
    }
  }

  // ==================== HELPER METHODS ====================

  private extractEventIdFromTransaction(transaction: any): string {
    // Look for event creation in transaction events
    if (transaction.events) {
      for (const event of transaction.events) {
        if (event.type.includes('EventCreated')) {
          return event.data.event_id;
        }
      }
    }
    
    // Fallback: extract from transaction hash or version
    return transaction.version || transaction.hash;
  }

  private async cacheEventDetails(
    eventId: string,
    eventData: EventData,
    organizer: string
  ): Promise<void> {
    const cacheKey = `event:${eventId}`;
    const details: EventDetails = {
      id: eventId,
      name: eventData.name,
      description: eventData.description,
      organizer,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      venue_name: eventData.venue_name,
      venue_address: eventData.venue_address,
      latitude: eventData.latitude,
      longitude: eventData.longitude,
      max_attendees: eventData.max_attendees,
      check_in_radius: eventData.check_in_radius,
      total_attendees: 0,
      image_url: eventData.image_url,
      external_url: eventData.external_url,
      created_at: Math.floor(Date.now() / 1000),
    };

    await this.redis.setex(cacheKey, 3600, JSON.stringify(details));
  }

  private async cacheCheckIn(checkInData: CheckInData): Promise<void> {
    const cacheKey = `checkin:${checkInData.event_id}:${checkInData.attendee_address}`;
    await this.redis.setex(cacheKey, 3600, JSON.stringify(checkInData));
  }

  private parseContractError(error: any): string | null {
    if (error.message && typeof error.message === 'string') {
      // Extract error code from contract error messages
      const errorCodeMatch = error.message.match(/error code[:\s]+(\d+)/i);
      if (errorCodeMatch) {
        const errorCode = parseInt(errorCodeMatch[1]);
        return getErrorMessage(errorCode);
      }
    }
    return null;
  }

  // ==================== ADMIN FUNCTIONS ====================

  /**
   * Initialize certificate registry (admin only)
   */
  async initializeCertificateRegistry(): Promise<string> {
    try {
      if (!this.adminAccount) {
        throw new Error('Admin account not configured');
      }

      const transaction = await aptos.transaction.build.simple({
        sender: this.adminAccount.accountAddress,
        data: {
          function: getFullFunctionName(CONTRACT_CONFIG.FUNCTIONS.INITIALIZE_CERT_REGISTRY),
          functionArguments: [],
        },
      });

      const committedTxn = await aptos.signAndSubmitTransaction({
        signer: this.adminAccount,
        transaction,
      });

      await aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      return committedTxn.hash;
    } catch (error) {
      console.error('Error initializing certificate registry:', error);
      throw new Error(`Failed to initialize certificate registry: ${error}`);
    }
  }

  /**
   * Health check for blockchain connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await aptos.getLedgerInfo();
      return true;
    } catch (error) {
      console.error('Blockchain health check failed:', error);
      return false;
    }
  }
}
