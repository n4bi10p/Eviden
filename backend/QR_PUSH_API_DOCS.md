# QR Code & Push Notification API Documentation

## QR Code Endpoints

### Generate QR Code for Event Check-in
```bash
POST /api/qr-codes/generate/:eventId
Authorization: Bearer <token>
Content-Type: application/json

{
  "expirationHours": 24,
  "location": "Conference Hall",
  "organizer": "Event Team",
  "customData": {}
}
```

### Generate Dynamic QR Code
```bash
POST /api/qr-codes/generate-dynamic/:eventId
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionData": {}
}
```

### Validate QR Code
```bash
POST /api/qr-codes/validate
Content-Type: application/json

{
  "token": "check-in-token",
  "eventId": "event-123",
  "qrId": "qr-id"
}
```

### Check-in with QR Code
```bash
POST /api/qr-codes/check-in
Content-Type: application/json

{
  "token": "check-in-token",
  "eventId": "event-123",
  "qrId": "qr-id",
  "userInfo": {}
}
```

### Get QR Code Analytics
```bash
GET /api/qr-codes/analytics/:eventId
Authorization: Bearer <token>
```

### Generate Bulk QR Codes
```bash
POST /api/qr-codes/generate-bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventIds": ["event-1", "event-2", "event-3"]
}
```

### Cleanup Expired QR Codes
```bash
POST /api/qr-codes/cleanup
Authorization: Bearer <token>
```

### Get QR Code Info
```bash
GET /api/qr-codes/info/:qrId
```

## Push Notification Endpoints

### Get VAPID Public Key
```bash
GET /api/push-notifications/vapid-public-key
```

### Subscribe to Push Notifications
```bash
POST /api/push-notifications/subscribe
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "key-data",
      "auth": "auth-secret"
    }
  }
}
```

### Send Test Notification
```bash
POST /api/push-notifications/send-test
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test",
  "url": "/dashboard",
  "icon": "/icons/test.png"
}
```

### Send Notification to Specific User
```bash
POST /api/push-notifications/send-to-user/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Personal Message",
  "body": "You have a new update",
  "icon": "/icons/message.png",
  "url": "/messages",
  "requireInteraction": true,
  "actions": [
    {"action": "view", "title": "View", "icon": "/icons/view.png"},
    {"action": "dismiss", "title": "Dismiss"}
  ]
}
```

### Send Notification to All Users
```bash
POST /api/push-notifications/send-to-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "System Announcement",
  "body": "Important update for all users",
  "icon": "/icons/announcement.png",
  "url": "/announcements"
}
```

### Send Event Notification
```bash
POST /api/push-notifications/send-event-notification
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event-123",
  "type": "reminder", // or "update", "checkin", "certificate"
  "title": "Custom Title (optional)",
  "body": "Custom Body (optional)",
  "customData": {}
}
```

### Get User Subscriptions
```bash
GET /api/push-notifications/subscriptions
Authorization: Bearer <token>
```

### Unsubscribe
```bash
POST /api/push-notifications/unsubscribe/:subscriptionId
Authorization: Bearer <token>
```

### Get Push Statistics
```bash
GET /api/push-notifications/statistics
Authorization: Bearer <token>
```

### Cleanup Expired Subscriptions
```bash
POST /api/push-notifications/cleanup
Authorization: Bearer <token>
```

## Example Usage Flows

### 1. Event Check-in Flow
1. Generate QR code for event
2. Display QR code at event location
3. Users scan QR code with their phones
4. Validate QR code and process check-in
5. Send push notification confirming check-in

### 2. Event Notification Flow
1. User subscribes to push notifications
2. Event organizer sends reminder notification
3. User receives notification on their device
4. User clicks notification to view event details

### 3. Certificate Ready Flow
1. User completes event attendance
2. System generates certificate
3. Send push notification about certificate
4. User clicks to download certificate

## VAPID Configuration

Current VAPID keys (for development):
- Public Key: `BMPxA7-g8E7lasWAjtiyDuC8OlOM9o44RFR75WPldb4r3YAvhk1kB5S1z0VKrd0F7fBuErrBrOvOEluiBuu_BbU`
- Private Key: Stored securely in environment variables

## Storage

- QR codes: Stored as PNG files in `uploads/qr-codes/`
- QR metadata: JSON files in `uploads/qr-codes/`
- Push subscriptions: JSON files in `uploads/push-subscriptions/`

## Security Features

- QR codes have expiration times
- Push notifications require VAPID authentication
- Endpoints require JWT authentication where appropriate
- Automatic cleanup of expired data
- Validation of all input parameters
