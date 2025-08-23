import webpush from 'web-push';
import path from 'path';
import fs from 'fs/promises';
import config from '../config';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

export interface SavedSubscription extends PushSubscription {
  id: string;
  userId?: string;
  userAgent?: string;
  createdAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export class WebPushService {
  private subscriptionsDir: string;
  private vapidKeys: {
    publicKey: string;
    privateKey: string;
  };

  constructor() {
    this.subscriptionsDir = path.join(config.UPLOAD_DIR, 'push-subscriptions');
    this.vapidKeys = this.generateVapidKeys();
    this.initializeWebPush();
    this.initializeSubscriptionsDirectory();
  }

  private generateVapidKeys() {
    // Use generated VAPID keys or environment variables
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY || 'BMPxA7-g8E7lasWAjtiyDuC8OlOM9o44RFR75WPldb4r3YAvhk1kB5S1z0VKrd0F7fBuErrBrOvOEluiBuu_BbU',
      privateKey: process.env.VAPID_PRIVATE_KEY || 'Ahe-BPtkuNJpuo3PnN6CcRnh4fu0xFo3Olg8j59jOE8'
    };
  }

  private initializeWebPush(): void {
    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      'mailto:' + config.FROM_EMAIL,
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );

    console.log('✅ Web Push service initialized');
    console.log('📱 VAPID Public Key:', this.vapidKeys.publicKey);
  }

  private async initializeSubscriptionsDirectory(): Promise<void> {
    try {
      await fs.access(this.subscriptionsDir);
    } catch (error) {
      await fs.mkdir(this.subscriptionsDir, { recursive: true });
      console.log(`✅ Created push subscriptions directory: ${this.subscriptionsDir}`);
    }
  }

  // Get VAPID public key for frontend
  getVapidPublicKey(): string {
    return this.vapidKeys.publicKey;
  }

  // Save subscription from user's browser
  async saveSubscription(
    subscription: PushSubscription,
    userId?: string,
    userAgent?: string
  ): Promise<SavedSubscription> {
    try {
      const subscriptionId = this.generateSubscriptionId();
      
      const savedSubscription: SavedSubscription = {
        id: subscriptionId,
        ...subscription,
        userId,
        userAgent,
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      };

      // Save subscription to file (in production, use database)
      await this.storeSubscription(savedSubscription);

      console.log(`✅ Saved push subscription for user: ${userId || 'anonymous'}`);
      return savedSubscription;

    } catch (error) {
      console.error('❌ Error saving push subscription:', error);
      throw error;
    }
  }

  // Send notification to a specific subscription
  async sendNotification(
    subscription: PushSubscription | SavedSubscription,
    payload: NotificationPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        image: payload.image,
        url: payload.url,
        tag: payload.tag || 'default',
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        timestamp: payload.timestamp || Date.now(),
        actions: payload.actions || [],
        data: payload.data || {}
      });

      await webpush.sendNotification(subscription, notificationPayload);

      // Update last used timestamp if it's a saved subscription
      if ('id' in subscription) {
        await this.updateSubscriptionLastUsed(subscription.id);
      }

      return { success: true };

    } catch (error: any) {
      console.error('❌ Error sending push notification:', error);
      
      // Handle expired subscriptions
      if (error.statusCode === 410) {
        if ('id' in subscription) {
          await this.deactivateSubscription(subscription.id);
        }
        return { success: false, error: 'Subscription expired' };
      }

      return { success: false, error: error.message };
    }
  }

  // Send notification to multiple subscriptions
  async sendBulkNotifications(
    subscriptions: Array<PushSubscription | SavedSubscription>,
    payload: NotificationPayload
  ): Promise<{
    successCount: number;
    failureCount: number;
    results: Array<{ success: boolean; error?: string }>;
  }> {
    const results = await Promise.allSettled(
      subscriptions.map(sub => this.sendNotification(sub, payload))
    );

    let successCount = 0;
    let failureCount = 0;
    const processedResults: Array<{ success: boolean; error?: string }> = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        processedResults.push(result.value);
        if (result.value.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } else {
        processedResults.push({ success: false, error: result.reason.message });
        failureCount++;
      }
    });

    console.log(`📱 Bulk notifications sent: ${successCount} success, ${failureCount} failed`);

    return {
      successCount,
      failureCount,
      results: processedResults
    };
  }

  // Send notification to all users
  async sendToAllUsers(payload: NotificationPayload): Promise<{
    successCount: number;
    failureCount: number;
  }> {
    try {
      const allSubscriptions = await this.getAllActiveSubscriptions();
      const result = await this.sendBulkNotifications(allSubscriptions, payload);
      
      return {
        successCount: result.successCount,
        failureCount: result.failureCount
      };

    } catch (error) {
      console.error('❌ Error sending notifications to all users:', error);
      return { successCount: 0, failureCount: 0 };
    }
  }

  // Send notification to specific user
  async sendToUser(userId: string, payload: NotificationPayload): Promise<{
    successCount: number;
    failureCount: number;
  }> {
    try {
      const userSubscriptions = await this.getUserSubscriptions(userId);
      const result = await this.sendBulkNotifications(userSubscriptions, payload);
      
      return {
        successCount: result.successCount,
        failureCount: result.failureCount
      };

    } catch (error) {
      console.error(`❌ Error sending notifications to user ${userId}:`, error);
      return { successCount: 0, failureCount: 0 };
    }
  }

  // Send event-related notifications
  async sendEventNotification(
    eventId: string,
    type: 'reminder' | 'update' | 'checkin' | 'certificate',
    customPayload?: Partial<NotificationPayload>
  ): Promise<{ successCount: number; failureCount: number }> {
    const basePayloads = {
      reminder: {
        title: '📅 Event Reminder',
        body: 'Your event is starting soon!',
        icon: '/icons/reminder.png',
        tag: `event-reminder-${eventId}`,
        requireInteraction: true,
        url: `/events/${eventId}`,
        actions: [
          { action: 'view', title: 'View Event', icon: '/icons/view.png' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      },
      update: {
        title: '📢 Event Update',
        body: 'There has been an update to your event',
        icon: '/icons/update.png',
        tag: `event-update-${eventId}`,
        url: `/events/${eventId}`
      },
      checkin: {
        title: '✅ Check-in Available',
        body: 'You can now check in to your event',
        icon: '/icons/checkin.png',
        tag: `event-checkin-${eventId}`,
        requireInteraction: true,
        url: `/check-in?event=${eventId}`,
        actions: [
          { action: 'checkin', title: 'Check In', icon: '/icons/checkin.png' },
          { action: 'later', title: 'Later' }
        ]
      },
      certificate: {
        title: '🏆 Certificate Ready',
        body: 'Your participation certificate is ready for download',
        icon: '/icons/certificate.png',
        tag: `event-certificate-${eventId}`,
        requireInteraction: true,
        url: `/certificates/${eventId}`,
        actions: [
          { action: 'download', title: 'Download', icon: '/icons/download.png' },
          { action: 'view', title: 'View' }
        ]
      }
    };

    const payload = {
      ...basePayloads[type],
      ...customPayload,
      data: {
        eventId,
        type,
        timestamp: Date.now(),
        ...customPayload?.data
      }
    };

    // In production, get users registered for this event from database
    // For now, send to all users
    return await this.sendToAllUsers(payload);
  }

  // Get user's subscriptions
  async getUserSubscriptions(userId: string): Promise<SavedSubscription[]> {
    try {
      const allSubscriptions = await this.getAllActiveSubscriptions();
      return allSubscriptions.filter(sub => sub.userId === userId);
    } catch (error) {
      console.error(`❌ Error getting subscriptions for user ${userId}:`, error);
      return [];
    }
  }

  // Get all active subscriptions
  async getAllActiveSubscriptions(): Promise<SavedSubscription[]> {
    try {
      const files = await fs.readdir(this.subscriptionsDir);
      const subscriptionFiles = files.filter(file => file.endsWith('.json'));
      const subscriptions: SavedSubscription[] = [];

      for (const file of subscriptionFiles) {
        try {
          const filePath = path.join(this.subscriptionsDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const subscription = JSON.parse(data);
          
          if (subscription.isActive) {
            subscriptions.push(subscription);
          }
        } catch (error) {
          console.error(`❌ Error reading subscription file ${file}:`, error);
        }
      }

      return subscriptions;
    } catch (error) {
      console.error('❌ Error getting all subscriptions:', error);
      return [];
    }
  }

  // Deactivate subscription
  async deactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (subscription) {
        subscription.isActive = false;
        await this.storeSubscription(subscription);
        console.log(`🔇 Deactivated subscription: ${subscriptionId}`);
      }
    } catch (error) {
      console.error(`❌ Error deactivating subscription ${subscriptionId}:`, error);
    }
  }

  // Clean up expired subscriptions
  async cleanupExpiredSubscriptions(): Promise<number> {
    try {
      const allSubscriptions = await this.getAllActiveSubscriptions();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      let cleanedCount = 0;

      for (const subscription of allSubscriptions) {
        const lastUsed = new Date(subscription.lastUsed).getTime();
        if (lastUsed < thirtyDaysAgo) {
          await this.deactivateSubscription(subscription.id);
          cleanedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${cleanedCount} expired push subscriptions`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ Error cleaning up expired subscriptions:', error);
      return 0;
    }
  }

  // Helper methods
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async storeSubscription(subscription: SavedSubscription): Promise<void> {
    const filePath = path.join(this.subscriptionsDir, `${subscription.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(subscription, null, 2));
  }

  private async getSubscription(subscriptionId: string): Promise<SavedSubscription | null> {
    try {
      const filePath = path.join(this.subscriptionsDir, `${subscriptionId}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  private async updateSubscriptionLastUsed(subscriptionId: string): Promise<void> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (subscription) {
        subscription.lastUsed = new Date();
        await this.storeSubscription(subscription);
      }
    } catch (error) {
      console.error(`❌ Error updating last used for subscription ${subscriptionId}:`, error);
    }
  }

  // Get statistics
  async getStatistics(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    userSubscriptions: Record<string, number>;
    recentActivity: number;
  }> {
    try {
      const allSubscriptions = await this.getAllActiveSubscriptions();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      const userSubscriptions: Record<string, number> = {};
      let recentActivity = 0;

      allSubscriptions.forEach(sub => {
        if (sub.userId) {
          userSubscriptions[sub.userId] = (userSubscriptions[sub.userId] || 0) + 1;
        }
        
        const lastUsed = new Date(sub.lastUsed).getTime();
        if (lastUsed > sevenDaysAgo) {
          recentActivity++;
        }
      });

      return {
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: allSubscriptions.filter(sub => sub.isActive).length,
        userSubscriptions,
        recentActivity
      };
    } catch (error) {
      console.error('❌ Error getting push statistics:', error);
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        userSubscriptions: {},
        recentActivity: 0
      };
    }
  }
}

export const webPushService = new WebPushService();
