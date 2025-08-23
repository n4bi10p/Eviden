import React, { useState } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import AdvancedSearch from '../components/AdvancedSearch';
import { useTheme } from '../contexts/ThemeContext';

const Events: React.FC = () => {
  const { theme } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  
  const handleResultSelect = (result: any) => {
    console.log('Selected event:', result);
    // Handle event selection logic here
  };
  
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
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Discover Events 🎯
            </h1>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Find and attend blockchain events with verified certificates
            </p>
          </div>
          
          <MacOSButton 
            icon="🔍"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? 'Hide Search' : 'Advanced Search'}
          </MacOSButton>
        </header>

        {/* Advanced Search Component */}
        {showSearch && (
          <div className="mb-4 sm:mb-6">
            <AdvancedSearch 
              onResultSelect={handleResultSelect}
              initialQuery=""
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <GlassCard className="text-center">
            <div className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-blue-600'
            }`}>12</div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Upcoming Events</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-green-600'
            }`}>3.2K</div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Total Attendees</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-purple-600'
            }`}>45</div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
            }`}>Cities Worldwide</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-cyber-cyan' : 'text-orange-600'
            }`}>98%</div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-white/70' : 'text-slate-700'
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
    </ResponsiveLayout>
  );
};

export default Events;
