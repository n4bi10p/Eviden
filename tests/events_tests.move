#[test_only]
module eviden::events_tests {
    use std::string;
    use std::signer;
    use aptos_framework::account;
    use eviden::events;

    #[test(admin = @eviden, organizer = @0x123)]
    public fun test_create_event(admin: &signer, organizer: &signer) {
        // Initialize accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));

        // Initialize the events module
        events::init_module_for_testing(admin);

        // Create an event
        let event_name = string::utf8(b"Blockchain Conference 2025");
        let event_description = string::utf8(b"A conference about blockchain technology");
        let venue_name = string::utf8(b"Convention Center");
        
        events::create_event(
            organizer,
            event_name,
            event_description,
            1700000000,    // fixed start time
            1700003600,    // fixed end time (1 hour later)
            37774000,      // latitude * 1000000 (San Francisco)
            122419000,     // longitude * 1000000 
            venue_name,
            100,           // max attendees
            1000,          // 1km check-in radius
        );

        // Verify event was created
        let total_events = events::get_total_events();
        assert!(total_events == 1, 1);

        // Verify event details
        let (name, description, organizer_addr, _start_time, _end_time, is_active) = 
            events::get_event_details(1);
        
        assert!(name == event_name, 2);
        assert!(description == event_description, 3);
        assert!(organizer_addr == signer::address_of(organizer), 4);
        assert!(is_active == true, 5);
    }

    #[test(admin = @eviden, organizer = @0x123)]
    public fun test_create_multiple_events(admin: &signer, organizer: &signer) {
        // Initialize
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));

        // Initialize the events module
        events::init_module_for_testing(admin);

        // Create first event
        events::create_event(
            organizer,
            string::utf8(b"Event 1"),
            string::utf8(b"First event"),
            1700000000,
            1700003600,
            37774000,
            122419000,
            string::utf8(b"Venue 1"),
            50,
            500,
        );

        // Create second event
        events::create_event(
            organizer,
            string::utf8(b"Event 2"),
            string::utf8(b"Second event"),
            1700010000,
            1700013600,
            37775000,
            122420000,
            string::utf8(b"Venue 2"),
            75,
            750,
        );

        // Verify both events were created
        let total_events = events::get_total_events();
        assert!(total_events == 2, 1);

        // Verify first event details
        let (name1, _desc1, _org1, _start1, _end1, _active1) = events::get_event_details(1);
        assert!(name1 == string::utf8(b"Event 1"), 2);

        // Verify second event details
        let (name2, _desc2, _org2, _start2, _end2, _active2) = events::get_event_details(2);
        assert!(name2 == string::utf8(b"Event 2"), 3);
    }
}
