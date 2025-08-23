script {
    use eviden::events;

    /// Deploy and initialize the events module
    fun deploy_events(admin: &signer) {
        // The init_module function will be called automatically when the module is published
        // This script can be used for additional setup if needed
    }
}
