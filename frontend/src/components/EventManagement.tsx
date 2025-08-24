import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useEvents, useCreateEvent } from '../hooks/useApi';
import { Form, FormField, TextareaField, SelectField, SubmitButton, createValidationSchemas } from './ui/Form';
import { cn } from '../utils';
import { Plus, Calendar, MapPin, Users, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import EmailVerificationBanner from './EmailVerificationBanner';

interface EventFormData {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  location?: string;
  image?: string;
}

export function EventManagement() {
  const { theme } = useTheme();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // API hooks
  const { data: eventsData, loading: eventsLoading, refetch: refetchEvents } = useEvents({
    organizer: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // Mock organizer for demo
    ...(searchTerm && { search: searchTerm }),
    ...(categoryFilter && { category: categoryFilter }),
    ...(statusFilter && { status: statusFilter as any }),
  });

  const { createEvent, loading: createLoading } = useCreateEvent();

  // Form validation
  const validationSchema = createValidationSchemas().event;

  // Event categories
  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'design', label: 'Design' },
    { value: 'other', label: 'Other' },
  ];

  // Status filters
  const statusOptions = [
    { value: '', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
  ];

  // Handle form submission
  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await createEvent({
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
      setShowCreateForm(false);
      refetchEvents();
      toast.success('Event created successfully!');
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // Get event status
  const getEventStatus = (event: any) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'completed';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const events = eventsData?.events || [];

  return (
    <div className={cn(
      'min-h-screen transition-all duration-300',
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    )}>
      <EmailVerificationBanner />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={cn(
              'text-4xl font-bold mb-2',
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            )}>
              Event Management
            </h1>
            <p className={cn(
              'text-lg',
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            )}>
              Create and manage your events
            </p>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className={cn(
              'flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all',
              'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/20'
            )}
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5',
              theme === 'dark' ? 'text-white/40' : 'text-slate-400'
            )} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                theme === 'dark'
                  ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
              )}
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={cn(
              'w-full px-4 py-3 rounded-xl border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              theme === 'dark'
                ? 'bg-white/10 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            )}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'w-full px-4 py-3 rounded-xl border transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              theme === 'dark'
                ? 'bg-white/10 border-white/20 text-white focus:border-blue-500 focus:ring-blue-500/20'
                : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            )}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Events Grid */}
        {eventsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
              const status = getEventStatus(event);
              const statusColor = getStatusColor(status);

              return (
                <div
                  key={event.id}
                  className={cn(
                    'rounded-xl p-6 transition-all duration-300 hover:scale-105 cursor-pointer',
                    theme === 'dark'
                      ? 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15'
                      : 'bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl'
                  )}
                >
                  {/* Event Image */}
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}

                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      statusColor
                    )}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <span className={cn(
                      'text-sm px-2 py-1 rounded-lg',
                      theme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-600'
                    )}>
                      {event.category}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h3 className={cn(
                    'text-xl font-semibold mb-2',
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  )}>
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className={cn(
                    'text-sm mb-4 line-clamp-2',
                    theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                  )}>
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className={cn(
                        'w-4 h-4',
                        theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                      )} />
                      <span className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                      )}>
                        {new Date(event.startDate).toLocaleDateString()}
                      </span>
                    </div>

                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className={cn(
                          'w-4 h-4',
                          theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                        )} />
                        <span className={cn(
                          'text-sm',
                          theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                        )}>
                          {event.location}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Users className={cn(
                        'w-4 h-4',
                        theme === 'dark' ? 'text-white/60' : 'text-slate-500'
                      )} />
                      <span className={cn(
                        'text-sm',
                        theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                      )}>
                        {event.attendeeCount || 0}/{event.maxAttendees} attendees
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={cn(
              'w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto',
              theme === 'dark'
                ? 'bg-slate-800 border border-white/20'
                : 'bg-white border border-slate-200 shadow-xl'
            )}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={cn(
                  'text-2xl font-bold',
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                )}>
                  Create New Event
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    theme === 'dark'
                      ? 'hover:bg-white/10 text-white/70 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  )}
                >
                  ✕
                </button>
              </div>

              <Form
                onSubmit={handleCreateEvent}
                schema={validationSchema}
                defaultValues={{
                  title: '',
                  description: '',
                  category: '',
                  startDate: '',
                  endDate: '',
                  maxAttendees: 100,
                }}
              >
                <FormField
                  name="title"
                  label="Event Title"
                  placeholder="Enter event title"
                  required
                />

                <TextareaField
                  name="description"
                  label="Description"
                  placeholder="Describe your event"
                  required
                  rows={4}
                />

                <SelectField
                  name="category"
                  label="Category"
                  options={categories}
                  placeholder="Select a category"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="startDate"
                    label="Start Date"
                    type="datetime-local"
                    required
                  />

                  <FormField
                    name="endDate"
                    label="End Date"
                    type="datetime-local"
                    required
                  />
                </div>

                <FormField
                  name="maxAttendees"
                  label="Maximum Attendees"
                  type="number"
                  placeholder="100"
                  required
                />

                <FormField
                  name="location"
                  label="Location (Optional)"
                  placeholder="Event location"
                />

                <div className="flex space-x-4 pt-4">
                  <SubmitButton loading={createLoading}>
                    Create Event
                  </SubmitButton>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className={cn(
                      'flex-1 px-6 py-3 rounded-xl font-medium transition-all',
                      'border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
                      theme === 'dark'
                        ? 'border-white/20 text-white hover:bg-white/10 focus:ring-white/20'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500/20'
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!eventsLoading && events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className={cn(
              'w-16 h-16 mx-auto mb-4',
              theme === 'dark' ? 'text-white/40' : 'text-slate-400'
            )} />
            <h3 className={cn(
              'text-xl font-semibold mb-2',
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            )}>
              No events found
            </h3>
            <p className={cn(
              'text-base mb-6',
              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
            )}>
              {searchTerm || categoryFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Create your first event to get started'
              }
            </p>
            {!searchTerm && !categoryFilter && !statusFilter && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all hover:scale-105"
              >
                Create Your First Event
              </button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default EventManagement;
