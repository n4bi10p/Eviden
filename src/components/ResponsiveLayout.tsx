import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Mobile: Sidebar as overlay, content takes full width */}
      <div className="lg:hidden">
        {/* Sidebar (overlay on mobile) */}
        <Sidebar />
        
        {/* Main Content - full width on mobile with responsive padding */}
        <main className="min-h-screen px-4 py-3 pt-20 sm:px-6 sm:py-4 md:px-8 md:py-6">
          <div className="w-full max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Desktop: Sidebar and content side by side with fluid layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar - responsive width */}
        <div className="w-64 xl:w-72 flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content - fluid width with responsive constraints */}
        <div className="flex-1 min-h-screen overflow-hidden">
          <main className="h-full px-6 py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10 overflow-y-auto">
            <div className="w-full max-w-none xl:max-w-6xl 2xl:max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
