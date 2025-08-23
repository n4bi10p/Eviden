import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';

interface EventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

const EventCreationWizard: React.FC<EventWizardProps> = ({ isOpen, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventData, setEventData] = useState({
    // Basic Info
    title: '',
    description: '',
    category: '',
    
    // Date & Time
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'UTC',
    
    // Location
    locationType: 'physical', // physical, virtual, hybrid
    venue: '',
    address: '',
    virtualLink: '',
    
    // Tickets
    ticketType: 'free', // free, paid
    maxAttendees: '',
    price: '',
    currency: 'USD',
    
    // Additional
    banner: null,
    requirements: '',
    tags: []
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: '📝' },
    { id: 2, title: 'Schedule', icon: '📅' },
    { id: 3, title: 'Location', icon: '📍' },
    { id: 4, title: 'Tickets', icon: '🎫' },
    { id: 5, title: 'Review', icon: '✅' }
  ];

  const categories = [
    'Technology', 'Business', 'Education', 'Entertainment',
    'Health & Wellness', 'Sports', 'Art & Culture', 'Networking',
    'Community', 'Other'
  ];

  const handleInputChange = (field: string, value: any) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(eventData);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Event Title *
              </label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your event title"
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Category *
              </label>
              <select
                value={eventData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Description *
              </label>
              <textarea
                value={eventData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event..."
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={eventData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/20 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={eventData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/20 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={eventData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/20 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={eventData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/20 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Event Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'physical', label: 'Physical', icon: '🏢' },
                  { id: 'virtual', label: 'Virtual', icon: '💻' },
                  { id: 'hybrid', label: 'Hybrid', icon: '🌐' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleInputChange('locationType', type.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      eventData.locationType === type.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : theme === 'dark'
                          ? 'border-white/20 hover:border-white/40'
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {eventData.locationType !== 'virtual' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                  }`}>
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    value={eventData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Enter venue name"
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                  }`}>
                    Address *
                  </label>
                  <input
                    type="text"
                    value={eventData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </>
            )}
            
            {eventData.locationType !== 'physical' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                }`}>
                  Virtual Meeting Link *
                </label>
                <input
                  type="url"
                  value={eventData.virtualLink}
                  onChange={(e) => handleInputChange('virtualLink', e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Ticket Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'free', label: 'Free Event', icon: '🆓' },
                  { id: 'paid', label: 'Paid Event', icon: '💳' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => handleInputChange('ticketType', type.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      eventData.ticketType === type.id
                        ? 'border-blue-500 bg-blue-500/20'
                        : theme === 'dark'
                          ? 'border-white/20 hover:border-white/40'
                          : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-700'
              }`}>
                Maximum Attendees
              </label>
              <input
                type="number"
                value={eventData.maxAttendees}
                onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                placeholder="Enter max capacity"
                className={`w-full px-4 py-3 rounded-xl border transition-all ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>
            
            {eventData.ticketType === 'paid' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                  }`}>
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={eventData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-white/70' : 'text-slate-700'
                  }`}>
                    Currency *
                  </label>
                  <select
                    value={eventData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all ${
                      theme === 'dark' 
                        ? 'bg-white/10 border-white/20 text-white focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="APT">APT</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Review Your Event
            </h3>
            
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-white/20 bg-white/5' : 'border-slate-200 bg-slate-50'
              }`}>
                <h4 className={`font-semibold text-lg mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {eventData.title || 'Event Title'}
                </h4>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                }`}>
                  {eventData.category} • {eventData.locationType}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                  }`}>
                    Start:
                  </span>
                  <br />
                  {eventData.startDate} {eventData.startTime}
                </div>
                <div>
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                  }`}>
                    End:
                  </span>
                  <br />
                  {eventData.endDate} {eventData.endTime}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg ${
                eventData.ticketType === 'free' 
                  ? 'bg-green-500/20 text-green-600' 
                  : 'bg-blue-500/20 text-blue-600'
              }`}>
                <span className="font-medium">
                  {eventData.ticketType === 'free' 
                    ? '🆓 Free Event' 
                    : `💳 ${eventData.price} ${eventData.currency}`
                  }
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <GlassCard className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              Create New Event
            </h2>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                  : 'hover:bg-black/10 text-slate-500 hover:text-slate-700'
              }`}
            >
              ✕
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 flex-1 ${
                  index !== steps.length - 1 ? 'relative' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step.id
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'bg-white/10 text-white/50'
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs font-medium ${
                  currentStep >= step.id
                    ? theme === 'dark' ? 'text-white' : 'text-slate-800'
                    : theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                }`}>
                  {step.title}
                </span>
                {index !== steps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                    currentStep > step.id
                      ? 'bg-blue-500'
                      : theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-8 min-h-[300px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <MacOSButton
              onClick={prevStep}
              variant="secondary"
              disabled={currentStep === 1}
              className={currentStep === 1 ? 'invisible' : ''}
            >
              Previous
            </MacOSButton>
            
            <div className="flex space-x-3">
              <MacOSButton
                onClick={onClose}
                variant="secondary"
              >
                Cancel
              </MacOSButton>
              
              {currentStep === steps.length ? (
                <MacOSButton
                  onClick={handleSubmit}
                  icon="🚀"
                >
                  Create Event
                </MacOSButton>
              ) : (
                <MacOSButton
                  onClick={nextStep}
                  icon="→"
                >
                  Next
                </MacOSButton>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default EventCreationWizard;
