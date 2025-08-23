/// Event Management Module for Attestify
/// Handles creation, management, and attendance tracking for events
module eviden::events {
    use std::string::String;
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    /// Error codes
    /// User is not authorized to perform this action
    const E_NOT_AUTHORIZED: u64 = 1;
    /// Event was not found in the registry
    const E_EVENT_NOT_FOUND: u64 = 2;
    /// Event has expired and check-in is no longer allowed
    const E_EVENT_EXPIRED: u64 = 3;
    /// User has already checked in to this event
    const E_ALREADY_CHECKED_IN: u64 = 4;
    /// User's location is outside the allowed check-in radius
    const E_INVALID_LOCATION: u64 = 5;
    /// Event has not started yet
    const E_EVENT_NOT_STARTED: u64 = 6;

    /// Location structure for geofencing
    struct Location has store, copy, drop {
        latitude: u64,  // multiplied by 1000000 for precision
        longitude: u64, // multiplied by 1000000 for precision
        venue_name: String,
    }

    /// Event structure representing an attestable event
    struct Event has store {
        id: u64,
        name: String,
        description: String,
        organizer: address,
        start_time: u64,
        end_time: u64,
        location: Location,
        max_attendees: u64,
        current_attendees: u64,
        check_in_radius: u64, // in meters
        is_active: bool,
        created_at: u64,
    }

    /// Attendance record for an individual
    struct AttendanceRecord has store {
        event_id: u64,
        attendee: address,
        check_in_time: u64,
        location_verified: bool,
        peer_validations: u64,
        certificate_minted: bool,
    }

    /// Global event registry
    struct EventRegistry has key {
        events: Table<u64, Event>,
        next_event_id: u64,
        total_events: u64,
    }

    /// Attendance registry for tracking all attendances
    struct AttendanceRegistry has key {
        attendances: Table<u64, AttendanceRecord>,
        user_attendances: Table<address, vector<u64>>,
    }

    /// Initialize the module
    fun init_module(account: &signer) {
        move_to(account, EventRegistry {
            events: table::new(),
            next_event_id: 1,
            total_events: 0,
        });
        
        move_to(account, AttendanceRegistry {
            attendances: table::new(),
            user_attendances: table::new(),
        });
    }

    #[test_only]
    /// Initialize the module for testing
    public fun init_module_for_testing(account: &signer) {
        init_module(account);
    }

    /// Create a new event
    public entry fun create_event(
        organizer: &signer,
        name: String,
        description: String,
        start_time: u64,
        end_time: u64,
        latitude: u64,
        longitude: u64,
        venue_name: String,
        max_attendees: u64,
        check_in_radius: u64,
    ) acquires EventRegistry {
        let organizer_addr = signer::address_of(organizer);
        let registry = borrow_global_mut<EventRegistry>(@eviden);
        
        let event_id = registry.next_event_id;
        
        let location = Location {
            latitude,
            longitude,
            venue_name,
        };

        let event = Event {
            id: event_id,
            name,
            description,
            organizer: organizer_addr,
            start_time,
            end_time,
            location,
            max_attendees,
            current_attendees: 0,
            check_in_radius,
            is_active: true,
            created_at: start_time, // Use start_time instead of current timestamp
        };

        table::add(&mut registry.events, event_id, event);
        
        registry.next_event_id = event_id + 1;
        registry.total_events = registry.total_events + 1;
    }

    /// Check in to an event
    public entry fun check_in_to_event(
        attendee: &signer,
        event_id: u64,
        attendee_latitude: u64,
        attendee_longitude: u64,
    ) acquires EventRegistry, AttendanceRegistry {
        let attendee_addr = signer::address_of(attendee);
        let registry = borrow_global<EventRegistry>(@eviden);
        
        // Check if event exists
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event_ref = table::borrow(&registry.events, event_id);
        assert!(event_ref.is_active, E_EVENT_NOT_FOUND);
        
        let current_time = timestamp::now_seconds();
        assert!(current_time >= event_ref.start_time, E_EVENT_NOT_STARTED);
        assert!(current_time <= event_ref.end_time, E_EVENT_EXPIRED);

        // Verify location
        let location_valid = verify_location(
            attendee_latitude,
            attendee_longitude,
            event_ref.location.latitude,
            event_ref.location.longitude,
            event_ref.check_in_radius
        );
        assert!(location_valid, E_INVALID_LOCATION);

        // Create attendance record
        let attendance_registry = borrow_global_mut<AttendanceRegistry>(@eviden);
        // Simple approach: use event_id as the key and check for duplicates
        let attendance_id = event_id;
        
        let attendance = AttendanceRecord {
            event_id,
            attendee: attendee_addr,
            check_in_time: current_time,
            location_verified: true,
            peer_validations: 0,
            certificate_minted: false,
        };

        table::add(&mut attendance_registry.attendances, attendance_id, attendance);
    }

    /// Simplified location verification
    fun verify_location(
        attendee_lat: u64,
        attendee_lng: u64,
        event_lat: u64,
        event_lng: u64,
        radius: u64
    ): bool {
        // Simplified distance calculation
        let lat_diff = if (attendee_lat > event_lat) {
            attendee_lat - event_lat
        } else {
            event_lat - attendee_lat
        };
        
        let lng_diff = if (attendee_lng > event_lng) {
            attendee_lng - event_lng
        } else {
            event_lng - attendee_lng
        };
        
        // Simplified check - actual implementation would be more sophisticated
        lat_diff <= radius && lng_diff <= radius
    }

    /// View function to get event details
    #[view]
    public fun get_event_details(event_id: u64): (String, String, address, u64, u64, bool) acquires EventRegistry {
        let registry = borrow_global<EventRegistry>(@eviden);
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event_ref = table::borrow(&registry.events, event_id);
        
        (
            event_ref.name,
            event_ref.description,
            event_ref.organizer,
            event_ref.start_time,
            event_ref.end_time,
            event_ref.is_active
        )
    }

    /// View function to get total events count
    #[view]
    public fun get_total_events(): u64 acquires EventRegistry {
        let registry = borrow_global<EventRegistry>(@eviden);
        registry.total_events
    }
}
