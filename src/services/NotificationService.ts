// Push Notification Service for Real-time Updates
export interface NotificationPermissionResult {
  granted: boolean;
  denied: boolean;
  message: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class NotificationService {
  private static instance: NotificationService;
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check if push notifications are supported
  isPushNotificationSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermissionResult> {
    if (!('Notification' in window)) {
      return {
        granted: false,
        denied: true,
        message: 'This browser does not support notifications'
      };
    }

    try {
      const permission = await Notification.requestPermission();
      
      switch (permission) {
        case 'granted':
          return {
            granted: true,
            denied: false,
            message: 'Notifications enabled successfully'
          };
        case 'denied':
          return {
            granted: false,
            denied: true,
            message: 'Notifications denied by user'
          };
        default:
          return {
            granted: false,
            denied: false,
            message: 'Notification permission dismissed'
          };
      }
    } catch (error) {
      return {
        granted: false,
        denied: true,
        message: 'Failed to request notification permission'
      };
    }
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  }

  // Register service worker for push notifications
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPushNotificationSupported()) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.isPushNotificationSupported()) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from backend
      if (!this.vapidPublicKey) {
        await this.fetchVAPIDPublicKey();
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not available');
      }

      // Subscribe to push manager
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Convert to our format
      const subscription: PushSubscription = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(pushSubscription.getKey('auth')!)
        }
      };

      this.subscription = subscription;

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      
      if (pushSubscription) {
        const success = await pushSubscription.unsubscribe();
        if (success) {
          this.subscription = null;
          // Notify backend
          await this.removeSubscriptionFromBackend();
        }
        return success;
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Show local notification
  showLocalNotification(title: string, options: NotificationOptions = {}): Notification | null {
    if (this.getPermissionStatus() !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Handle different notification types
  handleNotification(type: string, data: any): void {
    switch (type) {
      case 'event_reminder':
        this.showEventReminder(data);
        break;
      case 'peer_validation_request':
        this.showPeerValidationRequest(data);
        break;
      case 'certificate_ready':
        this.showCertificateReady(data);
        break;
      case 'event_update':
        this.showEventUpdate(data);
        break;
      default:
        this.showGenericNotification(data);
    }
  }

  // Event reminder notification
  private showEventReminder(data: any): void {
    this.showLocalNotification(`Event Starting Soon: ${data.eventName}`, {
      body: `${data.eventName} starts in ${data.timeUntilStart}`,
      icon: data.eventImage || '/icon-192x192.png',
      tag: `event-reminder-${data.eventId}`,
      actions: [
        { action: 'view', title: 'View Event' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }

  // Peer validation request notification
  private showPeerValidationRequest(data: any): void {
    this.showLocalNotification('Peer Validation Request', {
      body: `${data.requesterName} is requesting validation at ${data.eventName}`,
      icon: '/icon-192x192.png',
      tag: `validation-request-${data.requestId}`,
      actions: [
        { action: 'validate', title: 'Validate' },
        { action: 'ignore', title: 'Ignore' }
      ]
    });
  }

  // Certificate ready notification
  private showCertificateReady(data: any): void {
    this.showLocalNotification('Certificate Ready!', {
      body: `Your ${data.tier} certificate for ${data.eventName} is ready to mint`,
      icon: '/icon-192x192.png',
      tag: `certificate-ready-${data.eventId}`,
      actions: [
        { action: 'mint', title: 'Mint Certificate' },
        { action: 'later', title: 'Mint Later' }
      ]
    });
  }

  // Event update notification
  private showEventUpdate(data: any): void {
    this.showLocalNotification(`Event Update: ${data.eventName}`, {
      body: data.updateMessage,
      icon: data.eventImage || '/icon-192x192.png',
      tag: `event-update-${data.eventId}`
    });
  }

  // Generic notification
  private showGenericNotification(data: any): void {
    this.showLocalNotification(data.title || 'Eviden Notification', {
      body: data.message || 'You have a new notification',
      icon: '/icon-192x192.png',
      tag: data.tag || 'generic-notification'
    });
  }

  // Utility functions
  private async fetchVAPIDPublicKey(): Promise<void> {
    try {
      const response = await fetch('/api/push-notifications/vapid-public-key');
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
    } catch (error) {
      console.error('Failed to fetch VAPID public key:', error);
    }
  }

  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      });
    } catch (error) {
      console.error('Failed to send subscription to backend:', error);
    }
  }

  private async removeSubscriptionFromBackend(): Promise<void> {
    try {
      await fetch('/api/push-notifications/unsubscribe', {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to remove subscription from backend:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Get current subscription
  getCurrentSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    if (!this.isPushNotificationSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  }
}

// Global notification service instance
export const notificationService = NotificationService.getInstance();
