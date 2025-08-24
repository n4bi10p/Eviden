import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, QrCode, Scan, Calendar, Settings } from 'lucide-react';
import AttendanceDashboard from '../components/AttendanceDashboard';
import AttendeeQRCard from '../components/AttendeeQRCard';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'qr-ticket'>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string>('event-1');

  // Mock event data - replace with actual API calls
  const mockEvents = [
    {
      id: 'event-1',
      title: 'Tech Conference 2025',
      date: '2025-08-24T10:00:00Z',
      location: 'Convention Center, San Francisco',
    },
    {
      id: 'event-2',
      title: 'Developer Meetup',
      date: '2025-08-25T18:00:00Z',
      location: 'Tech Hub, Downtown',
    },
  ];

  const selectedEvent = mockEvents.find(e => e.id === selectedEventId);

  // Mock user data - replace with actual auth context
  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  };

  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Event Dashboard',
      icon: Users,
      description: 'Manage attendees and check-ins',
    },
    {
      id: 'qr-ticket' as const,
      label: 'My Ticket',
      icon: QrCode,
      description: 'View your event QR code',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/50 to-purple-900/50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Attendance Management
              </h1>
              <p className="text-gray-400">
                Manage event check-ins and view attendance analytics
              </p>
            </div>

            {/* Event Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Event:</span>
              </div>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mockEvents.map((event) => (
                  <option key={event.id} value={event.id} className="bg-gray-900">
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative p-4 rounded-lg transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-blue-600/30 border border-blue-500/50'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-blue-500/20' : 'bg-white/10'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          isActive ? 'text-white' : 'text-gray-300'
                        }`}>
                          {tab.label}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {tab.description}
                        </p>
                      </div>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-blue-600/20 border border-blue-500/50 rounded-lg"
                        initial={false}
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && selectedEvent && (
            <AttendanceDashboard eventId={selectedEvent.id} />
          )}

          {activeTab === 'qr-ticket' && selectedEvent && (
            <div className="max-w-2xl mx-auto">
              <AttendeeQRCard
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                eventDate={selectedEvent.date}
                eventLocation={selectedEvent.location}
                attendeeName={mockUser.name}
                attendeeEmail={mockUser.email}
                userId={mockUser.id}
              />
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-6 right-6 space-y-3"
        >
          {activeTab === 'dashboard' && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
              onClick={() => {
                // Handle quick scan action
                console.log('Quick scan triggered');
              }}
            >
              <Scan className="w-4 h-4 mr-2" />
              Quick Scan
            </Button>
          )}
          
          <Button
            variant="outline"
            className="bg-white/10 backdrop-blur-sm shadow-lg"
            onClick={() => {
              // Handle settings
              console.log('Settings triggered');
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AttendancePage;
