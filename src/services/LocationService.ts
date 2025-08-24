// Location Service for GPS and Proximity Features
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface ProximityResult {
  isWithinRange: boolean;
  distance: number;
  requiredRadius: number;
  message: string;
}

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private currentPosition: LocationCoordinates | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Request location permission
  async requestLocationPermission(): Promise<boolean> {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Test if we can get location
      const position = await this.getCurrentPosition();
      return !!position;
    } catch (error) {
      console.error('Failed to get location permission:', error);
      return false;
    }
  }

  // Get current position
  async getCurrentPosition(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.currentPosition = coords;
          resolve(coords);
        },
        (error) => {
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    });
  }

  // Watch position changes
  startWatchingPosition(callback: (position: LocationCoordinates) => void): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.currentPosition = coords;
        callback(coords);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Cache for 30 seconds
      }
    );
  }

  // Stop watching position
  stopWatchingPosition(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(
    point1: LocationCoordinates,
    point2: LocationCoordinates
  ): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Check if user is within event radius
  checkProximity(
    userLocation: LocationCoordinates,
    eventLocation: LocationCoordinates,
    requiredRadius: number
  ): ProximityResult {
    const distance = this.calculateDistance(userLocation, eventLocation);
    const isWithinRange = distance <= requiredRadius;

    let message = '';
    if (isWithinRange) {
      message = `You are ${distance.toFixed(0)}m from the event location. Check-in available!`;
    } else {
      const extraDistance = distance - requiredRadius;
      message = `You are ${extraDistance.toFixed(0)}m too far from the event. Move closer to check in.`;
    }

    return {
      isWithinRange,
      distance,
      requiredRadius,
      message,
    };
  }

  // Calculate intelligent radius based on event parameters
  calculateIntelligentRadius(eventParams: {
    baseRadius: number;
    capacity: number;
    venueType: 'indoor' | 'outdoor' | 'mixed';
    venueSize?: 'small' | 'medium' | 'large' | 'massive';
  }): number {
    let { baseRadius, capacity, venueType, venueSize = 'medium' } = eventParams;

    // Capacity-based adjustments
    const capacityMultiplier = Math.min(1 + capacity / 1000, 2.5);
    
    // Venue type multipliers
    const venueTypeMultipliers = {
      indoor: 0.8,
      outdoor: 1.2,
      mixed: 1.0,
    };

    // Venue size multipliers
    const venueSizeMultipliers = {
      small: 0.7,
      medium: 1.0,
      large: 1.5,
      massive: 2.0,
    };

    const adjustedRadius = 
      baseRadius * 
      capacityMultiplier * 
      venueTypeMultipliers[venueType] * 
      venueSizeMultipliers[venueSize];

    // Safety buffer (minimum 10m, maximum 500m)
    return Math.max(10, Math.min(adjustedRadius, 500));
  }

  // Get location accuracy
  async getLocationAccuracy(): Promise<number | null> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        });
      });
      return position.coords.accuracy || null;
    } catch {
      return null;
    }
  }

  // Format distance for display
  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  // Get current cached position
  getCachedPosition(): LocationCoordinates | null {
    return this.currentPosition;
  }

  // Check if location services are available
  isLocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  // Get location permission status
  async getLocationPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
      }
      return 'prompt';
    } catch {
      return 'prompt';
    }
  }
}

// Global location service instance
export const locationService = LocationService.getInstance();
