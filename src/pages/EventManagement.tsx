import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import { apiService } from '../services/ApiService';
import { qrCodeService } from '../services/QRCodeService';

interface Event {
  id: string;
  name: string;
  description: string;
  venue_name: string;
  venue_address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  start_time: number;
  end_time: number;
  max_attendees: number;
  current_attendees: number;
  check_in_radius: number;
  category: string;
  tags: string[];
  image_url: string;
  is_private: boolean;
  requires_approval: boolean;
  security_level: 'basic' | 'standard' | 'high' | 'maximum';
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  qr_code_url: string;
  analytics: {
    total_registrations: number;
    checked_in_attendees: number;
    attendance_rate: number;
    avg_check_in_time: string;
    peak_check_in_hour: string;
  };
}

const EventManagement: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'ongoing' | 'completed'>('all');
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [regeneratingQR, setRegeneratingQR] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'organizer') {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrganizerEvents();
      
      if (response.success) {
        setEvents(response.data.events || []);
      } else {
        console.error('Failed to fetch events:', response.message);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (eventId: string) => {
    setRegeneratingQR(eventId);
    try {
      const response = await apiService.generateEventQRCode(eventId);
      
      if (response.success) {
        // Update event with new QR code
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, qr_code_url: response.data.qr_code_url }
              : event
          )
        );
        setShowQRCode(response.data.qr_code_url);
      } else {
        throw new Error(response.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setRegeneratingQR(null);
    }
  };

  const updateEventStatus = async (eventId: string, status: Event['status']) => {
    try {
      const response = await apiService.updateEventStatus(eventId, status);
      
      if (response.success) {
        setEvents(prev => 
          prev.map(event => 
            event.id === eventId 
              ? { ...event, status }
              : event
          )
        );
      } else {
        throw new Error(response.message || 'Failed to update event status');
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
      alert('Failed to update event status. Please try again.');
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteEvent(eventId);
      
      if (response.success) {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        setSelectedEvent(null);
      } else {
        throw new Error(response.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const exportAttendees = async (eventId: string) => {
    try {
      const response = await apiService.exportEventAttendees(eventId);
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `event_${eventId}_attendees.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error(response.message || 'Failed to export attendees');
      }
    } catch (error) {
      console.error('Failed to export attendees:', error);
      alert('Failed to export attendees. Please try again.');
    }
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'draft': return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
      case 'published': return theme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'ongoing': return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
      case 'completed': return theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
      case 'cancelled': return theme === 'dark' ? 'text-red-400' : 'text-red-600';
      default: return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Event['status']) => {
    switch (status) {
      case 'draft': return '📝';
      case 'published': return '🌟';
      case 'ongoing': return '🔴';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.status === filter);

  // Redirect if not organizer
  if (!user || user.role !== 'organizer') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <GlassCard className="text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only organizers can access event management</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Go to Dashboard
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userType="organizer" />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Event Management 🎪
              </h1>
              <p className={`${
                theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
              }`}>
                Manage your events, view analytics, and handle attendees
              </p>
            </div>
            <button
              onClick={() => navigate('/events/create')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark' 
                  ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              ➕ Create Event
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-cyber-cyan mb-1">
              {events.length}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Total Events
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {events.filter(e => e.status === 'published').length}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Published
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {events.filter(e => e.status === 'ongoing').length}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Ongoing
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {events.reduce((sum, e) => sum + e.current_attendees, 0)}
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Total Attendees
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'draft', 'published', 'ongoing', 'completed'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? (theme === 'dark' 
                        ? 'bg-cyber-cyan text-black' 
                        : 'bg-blue-600 text-white')
                    : (theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                {filterType === 'all' ? '📋 All' : `${getStatusIcon(filterType)} ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎪</div>
            <p className={`${
              theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
            }`}>
              Loading events...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              {filter === 'all' ? 'No Events Yet' : `No ${filter} Events`}
            </h3>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
            }`}>
              {filter === 'all' 
                ? 'Create your first event to get started' 
                : `You don't have any ${filter} events`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate('/events/create')}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <GlassCard key={event.id} className="hover:scale-[1.02] transition-transform">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className={`text-lg font-semibold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-slate-800'
                        }`}>
                          {event.name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-sm ${getStatusColor(event.status)}`}>
                            {getStatusIcon(event.status)} {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded text-xs ${
                            theme === 'dark' 
                              ? 'bg-cyber-purple/30 text-cyber-cyan' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {event.category}
                          </span>
                          {event.security_level && (
                            <span className={`text-sm px-2 py-1 rounded text-xs ${
                              theme === 'dark' 
                                ? 'bg-cyber-purple/30 text-cyber-cyan' 
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {qrCodeService.getSecurityLevelIcon(event.security_level)} {event.security_level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`text-sm grid grid-cols-2 lg:grid-cols-4 gap-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div>
                        <strong>📅 Date:</strong><br />
                        {new Date(event.start_time * 1000).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>📍 Venue:</strong><br />
                        {event.venue_name}
                      </div>
                      <div>
                        <strong>👥 Attendees:</strong><br />
                        {event.current_attendees} / {event.max_attendees}
                      </div>
                      {event.analytics && (
                        <div>
                          <strong>📊 Attendance:</strong><br />
                          {event.analytics.attendance_rate}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        theme === 'dark' 
                          ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      📊 Details
                    </button>

                    <button
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        theme === 'dark' 
                          ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => generateQRCode(event.id)}
                      disabled={regeneratingQR === event.id}
                      className={`px-3 py-1 text-sm rounded transition-colors disabled:opacity-50 ${
                        theme === 'dark' 
                          ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {regeneratingQR === event.id ? '⏳' : '📱'} QR
                    </button>

                    <button
                      onClick={() => exportAttendees(event.id)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        theme === 'dark' 
                          ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📥 Export
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {selectedEvent.name}
                </h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`text-2xl ${
                    theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ×
                </button>
              </div>

              {/* Event Image */}
              {selectedEvent.image_url && (
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.name}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              )}

              {/* Analytics */}
              {selectedEvent.analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyber-cyan">
                      {selectedEvent.analytics.total_registrations}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Registrations
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {selectedEvent.analytics.checked_in_attendees}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Checked In
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedEvent.analytics.attendance_rate}%
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Attendance Rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {selectedEvent.analytics.peak_check_in_hour}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Peak Hour
                    </div>
                  </div>
                </div>
              )}

              {/* Event Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Event Information
                  </h3>
                  <div className={`space-y-2 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <p><strong>Status:</strong> <span className={getStatusColor(selectedEvent.status)}>{getStatusIcon(selectedEvent.status)} {selectedEvent.status}</span></p>
                    <p><strong>Category:</strong> {selectedEvent.category}</p>
                    <p><strong>Start:</strong> {new Date(selectedEvent.start_time * 1000).toLocaleString()}</p>
                    <p><strong>End:</strong> {new Date(selectedEvent.end_time * 1000).toLocaleString()}</p>
                    <p><strong>Capacity:</strong> {selectedEvent.current_attendees} / {selectedEvent.max_attendees}</p>
                    <p><strong>Check-in Radius:</strong> {selectedEvent.check_in_radius}m</p>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Venue Details
                  </h3>
                  <div className={`space-y-2 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <p><strong>Name:</strong> {selectedEvent.venue_name}</p>
                    <p><strong>Address:</strong> {selectedEvent.venue_address}</p>
                    <p><strong>Coordinates:</strong> {selectedEvent.location.latitude.toFixed(6)}, {selectedEvent.location.longitude.toFixed(6)}</p>
                    <p><strong>Security Level:</strong> {qrCodeService.getSecurityLevelIcon(selectedEvent.security_level)} {selectedEvent.security_level}</p>
                    <p><strong>Privacy:</strong> {selectedEvent.is_private ? 'Private' : 'Public'}</p>
                    <p><strong>Approval:</strong> {selectedEvent.requires_approval ? 'Required' : 'Not Required'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  Description
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {selectedEvent.description}
                </p>
              </div>

              {/* Tags */}
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.tags.map(tag => (
                      <span key={tag} className={`px-2 py-1 rounded text-xs ${
                        theme === 'dark' 
                          ? 'bg-cyber-purple/30 text-cyber-cyan' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/events/${selectedEvent.id}/edit`)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  ✏️ Edit Event
                </button>
                
                <button
                  onClick={() => generateQRCode(selectedEvent.id)}
                  disabled={regeneratingQR === selectedEvent.id}
                  className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                    theme === 'dark' 
                      ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {regeneratingQR === selectedEvent.id ? '⏳ Generating...' : '📱 Generate QR'}
                </button>
                
                <button
                  onClick={() => exportAttendees(selectedEvent.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  📥 Export Attendees
                </button>

                {selectedEvent.status === 'draft' && (
                  <button
                    onClick={() => updateEventStatus(selectedEvent.id, 'published')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    🌟 Publish Event
                  </button>
                )}

                <button
                  onClick={() => deleteEvent(selectedEvent.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  🗑️ Delete Event
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <GlassCard className="text-center max-w-md">
              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Event QR Code
              </h3>
              
              <div className="mb-4">
                <img
                  src={showQRCode}
                  alt="Event QR Code"
                  className="w-64 h-64 mx-auto border rounded-lg"
                />
              </div>

              <p className={`text-sm mb-4 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Attendees can scan this QR code to check in to your event
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = showQRCode;
                    link.download = 'event-qr-code.png';
                    link.click();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  📥 Download
                </button>
                <button
                  onClick={() => setShowQRCode(null)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;
