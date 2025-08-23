/// Tests for the peer validation functionality
#[test_only]
module eviden::peer_validation_tests {
    use std::string;
    use std::signer;
    use std::vector;
    use aptos_framework::account;
    use eviden::events_v3;

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456, bob = @0x789)]
    public fun test_peer_validation_flow(
        admin: &signer,
        organizer: &signer,
        alice: &signer,
        bob: &signer
    ) {
        // Initialize accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));
        account::create_account_for_test(signer::address_of(alice));
        account::create_account_for_test(signer::address_of(bob));

        // Initialize the events module
        events_v3::init_module_for_testing(admin);

        // Create an event
        events_v3::create_event_for_testing(
            organizer,
            string::utf8(b"Tech Conference"),
            string::utf8(b"A conference about technology"),
            1700000000,    // start time
            1700003600,    // end time
            37774000,      // latitude
            122419000,     // longitude
            string::utf8(b"Convention Center"),
            100,           // max attendees
            1000,          // check-in radius
        );

        // Both Alice and Bob check in
        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);
        events_v3::check_in_to_event_for_testing(bob, 1, 37774100, 122419100);

        // Verify both are checked in
        assert!(events_v3::is_checked_in(1, signer::address_of(alice)), 1);
        assert!(events_v3::is_checked_in(1, signer::address_of(bob)), 2);

        // Initial peer validation count should be 0
        assert!(events_v3::get_peer_validation_count(1, signer::address_of(alice)) == 0, 3);
        assert!(events_v3::get_peer_validation_count(1, signer::address_of(bob)) == 0, 4);

        // Alice validates Bob's attendance
        events_v3::validate_peer_attendance(alice, 1, signer::address_of(bob));

        // Bob's validation count should increase
        assert!(events_v3::get_peer_validation_count(1, signer::address_of(bob)) == 1, 5);

        // Alice should appear in Bob's validators list
        let bob_validators = events_v3::get_peer_validators(1, signer::address_of(bob));
        assert!(vector::length(&bob_validators) == 1, 6);
        assert!(vector::contains(&bob_validators, &signer::address_of(alice)), 7);

        // Bob validates Alice's attendance
        events_v3::validate_peer_attendance(bob, 1, signer::address_of(alice));

        // Alice's validation count should increase
        assert!(events_v3::get_peer_validation_count(1, signer::address_of(alice)) == 1, 8);

        // Check attendees list
        let attendees = events_v3::get_event_attendees(1);
        assert!(vector::length(&attendees) == 2, 9);
        assert!(vector::contains(&attendees, &signer::address_of(alice)), 10);
        assert!(vector::contains(&attendees, &signer::address_of(bob)), 11);
    }

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456)]
    #[expected_failure(abort_code = 8, location = eviden::events_v3)]
    public fun test_cannot_self_validate(
        admin: &signer,
        organizer: &signer,
        alice: &signer
    ) {
        // Initialize
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));
        account::create_account_for_test(signer::address_of(alice));
        events_v3::init_module_for_testing(admin);

        // Create event and check in
        events_v3::create_event_for_testing(
            organizer,
            string::utf8(b"Test Event"),
            string::utf8(b"Test Description"),
            1700000000,
            1700003600,
            37774000,
            122419000,
            string::utf8(b"Test Venue"),
            100,
            1000,
        );

        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);

        // Alice tries to validate herself (should fail)
        events_v3::validate_peer_attendance(alice, 1, signer::address_of(alice));
    }

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456, bob = @0x789)]
    #[expected_failure(abort_code = 10, location = eviden::events_v3)]
    public fun test_cannot_validate_twice(
        admin: &signer,
        organizer: &signer,
        alice: &signer,
        bob: &signer
    ) {
        // Initialize
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));
        account::create_account_for_test(signer::address_of(alice));
        account::create_account_for_test(signer::address_of(bob));
        events_v3::init_module_for_testing(admin);

        // Create event and both check in
        events_v3::create_event_for_testing(
            organizer,
            string::utf8(b"Test Event"),
            string::utf8(b"Test Description"),
            1700000000,
            1700003600,
            37774000,
            122419000,
            string::utf8(b"Test Venue"),
            100,
            1000,
        );

        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);
        events_v3::check_in_to_event_for_testing(bob, 1, 37774100, 122419100);

        // Alice validates Bob
        events_v3::validate_peer_attendance(alice, 1, signer::address_of(bob));

        // Alice tries to validate Bob again (should fail)
        events_v3::validate_peer_attendance(alice, 1, signer::address_of(bob));
    }

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456, bob = @0x789)]
    #[expected_failure(abort_code = 9, location = eviden::events_v3)]
    public fun test_validate_non_attendee(
        admin: &signer,
        organizer: &signer,
        alice: &signer,
        bob: &signer
    ) {
        // Initialize
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));
        account::create_account_for_test(signer::address_of(alice));
        account::create_account_for_test(signer::address_of(bob));
        events_v3::init_module_for_testing(admin);

        // Create event
        events_v3::create_event_for_testing(
            organizer,
            string::utf8(b"Test Event"),
            string::utf8(b"Test Description"),
            1700000000,
            1700003600,
            37774000,
            122419000,
            string::utf8(b"Test Venue"),
            100,
            1000,
        );

        // Only Alice checks in
        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);

        // Alice tries to validate Bob who didn't check in (should fail)
        events_v3::validate_peer_attendance(alice, 1, signer::address_of(bob));
    }
}
