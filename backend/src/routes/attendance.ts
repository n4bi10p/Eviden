import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

const router = Router();

// Simple file-based storage for attendance
const ATTENDANCE_FILE = path.join(process.cwd(), 'data', 'attendance.json');

interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  registrationDate: string;
  checkInStatus: 'pending' | 'checked-in' | 'no-show';
  checkInTime?: string;
  qrCodeData?: string;
}

// Load attendance records from file
function loadAttendance(): Map<string, AttendanceRecord> {
  try {
    if (fs.existsSync(ATTENDANCE_FILE)) {
      const data = fs.readFileSync(ATTENDANCE_FILE, 'utf-8');
      const recordsArray = JSON.parse(data);
      return new Map(recordsArray);
    }
  } catch (error) {
    console.error('Error loading attendance from file:', error);
  }
  return new Map();
}

// Save attendance records to file
function saveAttendance(records: Map<string, AttendanceRecord>): void {
  try {
    const recordsArray = Array.from(records.entries());
    const dataDir = path.dirname(ATTENDANCE_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(ATTENDANCE_FILE, JSON.stringify(recordsArray, null, 2));
  } catch (error) {
    console.error('Error saving attendance to file:', error);
  }
}

// Initialize attendance records
const attendanceRecords = loadAttendance();

// Register for event (creates attendance record)
router.post('/register', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { eventId, attendeeName, attendeeEmail } = req.body;
  const userId = req.user?.id;

  if (!eventId || !attendeeName || !attendeeEmail) {
    throw new ValidationError('Event ID, attendee name, and email are required');
  }

  const recordId = `${eventId}_${userId}_${Date.now()}`;
  
  const attendanceRecord: AttendanceRecord = {
    id: recordId,
    eventId,
    userId: userId!,
    attendeeName,
    attendeeEmail,
    registrationDate: new Date().toISOString(),
    checkInStatus: 'pending'
  };

  attendanceRecords.set(recordId, attendanceRecord);
  saveAttendance(attendanceRecords);

  res.status(201).json({
    success: true,
    message: 'Successfully registered for event',
    data: {
      registrationId: recordId,
      eventId,
      status: 'pending'
    }
  });
}));

// Get event attendance records (for organizers)
router.get('/event/:eventId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  
  const eventAttendance = Array.from(attendanceRecords.values())
    .filter(record => record.eventId === eventId);

  const stats = {
    total: eventAttendance.length,
    checkedIn: eventAttendance.filter(r => r.checkInStatus === 'checked-in').length,
    pending: eventAttendance.filter(r => r.checkInStatus === 'pending').length,
    noShow: eventAttendance.filter(r => r.checkInStatus === 'no-show').length
  };

  res.json({
    success: true,
    data: {
      attendees: eventAttendance,
      stats
    }
  });
}));

// Check-in attendee via QR scan
router.post('/checkin', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { qrData, eventId } = req.body;

  if (!qrData || !eventId) {
    throw new ValidationError('QR data and event ID are required');
  }

  try {
    const parsedQR = JSON.parse(qrData);
    
    if (parsedQR.eventId !== eventId) {
      throw new ValidationError('QR code is not valid for this event');
    }

    // Find attendance record
    const recordKey = Array.from(attendanceRecords.keys())
      .find(key => {
        const record = attendanceRecords.get(key);
        return record?.userId === parsedQR.userId && 
               record?.eventId === eventId &&
               record?.attendeeEmail === parsedQR.email;
      });

    if (!recordKey) {
      throw new NotFoundError('Attendance record not found');
    }

    const record = attendanceRecords.get(recordKey)!;
    
    if (record.checkInStatus === 'checked-in') {
      return res.status(400).json({
        success: false,
        message: 'Attendee already checked in',
        data: { 
          checkInTime: record.checkInTime,
          attendeeName: record.attendeeName 
        }
      });
    }

    // Update check-in status
    record.checkInStatus = 'checked-in';
    record.checkInTime = new Date().toISOString();
    attendanceRecords.set(recordKey, record);
    saveAttendance(attendanceRecords);

    res.json({
      success: true,
      message: 'Check-in successful',
      data: {
        attendeeName: record.attendeeName,
        attendeeEmail: record.attendeeEmail,
        checkInTime: record.checkInTime
      }
    });

  } catch (error) {
    throw new ValidationError('Invalid QR code format');
  }
}));

// Get user's attendance records
router.get('/my-events', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  const userAttendance = Array.from(attendanceRecords.values())
    .filter(record => record.userId === userId);

  res.json({
    success: true,
    data: userAttendance
  });
}));

// Update attendance status (for organizers)
router.patch('/status/:recordId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { recordId } = req.params;
  const { status } = req.body;

  if (!['pending', 'checked-in', 'no-show'].includes(status)) {
    throw new ValidationError('Invalid status. Must be: pending, checked-in, or no-show');
  }

  const record = attendanceRecords.get(recordId);
  if (!record) {
    throw new NotFoundError('Attendance record not found');
  }

  record.checkInStatus = status;
  if (status === 'checked-in' && !record.checkInTime) {
    record.checkInTime = new Date().toISOString();
  }

  attendanceRecords.set(recordId, record);
  saveAttendance(attendanceRecords);

  res.json({
    success: true,
    message: 'Attendance status updated',
    data: record
  });
}));

// Generate QR code for attendee
router.get('/qr/:eventId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const userId = req.user?.id;

  // Find user's registration for this event
  const userRecord = Array.from(attendanceRecords.values())
    .find(record => record.eventId === eventId && record.userId === userId);

  if (!userRecord) {
    throw new NotFoundError('Registration not found for this event');
  }

  const qrData = {
    eventId,
    userId,
    email: userRecord.attendeeEmail,
    name: userRecord.attendeeName,
    timestamp: Date.now(),
    type: 'attendee'
  };

  res.json({
    success: true,
    data: {
      qrData: JSON.stringify(qrData),
      attendeeName: userRecord.attendeeName,
      attendeeEmail: userRecord.attendeeEmail,
      registrationDate: userRecord.registrationDate
    }
  });
}));

export default router;
