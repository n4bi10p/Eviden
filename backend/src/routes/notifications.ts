import { Router, Request, Response } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { emailService } from '../services/EmailService';

const router = Router();

// Mock notification storage (replace with database in production)
interface Notification {
  id: string;
  user_address: string;
  type: 'event_reminder' | 'check_in_success' | 'validation_received' | 'certificate_earned' | 'event_update' | 'system_update';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: number;
  read_at?: number;
  priority: 'low' | 'medium' | 'high';
  category: 'event' | 'validation' | 'certificate' | 'system' | 'social';
}

const notifications: Map<string, Notification> = new Map();

// Initialize with mock notifications
const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    user_address: 'alice.johnson@eviden.com',
    type: 'certificate_earned',
    title: 'Certificate Earned! 🏆',
    message: 'Congratulations! You earned a Gold certificate for attending Web3 Summit 2025.',
    data: {
      event_id: 'event_123',
      event_name: 'Web3 Summit 2025',
      certificate_tier: 'Gold'
    },
    is_read: false,
    created_at: Math.floor(Date.now() / 1000) - 1800,
    priority: 'high',
    category: 'certificate'
  },
  {
    id: 'notif_2',
    user_address: 'alice.johnson@eviden.com',
    type: 'validation_received',
    title: 'Peer Validation Received',
    message: 'You received a validation from alex_crypto for attending Blockchain Workshop.',
    data: {
      validator_address: 'alex.chen@eviden.com',
      validator_username: 'alex_crypto',
      event_id: 'event_456'
    },
    is_read: true,
    created_at: Math.floor(Date.now() / 1000) - 3600,
    read_at: Math.floor(Date.now() / 1000) - 1800,
    priority: 'medium',
    category: 'validation'
  },
  {
    id: 'notif_3',
    user_address: 'alice.johnson@eviden.com',
    type: 'event_reminder',
    title: 'Event Starting Soon! ⏰',
    message: 'DeFi Workshop Series starts in 30 minutes. Don\'t forget to check in!',
    data: {
      event_id: 'event_789',
      event_name: 'DeFi Workshop Series',
      start_time: Math.floor(Date.now() / 1000) + 1800
    },
    is_read: false,
    created_at: Math.floor(Date.now() / 1000) - 300,
    priority: 'high',
    category: 'event'
  }
];

mockNotifications.forEach(notification => {
  notifications.set(notification.id, notification);
});

/**
 * @route GET /api/notifications
 * @desc Get user's notifications with pagination and filtering
 * @access Private
 */
router.get('/',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      is_read,
      priority,
      from_date,
      to_date
    } = req.query as any;

    const userAddress = req.user!.address;

    // Get user's notifications
    let userNotifications = Array.from(notifications.values())
      .filter(notification => notification.user_address === userAddress);

    // Apply filters
    if (type) {
      userNotifications = userNotifications.filter(notif => notif.type === type);
    }

    if (category) {
      userNotifications = userNotifications.filter(notif => notif.category === category);
    }

    if (is_read !== undefined) {
      const readStatus = is_read === 'true';
      userNotifications = userNotifications.filter(notif => notif.is_read === readStatus);
    }

    if (priority) {
      userNotifications = userNotifications.filter(notif => notif.priority === priority);
    }

    if (from_date) {
      const fromTimestamp = parseInt(from_date);
      userNotifications = userNotifications.filter(notif => notif.created_at >= fromTimestamp);
    }

    if (to_date) {
      const toTimestamp = parseInt(to_date);
      userNotifications = userNotifications.filter(notif => notif.created_at <= toTimestamp);
    }

    // Sort by creation time (newest first)
    userNotifications.sort((a, b) => b.created_at - a.created_at);

    // Calculate pagination
    const total = userNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedNotifications = userNotifications.slice(offset, offset + limit);

    // Calculate unread count
    const unreadCount = userNotifications.filter(notif => !notif.is_read).length;

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        unread_count: unreadCount
      }
    });
  })
);

/**
 * @route GET /api/notifications/:id
 * @desc Get specific notification by ID
 * @access Private
 */
router.get('/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user!.address;

    const notification = notifications.get(id);
    if (!notification) {
      throw new NotFoundError('Notification');
    }

    // Check if notification belongs to user
    if (notification.user_address !== userAddress) {
      throw new NotFoundError('Notification');
    }

    res.json({
      success: true,
      data: { notification }
    });
  })
);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put('/:id/read',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user!.address;

    const notification = notifications.get(id);
    if (!notification) {
      throw new NotFoundError('Notification');
    }

    // Check if notification belongs to user
    if (notification.user_address !== userAddress) {
      throw new NotFoundError('Notification');
    }

    // Mark as read
    notification.is_read = true;
    notification.read_at = Math.floor(Date.now() / 1000);
    notifications.set(id, notification);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  })
);

/**
 * @route PUT /api/notifications/:id/unread
 * @desc Mark notification as unread
 * @access Private
 */
router.put('/:id/unread',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user!.address;

    const notification = notifications.get(id);
    if (!notification) {
      throw new NotFoundError('Notification');
    }

    // Check if notification belongs to user
    if (notification.user_address !== userAddress) {
      throw new NotFoundError('Notification');
    }

    // Mark as unread
    notification.is_read = false;
    notification.read_at = undefined;
    notifications.set(id, notification);

    res.json({
      success: true,
      message: 'Notification marked as unread',
      data: { notification }
    });
  })
);

