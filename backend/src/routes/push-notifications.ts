import express, { Request, Response } from 'express';
import { webPushService } from '../services/WebPushService';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Get VAPID public key for frontend
router.get('/vapid-public-key', asyncHandler(async (req: Request, res: Response) => {
  try {
    const publicKey = webPushService.getVapidPublicKey();
    
    res.json({
      success: true,
      message: 'VAPID public key retrieved',
      data: { publicKey }
    });

  } catch (error: any) {
    console.error('❌ Error getting VAPID public key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get VAPID public key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Subscribe to push notifications
router.post('/subscribe', optionalAuth, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { subscription } = req.body;
    const userId = req.user?.id;
    const userAgent = req.get('User-Agent');

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data'
      });
    }

    const savedSubscription = await webPushService.saveSubscription(
      subscription,
      userId,
      userAgent
    );

    res.json({
      success: true,
      message: 'Push notification subscription saved',
      data: {
        subscriptionId: savedSubscription.id,
        isActive: savedSubscription.isActive
      }
    });

  } catch (error: any) {
    console.error('❌ Error saving push subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save push subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Send test notification
router.post('/send-test', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, body, url, icon } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const payload = {
      title: title || '🧪 Test Notification',
      body: body || 'This is a test push notification from Eviden',
      icon: icon || '/icons/test.png',
      url: url || '/dashboard',
      tag: 'test-notification',
      data: {
        type: 'test',
        timestamp: Date.now()
      }
    };

    const result = await webPushService.sendToUser(userId, payload);

    res.json({
      success: true,
      message: 'Test notification sent',
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error: any) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Send notification to specific user (admin only)
router.post('/send-to-user/:userId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    // In production, add admin role check
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const { userId } = req.params;
    const { title, body, icon, url, tag, requireInteraction, actions, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    const payload = {
      title,
      body,
      icon,
      url,
      tag,
      requireInteraction,
      actions,
      data: {
        ...data,
        timestamp: Date.now()
      }
    };

    const result = await webPushService.sendToUser(userId, payload);

    res.json({
      success: true,
      message: `Notification sent to user ${userId}`,
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error: any) {
    console.error('❌ Error sending notification to user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification to user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Send notification to all users (admin only)
router.post('/send-to-all', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    // In production, add admin role check
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const { title, body, icon, url, tag, requireInteraction, actions, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }

    const payload = {
      title,
      body,
      icon,
      url,
      tag,
      requireInteraction,
      actions,
      data: {
        ...data,
        timestamp: Date.now()
      }
    };

    const result = await webPushService.sendToAllUsers(payload);

    res.json({
      success: true,
      message: 'Notification sent to all users',
      data: {
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error: any) {
    console.error('❌ Error sending notification to all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification to all users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Send event notification
router.post('/send-event-notification', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      eventId, 
      type, 
      title, 
      body, 
      icon, 
      url, 
      customData 
    } = req.body;

    if (!eventId || !type) {
      return res.status(400).json({
        success: false,
        message: 'EventId and type are required'
      });
    }

    const validTypes = ['reminder', 'update', 'checkin', 'certificate'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    const customPayload = title || body || icon || url || customData ? {
      title,
      body,
      icon,
      url,
      data: customData
    } : undefined;

    const result = await webPushService.sendEventNotification(
      eventId,
      type,
      customPayload
    );

    res.json({
      success: true,
      message: `Event ${type} notification sent`,
      data: {
        eventId,
        type,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error: any) {
    console.error('❌ Error sending event notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send event notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get user's subscriptions
router.get('/subscriptions', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const subscriptions = await webPushService.getUserSubscriptions(userId);

    res.json({
      success: true,
      message: 'User subscriptions retrieved',
      data: {
        subscriptions: subscriptions.map(sub => ({
          id: sub.id,
          createdAt: sub.createdAt,
          lastUsed: sub.lastUsed,
          isActive: sub.isActive,
          userAgent: sub.userAgent
        })),
        count: subscriptions.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting user subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Deactivate subscription
router.post('/unsubscribe/:subscriptionId', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;

    await webPushService.deactivateSubscription(subscriptionId);

    res.json({
      success: true,
      message: 'Subscription deactivated',
      data: { subscriptionId }
    });

  } catch (error: any) {
    console.error('❌ Error deactivating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Get push notification statistics (admin only)
router.get('/statistics', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    // In production, add admin role check
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const stats = await webPushService.getStatistics();

    res.json({
      success: true,
      message: 'Push notification statistics retrieved',
      data: stats
    });

  } catch (error: any) {
    console.error('❌ Error getting push statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get push statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// Cleanup expired subscriptions (admin only)
router.post('/cleanup', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  try {
    // In production, add admin role check
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const cleanedCount = await webPushService.cleanupExpiredSubscriptions();

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired subscriptions`,
      data: { cleanedCount }
    });

  } catch (error: any) {
    console.error('❌ Error cleaning up subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired subscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

export default router;
