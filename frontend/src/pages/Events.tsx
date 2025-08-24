import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import { ApiService } from '../services/ApiService';
import { toast } from 'react-hot-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  price: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  image: string;
  category: string;
  max_attendees: number;
  current_attendees: number;
}

const Events: React.FC = () => {
  const { theme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    start_time: '',
    end_time: '',
    max_attendees: 100,
    price: '0'
  });

  const categories = [
    'Technology', 'Business', 'Education', 'Entertainment', 
    'Health', 'Sports', 'Art', 'Music', 'Food', 'Travel',
    'Networking', 'Workshop', 'Conference', 'Meetup'
  ];

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const apiService = new ApiService();
        const response = await apiService.getEvents({
          limit: 50,
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter && { category: categoryFilter })
        });

        if (response.success) {
          setEvents(response.data.events || []);
        } else {
          // Fallback to mock data
          setEvents([
            {
              id: '1',
              title: 'Blockchain Security Summit 2025',
              description: 'Join leading experts for comprehensive blockchain security discussions.',
              organizer: 'TechCorp Blockchain',
              date: 'March 15, 2025',
              time: '10:00 AM - 6:00 PM',
              location: 'Moscone Center, San Francisco',
              price: 'Free',
              status: 'upcoming',
              image: '🔒',
              category: 'Technology',
              max_attendees: 500,
              current_attendees: 249
            },
            {
              id: '2',
              title: 'DeFi Innovation Conference',
              description: 'Explore the latest innovations in decentralized finance.',
              organizer: 'DeFi Alliance',
              date: 'March 20, 2025',
              time: '9:00 AM - 5:00 PM',
              location: 'Jacob Javits Center, New York',
              price: '$299',
              status: 'upcoming',
              image: '💰',
              category: 'Business',
              max_attendees: 300,
              current_attendees: 189
            },
            {
              id: '3',
              title: 'Web3 Developer Bootcamp',
              description: 'Hands-on workshop for building Web3 applications.',
              organizer: 'DevCommunity',
              date: 'February 28, 2025',
              time: 'Full Day Workshop',
              location: 'Austin Convention Center',
              price: '$199',
              status: 'completed',
              image: '🛠️',
              category: 'Education',
              max_attendees: 200,
              current_attendees: 156
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, categoryFilter]);

  // Handle form submission
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiService = new ApiService();
      const response = await apiService.createEvent({
        name: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_attendees: formData.max_attendees,
        venue_name: formData.location,
        venue_address: formData.location,
        check_in_radius: 100,
        security_level: 'standard',
        venue_type: 'indoor',
        venue_size: 'medium',
        tags: [formData.category],
        is_private: false,
        requires_approval: false
      });

      if (response.success) {
        toast.success('Event created successfully!');
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          start_time: '',
          end_time: '',
          max_attendees: 100,
          price: '0'
        });
        // Refresh events
        window.location.reload();
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return theme === 'dark' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ongoing':
        return theme === 'dark' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300';
      case 'completed':
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return theme === 'dark' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Events 📅
            </h1>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Discover and create blockchain events
            </p>
          </div>
          <MacOSButton 
            onClick={() => setShowCreateForm(true)}
            icon="➕"
          >
            Create Event
          </MacOSButton>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <GlassCard className="h-64 bg-gray-300 rounded-lg">
                  <div className="p-4">
                    <div className="h-4 bg-gray-400 rounded mb-2"></div>
                    <div className="h-3 bg-gray-400 rounded mb-4"></div>
                    <div className="h-20 bg-gray-400 rounded"></div>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <GlassCard key={event.id} className="hover:scale-105 transition-all duration-300 group">
                <div className="space-y-4">
                  {/* Event Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                        theme === 'dark' ? 'bg-cyber-purple/20' : 'bg-blue-100'
                      }`}>
                        {event.image}
                      </div>
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(event.status)}`}>
                          📅 {event.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3">
                    <h3 className={`text-lg font-bold group-hover:text-cyber-cyan transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {event.title}
                    </h3>
                    
                    <div className={`text-sm ${theme === 'dark' ? 'text-cyber-cyan/70' : 'text-slate-600'}`}>
                      by {event.organizer}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>📅</span>
                        <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>
                          {event.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🕒</span>
                        <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📍</span>
                        <span className={theme === 'dark' ? 'text-white/80' : 'text-slate-700'}>
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>💰</span>
                        <span className={`font-medium ${
                          event.price === 'Free' 
                            ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                            : (theme === 'dark' ? 'text-white/80' : 'text-slate-700')
                        }`}>
                          {event.price}
                        </span>
                      </div>
                    </div>

                    <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                      {event.description}
                    </p>

                    {/* Attendees Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                          Attendees
                        </span>
                        <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                          {event.current_attendees}/{event.max_attendees}
                        </span>
                      </div>
                      <div className={`w-full bg-gray-200 rounded-full h-2 ${
                        theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'
                      }`}>
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(event.current_attendees / event.max_attendees) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <MacOSButton 
                        size="sm" 
                        className="flex-1"
                        onClick={() => toast.success('Registration feature coming soon!')}
                      >
                        🎯 Register Now
                      </MacOSButton>
                      <MacOSButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => toast.success('Certificate preview coming soon!')}
                      >
                        🏆 View Certificate
                      </MacOSButton>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              No events found
            </h3>
            <p className={`text-base mb-6 ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            }`}>
              {searchTerm || categoryFilter
                ? 'Try adjusting your filters'
                : 'Create your first event to get started'
              }
            </p>
            <MacOSButton onClick={() => setShowCreateForm(true)}>
              Create Your First Event
            </MacOSButton>
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Create New Event ✨
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className={`text-2xl ${
                      theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-700'
                    }`}>
                      Event Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="Enter event title"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-700'
                    }`}>
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="Describe your event"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-700'
                      }`}>
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border transition-all ${
                          theme === 'dark'
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-700'
                      }`}>
                        Max Attendees
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.max_attendees}
                        onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 100 })}
                        className={`w-full px-4 py-3 rounded-lg border transition-all ${
                          theme === 'dark'
                            ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                            : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-700'
                    }`}>
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border transition-all ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 text-white placeholder-white/40'
                          : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                      }`}
                      placeholder="Enter event location"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-700'
                      }`}>
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border transition-all ${
                          theme === 'dark'
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-700'
                      }`}>
                        End Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border transition-all ${
                          theme === 'dark'
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <MacOSButton type="submit" className="flex-1">
                      Create Event
                    </MacOSButton>
                    <MacOSButton 
                      type="button"
                      variant="secondary" 
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </MacOSButton>
                  </div>
                </form>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default Events;
