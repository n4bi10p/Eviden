import React from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';

const Events: React.FC = () => {
  const events = [
    {
      id: 1,
      title: "Blockchain Security Summit 2025",
      date: "March 15, 2025",
      time: "10:00 AM - 6:00 PM",
      location: "Moscone Center, San Francisco",
      organizer: "TechCorp Events",
      attendees: 245,
      maxAttendees: 300,
      status: "upcoming",
      description: "Join industry leaders for comprehensive blockchain security discussions.",
      price: "Free",
      tags: ["Security", "Enterprise", "Networking"]
    },
    {
      id: 2,
      title: "DeFi Innovation Conference",
      date: "March 20, 2025",
      time: "9:00 AM - 5:00 PM",
      location: "Jacob Javits Center, New York",
      organizer: "DeFi Alliance",
      attendees: 189,
      maxAttendees: 250,
      status: "upcoming",
      description: "Explore the latest innovations in decentralized finance.",
      price: "$299",
      tags: ["DeFi", "Innovation", "Finance"]
    },
    {
      id: 3,
      title: "Web3 Developer Bootcamp",
      date: "February 28, 2025",
      time: "Full Day Workshop",
      location: "Austin Convention Center",
      organizer: "DevCommunity",
      attendees: 156,
      maxAttendees: 200,
      status: "completed",
      description: "Hands-on workshop for building Web3 applications.",
      price: "$199",
      tags: ["Development", "Hands-on", "Web3"]
    }
  ];

  return (
    <div className="flex min-h-screen bg-pastel-gradient">
      <Sidebar userType="attendee" />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-macos-gray-800 mb-2">
              Discover Events 🎯
            </h1>
            <p className="text-macos-gray-600">
              Find and attend blockchain events with verified certificates
            </p>
          </div>
          
          <MacOSButton icon="🔍">
            Search Events
          </MacOSButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-blue mb-1">12</div>
            <div className="text-sm text-macos-gray-600">Upcoming Events</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-green mb-1">3.2K</div>
            <div className="text-sm text-macos-gray-600">Total Attendees</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-purple mb-1">45</div>
            <div className="text-sm text-macos-gray-600">Cities Worldwide</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="text-2xl font-bold text-macos-teal mb-1">98%</div>
            <div className="text-sm text-macos-gray-600">Verification Rate</div>
          </GlassCard>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <GlassCard key={event.id} className="relative overflow-hidden">
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${event.status === 'upcoming' 
                    ? 'bg-macos-blue/20 text-macos-blue border border-macos-blue/30' 
                    : event.status === 'completed'
                    ? 'bg-macos-gray-300/20 text-macos-gray-600 border border-macos-gray-300/30'
                    : 'bg-macos-green/20 text-macos-green border border-macos-green/30'
                  }
                `}>
                  {event.status === 'upcoming' ? '📅 Upcoming' : 
                   event.status === 'completed' ? '✓ Completed' : '🔴 Live'}
                </span>
              </div>

              {/* Event Content */}
              <div className="pt-2">
                <h3 className="text-lg font-bold text-macos-gray-800 mb-2 pr-20">
                  {event.title}
                </h3>
                
                <p className="text-sm text-macos-blue font-medium mb-3">
                  by {event.organizer}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-macos-gray-700">
                    <span className="text-macos-blue mr-2">📅</span>
                    {event.date}
                  </div>
                  <div className="flex items-center text-macos-gray-700">
                    <span className="text-macos-blue mr-2">⏰</span>
                    {event.time}
                  </div>
                  <div className="flex items-center text-macos-gray-700">
                    <span className="text-macos-blue mr-2">📍</span>
                    {event.location}
                  </div>
                  <div className="flex items-center text-macos-gray-700">
                    <span className="text-macos-blue mr-2">💰</span>
                    {event.price}
                  </div>
                </div>

                <p className="text-sm text-macos-gray-600 mb-4">
                  {event.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-macos-gray-100 text-macos-gray-700 rounded-lg text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Attendee Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-macos-gray-600">Attendees</span>
                    <span className="text-macos-gray-800">
                      {event.attendees}/{event.maxAttendees}
                    </span>
                  </div>
                  <div className="w-full bg-macos-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-macos-blue to-macos-teal h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <MacOSButton 
                  className="w-full"
                  variant={event.status === 'completed' ? 'secondary' : 'primary'}
                  icon={event.status === 'completed' ? '📜' : '🎫'}
                >
                  {event.status === 'completed' ? 'View Certificate' : 
                   event.status === 'upcoming' ? 'Register Now' : 'Join Event'}
                </MacOSButton>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12">
          <GlassCard className="text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-macos-gray-800 mb-4">
                Host Your Own Event 🚀
              </h2>
              <p className="text-macos-gray-600 mb-6">
                Create verifiable attendance certificates for your events. 
                Build trust and provide lasting value to your attendees with blockchain verification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MacOSButton size="lg" icon="✨">
                  Create Event
                </MacOSButton>
                <MacOSButton variant="secondary" size="lg" icon="📖">
                  Learn More
                </MacOSButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Events;
