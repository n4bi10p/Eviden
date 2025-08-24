import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  priceRange: 'all' | 'free' | 'paid' | 'premium';
  eventType: 'all' | 'workshop' | 'conference' | 'meetup' | 'webinar';
  sortBy: 'relevance' | 'date' | 'price' | 'rating';
  customDateStart?: string;
  customDateEnd?: string;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  price: number;
  type: 'workshop' | 'conference' | 'meetup' | 'webinar';
  rating: number;
  attendees: number;
  imageUrl?: string;
  tags: string[];
  organizer: string;
}

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  initialQuery?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  onResultSelect, 
  initialQuery = '' 
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    category: 'all',
    location: '',
    dateRange: 'all',
    priceRange: 'all',
    eventType: 'all',
    sortBy: 'relevance'
  });

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Blockchain Fundamentals Workshop',
      description: 'Learn the basics of blockchain technology and its applications in modern business.',
      category: 'Technology',
      location: 'San Francisco, CA',
      date: '2025-03-15',
      price: 0,
      type: 'workshop',
      rating: 4.8,
      attendees: 124,
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
      tags: ['blockchain', 'crypto', 'beginner', 'technology'],
      organizer: 'TechCorp Education'
    },
    {
      id: '2',
      title: 'Web3 Development Conference 2025',
      description: 'Join leading developers and entrepreneurs shaping the future of decentralized web.',
      category: 'Technology',
      location: 'New York, NY',
      date: '2025-04-20',
      price: 299,
      type: 'conference',
      rating: 4.9,
      attendees: 850,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      tags: ['web3', 'development', 'networking', 'conference'],
      organizer: 'Web3 Foundation'
    },
    {
      id: '3',
      title: 'Smart Contract Security Meetup',
      description: 'Discuss best practices for securing smart contracts and DeFi protocols.',
      category: 'Security',
      location: 'Austin, TX',
      date: '2025-02-28',
      price: 0,
      type: 'meetup',
      rating: 4.6,
      attendees: 45,
      tags: ['security', 'smart-contracts', 'defi', 'meetup'],
      organizer: 'Security Guild'
    },
    {
      id: '4',
      title: 'NFT Art Creation Webinar',
      description: 'Create and mint your first NFT collection with professional artists.',
      category: 'Art & Design',
      location: 'Online',
      date: '2025-03-05',
      price: 49,
      type: 'webinar',
      rating: 4.7,
      attendees: 234,
      imageUrl: 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=400',
      tags: ['nft', 'art', 'digital', 'creative'],
      organizer: 'Digital Artists Collective'
    },
    {
      id: '5',
      title: 'DeFi Investment Strategies',
      description: 'Advanced strategies for yield farming and liquidity provision.',
      category: 'Finance',
      location: 'Chicago, IL',
      date: '2025-03-25',
      price: 199,
      type: 'workshop',
      rating: 4.5,
      attendees: 67,
      tags: ['defi', 'finance', 'investment', 'yield-farming'],
      organizer: 'DeFi Academy'
    }
  ];

  // Search suggestions
  const searchSuggestions = [
    'blockchain workshop',
    'web3 conference',
    'smart contracts',
    'nft creation',
    'defi strategies',
    'crypto meetup',
    'ethereum development',
    'solidity course'
  ];

  const categories = [
    'all', 'Technology', 'Finance', 'Art & Design', 'Security', 
    'Education', 'Gaming', 'Healthcare', 'Real Estate'
  ];

  const locations = [
    '', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 
    'Chicago, IL', 'Los Angeles, CA', 'Boston, MA', 'Online'
  ];

  // Perform search
  const performSearch = () => {
    setIsLoading(true);
    setShowSuggestions(false);
    
    // Simulate API call
    setTimeout(() => {
      let filtered = [...mockResults];

      // Filter by query
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filtered = filtered.filter(result => 
          result.title.toLowerCase().includes(query) ||
          result.description.toLowerCase().includes(query) ||
          result.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Filter by category
      if (filters.category !== 'all') {
        filtered = filtered.filter(result => result.category === filters.category);
      }

      // Filter by location
      if (filters.location) {
        filtered = filtered.filter(result => 
          result.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Filter by price range
      if (filters.priceRange !== 'all') {
        switch (filters.priceRange) {
          case 'free':
            filtered = filtered.filter(result => result.price === 0);
            break;
          case 'paid':
            filtered = filtered.filter(result => result.price > 0 && result.price < 100);
            break;
          case 'premium':
            filtered = filtered.filter(result => result.price >= 100);
            break;
        }
      }

      // Filter by event type
      if (filters.eventType !== 'all') {
        filtered = filtered.filter(result => result.type === filters.eventType);
      }

      // Sort results
      switch (filters.sortBy) {
        case 'date':
          filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        case 'price':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        default: // relevance
          // Keep original order for relevance
          break;
      }

      setResults(filtered);
      setIsLoading(false);
    }, 800);
  };

  // Auto-search on filter changes
  useEffect(() => {
    if (filters.query || filters.category !== 'all' || filters.location) {
      performSearch();
    }
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      location: '',
      dateRange: 'all',
      priceRange: 'all',
      eventType: 'all',
      sortBy: 'relevance'
    });
    setResults([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, query: suggestion }));
    setShowSuggestions(false);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'workshop': return '🛠️';
      case 'conference': return '🏛️';
      case 'meetup': return '👥';
      case 'webinar': return '💻';
      default: return '📅';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Advanced Search 🔍
          </h2>
          <p className={`${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            Find the perfect events for you
          </p>
        </div>

        <MacOSButton
          variant="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          icon={isExpanded ? '🔼' : '🔽'}
        >
          {isExpanded ? 'Simple Search' : 'Advanced Filters'}
        </MacOSButton>
      </div>

      {/* Search Input */}
      <GlassCard className="p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search events, topics, organizers..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none ${
              theme === 'dark'
                ? 'bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400'
                : 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-500 focus:border-blue-500'
            }`}
          />
          <button
            onClick={performSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <span className="text-xl">🔍</span>
          </button>

          {/* Search Suggestions */}
          {showSuggestions && filters.query === '' && (
            <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl shadow-xl z-10 ${
              theme === 'dark' 
                ? 'bg-slate-800/90 backdrop-blur-sm border border-white/10' 
                : 'bg-white/90 backdrop-blur-sm border border-slate-200'
            }`}>
              <div className={`text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/80' : 'text-slate-700'
              }`}>
                Popular searches:
              </div>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/50 border-slate-200 text-slate-800'
                  }`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="">All Locations</option>
                  {locations.filter(loc => loc !== '').map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">$1 - $99</option>
                  <option value="premium">$100+</option>
                </select>
              </div>

              {/* Event Type Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>
                  Event Type
                </label>
                <select
                  value={filters.eventType}
                  onChange={(e) => handleFilterChange('eventType', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border transition-all focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">All Types</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="meetup">Meetup</option>
                  <option value="webinar">Webinar</option>
                </select>
              </div>
            </div>

            {/* Sort and Clear */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-4">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                }`}>
                  Sort by:
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className={`px-3 py-2 rounded-lg border transition-all focus:outline-none ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              <MacOSButton
                variant="secondary"
                onClick={clearFilters}
                icon="🧹"
              >
                Clear Filters
              </MacOSButton>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Results Count & Loading */}
      {(results.length > 0 || isLoading) && (
        <div className={`flex justify-between items-center ${
          theme === 'dark' ? 'text-white/70' : 'text-slate-600'
        }`}>
          <span>
            {isLoading ? 'Searching...' : `${results.length} events found`}
          </span>
          {isLoading && (
            <div className="flex space-x-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((result) => (
          <GlassCard 
            key={result.id} 
            className="p-6 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => onResultSelect?.(result)}
          >
            {/* Result Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(result.type)}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  {result.type}
                </span>
              </div>
              <div className={`text-lg font-bold ${
                result.price === 0 ? 'text-green-500' : 'text-blue-500'
              }`}>
                {formatPrice(result.price)}
              </div>
            </div>

            {/* Result Image */}
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={result.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}

            {/* Result Content */}
            <div className="space-y-3">
              <h3 className={`font-bold text-lg leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                {result.title}
              </h3>
              
              <p className={`text-sm line-clamp-2 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-600'
              }`}>
                {result.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {result.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className={`text-xs px-2 py-1 rounded-full ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white/60' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Result Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${
                    theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                  }`}>
                    📍 {result.location}
                  </span>
                </div>
                <div>
                  <span className={`${
                    theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                  }`}>
                    📅 {new Date(result.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className={`${
                    theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                  }`}>
                    {result.rating}
                  </span>
                </div>
                <div>
                  <span className={`${
                    theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                  }`}>
                    👥 {result.attendees} attending
                  </span>
                </div>
              </div>

              <div className={`text-xs ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                by {result.organizer}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* No Results */}
      {!isLoading && results.length === 0 && filters.query && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            No events found
          </h3>
          <p className={`mb-4 ${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            Try adjusting your search criteria or browse our popular events.
          </p>
          <MacOSButton onClick={clearFilters}>
            Clear All Filters
          </MacOSButton>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
