import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import ResponsiveLayout from '../components/ResponsiveLayout';
import GlassCard from '../components/GlassCard';
import { apiService } from '../services/ApiService';
import { walletService } from '../services/WalletService';

interface Certificate {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  certificate_type: 'attendance' | 'participation' | 'completion' | 'achievement';
  nft_token_id: string;
  nft_metadata_url: string;
  blockchain_hash: string;
  issued_at: string;
  issuer_name: string;
  certificate_image_url: string;
  verification_url: string;
  attributes: {
    attendance_duration?: string;
    participation_score?: number;
    achievement_level?: string;
    skills_acquired?: string[];
  };
}

const CertificateGallery: React.FC = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'attendance' | 'participation' | 'completion' | 'achievement'>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [mintingCertificate, setMintingCertificate] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
    checkWalletConnection();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const response = await apiService.getUserCertificates(user.id);
      
      if (response.success) {
        setCertificates(response.data.certificates || []);
      } else {
        console.error('Failed to fetch certificates:', response.message);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    try {
      const connected = await walletService.isConnected();
      setWalletConnected(connected);
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      await walletService.connectWallet();
      setWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const mintCertificateNFT = async (certificate: Certificate) => {
    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setMintingCertificate(certificate.id);
    try {
      const response = await apiService.mintCertificate(certificate.id);
      
      if (response.success) {
        // Update certificate with NFT data
        setCertificates(prev => 
          prev.map(cert => 
            cert.id === certificate.id 
              ? { ...cert, nft_token_id: response.data.token_id, blockchain_hash: response.data.transaction_hash }
              : cert
          )
        );
        alert('Certificate minted as NFT successfully!');
      } else {
        throw new Error(response.message || 'Failed to mint NFT');
      }
    } catch (error) {
      console.error('Failed to mint certificate NFT:', error);
      alert('Failed to mint certificate as NFT. Please try again.');
    } finally {
      setMintingCertificate(null);
    }
  };

  const downloadCertificate = (certificate: Certificate) => {
    if (certificate.certificate_image_url) {
      const link = document.createElement('a');
      link.href = certificate.certificate_image_url;
      link.download = `${certificate.event_name}_certificate.png`;
      link.click();
    }
  };

  const shareCertificate = (certificate: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `${certificate.event_name} Certificate`,
        text: `I received a certificate for completing ${certificate.event_name}!`,
        url: certificate.verification_url
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(certificate.verification_url);
      alert('Certificate link copied to clipboard!');
    }
  };

  const getCertificateTypeIcon = (type: string) => {
    switch (type) {
      case 'attendance': return '✅';
      case 'participation': return '🏆';
      case 'completion': return '🎓';
      case 'achievement': return '🌟';
      default: return '📜';
    }
  };

  const getCertificateTypeColor = (type: string) => {
    switch (type) {
      case 'attendance': return theme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'participation': return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
      case 'completion': return theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
      case 'achievement': return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
      default: return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const filteredCertificates = filter === 'all' 
    ? certificates 
    : certificates.filter(cert => cert.certificate_type === filter);

  return (
    <ResponsiveLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <h1 className={`text-responsive-2xl sm:text-responsive-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Certificate Gallery 🏆
          </h1>
          <p className={`text-responsive-sm sm:text-responsive-base ${
            theme === 'dark' ? 'text-cyber-cyan/80' : 'text-slate-700'
          }`}>
            View and manage your event certificates and NFTs
          </p>
        </header>

        {/* Wallet Connection */}
        {!walletConnected && (
          <GlassCard className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className={`text-responsive-lg font-semibold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  Connect Wallet for NFT Features
                </h3>
                <p className={`text-responsive-sm ${
                  theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
                }`}>
                  Connect your Aptos wallet to mint certificates as NFTs
                </p>
              </div>
              <button
                onClick={connectWallet}
                className={`px-4 sm:px-6 py-2 rounded-lg transition-colors touch-friendly ${
                  theme === 'dark' 
                    ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Connect Wallet
              </button>
            </div>
          </GlassCard>
        )}

        {/* Filters */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'attendance', 'participation', 'completion', 'achievement'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 rounded-lg text-responsive-sm font-medium transition-colors touch-friendly ${
                  filter === filterType
                    ? (theme === 'dark' 
                        ? 'bg-cyber-cyan text-black' 
                        : 'bg-blue-600 text-white')
                    : (theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                {getCertificateTypeIcon(filterType)} {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <GlassCard className="text-center">
            <div className="text-responsive-xl sm:text-responsive-2xl font-bold text-cyber-cyan mb-1">
              {certificates.length}
            </div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Total Certificates
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-responsive-xl sm:text-responsive-2xl font-bold text-green-400 mb-1">
              {certificates.filter(c => c.nft_token_id).length}
            </div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Minted NFTs
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-responsive-xl sm:text-responsive-2xl font-bold text-purple-400 mb-1">
              {certificates.filter(c => c.certificate_type === 'achievement').length}
            </div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Achievements
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="text-responsive-xl sm:text-responsive-2xl font-bold text-yellow-400 mb-1">
              {new Set(certificates.map(c => c.event_id)).size}
            </div>
            <div className={`text-responsive-xs sm:text-responsive-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Events Attended
            </div>
          </GlassCard>
        </div>

        {/* Certificate Grid */}
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📜</div>
            <p className={`text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
            }`}>
              Loading certificates...
            </p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏆</div>
            <h3 className={`text-responsive-lg sm:text-responsive-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-800'
            }`}>
              No Certificates Yet
            </h3>
            <p className={`mb-3 sm:mb-4 text-responsive-sm sm:text-responsive-base ${
              theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-600'
            }`}>
              Attend events to earn certificates and NFTs
            </p>
            <button
              onClick={() => navigate('/events/discover')}
              className={`px-4 sm:px-6 py-2 rounded-lg transition-colors touch-friendly ${
                theme === 'dark' 
                  ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Discover Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {filteredCertificates.map(certificate => (
              <GlassCard key={certificate.id} className="hover:scale-[1.02] transition-transform cursor-pointer">
                <div onClick={() => setSelectedCertificate(certificate)}>
                  {/* Certificate Image */}
                  <div className="relative mb-3 sm:mb-4">
                    {certificate.certificate_image_url ? (
                      <img
                        src={certificate.certificate_image_url}
                        alt={`${certificate.event_name} Certificate`}
                        className="w-full h-36 sm:h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className={`w-full h-36 sm:h-48 rounded-lg flex items-center justify-center ${
                        theme === 'dark' ? 'bg-cyber-purple/20' : 'bg-gray-100'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{getCertificateTypeIcon(certificate.certificate_type)}</div>
                          <p className={`text-responsive-xs sm:text-responsive-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Certificate
                          </p>
                        </div>
                      </div>
                    )}

                    {/* NFT Badge */}
                    {certificate.nft_token_id && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-responsive-xs font-medium">
                        NFT
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-responsive-xs font-medium ${
                      theme === 'dark' 
                        ? 'bg-black/50 text-white' 
                        : 'bg-white/90 text-gray-800'
                    }`}>
                      {getCertificateTypeIcon(certificate.certificate_type)} {certificate.certificate_type}
                    </div>
                  </div>

                  {/* Certificate Info */}
                  <div className="mb-3">
                    <h3 className={`font-semibold mb-2 line-clamp-2 text-responsive-sm sm:text-responsive-base ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {certificate.event_name}
                    </h3>
                    
                    <div className={`text-responsive-xs sm:text-responsive-sm space-y-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <p><strong>Venue:</strong> {certificate.venue_name}</p>
                      <p><strong>Date:</strong> {new Date(certificate.event_date).toLocaleDateString()}</p>
                      <p><strong>Issued:</strong> {new Date(certificate.issued_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadCertificate(certificate);
                    }}
                    className={`flex-1 px-2 sm:px-3 py-1.5 text-responsive-xs rounded transition-colors touch-friendly ${
                      theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    📥 Download
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareCertificate(certificate);
                    }}
                    className={`flex-1 px-2 sm:px-3 py-1.5 text-responsive-xs rounded transition-colors touch-friendly ${
                      theme === 'dark' 
                        ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    📤 Share
                  </button>

                  {!certificate.nft_token_id && walletConnected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        mintCertificateNFT(certificate);
                      }}
                      disabled={mintingCertificate === certificate.id}
                      className={`w-full px-2 sm:px-3 py-1.5 text-responsive-xs rounded transition-colors disabled:opacity-50 touch-friendly ${
                        theme === 'dark' 
                          ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {mintingCertificate === certificate.id ? '⏳ Minting...' : '🪙 Mint as NFT'}
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Certificate Details Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
            <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <h2 className={`text-responsive-xl sm:text-responsive-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  Certificate Details
                </h2>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className={`text-responsive-xl sm:text-responsive-2xl touch-friendly ${
                    theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ×
                </button>
              </div>

              {/* Certificate Image */}
              {selectedCertificate.certificate_image_url && (
                <img
                  src={selectedCertificate.certificate_image_url}
                  alt={`${selectedCertificate.event_name} Certificate`}
                  className="w-full rounded-lg mb-4 sm:mb-6"
                />
              )}

              {/* Certificate Information */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className={`text-responsive-lg ${getCertificateTypeColor(selectedCertificate.certificate_type)} mb-1`}>
                    {getCertificateTypeIcon(selectedCertificate.certificate_type)} {selectedCertificate.event_name}
                  </h3>
                  <p className={`text-responsive-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {selectedCertificate.certificate_type.charAt(0).toUpperCase() + selectedCertificate.certificate_type.slice(1)} Certificate
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className={`text-responsive-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-700'
                    }`}>
                      Event Details
                    </p>
                    <div className={`text-responsive-xs sm:text-responsive-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <p><strong>Venue:</strong> {selectedCertificate.venue_name}</p>
                      <p><strong>Date:</strong> {new Date(selectedCertificate.event_date).toLocaleDateString()}</p>
                      <p><strong>Issuer:</strong> {selectedCertificate.issuer_name}</p>
                    </div>
                  </div>

                  <div>
                    <p className={`text-responsive-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-700'
                    }`}>
                      Certificate Details
                    </p>
                    <div className={`text-responsive-xs sm:text-responsive-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <p><strong>Issued:</strong> {new Date(selectedCertificate.issued_at).toLocaleDateString()}</p>
                      <p><strong>Certificate ID:</strong> {selectedCertificate.id.slice(0, 8)}...</p>
                      {selectedCertificate.nft_token_id && (
                        <p><strong>NFT Token:</strong> {selectedCertificate.nft_token_id}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attributes */}
                {selectedCertificate.attributes && Object.keys(selectedCertificate.attributes).length > 0 && (
                  <div>
                    <p className={`text-responsive-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-700'
                    }`}>
                      Additional Information
                    </p>
                    <div className={`text-responsive-xs sm:text-responsive-sm space-y-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedCertificate.attributes.attendance_duration && (
                        <p><strong>Duration:</strong> {selectedCertificate.attributes.attendance_duration}</p>
                      )}
                      {selectedCertificate.attributes.participation_score && (
                        <p><strong>Score:</strong> {selectedCertificate.attributes.participation_score}/100</p>
                      )}
                      {selectedCertificate.attributes.achievement_level && (
                        <p><strong>Level:</strong> {selectedCertificate.attributes.achievement_level}</p>
                      )}
                      {selectedCertificate.attributes.skills_acquired && (
                        <div>
                          <strong>Skills:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedCertificate.attributes.skills_acquired.map(skill => (
                              <span key={skill} className={`px-2 py-1 rounded text-responsive-xs ${
                                theme === 'dark' 
                                  ? 'bg-cyber-purple/30 text-cyber-cyan' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blockchain Info */}
                {selectedCertificate.blockchain_hash && (
                  <div>
                    <p className={`text-responsive-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-cyber-cyan/70' : 'text-gray-700'
                    }`}>
                      Blockchain Verification
                    </p>
                    <div className={`text-responsive-xs font-mono p-2 rounded break-all ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-gray-100'
                    }`}>
                      {selectedCertificate.blockchain_hash}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => downloadCertificate(selectedCertificate)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors touch-friendly ${
                    theme === 'dark' 
                      ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  📥 Download
                </button>
                
                <button
                  onClick={() => shareCertificate(selectedCertificate)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors touch-friendly ${
                    theme === 'dark' 
                      ? 'bg-cyber-purple/30 text-cyber-cyan hover:bg-cyber-purple/50' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  📤 Share
                </button>

                {!selectedCertificate.nft_token_id && walletConnected && (
                  <button
                    onClick={() => mintCertificateNFT(selectedCertificate)}
                    disabled={mintingCertificate === selectedCertificate.id}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 touch-friendly ${
                      theme === 'dark' 
                        ? 'bg-cyber-cyan text-black hover:bg-cyber-cyan/80' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {mintingCertificate === selectedCertificate.id ? '⏳ Minting...' : '🪙 Mint as NFT'}
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default CertificateGallery;
