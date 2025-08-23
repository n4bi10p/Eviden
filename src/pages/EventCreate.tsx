import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import MacOSSwitch from '../components/MacOSSwitch';

const EventCreate: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    requiresLocation: true
  });

  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating event:', formData);
    // Handle event creation
  };

  return (
    <div className="flex min-h-screen bg-pastel-gradient">
      <Sidebar userType="organizer" />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-macos-gray-800 mb-2">
            Create New Event ✨
          </h1>
          <p className="text-macos-gray-600">
            Set up a new event with blockchain-verified attendance
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <GlassCard className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-semibold text-macos-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/30 focus:border-macos-blue focus:ring-2 focus:ring-macos-blue/20 outline-none transition-all"
                  placeholder="Enter event name..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-macos-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/30 focus:border-macos-blue focus:ring-2 focus:ring-macos-blue/20 outline-none transition-all resize-none"
                  placeholder="Describe your event..."
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-macos-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/30 focus:border-macos-blue focus:ring-2 focus:ring-macos-blue/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-macos-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/30 focus:border-macos-blue focus:ring-2 focus:ring-macos-blue/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-macos-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/30 focus:border-macos-blue focus:ring-2 focus:ring-macos-blue/20 outline-none transition-all pr-12"
                    placeholder="Enter location or address..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(!showLocationPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-macos-blue hover:text-macos-teal transition-colors"
                  >
                    📍
                  </button>
                </div>
                
                {showLocationPicker && (
                  <div className="mt-4 h-48 glass rounded-xl flex items-center justify-center border border-white/30">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🗺️</div>
                      <p className="text-macos-gray-600">Interactive Map Picker</p>
                      <p className="text-sm text-macos-gray-500">Click to select location</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Max Attendees */}
              <div>
                <label className="block text-sm font-semibold text-macos-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({...formData, maxAttendees: e.target.value})}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/30 focus:border-macos-blue focus:ring-2 focus:ring-macos-blue/20 outline-none transition-all"
                  placeholder="e.g., 100"
                />
              </div>

              {/* Location Verification Toggle */}
              <div className="flex items-center justify-between p-4 glass-dark rounded-xl">
                <div>
                  <h3 className="text-white font-medium mb-1">Require Location Verification</h3>
                  <p className="text-white/70 text-sm">Attendees must be physically present to check in</p>
                </div>
                <MacOSSwitch
                  checked={formData.requiresLocation}
                  onChange={(checked) => setFormData({...formData, requiresLocation: checked})}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <MacOSButton 
                  size="lg" 
                  className="w-full animate-pulse-glow"
                  icon="✨"
                >
                  Create Event
                </MacOSButton>
              </div>
            </form>
          </GlassCard>

          {/* Preview Card */}
          <div className="mt-8">
            <GlassCard variant="dark" className="max-w-md mx-auto">
              <h3 className="text-white font-semibold mb-4 text-center">Event Preview</h3>
              <div className="space-y-3">
                <div className="text-white">
                  <span className="text-white/70">Name: </span>
                  {formData.name || 'Event Name'}
                </div>
                <div className="text-white">
                  <span className="text-white/70">Date: </span>
                  {formData.date || 'Not set'} {formData.time && `at ${formData.time}`}
                </div>
                <div className="text-white">
                  <span className="text-white/70">Location: </span>
                  {formData.location || 'Not set'}
                </div>
                <div className="text-white">
                  <span className="text-white/70">Max Attendees: </span>
                  {formData.maxAttendees || 'Unlimited'}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreate;
