import { Router, Request, Response } from 'express';
import { authenticateToken, requireOrganizer, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { eventSchemas } from '../middleware/validation';
import { generalRateLimit, checkInRateLimit, peerValidationRateLimit } from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError, AuthorizationError, BlockchainError } from '../middleware/errorHandler';
import { BlockchainService } from '../services/BlockchainService';

const router = Router();
const blockchainService = new BlockchainService();

// Mock event storage (replace with database in production)
interface Event {
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
  image_url?: string;
  external_url?: string;
  created_at: number;
  is_active: boolean;
  tags?: string[];
}

const events: Map<string, Event> = new Map();
const attendees: Map<string, Set<string>> = new Map(); // eventId -> Set of user addresses
const checkIns: Map<string, Map<string, { timestamp: number; latitude: number; longitude: number }>> = new Map();

/**
 * @route POST /api/events
 * @desc Create a new event
 * @access Private (Organizers only)
 */
router.post('/',
  authenticateToken,
  requireOrganizer,
  validate(eventSchemas.createEvent),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const eventData = req.body;

    try {
      // Create event ID
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store event locally
      const event: Event = {
        id: eventId,
        ...eventData,
        organizer: user.address,
        created_at: Math.floor(Date.now() / 1000),
        is_active: true
      };

      events.set(eventId, event);
      attendees.set(eventId, new Set());
      checkIns.set(eventId, new Map());

      // Note: In production, you would create the event on blockchain here
      // const txHash = await blockchainService.createEvent(eventData, organizerAccount);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: {
          event,
          blockchain_tx: 'simulated_tx_hash' // In production: txHash
        }
      });

    } catch (error) {
      throw new BlockchainError(`Failed to create event: ${error}`);
    }
  })
);

/**
 * @route GET /api/events
 * @desc Get all events with pagination and filtering
 * @access Public
 */
router.get('/',
  optionalAuth,
  validate(eventSchemas.getEvents, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      organizer,
      start_date,
      end_date,
      near_location
    } = req.query as any;

    let filteredEvents = Array.from(events.values());

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.venue_name.toLowerCase().includes(searchLower)
      );
    }

    if (organizer) {
      filteredEvents = filteredEvents.filter(event => event.organizer === organizer);
    }

    if (status) {
      const now = Math.floor(Date.now() / 1000);
      filteredEvents = filteredEvents.filter(event => {
        switch (status) {
          case 'upcoming':
            return event.start_time > now;
          case 'ongoing':
            return event.start_time <= now && event.end_time > now;
          case 'completed':
            return event.end_time <= now;
          default:
            return true;
        }
      });
    }

    if (start_date) {
      filteredEvents = filteredEvents.filter(event => event.start_time >= parseInt(start_date));
    }

    if (end_date) {
      filteredEvents = filteredEvents.filter(event => event.end_time <= parseInt(end_date));
    }

    // Calculate pagination
    const total = filteredEvents.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    // Add attendee counts
    const eventsWithCounts = paginatedEvents.map(event => ({
      ...event,
      attendee_count: attendees.get(event.id)?.size || 0,
      checked_in_count: checkIns.get(event.id)?.size || 0
    }));

    res.json({
      success: true,
      data: {
        events: eventsWithCounts,
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
 * @route GET /api/events/:id
 * @desc Get event details by ID
 * @access Public
 */
router.get('/:id',
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = events.get(id);

    if (!event) {
      throw new NotFoundError('Event');
    }

    const eventAttendees = attendees.get(id) || new Set();
    const eventCheckIns = checkIns.get(id) || new Map();

    const eventDetails = {
      ...event,
      attendee_count: eventAttendees.size,
      checked_in_count: eventCheckIns.size,
      user_checked_in: req.user ? eventCheckIns.has(req.user.address) : false,
      attendees: Array.from(eventAttendees),
    };

    res.json({
      success: true,
      data: { event: eventDetails }
    });
  })
);

/**
 * @route PUT /api/events/:id
 * @desc Update event details
 * @access Private (Event organizer only)
 */
router.put('/:id',
  authenticateToken,
  validate(eventSchemas.updateEvent),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user!;
    const event = events.get(id);

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.organizer !== user.address) {
      throw new AuthorizationError('Only event organizer can update this event');
    }

    // Update event
    const updatedEvent = { ...event, ...req.body };
    events.set(id, updatedEvent);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent }
    });
  })
);

