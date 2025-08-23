/// Tests for the certificate functionality
#[test_only]
module eviden::certificate_tests {
    use std::string;
    use std::signer;
    use std::vector;
    use aptos_framework::account;
    use eviden::events_v3::{Self};

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456, bob = @0x789, charlie = @0xabc)]
    public fun test_certificate_minting_bronze(
        admin: &signer,
        organizer: &signer,
        alice: &signer,
        bob: &signer,
        charlie: &signer
    ) {
        // Initialize accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));
        account::create_account_for_test(signer::address_of(alice));
        account::create_account_for_test(signer::address_of(bob));
        account::create_account_for_test(signer::address_of(charlie));

        // Initialize the events module
        events_v3::init_module_for_testing(admin);

        // Create an event
        events_v3::create_event_for_testing(
            organizer,
            string::utf8(b"Blockchain Conference"),
            string::utf8(b"A conference about blockchain technology"),
            1700000000,
            1700003600,
            37774000,
            122419000,
            string::utf8(b"Convention Center"),
            100,
            1000,
        );

        // Alice and Bob check in
        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);
        events_v3::check_in_to_event_for_testing(bob, 1, 37774100, 122419100);

        // Bob validates Alice (1 validation = Bronze tier)
        events_v3::validate_peer_attendance(bob, 1, signer::address_of(alice));

        // Check that Alice can mint a certificate
        assert!(events_v3::can_mint_certificate(1, signer::address_of(alice)), 1);
        assert!(events_v3::get_earned_certificate_tier(1, signer::address_of(alice)) == 1, 2); // Bronze

        // Alice mints certificate
        events_v3::mint_certificate(alice, 1);

        // Verify certificate was created
        assert!(events_v3::get_total_certificates() == 1, 3);
        let user_certs = events_v3::get_user_certificates(signer::address_of(alice));
        assert!(vector::length(&user_certs) == 1, 4);

        let cert_id = *vector::borrow(&user_certs, 0);
        let (event_id, attendee, event_name, validation_score, cert_tier, _issued_at, metadata_uri) = 
            events_v3::get_certificate_details(cert_id);

        assert!(event_id == 1, 5);
        assert!(attendee == signer::address_of(alice), 6);
        assert!(event_name == string::utf8(b"Blockchain Conference"), 7);
        assert!(validation_score == 1, 8);
        assert!(cert_tier == 1, 9); // Bronze
        assert!(metadata_uri == string::utf8(b"https://attestify.io/certificates/Bronze/Blockchain Conference"), 10);

        // Check that Alice cannot mint another certificate
        assert!(!events_v3::can_mint_certificate(1, signer::address_of(alice)), 11);
    }

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456, bob = @0x789, charlie = @0xabc, dave = @0xdef)]
    public fun test_certificate_minting_silver(
        admin: &signer,
        organizer: &signer,
        alice: &signer,
        bob: &signer,
        charlie: &signer,
        dave: &signer
    ) {
        // Initialize accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));
        account::create_account_for_test(signer::address_of(alice));
        account::create_account_for_test(signer::address_of(bob));
        account::create_account_for_test(signer::address_of(charlie));
        account::create_account_for_test(signer::address_of(dave));

        // Initialize the events module
        events_v3::init_module_for_testing(admin);

        // Create an event
        events_v3::create_event_for_testing(
            organizer,
            string::utf8(b"AI Summit"),
            string::utf8(b"Summit about artificial intelligence"),
            1700000000,
            1700003600,
            37774000,
            122419000,
            string::utf8(b"Tech Hub"),
            100,
            1000,
        );

        // Everyone checks in
        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);
        events_v3::check_in_to_event_for_testing(bob, 1, 37774100, 122419100);
        events_v3::check_in_to_event_for_testing(charlie, 1, 37774150, 122419150);
        events_v3::check_in_to_event_for_testing(dave, 1, 37774200, 122419200);

        // Multiple people validate Alice (3 validations = Silver tier)
        events_v3::validate_peer_attendance(bob, 1, signer::address_of(alice));
        events_v3::validate_peer_attendance(charlie, 1, signer::address_of(alice));
        events_v3::validate_peer_attendance(dave, 1, signer::address_of(alice));

        // Check that Alice can mint a Silver certificate
        assert!(events_v3::can_mint_certificate(1, signer::address_of(alice)), 1);
        assert!(events_v3::get_earned_certificate_tier(1, signer::address_of(alice)) == 2, 2); // Silver

        // Alice mints certificate
        events_v3::mint_certificate(alice, 1);

        // Verify certificate details
        let user_certs = events_v3::get_user_certificates(signer::address_of(alice));
        let cert_id = *vector::borrow(&user_certs, 0);
        let (_event_id, _attendee, _event_name, validation_score, cert_tier, _issued_at, metadata_uri) = 
            events_v3::get_certificate_details(cert_id);

        assert!(validation_score == 3, 3);
        assert!(cert_tier == 2, 4); // Silver
        assert!(metadata_uri == string::utf8(b"https://attestify.io/certificates/Silver/AI Summit"), 5);
    }

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456)]
    #[expected_failure(abort_code = 11, location = eviden::events_v3)]
    public fun test_cannot_mint_without_validations(
        admin: &signer,
        organizer: &signer,
        alice: &signer
    ) {
        // Initialize accounts
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(organizer));
        account::create_account_for_test(signer::address_of(alice));

        // Initialize the events module
        events_v3::init_module_for_testing(admin);

        // Create an event
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

        // Alice checks in but has no validations
        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);

        // Check that Alice cannot mint a certificate
        assert!(!events_v3::can_mint_certificate(1, signer::address_of(alice)), 1);
        assert!(events_v3::get_earned_certificate_tier(1, signer::address_of(alice)) == 0, 2); // No tier

        // This should fail with E_CERTIFICATE_NOT_EARNED
        events_v3::mint_certificate(alice, 1);
    }

    #[test(admin = @eviden, organizer = @0x123, alice = @0x456, bob = @0x789)]
    #[expected_failure(abort_code = 12, location = eviden::events_v3)]
    public fun test_cannot_mint_twice(
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

        // Both check in and Bob validates Alice
        events_v3::check_in_to_event_for_testing(alice, 1, 37774050, 122419050);
        events_v3::check_in_to_event_for_testing(bob, 1, 37774100, 122419100);
        events_v3::validate_peer_attendance(bob, 1, signer::address_of(alice));

        // Alice mints certificate successfully
        events_v3::mint_certificate(alice, 1);

        // This should fail with E_CERTIFICATE_ALREADY_MINTED
        events_v3::mint_certificate(alice, 1);
    }
}
