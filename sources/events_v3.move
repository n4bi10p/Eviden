/// Event Management Module for Attestify v2
/// Handles creation, management, and attendance tracking for events with peer validation
module eviden::events_v3 {
    use std::string::{Self, String};
    use std::vector;
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
    /// Event has reached maximum capacity
    const E_EVENT_FULL: u64 = 7;
    /// Cannot validate your own attendance
    const E_CANNOT_SELF_VALIDATE: u64 = 8;
    /// Attendee not checked in to this event
    const E_ATTENDEE_NOT_FOUND: u64 = 9;
    /// Already validated this attendee
    const E_ALREADY_VALIDATED: u64 = 10;
    /// Certificate not yet earned
    const E_CERTIFICATE_NOT_EARNED: u64 = 11;
    /// Certificate already minted
    const E_CERTIFICATE_ALREADY_MINTED: u64 = 12;

    /// Certificate tier levels
    const CERTIFICATE_BRONZE: u8 = 1;
    const CERTIFICATE_SILVER: u8 = 2;
    const CERTIFICATE_GOLD: u8 = 3;
    
    /// Minimum validations required for each tier
    const BRONZE_MIN_VALIDATIONS: u64 = 1;
    const SILVER_MIN_VALIDATIONS: u64 = 3;
    const GOLD_MIN_VALIDATIONS: u64 = 5;

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
        // Track who validated whom: (event_id, attendee) -> vector of validators
        peer_validations: Table<u64, Table<address, vector<address>>>,
        // Track attendance IDs by event and attendee for easier lookup
        event_attendee_to_id: Table<u64, Table<address, u64>>,
        // Track attendees by event for easier listing
        event_attendees: Table<u64, vector<address>>,
        next_attendance_id: u64,
    }

    /// Digital certificate for event attendance
    struct Certificate has store {
        certificate_id: u64,
        event_id: u64,
        attendee: address,
        event_name: String,
        validation_score: u64,
        certificate_tier: u8, // Bronze(1), Silver(2), Gold(3)
        issued_at: u64,
        metadata_uri: String,
    }

    /// Certificate registry for tracking all certificates
    struct CertificateRegistry has key {
        certificates: Table<u64, Certificate>,
        user_certificates: Table<address, vector<u64>>,
        event_certificates: Table<u64, vector<u64>>,
        next_certificate_id: u64,
        total_certificates: u64,
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
            peer_validations: table::new(),
            event_attendee_to_id: table::new(),
            event_attendees: table::new(),
            next_attendance_id: 1,
        });

        move_to(account, CertificateRegistry {
            certificates: table::new(),
            user_certificates: table::new(),
            event_certificates: table::new(),
            next_certificate_id: 1,
            total_certificates: 0,
        });
    }

    #[test_only]
    /// Initialize the module for testing
    public fun init_module_for_testing(account: &signer) {
        init_module(account);
    }

    /// Upgrade function to initialize certificate registry for existing deployments
    public entry fun initialize_certificate_registry(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @eviden, E_NOT_AUTHORIZED);
        
        // Only initialize if it doesn't exist
        if (!exists<CertificateRegistry>(@eviden)) {
            move_to(admin, CertificateRegistry {
                certificates: table::new(),
                user_certificates: table::new(),
                event_certificates: table::new(),
                next_certificate_id: 1,
                total_certificates: 0,
            });
        };
    }

    #[test_only]
    /// Create a new event for testing (without timestamp validation)
    public fun create_event_for_testing(
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
            created_at: start_time, // Use start_time for testing
        };

        table::add(&mut registry.events, event_id, event);
        
        registry.next_event_id = event_id + 1;
        registry.total_events = registry.total_events + 1;
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
        let registry = borrow_global_mut<EventRegistry>(@eviden);
        
        // Check if event exists
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event_ref = table::borrow_mut(&mut registry.events, event_id);
        assert!(event_ref.is_active, E_EVENT_NOT_FOUND);
        
        let current_time = timestamp::now_seconds();
        assert!(current_time >= event_ref.start_time, E_EVENT_NOT_STARTED);
        assert!(current_time <= event_ref.end_time, E_EVENT_EXPIRED);

        // Check if event is full
        assert!(event_ref.current_attendees < event_ref.max_attendees, E_EVENT_FULL);

        // Verify location
        let location_valid = verify_location(
            attendee_latitude,
            attendee_longitude,
            event_ref.location.latitude,
            event_ref.location.longitude,
            event_ref.check_in_radius
        );
        assert!(location_valid, E_INVALID_LOCATION);

        // Check for duplicate check-in
        let attendance_registry = borrow_global_mut<AttendanceRegistry>(@eviden);
        
        // Initialize user attendance list if doesn't exist
        if (!table::contains(&attendance_registry.user_attendances, attendee_addr)) {
            table::add(&mut attendance_registry.user_attendances, attendee_addr, vector::empty());
        };
        
        let user_events = table::borrow(&attendance_registry.user_attendances, attendee_addr);
        let i = 0;
        let len = vector::length(user_events);
        while (i < len) {
            let existing_event_id = *vector::borrow(user_events, i);
            assert!(existing_event_id != event_id, E_ALREADY_CHECKED_IN);
            i = i + 1;
        };

        // Create unique attendance ID
        let attendance_id = attendance_registry.next_attendance_id;
        attendance_registry.next_attendance_id = attendance_id + 1;
        
        let attendance = AttendanceRecord {
            event_id,
            attendee: attendee_addr,
            check_in_time: current_time,
            location_verified: true,
            peer_validations: 0,
            certificate_minted: false,
        };

        table::add(&mut attendance_registry.attendances, attendance_id, attendance);
        
        // Track the attendance ID for this event and attendee
        if (!table::contains(&attendance_registry.event_attendee_to_id, event_id)) {
            table::add(&mut attendance_registry.event_attendee_to_id, event_id, table::new());
        };
        let event_attendees = table::borrow_mut(&mut attendance_registry.event_attendee_to_id, event_id);
        table::add(event_attendees, attendee_addr, attendance_id);
        
        // Add to event attendees list
        if (!table::contains(&attendance_registry.event_attendees, event_id)) {
            table::add(&mut attendance_registry.event_attendees, event_id, vector::empty());
        };
        let attendees_list = table::borrow_mut(&mut attendance_registry.event_attendees, event_id);
        vector::push_back(attendees_list, attendee_addr);
        
        // Update user's attendance list
        let user_events_mut = table::borrow_mut(&mut attendance_registry.user_attendances, attendee_addr);
        vector::push_back(user_events_mut, event_id);
        
        // Increment current attendees
        event_ref.current_attendees = event_ref.current_attendees + 1;

        // Initialize peer validation table for this event if needed
        if (!table::contains(&attendance_registry.peer_validations, event_id)) {
            table::add(&mut attendance_registry.peer_validations, event_id, table::new());
        };
        
        // Initialize peer validation list for this attendee
        let event_validations = table::borrow_mut(&mut attendance_registry.peer_validations, event_id);
        if (!table::contains(event_validations, attendee_addr)) {
            table::add(event_validations, attendee_addr, vector::empty());
        };
    }

    #[test_only]
    /// Check in to an event for testing (without timestamp validation)
    public fun check_in_to_event_for_testing(
        attendee: &signer,
        event_id: u64,
        attendee_latitude: u64,
        attendee_longitude: u64,
    ) acquires EventRegistry, AttendanceRegistry {
        let attendee_addr = signer::address_of(attendee);
        let registry = borrow_global_mut<EventRegistry>(@eviden);
        
        // Check if event exists
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event_ref = table::borrow_mut(&mut registry.events, event_id);
        assert!(event_ref.is_active, E_EVENT_NOT_FOUND);

        // Check if event is full
        assert!(event_ref.current_attendees < event_ref.max_attendees, E_EVENT_FULL);

        // Verify location
        let location_valid = verify_location(
            attendee_latitude,
            attendee_longitude,
            event_ref.location.latitude,
            event_ref.location.longitude,
            event_ref.check_in_radius
        );
        assert!(location_valid, E_INVALID_LOCATION);

        // Check for duplicate check-in
        let attendance_registry = borrow_global_mut<AttendanceRegistry>(@eviden);
        
        // Initialize user attendance list if doesn't exist
        if (!table::contains(&attendance_registry.user_attendances, attendee_addr)) {
            table::add(&mut attendance_registry.user_attendances, attendee_addr, vector::empty());
        };
        
        let user_events = table::borrow(&attendance_registry.user_attendances, attendee_addr);
        let i = 0;
        let len = vector::length(user_events);
        while (i < len) {
            let existing_event_id = *vector::borrow(user_events, i);
            assert!(existing_event_id != event_id, E_ALREADY_CHECKED_IN);
            i = i + 1;
        };

        // Create unique attendance ID
        let attendance_id = attendance_registry.next_attendance_id;
        attendance_registry.next_attendance_id = attendance_id + 1;
        
        let attendance = AttendanceRecord {
            event_id,
            attendee: attendee_addr,
            check_in_time: 1700000000, // Fixed time for testing
            location_verified: true,
            peer_validations: 0,
            certificate_minted: false,
        };

        table::add(&mut attendance_registry.attendances, attendance_id, attendance);
        
        // Track the attendance ID for this event and attendee
        if (!table::contains(&attendance_registry.event_attendee_to_id, event_id)) {
            table::add(&mut attendance_registry.event_attendee_to_id, event_id, table::new());
        };
        let event_attendees_map = table::borrow_mut(&mut attendance_registry.event_attendee_to_id, event_id);
        table::add(event_attendees_map, attendee_addr, attendance_id);
        
        // Add to event attendees list
        if (!table::contains(&attendance_registry.event_attendees, event_id)) {
            table::add(&mut attendance_registry.event_attendees, event_id, vector::empty());
        };
        let attendees_list = table::borrow_mut(&mut attendance_registry.event_attendees, event_id);
        vector::push_back(attendees_list, attendee_addr);
        
        // Update user's attendance list
        let user_events_mut = table::borrow_mut(&mut attendance_registry.user_attendances, attendee_addr);
        vector::push_back(user_events_mut, event_id);
        
        // Increment current attendees
        event_ref.current_attendees = event_ref.current_attendees + 1;

        // Initialize peer validation table for this event if needed
        if (!table::contains(&attendance_registry.peer_validations, event_id)) {
            table::add(&mut attendance_registry.peer_validations, event_id, table::new());
        };
        
        // Initialize peer validation list for this attendee
        let event_validations = table::borrow_mut(&mut attendance_registry.peer_validations, event_id);
        if (!table::contains(event_validations, attendee_addr)) {
            table::add(event_validations, attendee_addr, vector::empty());
        };
    }

    /// Validate another attendee's presence at an event
    public entry fun validate_peer_attendance(
        validator: &signer,
        event_id: u64,
        attendee_to_validate: address,
    ) acquires EventRegistry, AttendanceRegistry {
        let validator_addr = signer::address_of(validator);
        
        // Ensure validator is not trying to validate themselves
        assert!(validator_addr != attendee_to_validate, E_CANNOT_SELF_VALIDATE);
        
        // Check if event exists and is active
        let registry = borrow_global<EventRegistry>(@eviden);
        assert!(table::contains(&registry.events, event_id), E_EVENT_NOT_FOUND);
        let event_ref = table::borrow(&registry.events, event_id);
        assert!(event_ref.is_active, E_EVENT_NOT_FOUND);
        
        let attendance_registry = borrow_global_mut<AttendanceRegistry>(@eviden);
        
        // Verify both validator and attendee are checked in to this event
        assert!(table::contains(&attendance_registry.user_attendances, validator_addr), E_ATTENDEE_NOT_FOUND);
        assert!(table::contains(&attendance_registry.user_attendances, attendee_to_validate), E_ATTENDEE_NOT_FOUND);
        
        let validator_events = table::borrow(&attendance_registry.user_attendances, validator_addr);
        let attendee_events = table::borrow(&attendance_registry.user_attendances, attendee_to_validate);
        
        // Check if both are attending this event
        assert!(vector::contains(validator_events, &event_id), E_ATTENDEE_NOT_FOUND);
        assert!(vector::contains(attendee_events, &event_id), E_ATTENDEE_NOT_FOUND);
        
        // Get or create validation table for this event
        if (!table::contains(&attendance_registry.peer_validations, event_id)) {
            table::add(&mut attendance_registry.peer_validations, event_id, table::new());
        };
        
        let event_validations = table::borrow_mut(&mut attendance_registry.peer_validations, event_id);
        
        // Get or create validation list for the attendee
        if (!table::contains(event_validations, attendee_to_validate)) {
            table::add(event_validations, attendee_to_validate, vector::empty());
        };
        
        let attendee_validators = table::borrow_mut(event_validations, attendee_to_validate);
        
        // Check if validator has already validated this attendee
        assert!(!vector::contains(attendee_validators, &validator_addr), E_ALREADY_VALIDATED);
        
        // Add validator to the list
        vector::push_back(attendee_validators, validator_addr);
        
        // Update the attendee's peer validation count in their attendance record
        update_peer_validation_count(event_id, attendee_to_validate, &mut attendance_registry.attendances, &attendance_registry.event_attendee_to_id);
    }

    /// Helper function to update peer validation count in attendance record
    fun update_peer_validation_count(
        event_id: u64,
        attendee: address,
        attendances: &mut Table<u64, AttendanceRecord>,
        event_attendee_to_id: &Table<u64, Table<address, u64>>
    ) {
        // Use the lookup table to find the attendance record efficiently
        if (table::contains(event_attendee_to_id, event_id)) {
            let event_attendees = table::borrow(event_attendee_to_id, event_id);
            if (table::contains(event_attendees, attendee)) {
                let attendance_id = *table::borrow(event_attendees, attendee);
                let attendance = table::borrow_mut(attendances, attendance_id);
                attendance.peer_validations = attendance.peer_validations + 1;
            };
        };
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

    /// Determine certificate tier based on validation count
    fun get_certificate_tier(validation_count: u64): u8 {
        if (validation_count >= GOLD_MIN_VALIDATIONS) {
            CERTIFICATE_GOLD
        } else if (validation_count >= SILVER_MIN_VALIDATIONS) {
            CERTIFICATE_SILVER
        } else if (validation_count >= BRONZE_MIN_VALIDATIONS) {
            CERTIFICATE_BRONZE
        } else {
            0 // No certificate earned
        }
    }

    /// Generate metadata URI for certificate
    fun generate_metadata_uri(
        event_name: String,
        tier: u8,
        _validation_score: u64
    ): String {
        let tier_name = if (tier == CERTIFICATE_GOLD) {
            string::utf8(b"Gold")
        } else if (tier == CERTIFICATE_SILVER) {
            string::utf8(b"Silver")
        } else {
            string::utf8(b"Bronze")
        };
        
        // In a real implementation, this would generate a JSON metadata URI
        // For now, we'll create a simple string representation
        let base_uri = string::utf8(b"https://attestify.io/certificates/");
        string::append(&mut base_uri, tier_name);
        string::append(&mut base_uri, string::utf8(b"/"));
        string::append(&mut base_uri, event_name);
        base_uri
    }

    /// Mint a certificate for an attendee
    public entry fun mint_certificate(
        attendee: &signer,
        event_id: u64,
    ) acquires EventRegistry, AttendanceRegistry, CertificateRegistry {
        let attendee_addr = signer::address_of(attendee);
        
        // Verify event exists
        let event_registry = borrow_global<EventRegistry>(@eviden);
        assert!(table::contains(&event_registry.events, event_id), E_EVENT_NOT_FOUND);
        let event_ref = table::borrow(&event_registry.events, event_id);
        let event_name = event_ref.name;
        
        // Get validation count first (before borrowing AttendanceRegistry mutably)
        let validation_count = get_peer_validation_count(event_id, attendee_addr);
        let certificate_tier = get_certificate_tier(validation_count);
        assert!(certificate_tier > 0, E_CERTIFICATE_NOT_EARNED);
        
        // Now borrow AttendanceRegistry and verify attendee
        let attendance_registry = borrow_global<AttendanceRegistry>(@eviden);
        assert!(table::contains(&attendance_registry.user_attendances, attendee_addr), E_ATTENDEE_NOT_FOUND);
        let user_events = table::borrow(&attendance_registry.user_attendances, attendee_addr);
        assert!(vector::contains(user_events, &event_id), E_ATTENDEE_NOT_FOUND);
        
        // Check if certificate already minted
        if (table::contains(&attendance_registry.event_attendee_to_id, event_id)) {
            let event_attendees = table::borrow(&attendance_registry.event_attendee_to_id, event_id);
            if (table::contains(event_attendees, attendee_addr)) {
                let attendance_id = *table::borrow(event_attendees, attendee_addr);
                let attendance = table::borrow(&attendance_registry.attendances, attendance_id);
                assert!(!attendance.certificate_minted, E_CERTIFICATE_ALREADY_MINTED);
            };
        };
        
        // Generate metadata URI
        let metadata_uri = generate_metadata_uri(event_name, certificate_tier, validation_count);
        
        // Mint certificate
        let cert_registry = borrow_global_mut<CertificateRegistry>(@eviden);
        let certificate_id = cert_registry.next_certificate_id;
        cert_registry.next_certificate_id = certificate_id + 1;
        
        let certificate = Certificate {
            certificate_id,
            event_id,
            attendee: attendee_addr,
            event_name,
            validation_score: validation_count,
            certificate_tier,
            issued_at: 1700000000, // Fixed timestamp for testing - in production use timestamp::now_seconds()
            metadata_uri,
        };
        
        // Store certificate
        table::add(&mut cert_registry.certificates, certificate_id, certificate);
        
        // Update user certificates
        if (!table::contains(&cert_registry.user_certificates, attendee_addr)) {
            table::add(&mut cert_registry.user_certificates, attendee_addr, vector::empty());
        };
        let user_certs = table::borrow_mut(&mut cert_registry.user_certificates, attendee_addr);
        vector::push_back(user_certs, certificate_id);
        
        // Update event certificates
        if (!table::contains(&cert_registry.event_certificates, event_id)) {
            table::add(&mut cert_registry.event_certificates, event_id, vector::empty());
        };
        let event_certs = table::borrow_mut(&mut cert_registry.event_certificates, event_id);
        vector::push_back(event_certs, certificate_id);
        
        // Update total certificates
        cert_registry.total_certificates = cert_registry.total_certificates + 1;
        
        // Mark certificate as minted in attendance record
        let attendance_registry_mut = borrow_global_mut<AttendanceRegistry>(@eviden);
        if (table::contains(&attendance_registry_mut.event_attendee_to_id, event_id)) {
            let event_attendees = table::borrow(&attendance_registry_mut.event_attendee_to_id, event_id);
            if (table::contains(event_attendees, attendee_addr)) {
                let attendance_id = *table::borrow(event_attendees, attendee_addr);
                let attendance = table::borrow_mut(&mut attendance_registry_mut.attendances, attendance_id);
                attendance.certificate_minted = true;
            };
        };
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

    /// Get peer validation count for an attendee at an event
    #[view]
    public fun get_peer_validation_count(event_id: u64, attendee: address): u64 acquires AttendanceRegistry {
        let registry = borrow_global<AttendanceRegistry>(@eviden);
        
        if (!table::contains(&registry.peer_validations, event_id)) {
            return 0
        };
        
        let event_validations = table::borrow(&registry.peer_validations, event_id);
        
        if (!table::contains(event_validations, attendee)) {
            return 0
        };
        
        let validators = table::borrow(event_validations, attendee);
        vector::length(validators)
    }

    /// Get list of validators for an attendee at an event
    #[view]
    public fun get_peer_validators(event_id: u64, attendee: address): vector<address> acquires AttendanceRegistry {
        let registry = borrow_global<AttendanceRegistry>(@eviden);
        
        if (!table::contains(&registry.peer_validations, event_id)) {
            return vector::empty()
        };
        
        let event_validations = table::borrow(&registry.peer_validations, event_id);
        
        if (!table::contains(event_validations, attendee)) {
            return vector::empty()
        };
        
        *table::borrow(event_validations, attendee)
    }

    /// Check if an attendee has been checked in to an event
    #[view]
    public fun is_checked_in(event_id: u64, attendee: address): bool acquires AttendanceRegistry {
        let registry = borrow_global<AttendanceRegistry>(@eviden);
        
        if (!table::contains(&registry.user_attendances, attendee)) {
            return false
        };
        
        let user_events = table::borrow(&registry.user_attendances, attendee);
        vector::contains(user_events, &event_id)
    }

    /// Get list of attendees for an event
    #[view]
    public fun get_event_attendees(event_id: u64): vector<address> acquires AttendanceRegistry {
        let registry = borrow_global<AttendanceRegistry>(@eviden);
        
        if (table::contains(&registry.event_attendees, event_id)) {
            *table::borrow(&registry.event_attendees, event_id)
        } else {
            vector::empty<address>()
        }
    }

    /// Get certificate details
    #[view]
    public fun get_certificate_details(certificate_id: u64): (u64, address, String, u64, u8, u64, String) acquires CertificateRegistry {
        let registry = borrow_global<CertificateRegistry>(@eviden);
        assert!(table::contains(&registry.certificates, certificate_id), E_EVENT_NOT_FOUND);
        let cert = table::borrow(&registry.certificates, certificate_id);
        
        (
            cert.event_id,
            cert.attendee,
            cert.event_name,
            cert.validation_score,
            cert.certificate_tier,
            cert.issued_at,
            cert.metadata_uri
        )
    }

    /// Get total certificates count
    #[view]
    public fun get_total_certificates(): u64 acquires CertificateRegistry {
        let registry = borrow_global<CertificateRegistry>(@eviden);
        registry.total_certificates
    }

    /// Get user's certificates
    #[view]
    public fun get_user_certificates(user: address): vector<u64> acquires CertificateRegistry {
        let registry = borrow_global<CertificateRegistry>(@eviden);
        
        if (table::contains(&registry.user_certificates, user)) {
            *table::borrow(&registry.user_certificates, user)
        } else {
            vector::empty<u64>()
        }
    }

    /// Get certificates for an event
    #[view]
    public fun get_event_certificates(event_id: u64): vector<u64> acquires CertificateRegistry {
        let registry = borrow_global<CertificateRegistry>(@eviden);
        
        if (table::contains(&registry.event_certificates, event_id)) {
            *table::borrow(&registry.event_certificates, event_id)
        } else {
            vector::empty<u64>()
        }
    }

    /// Check if user has earned a certificate for an event
    #[view]
    public fun can_mint_certificate(event_id: u64, attendee: address): bool acquires AttendanceRegistry {
        let registry = borrow_global<AttendanceRegistry>(@eviden);
        
        // Check if attendee is checked in to this event
        if (!table::contains(&registry.user_attendances, attendee)) {
            return false
        };
        
        let user_events = table::borrow(&registry.user_attendances, attendee);
        if (!vector::contains(user_events, &event_id)) {
            return false
        };
        
        // Check if certificate already minted
        if (table::contains(&registry.event_attendee_to_id, event_id)) {
            let event_attendees = table::borrow(&registry.event_attendee_to_id, event_id);
            if (table::contains(event_attendees, attendee)) {
                let attendance_id = *table::borrow(event_attendees, attendee);
                let attendance = table::borrow(&registry.attendances, attendance_id);
                if (attendance.certificate_minted) {
                    return false
                };
            };
        };
        
        // Check if enough validations for a certificate
        let validation_count = get_peer_validation_count(event_id, attendee);
        validation_count >= BRONZE_MIN_VALIDATIONS
    }

    /// Get certificate tier that would be earned
    #[view]
    public fun get_earned_certificate_tier(event_id: u64, attendee: address): u8 acquires AttendanceRegistry {
        let validation_count = get_peer_validation_count(event_id, attendee);
        get_certificate_tier(validation_count)
    }
}
