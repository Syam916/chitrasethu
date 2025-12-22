import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  userType?: 'customer' | 'photographer';
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  userId: number;
  email: string;
  fullName: string;
  userType: string;
  isVerified: boolean;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  city?: string;
  state?: string;
  bio?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

class AuthService {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Store token
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }

      return result;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Store token
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }

      return result;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get user data');
      }

      return result.data.user;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Update user profile
  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    location?: string;
    city?: string;
    state?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH.ME.replace('/me', '/profile')}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(result.data.user));

      return result.data.user;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new AuthService();

