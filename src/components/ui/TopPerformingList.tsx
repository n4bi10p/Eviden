import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Star, Users, TrendingUp } from 'lucide-react';

interface TopPerformingItem {
  id: string;
  rank: number;
  title: string;
  subtitle?: string;
  value: string | number;
  valueType?: 'currency' | 'number' | 'percentage';
  metric?: string;
  rating?: number;
  attendees?: number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  avatar?: string;
  status?: 'active' | 'completed' | 'upcoming';
}

interface TopPerformingListProps {
  title: string;
  items: TopPerformingItem[];
  showRank?: boolean;
  showMetrics?: boolean;
  maxItems?: number;
  className?: string;
}

const TopPerformingList: React.FC<TopPerformingListProps> = ({
  title,
  items,
  showRank = true,
  showMetrics = true,
  maxItems = 5,
  className = ''
}) => {
  const { theme } = useTheme();

  const displayItems = items.slice(0, maxItems);

  const formatValue = (value: string | number, type?: string) => {
    if (type === 'currency') {
      return typeof value === 'number' ? `$${value.toLocaleString()}` : value;
    }
    if (type === 'percentage') {
      return typeof value === 'number' ? `${value}%` : value;
    }
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 2:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
      case 3:
        return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      default:
        return theme === 'dark' 
          ? 'bg-white/5 text-white/70 border-white/10'
          : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'upcoming':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-slate-800'
        }`}>
          {title}
        </h3>
      </div>

      {/* List */}
      <div className="space-y-3">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={`
              flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]
              ${theme === 'dark' 
                ? 'bg-white/5 hover:bg-white/10 border border-white/10' 
                : 'bg-white hover:bg-slate-50 border border-slate-200'
              }
            `}
          >
            {/* Rank */}
            {showRank && (
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold
                ${getRankColor(item.rank)}
              `}>
                {item.rank}
              </div>
            )}

            {/* Avatar/Status */}
            <div className="relative">
              {item.avatar ? (
                <img 
                  src={item.avatar} 
                  alt={item.title}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}
                `}>
                  <TrendingUp className={`w-5 h-5 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
              )}
              
              {item.status && (
                <div className={`
                  absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2
                  ${getStatusColor(item.status)}
                  ${theme === 'dark' ? 'border-slate-800' : 'border-white'}
                `} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium truncate ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    {item.title}
                  </h4>
                  
                  {item.subtitle && (
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                    }`}>
                      {item.subtitle}
                    </p>
                  )}

                  {/* Metrics */}
                  {showMetrics && (item.rating || item.attendees) && (
                    <div className="flex items-center gap-3 mt-2">
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                          }`}>
                            {item.rating}
                          </span>
                        </div>
                      )}
                      
                      {item.attendees && (
                        <div className="flex items-center gap-1">
                          <Users className={`w-3 h-3 ${
                            theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                          }`} />
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                          }`}>
                            {item.attendees} attendees
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Value */}
                <div className="text-right ml-4">
                  <div className={`font-semibold ${
                    item.valueType === 'currency' 
                      ? 'text-green-500' 
                      : theme === 'dark' 
                        ? 'text-white' 
                        : 'text-slate-800'
                  }`}>
                    {formatValue(item.value, item.valueType)}
                  </div>
                  
                  {item.metric && (
                    <div className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                    }`}>
                      {item.metric}
                    </div>
                  )}

                  {item.change && (
                    <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                      item.change.isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.change.isPositive ? '↗' : '↘'}
                      {item.change.value}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformingList;
