// API Service for Backend Integration
export class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Make authenticated request
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication APIs
  async register(userData: {
    address: string;
    signature: string;
    message: string;
    nonce: string;
    role: 'attendee' | 'organizer';
    name: string;
    email: string;
    organizationName?: string;
    organizationDescription?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(loginData: {
    address: string;
    signature: string;
    message: string;
    nonce: string;
  }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async getNonce() {
    return this.request('/auth/nonce');
  }

  async refreshToken() {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Events APIs
  async getEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    organizer?: string;
    status?: 'upcoming' | 'ongoing' | 'completed';
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return this.request(`/events?${queryParams.toString()}`);
  }

  async getEvent(eventId: string) {
    return this.request(`/events/${eventId}`);
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(eventId: string, eventData: any) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(eventId: string) {
    return this.request(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  async getEventAttendees(eventId: string) {
    return this.request(`/events/${eventId}/attendees`);
  }

  async checkInToEvent(eventId: string, locationData: {
    latitude: number;
    longitude: number;
  }) {
    return this.request(`/events/${eventId}/checkin`, {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async validatePeerAttendance(eventId: string, attendeeAddress: string) {
    return this.request(`/events/${eventId}/validate/${attendeeAddress}`, {
      method: 'POST',
    });
  }

  async getEventAnalytics(eventId: string) {
    return this.request(`/events/${eventId}/analytics`);
  }

  // Certificates APIs
  async getUserCertificates(address: string) {
    return this.request(`/certificates/user/${address}`);
  }

  async getEventCertificates(eventId: string) {
    return this.request(`/certificates/event/${eventId}`);
  }

  async mintCertificate(certificateData: any) {
    return this.request('/certificates/mint', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  }

  async verifyCertificate(certificateId: string) {
    return this.request(`/certificates/verify/${certificateId}`);
  }

  async checkCertificateEligibility(eventId: string, address: string) {
    return this.request(`/certificates/eligible/${eventId}/${address}`);
  }

  // Users APIs
  async getUserProfile(address: string) {
    return this.request(`/users/${address}`);
  }

  async updateUserProfile(address: string, profileData: any) {
    return this.request(`/users/${address}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserEvents(address: string, type?: 'created' | 'attended') {
    const params = type ? `?type=${type}` : '';
    return this.request(`/users/${address}/events${params}`);
  }

  async getUserStats(address: string) {
    return this.request(`/users/${address}/stats`);
  }

  async getGlobalStats() {
    return this.request('/users/stats/global');
  }

  // QR Codes APIs
  async generateQRCode(eventId: string, securityLevel: 'basic' | 'standard' | 'high' | 'maximum') {
    return this.request(`/qr-codes/generate/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({ securityLevel }),
    });
  }

  async validateQRCode(qrData: {
    token: string;
    eventId: string;
    latitude: number;
    longitude: number;
  }) {
    return this.request('/qr-codes/validate', {
      method: 'POST',
      body: JSON.stringify(qrData),
    });
  }

  async getQRRotationStatus(qrId: string) {
    return this.request(`/qr-codes/rotation-status/${qrId}`);
  }

  async checkProximity(locationData: {
    eventId: string;
    latitude: number;
    longitude: number;
  }) {
    return this.request('/qr-codes/check-proximity', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // Push Notifications APIs
  async subscribeToPushNotifications(subscription: any) {
    return this.request('/push-notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    });
  }

  async unsubscribeFromPushNotifications() {
    return this.request('/push-notifications/unsubscribe', {
      method: 'DELETE',
    });
  }

  async sendPushNotification(notificationData: any) {
    return this.request('/push-notifications/send', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async getVAPIDPublicKey() {
    return this.request('/push-notifications/vapid-public-key');
  }

  // File Upload APIs
  async uploadEventImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    return fetch(`${this.baseURL}/uploads/event-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    }).then(res => res.json());
  }

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    return fetch(`${this.baseURL}/uploads/profile-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    }).then(res => res.json());
  }

  // Notifications APIs
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Additional methods for UI components
  async getOrganizerEvents() {
    return this.request('/events/organizer');
  }

  async generateEventQRCode(eventId: string) {
    return this.request(`/events/${eventId}/qr-code`, {
      method: 'POST',
    });
  }

  async updateEventStatus(eventId: string, status: string) {
    return this.request(`/events/${eventId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async exportEventAttendees(eventId: string) {
    return this.request(`/events/${eventId}/attendees/export`);
  }
}

// Global API instance
export const apiService = new ApiService();
