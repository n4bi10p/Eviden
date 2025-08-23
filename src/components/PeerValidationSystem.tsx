import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import MacOSButton from './MacOSButton';

interface ValidationRequest {
  id: string;
  type: 'attendance' | 'completion' | 'achievement';
  eventTitle: string;
  requesterName: string;
  requesterAvatar?: string;
  eventDate: string;
  description: string;
  evidence: {
    type: 'photo' | 'document' | 'qr_code' | 'certificate';
    url?: string;
    description: string;
  }[];
  submittedAt: string;
  deadline: string;
  rewardPoints: number;
  status: 'pending' | 'validated' | 'rejected' | 'expired';
  validatorsNeeded: number;
  currentValidators: number;
}

interface PeerValidationSystemProps {
  userRole?: 'validator' | 'requester';
}

const PeerValidationSystem: React.FC<PeerValidationSystemProps> = ({ 
  userRole = 'validator' 
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'my_requests'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [validationDecision, setValidationDecision] = useState<'approve' | 'reject' | null>(null);
  const [validationComment, setValidationComment] = useState('');

  // Mock validation requests
  const mockRequests: ValidationRequest[] = [
    {
      id: '1',
      type: 'attendance',
      eventTitle: 'Blockchain Fundamentals Workshop',
      requesterName: 'Alice Johnson',
      requesterAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b3d3?w=150',
      eventDate: '2025-02-15',
      description: 'Requesting validation for attending the full-day blockchain workshop',
      evidence: [
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
          description: 'Photo from the workshop venue'
        },
        {
          type: 'qr_code',
          description: 'Check-in QR code scan confirmation'
        }
      ],
      submittedAt: '2025-02-16T10:30:00Z',
      deadline: '2025-02-20T23:59:59Z',
      rewardPoints: 50,
      status: 'pending',
      validatorsNeeded: 3,
      currentValidators: 1
    },
    {
      id: '2',
      type: 'completion',
      eventTitle: 'Smart Contract Development Course',
      requesterName: 'Bob Smith',
      requesterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      eventDate: '2025-02-10',
      description: 'Completed all course modules and final project',
      evidence: [
        {
          type: 'certificate',
          url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400',
          description: 'Course completion certificate'
        },
        {
          type: 'document',
          description: 'Final project submission with smart contract code'
        }
      ],
      submittedAt: '2025-02-11T14:20:00Z',
      deadline: '2025-02-18T23:59:59Z',
      rewardPoints: 100,
      status: 'pending',
      validatorsNeeded: 5,
      currentValidators: 3
    },
    {
      id: '3',
      type: 'achievement',
      eventTitle: 'DeFi Hackathon 2025',
      requesterName: 'Carol Davis',
      requesterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      eventDate: '2025-01-28',
      description: 'Won 2nd place in the DeFi category with innovative lending protocol',
      evidence: [
        {
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
          description: 'Award ceremony photo'
        },
        {
          type: 'document',
          description: 'Official competition results and project documentation'
        }
      ],
      submittedAt: '2025-01-29T09:15:00Z',
      deadline: '2025-02-05T23:59:59Z',
      rewardPoints: 200,
      status: 'validated',
      validatorsNeeded: 5,
      currentValidators: 5
    },
    {
      id: '4',
      type: 'attendance',
      eventTitle: 'Web3 Community Meetup',
      requesterName: 'David Wilson',
      eventDate: '2025-02-08',
      description: 'Attended community meetup and participated in discussions',
      evidence: [
        {
          type: 'photo',
          description: 'Group photo with other attendees'
        }
      ],
      submittedAt: '2025-02-09T16:45:00Z',
      deadline: '2025-02-15T23:59:59Z',
      rewardPoints: 25,
      status: 'rejected',
      validatorsNeeded: 3,
      currentValidators: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'validated': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      case 'expired': return 'text-gray-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'validated': return '✅';
      case 'rejected': return '❌';
      case 'expired': return '⏰';
      default: return '📋';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attendance': return '👥';
      case 'completion': return '🎓';
      case 'achievement': return '🏆';
      default: return '📋';
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'photo': return '📸';
      case 'document': return '📄';
      case 'qr_code': return '📱';
      case 'certificate': return '🏆';
      default: return '📎';
    }
  };

  const filterRequests = (status: string) => {
    switch (status) {
      case 'pending':
        return mockRequests.filter(req => req.status === 'pending');
      case 'completed':
        return mockRequests.filter(req => req.status === 'validated' || req.status === 'rejected');
      case 'my_requests':
        return mockRequests; // In real app, filter by current user
      default:
        return mockRequests;
    }
  };

  const handleValidation = (decision: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    
    // Simulate validation submission
    console.log(`Validation decision: ${decision}`, {
      requestId: selectedRequest.id,
      comment: validationComment,
      decision
    });
    
    // Show success message
    alert(`Validation ${decision === 'approve' ? 'approved' : 'rejected'} successfully! You earned 10 validator points.`);
    
    // Reset form
    setValidationDecision(null);
    setValidationComment('');
    setSelectedRequest(null);
  };

  const filteredRequests = filterRequests(activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            Peer Validation System 🤝
          </h2>
          <p className={`${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            {userRole === 'validator' 
              ? 'Review and validate community event participation'
              : 'Submit requests for event validation'
            }
          </p>
        </div>

        {/* Validator Stats */}
        <div className="flex space-x-4">
          <GlassCard className="px-4 py-2">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-500">127</div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-white/60' : 'text-slate-600'
              }`}>
                Validated
              </div>
            </div>
          </GlassCard>
          <GlassCard className="px-4 py-2">
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">98%</div>
              <div className={`text-xs ${
                theme === 'dark' ? 'text-white/60' : 'text-slate-600'
              }`}>
                Accuracy
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'pending', label: 'Pending Validation', icon: '⏳' },
          { key: 'completed', label: 'Completed', icon: '✅' },
          { key: 'my_requests', label: 'My Requests', icon: '📋' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === tab.key
                ? 'bg-blue-500 text-white shadow-lg'
                : theme === 'dark'
                  ? 'bg-white/10 text-white/70 hover:bg-white/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              activeTab === tab.key
                ? 'bg-white/20 text-white'
                : 'bg-blue-500/20 text-blue-600'
            }`}>
              {filterRequests(tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      {activeTab === 'my_requests' && (
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className={`font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                Submit New Validation Request
              </h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-white/60' : 'text-slate-600'
              }`}>
                Request community validation for your event participation
              </p>
            </div>
            <MacOSButton icon="➕">
              New Request
            </MacOSButton>
          </div>
        </GlassCard>
      )}

      {/* Validation Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <GlassCard 
            key={request.id} 
            className="p-6 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => setSelectedRequest(request)}
          >
            {/* Request Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {request.requesterAvatar ? (
                  <img 
                    src={request.requesterAvatar} 
                    alt={request.requesterName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {request.requesterName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    {request.requesterName}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                  }`}>
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)} {request.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Request Type and Event */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{getTypeIcon(request.type)}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Validation
                </span>
              </div>
              
              <h3 className={`font-semibold text-lg mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-slate-800'
              }`}>
                {request.eventTitle}
              </h3>
              
              <p className={`text-sm ${
                theme === 'dark' ? 'text-white/70' : 'text-slate-600'
              }`}>
                {request.description}
              </p>
            </div>

            {/* Evidence Preview */}
            <div className="mb-4">
              <div className={`text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-white/80' : 'text-slate-700'
              }`}>
                Evidence ({request.evidence.length} items):
              </div>
              <div className="flex flex-wrap gap-2">
                {request.evidence.map((evidence, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs ${
                      theme === 'dark' 
                        ? 'bg-white/10 text-white/70' 
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span>{getEvidenceIcon(evidence.type)}</span>
                    <span>{evidence.type.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress and Rewards */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`${
                  theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                }`}>
                  Validators:
                </span>
                <div className="flex items-center space-x-1 mt-1">
                  <div className={`flex-1 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'
                  }`}>
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(request.currentValidators / request.validatorsNeeded) * 100}%` 
                      }}
                    />
                  </div>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                  }`}>
                    {request.currentValidators}/{request.validatorsNeeded}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className={`${
                  theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                }`}>
                  Reward:
                </span>
                <div className="text-lg font-bold text-green-500">
                  {request.rewardPoints} pts
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className={`mt-3 text-xs flex items-center justify-between ${
              theme === 'dark' ? 'text-white/50' : 'text-slate-500'
            }`}>
              <span>📅 Event: {new Date(request.eventDate).toLocaleDateString()}</span>
              <span>⏰ Deadline: {new Date(request.deadline).toLocaleDateString()}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Validation Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedRequest(null)}
          />
          
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <GlassCard className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Validation Request Details
                  </h2>
                  <p className={`${
                    theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                  }`}>
                    Review and validate this request
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                      : 'hover:bg-black/10 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* Request Info */}
              <div className="space-y-6">
                {/* Requester Info */}
                <div className="flex items-center space-x-4">
                  {selectedRequest.requesterAvatar ? (
                    <img 
                      src={selectedRequest.requesterAvatar} 
                      alt={selectedRequest.requesterName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {selectedRequest.requesterName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {selectedRequest.requesterName}
                    </h3>
                    <p className={`${
                      theme === 'dark' ? 'text-white/60' : 'text-slate-600'
                    }`}>
                      Requesting {selectedRequest.type} validation
                    </p>
                  </div>
                </div>

                {/* Event Details */}
                <div>
                  <h4 className={`font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Event Information
                  </h4>
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'
                  }`}>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      {selectedRequest.eventTitle}
                    </p>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                    }`}>
                      Date: {new Date(selectedRequest.eventDate).toLocaleDateString()}
                    </p>
                    <p className={`text-sm mt-2 ${
                      theme === 'dark' ? 'text-white/80' : 'text-slate-700'
                    }`}>
                      {selectedRequest.description}
                    </p>
                  </div>
                </div>

                {/* Evidence */}
                <div>
                  <h4 className={`font-semibold mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Submitted Evidence
                  </h4>
                  <div className="space-y-3">
                    {selectedRequest.evidence.map((evidence, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          theme === 'dark' 
                            ? 'bg-white/5 border-white/10' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">
                            {getEvidenceIcon(evidence.type)}
                          </span>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-slate-800'
                            }`}>
                              {evidence.type.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-white/70' : 'text-slate-600'
                            }`}>
                              {evidence.description}
                            </p>
                            {evidence.url && (
                              <img 
                                src={evidence.url} 
                                alt="Evidence"
                                className="mt-2 w-full max-w-xs h-32 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Form (only for pending requests) */}
                {selectedRequest.status === 'pending' && (
                  <div>
                    <h4 className={`font-semibold mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Your Validation
                    </h4>
                    
                    {/* Decision Buttons */}
                    <div className="flex space-x-3 mb-4">
                      <button
                        onClick={() => setValidationDecision('approve')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          validationDecision === 'approve'
                            ? 'bg-green-500 text-white shadow-lg'
                            : theme === 'dark'
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        ✅ Approve Validation
                      </button>
                      <button
                        onClick={() => setValidationDecision('reject')}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                          validationDecision === 'reject'
                            ? 'bg-red-500 text-white shadow-lg'
                            : theme === 'dark'
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        ❌ Reject Validation
                      </button>
                    </div>

                    {/* Comment */}
                    <textarea
                      placeholder="Add a comment (optional)"
                      value={validationComment}
                      onChange={(e) => setValidationComment(e.target.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all focus:outline-none ${
                        theme === 'dark'
                          ? 'bg-white/5 border-white/20 text-white placeholder-white/50 focus:border-blue-400'
                          : 'bg-white/50 border-slate-200 text-slate-800 placeholder-slate-500 focus:border-blue-500'
                      }`}
                      rows={3}
                    />

                    {/* Submit Button */}
                    <div className="mt-4 flex justify-end">
                      <MacOSButton
                        onClick={() => validationDecision && handleValidation(validationDecision)}
                        disabled={!validationDecision}
                        className={!validationDecision ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        Submit Validation
                      </MacOSButton>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className={`text-xl font-semibold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-slate-800'
          }`}>
            No validation requests found
          </h3>
          <p className={`${
            theme === 'dark' ? 'text-white/60' : 'text-slate-600'
          }`}>
            {activeTab === 'pending' 
              ? "There are no pending validations at the moment."
              : activeTab === 'my_requests'
              ? "You haven't submitted any validation requests yet."
              : "No completed validations to show."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PeerValidationSystem;
