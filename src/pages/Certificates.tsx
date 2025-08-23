import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/GlassCard';
import MacOSButton from '../components/MacOSButton';
import { useTheme } from '../contexts/ThemeContext';

const Certificates: React.FC = () => {
  const { theme } = useTheme();
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const certificates = [
    {
      id: 1,
      eventName: 'Blockchain Summit 2025',
      organizer: 'TechCorp Events',
      date: 'March 15, 2025',
      location: 'San Francisco, CA',
      verificationScore: 98,
      blockchainHash: '0x7b2c3f8e9a1d5c4b6e8f9a2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z',
      attendees: 245,
      verified: true,
      type: 'attendance',
      nftImage: '🏆'
    },
    {
      id: 2,
      eventName: 'Web3 Developer Workshop',
      organizer: 'DevCommunity',
      date: 'February 28, 2025',
      location: 'Austin, TX',
      verificationScore: 95,
      blockchainHash: '0x8c3d4f9e0b2e6d5c7f9e0a3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z1a',
      attendees: 89,
      verified: true,
      type: 'completion',
      nftImage: '🎓'
    },
    {
      id: 3,
      eventName: 'DeFi Security Bootcamp',
      organizer: 'BlockchainEdu',
      date: 'January 20, 2025',
      location: 'Virtual Event',
      verificationScore: 92,
      blockchainHash: '0x9d4e5f0e1c3f7e6d8f0e1b4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z2b',
      attendees: 156,
      verified: true,
      type: 'achievement',
      nftImage: '🛡️'
    }
  ];

  return (
    <div className="flex min-h-screen bg-pastel-gradient">
      <Sidebar userType="attendee" />
      
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white/60' : 'text-macos-gray-800'
          }`}>
            My Certificates 🏆
          </h1>
          <p className={`${
            theme === 'dark' ? 'text-white/40' : 'text-macos-gray-600'
          }`}>
            Your verified blockchain credentials and achievements
          </p>
        </div>

        {!selectedCertificate ? (
          // Certificate Grid
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-blue-400/60' : 'text-macos-blue'
                }`}>{certificates.length}</div>
                <div className={`${
                  theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
                }`}>Total Certificates</div>
              </GlassCard>
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-green-400/60' : 'text-macos-green'
                }`}>
                  {Math.round(certificates.reduce((acc, cert) => acc + cert.verificationScore, 0) / certificates.length)}%
                </div>
                <div className={`${
                  theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
                }`}>Avg. Verification</div>
              </GlassCard>
              <GlassCard className="text-center">
                <div className={`text-3xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-purple-400/60' : 'text-macos-purple'
                }`}>
                  {certificates.reduce((acc, cert) => acc + cert.attendees, 0)}
                </div>
                <div className={`${
                  theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
                }`}>Community Reach</div>
              </GlassCard>
            </div>

            {/* Certificate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <GlassCard 
                  key={certificate.id} 
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => setSelectedCertificate(certificate)}
                >
                  {/* Certificate Badge */}
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-macos-blue to-macos-teal rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-glow-blue">
                      {certificate.nftImage}
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${certificate.type === 'attendance' 
                        ? theme === 'dark' 
                          ? 'bg-blue-400/20 text-blue-400/80' 
                          : 'bg-macos-blue/20 text-macos-blue'
                        : certificate.type === 'completion' 
                        ? theme === 'dark'
                          ? 'bg-green-400/20 text-green-400/80'
                          : 'bg-macos-green/20 text-macos-green'
                        : theme === 'dark'
                          ? 'bg-purple-400/20 text-purple-400/80'
                          : 'bg-macos-purple/20 text-macos-purple'}
                    `}>
                      {certificate.type}
                    </span>
                  </div>

                  {/* Certificate Info */}
                  <h3 className={`font-bold mb-2 text-center ${
                    theme === 'dark' ? 'text-white/60' : 'text-macos-gray-800'
                  }`}>
                    {certificate.eventName}
                  </h3>
                  <p className={`text-sm text-center mb-3 ${
                    theme === 'dark' ? 'text-white/40' : 'text-macos-gray-600'
                  }`}>
                    {certificate.organizer}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={`${
                        theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
                      }`}>Date:</span>
                      <span className={`${
                        theme === 'dark' ? 'text-white/50' : 'text-macos-gray-800'
                      }`}>{certificate.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${
                        theme === 'dark' ? 'text-white/30' : 'text-macos-gray-600'
                      }`}>Verification:</span>
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-green-400/80' : 'text-macos-green'
                      }`}>{certificate.verificationScore}%</span>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  {certificate.verified && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-macos-green">
                      <span>✓</span>
                      <span className="text-sm font-medium">Blockchain Verified</span>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        ) : (
          // Certificate Detail View
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <MacOSButton 
              variant="secondary" 
              className="mb-6"
              onClick={() => setSelectedCertificate(null)}
              icon="←"
            >
              Back to Certificates
            </MacOSButton>

            {/* Certificate Wallet-style Display */}
            <GlassCard className="relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-macos-blue/20 via-macos-purple/20 to-macos-teal/20"></div>
              
              <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-macos-blue to-macos-teal rounded-2xl flex items-center justify-center text-2xl shadow-glow-blue">
                      {selectedCertificate.nftImage}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-macos-gray-800">
                        {selectedCertificate.eventName}
                      </h1>
                      <p className="text-macos-gray-600">{selectedCertificate.organizer}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-macos-green mb-1">
                      {selectedCertificate.verificationScore}%
                    </div>
                    <p className="text-sm text-macos-gray-600">Verification Score</p>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-macos-gray-800 mb-4">Event Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-macos-gray-600">Date:</span>
                        <span className="text-macos-gray-800">{selectedCertificate.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-macos-gray-600">Location:</span>
                        <span className="text-macos-gray-800">{selectedCertificate.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-macos-gray-600">Attendees:</span>
                        <span className="text-macos-gray-800">{selectedCertificate.attendees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-macos-gray-600">Type:</span>
                        <span className="text-macos-gray-800 capitalize">{selectedCertificate.type}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-macos-gray-800 mb-4">Blockchain Verification</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-macos-gray-600 block mb-1">Transaction Hash:</span>
                        <code className="text-xs bg-macos-gray-100 p-2 rounded-lg block font-mono break-all">
                          {selectedCertificate.blockchainHash}
                        </code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-macos-green">✓</span>
                        <span className="text-sm text-macos-green font-medium">
                          Verified on Aptos Blockchain
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <MacOSButton size="lg" icon="🔗">
                    View on Blockchain
                  </MacOSButton>
                  <MacOSButton variant="secondary" size="lg" icon="📤">
                    Share Certificate
                  </MacOSButton>
                  <MacOSButton variant="secondary" size="lg" icon="💾">
                    Download PDF
                  </MacOSButton>
                </div>
              </div>
            </GlassCard>

            {/* Additional Metadata */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="font-semibold text-macos-gray-800 mb-4">Certificate Metadata</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-macos-gray-600">Certificate ID:</span>
                    <span className="text-macos-gray-800">#{selectedCertificate.id.toString().padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-macos-gray-600">Issue Date:</span>
                    <span className="text-macos-gray-800">{selectedCertificate.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-macos-gray-600">Blockchain:</span>
                    <span className="text-macos-gray-800">Aptos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-macos-gray-600">Standard:</span>
                    <span className="text-macos-gray-800">NFT Certificate</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold text-macos-gray-800 mb-4">Verification History</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-macos-green rounded-full"></div>
                    <div className="text-sm">
                      <p className="text-macos-gray-800">Certificate issued</p>
                      <p className="text-macos-gray-500">{selectedCertificate.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-macos-blue rounded-full"></div>
                    <div className="text-sm">
                      <p className="text-macos-gray-800">Blockchain verification</p>
                      <p className="text-macos-gray-500">{selectedCertificate.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-macos-purple rounded-full"></div>
                    <div className="text-sm">
                      <p className="text-macos-gray-800">Community validation</p>
                      <p className="text-macos-gray-500">{selectedCertificate.date}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
