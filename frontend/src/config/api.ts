// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  // Photographers
  PHOTOGRAPHERS: {
    LIST: `${API_BASE_URL}/photographers`,
    DETAIL: (id: number) => `${API_BASE_URL}/photographers/${id}`,
  },
  // Posts
  POSTS: {
    LIST: `${API_BASE_URL}/posts`,
    DETAIL: (id: number) => `${API_BASE_URL}/posts/${id}`,
  },
  // Events
  EVENTS: {
    LIST: `${API_BASE_URL}/events`,
    DETAIL: (id: number) => `${API_BASE_URL}/events/${id}`,
  },
  // Bookings
  BOOKINGS: {
    LIST: `${API_BASE_URL}/bookings`,
    DETAIL: (id: number) => `${API_BASE_URL}/bookings/${id}`,
  },
  // Messages
  MESSAGES: {
    CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
    CONVERSATION: (id: string) => `${API_BASE_URL}/messages/conversations/${id}`,
    SEND: `${API_BASE_URL}/messages/send`,
    MARK_READ: (id: string) => `${API_BASE_URL}/messages/conversations/${id}/read`,
  },
};

// Helper function to get auth header
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

