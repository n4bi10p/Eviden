import React from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import { useTheme } from '../contexts/ThemeContext';

const Events: React.FC = () => {
  const { theme } = useTheme();
  
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
            <h1 className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white/60' : 'text-macos-gray-800'
            }`}>
              Discover Events 🎯
            </h1>
            <p className={`${
              theme === 'dark' ? 'text-white/40' : 'text-macos-gray-600'
            }`}>
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
            <div className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-blue-400/60' : 'text-macos-blue'
            }`}>12</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
            }`}>Upcoming Events</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-green-400/60' : 'text-macos-green'
            }`}>3.2K</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
            }`}>Total Attendees</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-purple-400/60' : 'text-macos-purple'
            }`}>45</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
            }`}>Cities Worldwide</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-teal-400/60' : 'text-macos-teal'
            }`}>98%</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
            }`}>Verification Rate</div>
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
                    ? theme === 'dark' 
                      ? 'bg-blue-400/20 text-blue-400/80 border border-blue-400/30'
                      : 'bg-macos-blue/20 text-macos-blue border border-macos-blue/30'
                    : event.status === 'completed'
                    ? theme === 'dark'
                      ? 'bg-white/10 text-white/50 border border-white/20'
                      : 'bg-macos-gray-300/20 text-macos-gray-600 border border-macos-gray-300/30'
                    : theme === 'dark'
                      ? 'bg-green-400/20 text-green-400/80 border border-green-400/30'
                      : 'bg-macos-green/20 text-macos-green border border-macos-green/30'
                  }
                `}>
                  {event.status === 'upcoming' ? '📅 Upcoming' : 
                   event.status === 'completed' ? '✓ Completed' : '🔴 Live'}
                </span>
              </div>

              {/* Event Content */}
              <div className="pt-2">
                <h3 className={`text-lg font-bold mb-2 pr-20 ${
                  theme === 'dark' ? 'text-white/60' : 'text-macos-gray-800'
                }`}>
                  {event.title}
                </h3>
                
                <p className={`text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-blue-400/60' : 'text-macos-blue'
                }`}>
                  by {event.organizer}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className={`flex items-center ${
                    theme === 'dark' ? 'text-white/50' : 'text-macos-gray-700'
                  }`}>
                    <span className={`mr-2 ${
                      theme === 'dark' ? 'text-blue-400/60' : 'text-macos-blue'
                    }`}>📅</span>
                    {event.date}
                  </div>
                  <div className={`flex items-center ${
                    theme === 'dark' ? 'text-white/50' : 'text-macos-gray-700'
                  }`}>
                    <span className={`mr-2 ${
                      theme === 'dark' ? 'text-blue-400/60' : 'text-macos-blue'
                    }`}>⏰</span>
                    {event.time}
                  </div>
                  <div className={`flex items-center ${
                    theme === 'dark' ? 'text-white/50' : 'text-macos-gray-700'
                  }`}>
                    <span className={`mr-2 ${
                      theme === 'dark' ? 'text-blue-400/60' : 'text-macos-blue'
                    }`}>📍</span>
                    {event.location}
                  </div>
                  <div className={`flex items-center ${
                    theme === 'dark' ? 'text-white/50' : 'text-macos-gray-700'
                  }`}>
                    <span className={`mr-2 ${
                      theme === 'dark' ? 'text-blue-400/60' : 'text-macos-blue'
                    }`}>💰</span>
                    {event.price}
                  </div>
                </div>

                <p className={`text-sm mb-4 ${
                  theme === 'dark' ? 'text-white/40' : 'text-macos-gray-600'
                }`}>
                  {event.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className={`px-2 py-1 rounded-lg text-xs ${
                        theme === 'dark' 
                          ? 'bg-white/10 text-white/50'
                          : 'bg-macos-gray-100 text-macos-gray-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Attendee Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`${
                      theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
                    }`}>Attendees</span>
                    <span className={`${
                      theme === 'dark' ? 'text-white/50' : 'text-macos-gray-800'
                    }`}>
                      {event.attendees}/{event.maxAttendees}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-macos-gray-200'
                  }`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-r from-blue-400/60 to-teal-400/60'
                          : 'bg-gradient-to-r from-macos-blue to-macos-teal'
                      }`}
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
