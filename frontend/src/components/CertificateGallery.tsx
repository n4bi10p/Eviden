import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useWalletAuth } from '../contexts/WalletAuthContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';
import { ApiService } from '../services/ApiService';

interface Certificate {
  id: string;
  title: string;
  eventName: string;
  issuer: string;
  issueDate: string;
  tier: 'Bronze' | 'Silver' | 'Gold';
  description: string;
  tokenId: string;
  verified: boolean;
  imageUrl?: string;
}

interface CertificateGalleryProps {
  certificates?: Certificate[];
}

const CertificateGallery: React.FC<CertificateGalleryProps> = ({ certificates: propCerts }) => {
  const { theme } = useTheme();
  const { user } = useWalletAuth();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [filter, setFilter] = useState<'all' | 'Bronze' | 'Silver' | 'Gold'>('all');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user?.address) return;
      
      try {
        setLoading(true);
        const apiService = new ApiService();
        const response = await apiService.getUserCertificates(user.address);
        
        if (response.success) {
          setCertificates(response.data.certificates || []);
        } else {
          throw new Error(response.message || 'Failed to fetch certificates');
        }
      } catch (err) {
        console.error('Error fetching certificates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load certificates');
        // Fallback to mock data
        setCertificates(mockCertificates);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user?.address]);

  // Mock certificates data
  const mockCertificates: Certificate[] = propCerts || [
    {
      id: '1',
      title: 'Blockchain Fundamentals Completion',
      eventName: 'Web3 Summit 2025',
      issuer: 'Eviden Platform',
      issueDate: '2025-02-15',
      tier: 'Gold',
      description: 'Completed comprehensive blockchain fundamentals course with distinction',
      tokenId: 'APT_CERT_001',
      verified: true,
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400'
    },
    {
      id: '2',
      title: 'Smart Contract Development',
      eventName: 'DeFi Workshop Series',
      issuer: 'TechCorp Education',
      issueDate: '2025-01-28',
      tier: 'Silver',
      description: 'Successfully developed and deployed smart contracts on Aptos',
      tokenId: 'APT_CERT_002',
      verified: true
    },
    {
      id: '3',
      title: 'Event Attendance Certificate',
      eventName: 'Blockchain Innovation Conference',
      issuer: 'Innovation Hub',
      issueDate: '2025-01-10',
      tier: 'Bronze',
      description: 'Attended full-day blockchain innovation conference',
      tokenId: 'APT_CERT_003',
      verified: true
    },
    {
      id: '4',
      title: 'Community Leadership',
      eventName: 'Web3 Community Meetup',
      issuer: 'Community DAO',
      issueDate: '2024-12-20',
      tier: 'Gold',
      description: 'Outstanding leadership in community building and engagement',
      tokenId: 'APT_CERT_004',
      verified: true
    },
    {
      id: '5',
      title: 'Peer Validation Expert',
      eventName: 'Multiple Events',
      issuer: 'Eviden Platform',
      issueDate: '2024-12-01',
      tier: 'Silver',
      description: 'Completed 50+ peer validations with 98% accuracy rate',
      tokenId: 'APT_CERT_005',
      verified: true
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return 'from-yellow-400 to-orange-500';
      case 'Silver':
        return 'from-gray-300 to-gray-500';
      case 'Bronze':
        return 'from-orange-400 to-red-600';
      default:
        return 'from-blue-400 to-purple-600';
    }
  };

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '🏆';
    }
  };

  const filteredCertificates = filter === 'all' 
    ? certificates 
    : certificates.filter(cert => cert.tier === filter);

  const handleShare = (cert: Certificate) => {
    // Simulate sharing functionality
    if (navigator.share) {
      navigator.share({
        title: cert.title,
        text: `I earned a ${cert.tier} certificate for ${cert.title}!`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `I earned a ${cert.tier} certificate for ${cert.title} from ${cert.issuer}! 🏆`;
      navigator.clipboard.writeText(shareText);
      alert('Certificate details copied to clipboard!');
    }
  };

  const handleDownload = (cert: Certificate) => {
    // Simulate download functionality
    const element = document.createElement('a');
    const file = new Blob([`Certificate: ${cert.title}\nIssuer: ${cert.issuer}\nToken ID: ${cert.tokenId}`], 
      { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${cert.title.replace(/\s+/g, '_')}_Certificate.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️ {error}</div>
        <MacOSButton 
          onClick={() => window.location.reload()} 
          variant="secondary"
        >
          Retry
        </MacOSButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Certificate Gallery 🏆
          </h2>
          <p className={`${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            Your blockchain-verified achievements
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'Gold', 'Silver', 'Bronze'].map((tierFilter) => (
            <button
              key={tierFilter}
              onClick={() => setFilter(tierFilter as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tierFilter
                  ? 'bg-blue-500 text-white shadow-lg'
                  : theme === 'dark'
                    ? 'bg-white/10 text-white/70 hover:bg-white/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tierFilter === 'all' ? 'All' : `${getTierEmoji(tierFilter)} ${tierFilter}`}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['all', 'Gold', 'Silver', 'Bronze'].map((tier) => {
          const count = tier === 'all' 
            ? certificates.length 
            : certificates.filter(c => c.tier === tier).length;
          
          return (
            <GlassCard key={tier} className="text-center p-4">
              <div className="text-2xl font-bold text-blue-500 mb-1">
                {count}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-600'
              }`}>
                {tier === 'all' ? 'Total' : tier} {tier === 'all' ? 'Certificates' : ''}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((cert) => (
          <GlassCard 
            key={cert.id} 
            className="p-6 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => setSelectedCert(cert)}
          >
            {/* Certificate Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTierColor(cert.tier)} text-white shadow-lg`}>
                {getTierEmoji(cert.tier)} {cert.tier}
              </div>
              <div className="flex items-center space-x-2">
                {cert.verified && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Image/Icon */}
            <div className="mb-4">
              {cert.imageUrl ? (
                <img 
                  src={cert.imageUrl} 
                  alt={cert.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${getTierColor(cert.tier)} flex items-center justify-center`}>
                  <span className="text-4xl">🏆</span>
                </div>
              )}
            </div>

            {/* Certificate Info */}
            <div className="space-y-2">
              <h3 className={`font-semibold text-lg leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                {cert.title}
              </h3>
              
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {cert.eventName}
              </p>
              
              <div className="flex justify-between items-center text-sm">
                <span className={`${
                  theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                }`}>
                  {cert.issuer}
                </span>
                <span className={`${
                  theme === 'dark' ? 'text-white/50' : 'text-slate-500'
                }`}>
                  {new Date(cert.issueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex space-x-2">
              <button
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white/80 hover:bg-white/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleShare(cert);
                }}
              >
                Share
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleDownload(cert);
                }}
              >
                Download
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          />
          
          <div className="relative z-10 w-full max-w-lg mx-4">
            <GlassCard className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getTierColor(selectedCert.tier)} text-white shadow-lg`}>
                  {getTierEmoji(selectedCert.tier)} {selectedCert.tier} Certificate
                </div>
                <button
                  onClick={() => setSelectedCert(null)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                      : 'hover:bg-black/10 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Certificate Image */}
              <div className="mb-6">
                {selectedCert.imageUrl ? (
                  <img 
                    src={selectedCert.imageUrl} 
                    alt={selectedCert.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${getTierColor(selectedCert.tier)} flex items-center justify-center`}>
                    <span className="text-6xl">🏆</span>
                  </div>
                )}
              </div>

              {/* Certificate Details */}
              <div className="space-y-4 mb-6">
                <h2 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}>
                  {selectedCert.title}
                </h2>
                
                <p className={`${
                  theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                }`}>
                  {selectedCert.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Event:
                    </span>
                    <br />
                    <span className={`${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {selectedCert.eventName}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Issuer:
                    </span>
                    <br />
                    {selectedCert.issuer}
                  </div>
                  <div>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Issue Date:
                    </span>
                    <br />
                    {new Date(selectedCert.issueDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      Token ID:
                    </span>
                    <br />
                    <span className="font-mono text-xs">
                      {selectedCert.tokenId}
                    </span>
                  </div>
                </div>

                {/* Verification Status */}
                <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                  selectedCert.verified 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-orange-500/20 text-orange-600'
                }`}>
                  <span className="text-lg">
                    {selectedCert.verified ? '✅' : '⏳'}
                  </span>
                  <span className="font-medium">
                    {selectedCert.verified ? 'Verified on Blockchain' : 'Verification Pending'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <MacOSButton 
                  variant="secondary"
                  onClick={() => handleShare(selectedCert)}
                  icon="📤"
                >
                  Share Certificate
                </MacOSButton>
                <MacOSButton 
                  onClick={() => handleDownload(selectedCert)}
                  icon="⬇️"
                >
                  Download
                </MacOSButton>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCertificates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            No {filter !== 'all' ? filter : ''} certificates found
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            {filter !== 'all' 
              ? `You haven't earned any ${filter} certificates yet.`
              : "You haven't earned any certificates yet. Attend events to start collecting!"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificateGallery;
