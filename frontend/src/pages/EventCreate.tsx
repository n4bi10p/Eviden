import React, { useState } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import EventCreationWizard from '../components/EventCreationWizard';
import MacOSButton from '../components/MacOSButton';
import { useTheme } from '../contexts/ThemeContext';

const EventCreate: React.FC = () => {
  const { theme } = useTheme();
  const [showWizard, setShowWizard] = useState(true);

  const handleEventCreated = (eventData: any) => {
    console.log('Event created:', eventData);
    setShowWizard(false);
    // Handle successful event creation
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex-1">
            <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Create New Event ✨
            </h1>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
            }`}>
              Set up a new event with blockchain-verified attendance
            </p>
          </div>
        </header>

        {!showWizard ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-responsive-4xl mb-4">🎉</div>
            <h2 className={`text-responsive-xl sm:text-responsive-2xl font-bold mb-4 sm:mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Event Created Successfully!
            </h2>
            <MacOSButton onClick={() => setShowWizard(true)} icon="➕">
              Create Another Event
            </MacOSButton>
          </div>
        ) : null}

        {/* Event Creation Wizard Component */}
        <EventCreationWizard 
          isOpen={showWizard}
          onClose={handleCloseWizard}
          onSubmit={handleEventCreated}
        />
      </div>
    </ResponsiveLayout>
  );
};

export default EventCreate;
