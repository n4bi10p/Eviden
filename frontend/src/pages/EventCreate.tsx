
import React, { useState } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import EventCreationWizard from '../components/EventCreationWizard';
import MacOSButton from '../components/MacOSButton';
import { useTheme } from '../contexts/ThemeContext';
import { useEvents } from '../contexts/EventContext';
import { ApiService } from '../services/ApiService';
import { useWalletAuth } from '../contexts/WalletAuthContext';

const EventCreate: React.FC = () => {
  const { theme } = useTheme();
  const [showWizard, setShowWizard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useWalletAuth();

  const { addEvent } = useEvents();

  const transformEventData = (formData: any) => {
    // Transform frontend form data to backend API format
    
    // Handle date/time conversion more carefully
    let startDateTime, endDateTime;
    
    try {
      // Combine date and time, ensure proper format
      const startDateTimeStr = `${formData.startDate}T${formData.startTime}:00`;
      const endDateTimeStr = `${formData.endDate}T${formData.endTime}:00`;
      
      startDateTime = new Date(startDateTimeStr);
      endDateTime = new Date(endDateTimeStr);
      
      // Validate dates
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error('Invalid date/time format');
      }
      
      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time');
      }
    } catch (error) {
      console.error('Date conversion error:', error);
      // Fallback to current time + 1 hour
      startDateTime = new Date();
      endDateTime = new Date(Date.now() + 60 * 60 * 1000);
    }

    const apiData = {
      name: formData.title || 'Untitled Event',
      description: (formData.description || 'No description provided').length >= 10 
        ? formData.description 
        : 'No description provided for this event.',
      start_time: Math.floor(startDateTime.getTime() / 1000), // Convert to Unix timestamp
      end_time: Math.floor(endDateTime.getTime() / 1000),
      venue_name: formData.venue || 'TBD Venue',
      venue_address: formData.address || '',
      latitude: 37.7749, // Default to San Francisco - in real app, get from address geocoding
      longitude: -122.4194,
      max_attendees: parseInt(formData.maxAttendees) || 100,
      check_in_radius: 100, // Default 100 meters
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      image_url: formData.imageUrl || undefined, // Send undefined instead of empty string
      external_url: formData.virtualLink || undefined, // Send undefined instead of empty string
      is_private: false,
      requires_approval: false
    };

    console.log('🔄 Transformed event data:', apiData);
    return apiData;
  };

  const handleEventCreated = async (eventData: any) => {
    if (!user) {
      setError('You must be logged in to create an event');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting event creation process...');
      console.log('👤 Current user:', user);
      console.log('📝 Form data received:', eventData);

      // Transform form data to API format
      const apiEventData = transformEventData(eventData);
      console.log('🔄 API data to send:', apiEventData);
      
      // Create event via API
      const apiService = new ApiService();
      
      // Ensure the API service has the latest token
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
        apiService.setToken(currentToken);
      } else {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('📡 Sending API request...');
      const response = await apiService.createEvent(apiEventData);
      console.log('✅ API response:', response);

      if (response.success) {
        console.log('🎉 Event created successfully!');
        // Add to local state for immediate UI update
        addEvent({
          ...eventData,
          id: response.data.event.id,
          backendId: response.data.event.id
        });
        setShowWizard(false);
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    } catch (err) {
      console.error('❌ Error creating event:', err);
      
      // Better error handling
      let errorMessage = 'Failed to create event';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Check for specific error types
      if (errorMessage.includes('token') || errorMessage.includes('auth')) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('role')) {
        errorMessage = 'You need organizer permissions to create events.';
      }
      
      setError(errorMessage);
      
      // Don't add to local state if there's an auth error
      if (!errorMessage.includes('auth') && !errorMessage.includes('permission')) {
        console.log('📝 Adding to local state as fallback...');
        addEvent(eventData);
        setShowWizard(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1">
            <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Create New Event ✨
            </h1>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Set up a new event with blockchain-verified attendance
            </p>
          </div>
        </header>

        {!showWizard ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-responsive-4xl mb-4">🎉</div>
            <h2 className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-4 sm:mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Event Created Successfully!
            </h2>
            <MacOSButton onClick={() => setShowWizard(true)} icon="➕">
              Create Another Event
            </MacOSButton>
          </div>
        ) : null}

        {/* Event Creation Wizard Component */}
                {/* Event Creation Wizard */}
        {showWizard && (
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    Creating event...
                  </p>
                </div>
              </div>
            )}
            {error && (
              <div className={`mb-4 p-4 rounded-lg ${
                theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
              }`}>
                ⚠️ {error}
              </div>
            )}
            <EventCreationWizard
              isOpen={showWizard}
              onClose={handleCloseWizard}
              onSubmit={handleEventCreated}
            />
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default EventCreate;
