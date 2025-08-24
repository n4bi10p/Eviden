import React from 'react';
import ResponsiveLayout from '../components/ResponsiveLayout';
import CertificateGallery from '../components/CertificateGallery';
import { useTheme } from '../contexts/ThemeContext';

const Certificates: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            My Certificates 🏆
          </h1>
          <p className={`text-responsive-sm sm:text-responsive-base ${
            theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
          }`}>
            Your verified blockchain credentials and achievements
          </p>
        </header>

        {/* Certificate Gallery Component */}
        <CertificateGallery />
      </div>
    </ResponsiveLayout>
  );
};

export default Certificates;