/**
 * @route POST /api/events/:id/checkin
 * @desc Check in to an event
 * @access Private
 */
router.post('/:id/checkin',
  authenticateToken,
  checkInRateLimit.middleware,
  validate(eventSchemas.checkIn),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user!;
    const { latitude, longitude, device_info } = req.body;

    const event = events.get(id);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check if event is active and within time window
    const now = Math.floor(Date.now() / 1000);
    if (now < event.start_time) {
      throw new ValidationError('Event has not started yet');
    }
    if (now > event.end_time) {
      throw new ValidationError('Event has already ended');
    }

    // Check if user already checked in
    const eventCheckIns = checkIns.get(id) || new Map();
    if (eventCheckIns.has(user.address)) {
      throw new ValidationError('You have already checked in to this event');
    }

    // Validate location (simple distance check)
    const distance = calculateDistance(
      latitude, longitude,
      event.latitude, event.longitude
    );

    if (distance > event.check_in_radius) {
      throw new ValidationError(`You must be within ${event.check_in_radius}m of the event location to check in`);
    }

    // Perform check-in
    eventCheckIns.set(user.address, {
      timestamp: now,
      latitude,
      longitude
    });
    checkIns.set(id, eventCheckIns);

    // Add to attendees if not already added
    const eventAttendees = attendees.get(id) || new Set();
    eventAttendees.add(user.address);
    attendees.set(id, eventAttendees);

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: {
        event_id: id,
        user_address: user.address,
        check_in_time: now,
        location: { latitude, longitude }
      }
    });
  })
);

/**
 * @route POST /api/events/:id/validate/:attendee
 * @desc Validate peer attendance
 * @access Private
 */
router.post('/:id/validate/:attendee',
  authenticateToken,
  peerValidationRateLimit.middleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id, attendee } = req.params;
    const validator = req.user!;

    const event = events.get(id);
    if (!event) {
      throw new NotFoundError('Event');
    }

    // Check if validator is checked in
    const eventCheckIns = checkIns.get(id) || new Map();
    if (!eventCheckIns.has(validator.address)) {
      throw new ValidationError('You must be checked in to validate others');
    }

    // Check if attendee is checked in
    if (!eventCheckIns.has(attendee)) {
      throw new ValidationError('Attendee is not checked in to this event');
    }

    // Cannot validate yourself
    if (validator.address === attendee) {
      throw new ValidationError('Cannot validate your own attendance');
    }

    // Mock validation storage (in production, use blockchain)
    const validationKey = `${id}_${attendee}_${validator.address}`;
    
    res.json({
      success: true,
      message: 'Peer validation recorded successfully',
      data: {
        event_id: id,
        attendee_address: attendee,
        validator_address: validator.address,
        validation_time: Math.floor(Date.now() / 1000)
      }
    });
  })
);

/**
 * @route GET /api/events/:id/attendees
 * @desc Get event attendees
 * @access Private (Event organizer only)
 */
router.get('/:id/attendees',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user!;
    const event = events.get(id);

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.organizer !== user.address) {
      throw new AuthorizationError('Only event organizer can view attendees');
    }

    const eventAttendees = attendees.get(id) || new Set();
    const eventCheckIns = checkIns.get(id) || new Map();

    const attendeeList = Array.from(eventAttendees).map(address => ({
      address,
      checked_in: eventCheckIns.has(address),
      check_in_time: eventCheckIns.get(address)?.timestamp,
      check_in_location: eventCheckIns.get(address) ? {
        latitude: eventCheckIns.get(address)!.latitude,
        longitude: eventCheckIns.get(address)!.longitude
      } : null
    }));

    res.json({
      success: true,
      data: {
        event_id: id,
        attendees: attendeeList,
        total_attendees: attendeeList.length,
        checked_in_count: attendeeList.filter(a => a.checked_in).length
      }
    });
  })
);

/**
 * @route DELETE /api/events/:id
 * @desc Delete/deactivate an event
 * @access Private (Event organizer only)
 */
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user!;
    const event = events.get(id);

    if (!event) {
      throw new NotFoundError('Event');
    }

    if (event.organizer !== user.address) {
      throw new AuthorizationError('Only event organizer can delete this event');
    }

    // Soft delete - mark as inactive
    event.is_active = false;
    events.set(id, event);

    res.json({
      success: true,
      message: 'Event deactivated successfully'
    });
  })
);

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;
