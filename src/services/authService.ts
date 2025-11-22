import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_URL = Config.API_URL || 'http://localhost:5000/api';
const USE_MOCK_AUTH = Config.USE_MOCK_AUTH === 'true' || false;

// Types matching Atlas.Core backend
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  roles: string[];
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<string> {
    try {
      const errorData = await response.json() as any;
      
      // Log full error response
      console.log('🔴 FULL ERROR RESPONSE:', JSON.stringify(errorData, null, 2));
      
      // Check for generalErrors array
      if (errorData.errors?.generalErrors && Array.isArray(errorData.errors.generalErrors)) {
        return errorData.errors.generalErrors.join(', ');
      }
      
      // Fallback to message field
      if (errorData.message) {
        return errorData.message;
      }
      
      return 'An error occurred';
    } catch {
      // If JSON parsing fails, try to get text
      try {
        const textError = await response.text();
        console.log('🔴 ERROR TEXT:', textError);
        return textError || 'An error occurred';
      } catch {
        return 'An error occurred';
      }
    }
  }

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<AuthenticationResponse> {
    // Mock mode for development without backend
    if (USE_MOCK_AUTH) {
      return this.mockRegister(request);
    }

    try {
      console.log('🔵 REGISTER REQUEST:', JSON.stringify(request, null, 2));
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('🔵 REGISTER RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.log('🔴 RAW REGISTER ERROR RESPONSE:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          console.log('🔴 PARSED REGISTER ERROR:', JSON.stringify(errorData, null, 2));
          
          // Extract error message
          if (errorData.errors?.generalErrors && Array.isArray(errorData.errors.generalErrors)) {
            throw new Error(errorData.errors.generalErrors.join(', '));
          }
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          console.log('🔴 Failed to parse error, using raw text');
        }
        
        throw new Error(responseText || 'Registration failed');
      }

      const data = await response.json() as AuthenticationResponse;
      console.log('🟢 REGISTER SUCCESS:', JSON.stringify(data, null, 2));
      
      await this.saveTokens(data.accessToken, data.refreshToken);
      await this.saveUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(request: LoginRequest): Promise<AuthenticationResponse> {
    // Mock mode for development without backend
    if (USE_MOCK_AUTH) {
      return this.mockLogin(request);
    }

    try {
      console.log('🔵 LOGIN REQUEST:', JSON.stringify(request, null, 2));
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('🔵 LOGIN RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const responseText = await response.text();
        console.log('🔴 RAW LOGIN ERROR RESPONSE:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          console.log('🔴 PARSED LOGIN ERROR:', JSON.stringify(errorData, null, 2));
          
          // Extract error message
          if (errorData.errors?.generalErrors && Array.isArray(errorData.errors.generalErrors)) {
            throw new Error(errorData.errors.generalErrors.join(', '));
          }
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          console.log('🔴 Failed to parse error, using raw text');
        }
        
        throw new Error(responseText || 'Login failed');
      }

      const data = await response.json() as AuthenticationResponse;
      console.log('🟢 LOGIN SUCCESS:', JSON.stringify(data, null, 2));
      
      await this.saveTokens(data.accessToken, data.refreshToken);
      await this.saveUser(data.user);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout and clear tokens
   */
  async logout(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      console.log('🔵 LOGOUT REQUEST');
      
      if (token) {
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        console.log('🔵 LOGOUT RESPONSE STATUS:', response.status);
      }
      console.log('🟢 LOGOUT SUCCESS');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('🔵 FORGOT PASSWORD REQUEST:', JSON.stringify({ email }, null, 2));
      
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('🔵 FORGOT PASSWORD RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const error = await this.parseErrorResponse(response);
        console.log('🔴 FORGOT PASSWORD ERROR:', error);
        throw new Error(error || 'Failed to send reset email');
      }
      
      console.log('🟢 FORGOT PASSWORD SUCCESS');
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      console.log('🔵 RESET PASSWORD REQUEST');
      
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      console.log('🔵 RESET PASSWORD RESPONSE STATUS:', response.status);

      if (!response.ok) {
        const error = await this.parseErrorResponse(response);
        console.log('🔴 RESET PASSWORD ERROR:', error);
        throw new Error(error || 'Failed to reset password');
      }
      
      console.log('🟢 RESET PASSWORD SUCCESS');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = await this.getRefreshToken();
      
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await this.clearTokens();
        return null;
      }

      const data = await response.json() as AuthenticationResponse;
      await this.saveTokens(data.accessToken, data.refreshToken);
      await this.saveUser(data.user);
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearTokens();
      return null;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserDto | null> {
    try {
      const token = await this.getAccessToken();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Try to refresh token
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          return this.getProfile();
        }
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const user = await response.json() as UserDto;
      await this.saveUser(user);
      
      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(request: UpdateProfileRequest): Promise<UserDto | null> {
    try {
      const token = await this.getAccessToken();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.status === 401) {
        // Try to refresh token
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          return this.updateProfile(request);
        }
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const user = await response.json() as UserDto;
      await this.saveUser(user);
      
      return user;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<UserDto | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Save tokens to storage
   */
  private async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  }

  /**
   * Save user data to storage
   */
  private async saveUser(user: UserDto): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get access token from storage
   */
  async getAccessToken(): Promise<string | null> {
    if (this.accessToken) {
      return this.accessToken;
    }
    
    this.accessToken = await AsyncStorage.getItem('accessToken');
    return this.accessToken;
  }

  /**
   * Get refresh token from storage
   */
  private async getRefreshToken(): Promise<string | null> {
    if (this.refreshToken) {
      return this.refreshToken;
    }
    
    this.refreshToken = await AsyncStorage.getItem('refreshToken');
    return this.refreshToken;
  }

  /**
   * Clear all tokens and user data
   */
  private async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    let response = await fetch(url, { ...options, headers });

    // If unauthorized, try to refresh token and retry
    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  /**
   * Mock register for development without backend
   */
  private async mockRegister(request: RegisterRequest): Promise<AuthenticationResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser: UserDto = {
      id: 'mock-' + Date.now(),
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      phoneNumber: request.phoneNumber,
      avatarUrl: undefined,
      isEmailVerified: false,
      roles: ['User'],
    };

    const mockToken = 'mock-access-token-' + Date.now();
    const mockRefreshToken = 'mock-refresh-token-' + Date.now();

    const response: AuthenticationResponse = {
      accessToken: mockToken,
      refreshToken: mockRefreshToken,
      user: mockUser,
    };

    await this.saveTokens(response.accessToken, response.refreshToken);
    await this.saveUser(response.user);

    return response;
  }

  /**
   * Mock login for development without backend
   */
  private async mockLogin(request: LoginRequest): Promise<AuthenticationResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if user exists in storage (for mock mode)
    const existingUser = await this.getUser();
    
    const mockUser: UserDto = existingUser || {
      id: 'mock-user-123',
      email: request.email,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      avatarUrl: undefined,
      isEmailVerified: true,
      roles: ['User'],
    };

    const mockToken = 'mock-access-token-' + Date.now();
    const mockRefreshToken = 'mock-refresh-token-' + Date.now();

    const response: AuthenticationResponse = {
      accessToken: mockToken,
      refreshToken: mockRefreshToken,
      user: mockUser,
    };

    await this.saveTokens(response.accessToken, response.refreshToken);
    await this.saveUser(response.user);

    return response;
  }
}

export default new AuthService();
