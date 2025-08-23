import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import { apiService } from '../services/ApiService';
import { locationService } from '../services/LocationService';

interface Event {
  id: string;
  name: string;
  description: string;
  organizer: string;
  organizerName: string;
  start_time: number;
  end_time: number;
  venue_name: string;
  venue_address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  max_attendees: number;
  attendee_count: number;
  checked_in_count: number;
  check_in_radius: number;
  tags: string[];
  image_url?: string;
  is_active: boolean;
  category: string;
  user_registered?: boolean;
  user_checked_in?: boolean;
}

interface EventFilters {
  search: string;
  category: string;
  status: 'all' | 'upcoming' | 'ongoing' | 'completed';
  sortBy: 'date' | 'popularity' | 'distance';
  showNearby: boolean;
}

const EventDiscovery: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: '',
    status: 'all',
    sortBy: 'date',
    showNearby: false
  });

  const categories = [
    'Technology', 'Business', 'Education', 'Entertainment', 
    'Health', 'Sports', 'Art', 'Music', 'Food', 'Travel'
  ];

  useEffect(() => {
    loadEvents();
    getUserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters, userLocation]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEvents({
        page: 1,
        limit: 50,
        status: filters.status === 'all' ? undefined : filters.status
      });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const location = await locationService.getCurrentPosition();
      setUserLocation(location);
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.venue_name.toLowerCase().includes(searchTerm) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    // Status filter
    if (filters.status !== 'all') {
      const now = Date.now() / 1000;
      filtered = filtered.filter(event => {
        switch (filters.status) {
          case 'upcoming':
            return event.start_time > now;
          case 'ongoing':
            return event.start_time <= now && event.end_time > now;
          case 'completed':
            return event.end_time <= now;
          default:
            return true;
        }
      });
    }

    // Nearby filter
    if (filters.showNearby && userLocation) {
      filtered = filtered.filter(event => {
        const distance = locationService.calculateDistance(
          userLocation,
          event.location
        );
        return distance <= 50000; // 50km radius
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return a.start_time - b.start_time;
        case 'popularity':
          return b.attendee_count - a.attendee_count;
        case 'distance':
          if (!userLocation) return 0;
          const distanceA = locationService.calculateDistance(userLocation, a.location);
          const distanceB = locationService.calculateDistance(userLocation, b.location);
          return distanceA - distanceB;
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  };

  const registerForEvent = async (eventId: string) => {
    try {
      // Implementation depends on backend API
      console.log('Registering for event:', eventId);
      // await apiService.registerForEvent(eventId);
      loadEvents(); // Refresh events
    } catch (error) {
      console.error('Failed to register for event:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDistance = (event: Event) => {
    if (!userLocation) return '';
    const distance = locationService.calculateDistance(userLocation, event.location);
    return locationService.formatDistance(distance);
  };

  const getEventStatus = (event: Event) => {
    const now = Date.now() / 1000;
    if (event.start_time > now) return 'upcoming';
    if (event.end_time > now) return 'ongoing';
    return 'completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' : 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return '';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1">
            <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Discover Events 🔍
            </h1>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Find and join amazing events in your area
            </p>
          </div>
        </header>

        {/* Filters */}
        <GlassCard className="mb-4 sm:mb-6 lg:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Search Events
              </label>
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-cyber-purple/30 text-white placeholder-white/50 focus:border-cyber-cyan' 
                    : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Category */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                    : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                }`}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                    : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                }`}
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-700'
              }`}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-cyber-purple/30 text-white focus:border-cyber-cyan' 
                    : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
                }`}
              >
                <option value="date">Date</option>
                <option value="popularity">Popularity</option>
                <option value="distance">Distance</option>
              </select>
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showNearby}
                onChange={(e) => setFilters({...filters, showNearby: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${
                theme === 'dark' ? 'text-white' : 'text-slate-700'
              }`}>
                Show nearby events only (50km)
              </span>
            </label>
          </div>
        </GlassCard>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <GlassCard key={event.id} className="overflow-hidden">
                  {/* Event Image */}
                  {event.image_url && (
                    <div className="h-48 overflow-hidden rounded-lg mb-4">
                      <img
                        src={event.image_url}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Event Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-semibold text-lg leading-tight ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}>
                        {event.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>

                    <p className={`text-sm line-clamp-2 ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
                    }`}>
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">📅</span>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-slate-700'
                        }`}>
                          {formatDate(event.start_time)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm">📍</span>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-slate-700'
                        }`}>
                          {event.venue_name}
                        </span>
                        {userLocation && (
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-500'
                          }`}>
                            ({formatDistance(event)})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm">👥</span>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-slate-700'
                        }`}>
                          {event.attendee_count}/{event.max_attendees} attendees
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs ${
                              theme === 'dark' 
                                ? 'bg-cyber-purple/20 text-cyber-cyan' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            theme === 'dark' 
                              ? 'bg-gray-500/20 text-gray-400' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{event.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <MacOSButton
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        onClick={() => registerForEvent(event.id)}
                        disabled={event.user_registered || status === 'completed'}
                      >
                        {event.user_registered ? 'Registered' : 'Join Event'}
                      </MacOSButton>
                      <MacOSButton
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(`/events/${event.id}`, '_blank')}
                      >
                        Details
                      </MacOSButton>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* No Events Found */}
        {!loading && filteredEvents.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              No events found
            </h3>
            <p className={`${
              theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'
            }`}>
              Try adjusting your filters or search terms
            </p>
          </GlassCard>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default EventDiscovery;
