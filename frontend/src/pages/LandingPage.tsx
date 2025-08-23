import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';

const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Mock trending events data
  const trendingEvents = [
    {
      id: 1,
      title: 'AI & Machine Learning Summit 2025',
      organizer: 'TechCorp',
      date: 'March 15, 2025',
      location: 'San Francisco, CA',
      attendees: 2500,
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      category: 'Technology',
      price: 'Free'
    },
    {
      id: 2,
      title: 'Blockchain & Web3 Conference',
      organizer: 'CryptoEvents',
      date: 'March 22, 2025',
      location: 'New York, NY',
      attendees: 1800,
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
      category: 'Blockchain',
      price: '$299'
    },
    {
      id: 3,
      title: 'Digital Marketing Mastery',
      organizer: 'MarketingPro',
      date: 'March 28, 2025',
      location: 'Austin, TX',
      attendees: 1200,
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
      category: 'Marketing',
      price: '$199'
    },
    {
      id: 4,
      title: 'Startup Pitch Competition',
      organizer: 'VentureHub',
      date: 'April 5, 2025',
      location: 'Seattle, WA',
      attendees: 800,
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
      category: 'Business',
      price: 'Free'
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trendingEvents.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [trendingEvents.length]);

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-white/10' 
          : 'bg-white/80 border-black/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                  : 'bg-gradient-to-br from-blue-500 to-purple-500'
              } shadow-xl`}>
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Eviden
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:text-purple-400' 
                  : 'text-slate-700 hover:text-blue-600'
              }`}>
                Home
              </Link>
              <Link to="/events" className={`font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-white/70 hover:text-purple-400' 
                  : 'text-slate-600 hover:text-blue-600'
              }`}>
                Events
              </Link>
              {user && (
                <Link to="/dashboard" className={`font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'text-white/70 hover:text-purple-400' 
                    : 'text-slate-600 hover:text-blue-600'
                }`}>
                  Dashboard
                </Link>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link to="/profile">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                    }`}>
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <MacOSButton variant="secondary" size="sm">
                      Login
                    </MacOSButton>
                  </Link>
                  <Link to="/signup">
                    <MacOSButton size="sm" icon="✨">
                      Sign Up
                    </MacOSButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Host Smarter.{' '}
              <span className={`bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-purple-400 to-blue-400' 
                  : 'from-blue-600 to-purple-600'
              } bg-clip-text text-transparent`}>
                Attend Easier.
              </span>
            </h1>
            
            <p className={`text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Create unforgettable events and discover amazing experiences. 
              The premium platform for event organizers and attendees.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <MacOSButton 
                size="lg" 
                icon="🚀"
                onClick={() => navigate('/event-create')}
                className="w-full sm:w-auto"
              >
                Create Event
              </MacOSButton>
              <MacOSButton 
                variant="secondary" 
                size="lg" 
                icon="🔍"
                onClick={() => navigate('/events')}
                className="w-full sm:w-auto"
              >
                Explore Events
              </MacOSButton>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <GlassCard className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Statistics */}
                <div className="text-center lg:text-left">
                  <div className="space-y-6">
                    <div>
                      <div className={`text-4xl font-bold ${
                        theme === 'dark' ? 'text-purple-400' : 'text-blue-600'
                      }`}>
                        50K+
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                      }`}>
                        Events Hosted
                      </div>
                    </div>
                    <div>
                      <div className={`text-4xl font-bold ${
                        theme === 'dark' ? 'text-purple-400' : 'text-blue-600'
                      }`}>
                        2M+
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                      }`}>
                        Happy Attendees
                      </div>
                    </div>
                    <div>
                      <div className={`text-4xl font-bold ${
                        theme === 'dark' ? 'text-purple-400' : 'text-blue-600'
                      }`}>
                        99.9%
                      </div>
                      <div className={`text-sm ${
                        theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                      }`}>
                        Uptime
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Image/Graphic */}
                <div className="flex justify-center">
                  <div className={`w-48 h-48 rounded-full flex items-center justify-center text-6xl ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                      : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                  } backdrop-blur-lg shadow-2xl`}>
                    🎯
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">✨</span>
                    <span className={`${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Premium Experience
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔒</span>
                    <span className={`${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Secure & Reliable
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📱</span>
                    <span className={`${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Mobile Optimized
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎨</span>
                    <span className={`${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Beautiful Design
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Trending Events Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Trending Events
            </h2>
            <p className={`text-lg md:text-xl max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Discover the most popular events happening right now
            </p>
          </div>

          {/* Event Slider */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {trendingEvents.map((event) => (
                  <div key={event.id} className="w-full flex-shrink-0">
                    <GlassCard className="p-0 overflow-hidden">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Event Image */}
                        <div 
                          className="h-64 lg:h-96 bg-cover bg-center relative"
                          style={{ backgroundImage: `url(${event.image})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.price === 'Free' 
                                ? 'bg-green-500/80 text-white' 
                                : 'bg-blue-500/80 text-white'
                            }`}>
                              {event.price}
                            </span>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center">
                          <div className="mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              theme === 'dark' 
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
                            }`}>
                              {event.category}
                            </span>
                          </div>
                          
                          <h3 className={`text-2xl lg:text-3xl font-bold mb-4 ${
                            theme === 'dark' ? 'text-white' : 'text-slate-900'
                          }`}>
                            {event.title}
                          </h3>
                          
                          <div className={`space-y-2 mb-6 ${
                            theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <span>🗓️</span>
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>📍</span>
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>👥</span>
                              <span>{event.attendees.toLocaleString()} attendees</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span>🏢</span>
                              <span>by {event.organizer}</span>
                            </div>
                          </div>

                          <MacOSButton icon="🎫" className="w-fit">
                            Register Now
                          </MacOSButton>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {trendingEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? (theme === 'dark' ? 'bg-purple-400' : 'bg-blue-600')
                      : (theme === 'dark' ? 'bg-white/30' : 'bg-slate-300')
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Why Choose Eviden?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Easy Event Creation',
                description: 'Create stunning events in minutes with our intuitive wizard.'
              },
              {
                icon: '📊',
                title: 'Powerful Analytics',
                description: 'Track attendance, engagement, and revenue with detailed insights.'
              },
              {
                icon: '🔒',
                title: 'Secure Platform',
                description: 'Enterprise-grade security for your events and attendee data.'
              },
              {
                icon: '📱',
                title: 'Mobile First',
                description: 'Optimized experience across all devices and platforms.'
              },
              {
                icon: '🎨',
                title: 'Beautiful Design',
                description: 'Premium glassmorphism UI that looks stunning everywhere.'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Optimized performance for the best user experience.'
              }
            ].map((feature, index) => (
              <GlassCard key={index} className="p-8 text-center hover:scale-105 transition-transform">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12 md:p-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Ready to Get Started?
            </h2>
            <p className={`text-lg md:text-xl mb-10 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Join thousands of organizers and attendees creating amazing experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <MacOSButton 
                size="lg" 
                icon="🎯"
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto"
              >
                Start Creating Events
              </MacOSButton>
              <MacOSButton 
                variant="secondary" 
                size="lg" 
                icon="📖"
                className="w-full sm:w-auto"
              >
                Learn More
              </MacOSButton>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 px-4 sm:px-6 lg:px-8 border-t ${
        theme === 'dark' ? 'border-white/10' : 'border-black/10'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-500'
                }`}>
                  <span className="text-white font-bold">E</span>
                </div>
                <span className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  Eviden
                </span>
              </div>
              <p className={`mb-4 max-w-md ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                The premium platform for creating unforgettable events and discovering amazing experiences.
              </p>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Platform
              </h4>
              <ul className={`space-y-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <li><Link to="/events" className="hover:underline">Browse Events</Link></li>
                <li><Link to="/event-create" className="hover:underline">Create Event</Link></li>
                <li><Link to="/pricing" className="hover:underline">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Support
              </h4>
              <ul className={`space-y-2 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`mt-12 pt-8 border-t text-center ${
            theme === 'dark' 
              ? 'border-white/10 text-slate-400' 
              : 'border-black/10 text-slate-600'
          }`}>
            <p>&copy; 2025 Eviden. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
