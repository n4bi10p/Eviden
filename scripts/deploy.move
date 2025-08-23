script {
    use eviden::events_v3;

    /// Deploy and initialize the events v2 module
    fun deploy_events(_admin: &signer) {
        // The init_module function will be called automatically when the module is published
        // This script can be used for additional setup if needed
    }
}
