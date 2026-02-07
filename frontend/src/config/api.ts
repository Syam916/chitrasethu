// API Configuration
export const API_BASE_URL = 'https://chitrasethu.com:5000/api';
// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
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
    ME: `${API_BASE_URL}/photographers/me`,
    ME_STATS: `${API_BASE_URL}/photographers/me/stats`,
    ME_PORTFOLIO: `${API_BASE_URL}/photographers/me/portfolio`,
    ME_PORTFOLIO_ITEM: (id: number) => `${API_BASE_URL}/photographers/me/portfolio/${id}`,
    FOLLOW: (id: number) => `${API_BASE_URL}/photographers/${id}/follow`,
    FOLLOW_STATUS: (id: number) => `${API_BASE_URL}/photographers/${id}/follow/status`,
    FOLLOWERS: (id: number) => `${API_BASE_URL}/photographers/${id}/followers`,
    FOLLOWING: (id: number) => `${API_BASE_URL}/photographers/${id}/following`,
    ME_FOLLOWING: `${API_BASE_URL}/photographers/me/following`,
  },
  // Posts
  POSTS: {
    LIST: `${API_BASE_URL}/posts`,
    DETAIL: (id: number) => `${API_BASE_URL}/posts/${id}`,
    CREATE: `${API_BASE_URL}/posts`,
    DELETE: (id: number) => `${API_BASE_URL}/posts/${id}`,
    LIKE: (id: number) => `${API_BASE_URL}/posts/${id}/like`,
    COMMENTS: (id: number) => `${API_BASE_URL}/posts/${id}/comments`,
    COMMENT: (id: number) => `${API_BASE_URL}/posts/${id}/comment`,
    LIKES: (id: number) => `${API_BASE_URL}/posts/${id}/likes`,
  },
  // Upload
  UPLOAD: {
    PHOTO: `${API_BASE_URL}/upload/photo`,
    PHOTOS: `${API_BASE_URL}/upload/photos`,
    DELETE: (publicId: string) => `${API_BASE_URL}/upload/photo/${publicId}`,
  },
  // Events
  EVENTS: {
    LIST: `${API_BASE_URL}/events`,
    DETAIL: (id: number) => `${API_BASE_URL}/events/${id}`,
  },
  // Bookings
  BOOKINGS: {
    LIST: `${API_BASE_URL}/bookings`,
    CREATE: `${API_BASE_URL}/bookings`,
    DETAIL: (id: number) => `${API_BASE_URL}/bookings/${id}`,
  },
  // Messages
  MESSAGES: {
    CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
    CONVERSATION: (id: string) => `${API_BASE_URL}/messages/conversations/${id}`,
    SEND: `${API_BASE_URL}/messages/send`,
    MARK_READ: (id: string) => `${API_BASE_URL}/messages/conversations/${id}/read`,
  },
  // Discussions
  DISCUSSIONS: {
    LIST: `${API_BASE_URL}/discussions`,
    CATEGORIES: `${API_BASE_URL}/discussions/categories`,
    DETAIL: (id: number) => `${API_BASE_URL}/discussions/${id}`,
    CREATE: `${API_BASE_URL}/discussions`,
    UPDATE: (id: number) => `${API_BASE_URL}/discussions/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/discussions/${id}`,
    ADD_REPLY: (id: number) => `${API_BASE_URL}/discussions/${id}/replies`,
    UPDATE_REPLY: (id: number) => `${API_BASE_URL}/discussions/replies/${id}`,
    DELETE_REPLY: (id: number) => `${API_BASE_URL}/discussions/replies/${id}`,
  },
  // Groups
  GROUPS: {
    LIST: `${API_BASE_URL}/groups`,
    MY: `${API_BASE_URL}/groups/my`,
    DETAIL: (id: number) => `${API_BASE_URL}/groups/${id}`,
    CREATE: `${API_BASE_URL}/groups`,
    UPDATE: (id: number) => `${API_BASE_URL}/groups/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/groups/${id}`,
    JOIN: (id: number) => `${API_BASE_URL}/groups/${id}/join`,
    LEAVE: (id: number) => `${API_BASE_URL}/groups/${id}/leave`,
    UPDATE_MEMBER_ROLE: (groupId: number, memberId: number) => `${API_BASE_URL}/groups/${groupId}/members/${memberId}/role`,
    REMOVE_MEMBER: (groupId: number, memberId: number) => `${API_BASE_URL}/groups/${groupId}/members/${memberId}`,
    MESSAGES: (id: number) => `${API_BASE_URL}/groups/${id}/messages`,
    SEND_MESSAGE: (id: number) => `${API_BASE_URL}/groups/${id}/messages`,
  },
  // Collaborations
  COLLABORATIONS: {
    LIST: `${API_BASE_URL}/collaborations`,
    DETAIL: (id: number) => `${API_BASE_URL}/collaborations/${id}`,
    CREATE: `${API_BASE_URL}/collaborations`,
    UPDATE: (id: number) => `${API_BASE_URL}/collaborations/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/collaborations/${id}`,
    RESPOND: (id: number) => `${API_BASE_URL}/collaborations/${id}/respond`,
    UPDATE_RESPONSE_STATUS: (collabId: number, responseId: number) => `${API_BASE_URL}/collaborations/${collabId}/responses/${responseId}/status`,
    WITHDRAW: (id: number) => `${API_BASE_URL}/collaborations/${id}/withdraw`,
  },
  // Jobs
  JOBS: {
    LIST: `${API_BASE_URL}/jobs`,
    CREATE: `${API_BASE_URL}/jobs`,
    DETAIL: (id: number) => `${API_BASE_URL}/jobs/${id}`,
    APPLY: (id: number) => `${API_BASE_URL}/jobs/${id}/apply`,
    ANALYSIS: `${API_BASE_URL}/jobs/analysis`,
    UPDATE_APPLICATION_STATUS: (applicationId: number) => `${API_BASE_URL}/jobs/applications/${applicationId}/status`,
  },
  // Booking Requests
  BOOKING_REQUESTS: {
    LIST: `${API_BASE_URL}/photographer/requests`,
    ACCEPT: (id: number) => `${API_BASE_URL}/photographer/requests/${id}/accept`,
    DECLINE: (id: number) => `${API_BASE_URL}/photographer/requests/${id}/decline`,
    REQUEST_INFO: (id: number) => `${API_BASE_URL}/photographer/requests/${id}/request-info`,
  },
  // Photo Booth
  PHOTO_BOOTH: {
    GENERATE: `${API_BASE_URL}/photographer/photo-booth/generate`,
    GALLERIES: `${API_BASE_URL}/photographer/photo-booth/galleries`,
    GALLERY: (id: number) => `${API_BASE_URL}/photographer/photo-booth/${id}`,
    QR_CODE: (id: number) => `${API_BASE_URL}/photographer/photo-booth/${id}/qr-code`,
    PUBLIC_GALLERY: (qrCode: string) => `${API_BASE_URL}/photo-booth/${qrCode}`,
    VERIFY_PASSWORD: (qrCode: string) => `${API_BASE_URL}/photo-booth/${qrCode}/verify-password`,
    TRACK_ACCESS: (qrCode: string) => `${API_BASE_URL}/photo-booth/${qrCode}/access`,
    TRACK_DOWNLOAD: (photoId: number) => `${API_BASE_URL}/photo-booth/photos/${photoId}/download`,
  },
  // Mood Boards
  MOODBOARDS: {
    LIST: `${API_BASE_URL}/photographer/moodboards`,
    CREATE: `${API_BASE_URL}/photographer/moodboards`,
    DETAIL: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}`,
    UPDATE: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}`,
    DELETE: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}`,
    ADD_IMAGES: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}/images`,
    REMOVE_IMAGE: (id: number, imageIndex: number) => `${API_BASE_URL}/photographer/moodboards/${id}/images/${imageIndex}`,
    LIKE: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}/like`,
    COMMENTS: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}/comments`,
    COMMENT: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}/comment`,
    SEARCH_USERS: `${API_BASE_URL}/photographer/moodboards/users/search`,
    COLLABORATORS: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}/collaborators`,
    ADD_COLLABORATOR: (id: number) => `${API_BASE_URL}/photographer/moodboards/${id}/collaborators`,
    REMOVE_COLLABORATOR: (id: number, collaboratorId: number) => `${API_BASE_URL}/photographer/moodboards/${id}/collaborators/${collaboratorId}`,
    UPDATE_COLLABORATOR_PERMISSION: (id: number, collaboratorId: number) => `${API_BASE_URL}/photographer/moodboards/${id}/collaborators/${collaboratorId}/permission`,
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

