import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_URL = Config.API_URL || 'http://localhost:5001/api';

// Types matching Atlas.Core backend
export interface DriverLocationDto {
  driverId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface UpdateDriverLocationRequest {
  driverId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  bookingId?: string;
}

class LocationService {
  private getAuthHeader = async (): Promise<string> => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token found');
    return `Bearer ${token}`;
  };

  private handleError = async (response: Response): Promise<Error> => {
    let errorMessage = 'An error occurred';

    if (response.headers.get('content-type')?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.title || errorMessage;
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    return error;
  };

  /**
   * Update driver location
   */
  async updateDriverLocation(request: UpdateDriverLocationRequest): Promise<DriverLocationDto> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/location/driver/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get driver's current location
   */
  async getDriverLocation(driverId: string): Promise<DriverLocationDto | null> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/location/driver/${driverId}`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get all active driver locations
   */
  async getActiveDrivers(): Promise<DriverLocationDto[]> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(`${API_URL}/location/drivers/active`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get driver location history
   */
  async getDriverLocationHistory(driverId: string, bookingId?: string): Promise<DriverLocationDto[]> {
    const authHeader = await this.getAuthHeader();

    let url = `${API_URL}/location/driver/${driverId}/history`;
    if (bookingId) {
      url += `?bookingId=${bookingId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Get nearest available driver
   */
  async getNearestDriver(
    latitude: number,
    longitude: number,
    serviceCategory: string
  ): Promise<DriverLocationDto | null> {
    const authHeader = await this.getAuthHeader();

    const response = await fetch(
      `${API_URL}/location/drivers/nearest?latitude=${latitude}&longitude=${longitude}&serviceCategory=${serviceCategory}`,
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate bearing between two coordinates
   */
  calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLon = this.toRadians(lon2 - lon1);
    const lat1Rad = this.toRadians(lat1);
    const lat2Rad = this.toRadians(lat2);

    const y =
      Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    return ((this.toDegrees(bearing) + 360) % 360);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Get coordinate bounds for a region
   */
  getBounds(
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number
  ): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    return {
      north: latitude + latitudeDelta / 2,
      south: latitude - latitudeDelta / 2,
      east: longitude + longitudeDelta / 2,
      west: longitude - longitudeDelta / 2,
    };
  }

  /**
   * Check if a point is within bounds
   */
  isPointInBounds(
    latitude: number,
    longitude: number,
    bounds: { north: number; south: number; east: number; west: number }
  ): boolean {
    return (
      latitude <= bounds.north &&
      latitude >= bounds.south &&
      longitude <= bounds.east &&
      longitude >= bounds.west
    );
  }
}

export default new LocationService();
