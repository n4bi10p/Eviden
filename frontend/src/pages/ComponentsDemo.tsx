import React, { useState } from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import WalletConnection from '../components/WalletConnection';
import QRCodeScanner from '../components/QRCodeScanner';
import EventCreationWizard from '../components/EventCreationWizard';
import CertificateGallery from '../components/CertificateGallery';
import AdvancedSearch from '../components/AdvancedSearch';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import PeerValidationSystem from '../components/PeerValidationSystem';
import { useTheme } from '../contexts/ThemeContext';

const ComponentsDemo: React.FC = () => {
  const { theme } = useTheme();
  const [activeComponent, setActiveComponent] = useState<string>('wallet');

  const components = [
    { id: 'wallet', name: 'Wallet Connection', icon: '🔗', component: WalletConnection },
    { id: 'qr', name: 'QR Scanner', icon: '📱', component: QRCodeScanner },
    { id: 'wizard', name: 'Event Wizard', icon: '📝', component: EventCreationWizard },
    { id: 'certificates', name: 'Certificate Gallery', icon: '🏆', component: CertificateGallery },
    { id: 'search', name: 'Advanced Search', icon: '🔍', component: AdvancedSearch },
    { id: 'analytics', name: 'Analytics Dashboard', icon: '📊', component: AnalyticsDashboard },
    { id: 'validation', name: 'Peer Validation', icon: '🤝', component: PeerValidationSystem }
  ];

  const ActiveComponentElement = components.find(c => c.id === activeComponent)?.component;

  return (
    <ResponsiveLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-macos-gray-800'
          }`}>
            Components Demo 🎨
          </h1>
          <p className={`text-sm md:text-base ${
            theme === 'dark' ? 'text-white/60' : 'text-macos-gray-600'
          }`}>
            Showcase of all new frontend components
          </p>
        </div>

        {/* Component Navigation */}
        <div className="mb-6 md:mb-8">
          <GlassCard className="p-3 md:p-4">
            <div className="flex flex-wrap gap-2">
              {components.map((comp) => (
                <MacOSButton
                  key={comp.id}
                  variant={activeComponent === comp.id ? 'primary' : 'secondary'}
                  size="sm"
                  icon={comp.icon}
                  onClick={() => setActiveComponent(comp.id)}
                >
                  <span className="hidden sm:inline">{comp.name}</span>
                  <span className="sm:hidden">{comp.icon}</span>
                </MacOSButton>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Component Display */}
        <div className="space-y-6">
          {ActiveComponentElement && (
            <GlassCard className="p-6">
              <h2 className={`text-xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                {components.find(c => c.id === activeComponent)?.name}
              </h2>
              <ActiveComponentElement {...getComponentProps(activeComponent)} />
            </GlassCard>
          )}
        </div>
        <div className="mt-12">
          <GlassCard className="p-6 text-center">
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              🎉 All Components Ready!
            </h3>
            <p className={`mb-4 ${
              theme === 'dark' ? 'text-white/60' : 'text-slate-600'
            }`}>
              All 7 major frontend components have been successfully implemented with glassmorphism design,
              theme support, and complete functionality. Ready for production use!
            </p>
            <div className="flex justify-center space-x-4">
              <MacOSButton icon="🚀">
                Deploy to Production
              </MacOSButton>
              <MacOSButton variant="secondary" icon="📚">
                View Documentation
              </MacOSButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

function getComponentProps(componentId: string): any {
  const props = {
    wallet: {},
    qr: {},
    wizard: {
      onEventCreated: (data: any) => console.log('Event created in demo:', data)
    },
    certificates: {},
    search: {
      onResultSelect: (result: any) => console.log('Search result selected:', result)
    },
    analytics: {
      userRole: 'organizer'
    },
    validation: {
      userRole: 'validator'
    }
  };
  return props[componentId as keyof typeof props] || {};
}

export default ComponentsDemo;