/**
 * @route PUT /api/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/read-all',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userAddress = req.user!.address;
    const currentTime = Math.floor(Date.now() / 1000);

    let updatedCount = 0;

    // Mark all user's notifications as read
    for (const [id, notification] of notifications.entries()) {
      if (notification.user_address === userAddress && !notification.is_read) {
        notification.is_read = true;
        notification.read_at = currentTime;
        notifications.set(id, notification);
        updatedCount++;
      }
    }

    res.json({
      success: true,
      message: `${updatedCount} notifications marked as read`,
      data: {
        updated_count: updatedCount
      }
    });
  })
);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete specific notification
 * @access Private
 */
router.delete('/:id',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userAddress = req.user!.address;

    const notification = notifications.get(id);
    if (!notification) {
      throw new NotFoundError('Notification');
    }

    // Check if notification belongs to user
    if (notification.user_address !== userAddress) {
      throw new NotFoundError('Notification');
    }

    // Delete notification
    notifications.delete(id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  })
);

/**
 * @route DELETE /api/notifications/clear-read
 * @desc Delete all read notifications
 * @access Private
 */
router.delete('/clear-read',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userAddress = req.user!.address;
    let deletedCount = 0;

    // Delete all read notifications for the user
    for (const [id, notification] of notifications.entries()) {
      if (notification.user_address === userAddress && notification.is_read) {
        notifications.delete(id);
        deletedCount++;
      }
    }

    res.json({
      success: true,
      message: `${deletedCount} read notifications cleared`,
      data: {
        deleted_count: deletedCount
      }
    });
  })
);

/**
 * @route GET /api/notifications/stats
 * @desc Get notification statistics for user
 * @access Private
 */
router.get('/stats',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userAddress = req.user!.address;

    const userNotifications = Array.from(notifications.values())
      .filter(notification => notification.user_address === userAddress);

    const stats = {
      total: userNotifications.length,
      unread: userNotifications.filter(notif => !notif.is_read).length,
      read: userNotifications.filter(notif => notif.is_read).length,
      by_category: {
        event: userNotifications.filter(notif => notif.category === 'event').length,
        validation: userNotifications.filter(notif => notif.category === 'validation').length,
        certificate: userNotifications.filter(notif => notif.category === 'certificate').length,
        system: userNotifications.filter(notif => notif.category === 'system').length,
        social: userNotifications.filter(notif => notif.category === 'social').length
      },
      by_priority: {
        high: userNotifications.filter(notif => notif.priority === 'high').length,
        medium: userNotifications.filter(notif => notif.priority === 'medium').length,
        low: userNotifications.filter(notif => notif.priority === 'low').length
      },
      recent_activity: userNotifications
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 5)
        .map(notif => ({
          id: notif.id,
          type: notif.type,
          title: notif.title,
          created_at: notif.created_at,
          is_read: notif.is_read
        }))
    };

    res.json({
      success: true,
      data: stats
    });
  })
);

// Helper function to create notification (used internally)
export const createNotification = (
  userAddress: string,
  type: Notification['type'],
  title: string,
  message: string,
  data?: any,
  priority: Notification['priority'] = 'medium',
  category: Notification['category'] = 'system'
): string => {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const notification: Notification = {
    id,
    user_address: userAddress,
    type,
    title,
    message,
    data,
    is_read: false,
    created_at: Math.floor(Date.now() / 1000),
    priority,
    category
  };

  notifications.set(id, notification);
  
  // Here you would also emit via Socket.IO for real-time notifications
  // io.to(userAddress).emit('notification', notification);
  
  return id;
};

// Helper function to create notifications for multiple users
export const createBulkNotifications = (
  userAddresses: string[],
  type: Notification['type'],
  title: string,
  message: string,
  data?: any,
  priority: Notification['priority'] = 'medium',
  category: Notification['category'] = 'system'
): string[] => {
  const ids: string[] = [];
  
  userAddresses.forEach(address => {
    const id = createNotification(address, type, title, message, data, priority, category);
    ids.push(id);
  });
  
  return ids;
};

/**
 * @route POST /api/notifications/test
 * @desc Create test notification (development only)
 * @access Private
 */
router.post('/test',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userAddress = req.user!.address;
    const {
      type = 'system_update',
      title = 'Test Notification',
      message = 'This is a test notification from the API',
      priority = 'medium',
      category = 'system'
    } = req.body;

    const notificationId = createNotification(
      userAddress,
      type,
      title,
      message,
      { test: true },
      priority,
      category
    );

    const notification = notifications.get(notificationId);

    res.json({
      success: true,
      message: 'Test notification created successfully',
      data: { notification }
    });
  })
);

// Test email endpoint
router.post('/test-email', 
  asyncHandler(async (req: Request, res: Response) => {
    const { recipientEmail, type = 'welcome', data = {} } = req.body;

    if (!recipientEmail) {
      throw new ValidationError('Recipient email is required');
    }

    try {
      // Send test email
      const emailSent = await emailService.sendTemplateEmail(
        recipientEmail,
        type,
        {
          username: data.username || 'Test User',
          walletAddress: data.walletAddress || 'test.user@eviden.com',
          eventName: data.eventName || 'Attestify Email Test',
          message: data.message || 'This is a test email from your Attestify backend server!',
          ...data
        },
        `🧪 Test Email from Attestify - ${type}`
      );

      if (emailSent) {
        res.json({
          success: true,
          message: `Test email sent successfully to ${recipientEmail}`,
          data: {
            recipientEmail,
            emailType: type,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to send test email',
          error: 'Email service returned false'
        });
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: error.message
      });
    }
  })
);

export default router;
