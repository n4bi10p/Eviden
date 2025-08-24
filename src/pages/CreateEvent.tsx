import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import { apiService } from '../services/ApiService';
import { locationService } from '../services/LocationService';

interface EventFormData {
  name: string;
  description: string;
  venue_name: string;
  venue_address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  start_time: string;
  end_time: string;
  max_attendees: number;
  check_in_radius: number;
  category: string;
  tags: string[];
  image_url: string;
  is_private: boolean;
  requires_approval: boolean;
  external_url: string;
  security_level: 'basic' | 'standard' | 'high' | 'maximum';
  venue_type: 'indoor' | 'outdoor' | 'mixed';
  venue_size: 'small' | 'medium' | 'large' | 'massive';
}

const CreateEvent: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    venue_name: '',
    venue_address: '',
    location: { latitude: 0, longitude: 0 },
    start_time: '',
    end_time: '',
    max_attendees: 100,
    check_in_radius: 100,
    category: '',
    tags: [],
    image_url: '',
    is_private: false,
    requires_approval: false,
    external_url: '',
    security_level: 'standard',
    venue_type: 'indoor',
    venue_size: 'medium'
  });

  const [currentTag, setCurrentTag] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const categories = [
    'Technology', 'Business', 'Education', 'Entertainment', 
    'Health', 'Sports', 'Art', 'Music', 'Food', 'Travel',
    'Networking', 'Workshop', 'Conference', 'Meetup'
  ];

  const securityLevels = [
    { value: 'basic', label: 'Basic 🖤', description: 'Standard QR codes (24h validity)' },
    { value: 'standard', label: 'Standard 🔵', description: 'Rotating QR codes (5min intervals)' },
    { value: 'high', label: 'High 🔴', description: 'High security (1min intervals)' },
    { value: 'maximum', label: 'Maximum 🟣', description: 'Maximum security (30sec intervals)' }
  ];

  // Redirect if not organizer
  if (!user || user.role !== 'organizer') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <GlassCard className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only organizers can create events</p>
          <MacOSButton onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </MacOSButton>
        </GlassCard>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await locationService.getCurrentPosition();
      setFormData(prev => ({
        ...prev,
        location: position
      }));
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Failed to get current location. Please enter coordinates manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const response = await apiService.uploadEventImage(file);
      setFormData(prev => ({
        ...prev,
        image_url: response.data.url
      }));
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const calculateIntelligentRadius = () => {
    const intelligentRadius = locationService.calculateIntelligentRadius({
      baseRadius: formData.check_in_radius,
      capacity: formData.max_attendees,
      venueType: formData.venue_type,
      venueSize: formData.venue_size
    });

    setFormData(prev => ({
      ...prev,
      check_in_radius: Math.round(intelligentRadius)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Event name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Event description is required');
      return;
    }
    
    if (!formData.start_time || !formData.end_time) {
      alert('Start and end times are required');
      return;
    }
    
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      alert('End time must be after start time');
      return;
    }
    
    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      alert('Event location is required');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        start_time: Math.floor(new Date(formData.start_time).getTime() / 1000),
        end_time: Math.floor(new Date(formData.end_time).getTime() / 1000),
      };

      const response = await apiService.createEvent(eventData);
      
      if (response.success) {
        alert('Event created successfully!');
        navigate(`/events/${response.data.event.id}`);
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar userType={user.role} />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Create New Event ➕
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
          }`}>
            Set up your event with all the details attendees need
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <GlassCard>
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Event Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                  placeholder="Describe your event..."
                />
              </div>
            </div>
          </GlassCard>

          {/* Date & Time */}
          <GlassCard>
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Date & Time
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard>
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Location & Venue
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                  }`}>
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    name="venue_name"
                    value={formData.venue_name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                        : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                    placeholder="Enter venue name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                  }`}>
                    Venue Address
                  </label>
                  <input
                    type="text"
                    name="venue_address"
                    value={formData.venue_address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                        : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                    placeholder="Enter venue address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                  }`}>
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.latitude}
                    onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value) || 0)}
                    required
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                        : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                    placeholder="0.000000"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                  }`}>
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.location.longitude}
                    onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value) || 0)}
                    required
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                        : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                    placeholder="0.000000"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className={`w-full px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50 disabled:opacity-50' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50'
                    }`}
                  >
                    {locationLoading ? 'Getting...' : '📍 Current Location'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                  }`}>
                    Venue Type
                  </label>
                  <select
                    name="venue_type"
                    value={formData.venue_type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                        : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                  }`}>
                    Venue Size
                  </label>
                  <select
                    name="venue_size"
                    value={formData.venue_size}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                        : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    <option value="small">Small (1-50)</option>
                    <option value="medium">Medium (51-200)</option>
                    <option value="large">Large (201-1000)</option>
                    <option value="massive">Massive (1000+)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                  }`}>
                    Check-in Radius (meters)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="check_in_radius"
                      value={formData.check_in_radius}
                      onChange={handleInputChange}
                      min={10}
                      max={1000}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                        theme === 'dark' 
                          ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                          : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={calculateIntelligentRadius}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Event Settings */}
          <GlassCard>
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Event Settings
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  name="max_attendees"
                  value={formData.max_attendees}
                  onChange={handleInputChange}
                  min={1}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Security Level
                </label>
                <select
                  name="security_level"
                  value={formData.security_level}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                >
                  {securityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  External URL
                </label>
                <input
                  type="url"
                  name="external_url"
                  value={formData.external_url}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
                }`}>
                  Event Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
                {imageUploading && (
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-cyber-cyan/70' : 'text-blue-600'
                  }`}>
                    Uploading image...
                  </p>
                )}
                {formData.image_url && (
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ✓ Image uploaded successfully
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_private"
                  name="is_private"
                  checked={formData.is_private}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_private" className={`text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-slate-700'
                }`}>
                  Private Event (invitation only)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requires_approval"
                  name="requires_approval"
                  checked={formData.requires_approval}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="requires_approval" className={`text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-slate-700'
                }`}>
                  Require approval for registration
                </label>
              </div>
            </div>
          </GlassCard>

          {/* Tags */}
          <GlassCard>
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Tags
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                      : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                  }`}
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-cyber-cyan/20 text-cyber-cyan hover:bg-cyber-cyan/30' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Add
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        theme === 'dark' 
                          ? 'bg-cyber-purple/30 text-cyber-cyan' 
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                theme === 'dark' 
                  ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80 disabled:hover:bg-cyber-cyan' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600'
              }`}
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
