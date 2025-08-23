import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  avatar?: boolean;
}

// Loading Spinner Component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-transparent border-t-current',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
};

// Loading Overlay Component
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  className,
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 flex flex-col items-center justify-center z-50',
          'backdrop-blur-sm rounded-lg',
          theme === 'dark' ? 'bg-black/50' : 'bg-white/80'
        )}>
          <LoadingSpinner size="lg" color={theme === 'dark' ? 'white' : 'blue'} />
          <p className={cn(
            'mt-4 text-sm font-medium',
            theme === 'dark' ? 'text-white' : 'text-slate-700'
          )}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

// Loading Skeleton Component
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  rows = 3,
  avatar = false,
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      {avatar && (
        <div className="flex items-center space-x-4">
          <div className={cn(
            'rounded-full w-12 h-12',
            theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'
          )} />
          <div className="space-y-2 flex-1">
            <div className={cn(
              'h-4 rounded w-1/4',
              theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'
            )} />
            <div className={cn(
              'h-3 rounded w-1/6',
              theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'
            )} />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className={cn(
              'h-4 rounded',
              theme === 'dark' ? 'bg-white/20' : 'bg-slate-200',
              index === 0 ? 'w-3/4' : index === rows - 1 ? 'w-1/2' : 'w-full'
            )} />
            {index < rows - 1 && (
              <div className={cn(
                'h-3 rounded w-5/6',
                theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Page Loading Component
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading page...' 
}) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" color={theme === 'dark' ? 'white' : 'blue'} />
        <p className={cn(
          'mt-4 text-lg font-medium',
          theme === 'dark' ? 'text-white' : 'text-slate-700'
        )}>
          {message}
        </p>
      </div>
    </div>
  );
};

// Button Loading Component
export const ButtonLoading: React.FC<{ 
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}> = ({ 
  isLoading, 
  children, 
  loadingText = 'Loading...' 
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size="sm" color="white" className="mr-2" />
      {loadingText}
    </div>
  );
};

// Card Loading Component
export const CardLoading: React.FC<{ count?: number }> = ({ count = 1 }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'p-6 rounded-xl border animate-pulse',
            theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
          )}
        >
          <LoadingSkeleton rows={3} avatar />
        </div>
      ))}
    </div>
  );
};

// Table Loading Component
export const TableLoading: React.FC<{ 
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => {
  const { theme } = useTheme();

  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className={cn(
        'grid gap-4 p-4 border-b',
        `grid-cols-${columns}`,
        theme === 'dark' ? 'border-white/10' : 'border-slate-200'
      )}>
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-4 rounded',
              theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'
            )}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            'grid gap-4 p-4 border-b',
            `grid-cols-${columns}`,
            theme === 'dark' ? 'border-white/10' : 'border-slate-200'
          )}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                'h-3 rounded',
                theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Export LoadingSpinner as default
export default LoadingSpinner;
