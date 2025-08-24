import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Clock, 
  QrCode, 
  Filter,
  Search,
  Calendar,
  MapPin,
  Eye
} from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';
import QRScanner from './QRScanner';
import { AttendeeQRData } from '../services/QRCodeService';

interface Attendee {
  id: string;
  name: string;
  email: string;
  registrationDate: string;
  checkInStatus: 'pending' | 'checked-in' | 'no-show';
  checkInTime?: string;
  qrCode?: string;
}

interface EventDetails {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string;
}

interface AttendanceDashboardProps {
  eventId: string;
}

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ eventId }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'checked-in' | 'no-show'>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockEvent: EventDetails = {
        id: eventId,
        title: 'Tech Conference 2025',
        date: '2025-08-24T10:00:00Z',
        location: 'Convention Center',
        capacity: 500,
        description: 'Annual technology conference with industry leaders'
      };

      const mockAttendees: Attendee[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          registrationDate: '2025-08-20T10:00:00Z',
          checkInStatus: 'pending'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          registrationDate: '2025-08-21T14:30:00Z',
          checkInStatus: 'checked-in',
          checkInTime: '2025-08-24T09:30:00Z'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          registrationDate: '2025-08-22T16:15:00Z',
          checkInStatus: 'pending'
        }
      ];

      setEventDetails(mockEvent);
      setAttendees(mockAttendees);
    } catch (error) {
      console.error('Failed to load event data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (qrData: AttendeeQRData) => {
    try {
      // Find attendee by email or userId
      const attendeeIndex = attendees.findIndex(
        a => a.email === qrData.email || a.id === qrData.userId
      );

      if (attendeeIndex !== -1) {
        const updatedAttendees = [...attendees];
        updatedAttendees[attendeeIndex] = {
          ...updatedAttendees[attendeeIndex],
          checkInStatus: 'checked-in',
          checkInTime: new Date().toISOString()
        };
        setAttendees(updatedAttendees);

        // Close scanner after successful check-in
        setIsScannerOpen(false);
        
        // Show success notification
        // You can add toast notification here
      } else {
        console.error('Attendee not found');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || attendee.checkInStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: attendees.length,
    checkedIn: attendees.filter(a => a.checkInStatus === 'checked-in').length,
    pending: attendees.filter(a => a.checkInStatus === 'pending').length,
    noShow: attendees.filter(a => a.checkInStatus === 'no-show').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      {eventDetails && (
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">{eventDetails.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(eventDetails.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{eventDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{stats.total} / {eventDetails.capacity} attendees</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsScannerOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Registered</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Checked In</p>
              <p className="text-xl font-bold text-white">{stats.checkedIn}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Attendance Rate</p>
              <p className="text-xl font-bold text-white">
                {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters and Search */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="checked-in">Checked In</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Attendees List */}
      <GlassCard className="overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Attendees List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Check-in Time</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.map((attendee) => (
                <motion.tr
                  key={attendee.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-4 text-white">{attendee.name}</td>
                  <td className="p-4 text-gray-400">{attendee.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attendee.checkInStatus === 'checked-in'
                          ? 'bg-green-500/20 text-green-400'
                          : attendee.checkInStatus === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {attendee.checkInStatus === 'checked-in' ? 'Checked In' :
                       attendee.checkInStatus === 'pending' ? 'Pending' : 'No Show'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {attendee.checkInTime 
                      ? new Date(attendee.checkInTime).toLocaleTimeString()
                      : '-'
                    }
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs transition-colors"
                      >
                        View QR
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredAttendees.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No attendees found matching your criteria.
            </div>
          )}
        </div>
      </GlassCard>

      {/* QR Scanner Modal */}
      {eventDetails && (
        <QRScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleQRScan}
          eventId={eventId}
          eventTitle={eventDetails.title}
        />
      )}
    </div>
  );
};

export default AttendanceDashboard;
