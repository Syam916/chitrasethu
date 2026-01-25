import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface Photographer {
  photographerId: number;
  userId: number;
  fullName: string;
  email?: string;
  businessName?: string;
  avatarUrl?: string;
  location?: string;
  city?: string;
  state?: string;
  specialties: string[];
  experienceYears: number;
  basePrice: number;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isPremium: boolean;
}

export interface PhotographerDetail extends Photographer {
  bio?: string;
  phone?: string;
  totalBookings: number;
  equipment: string[];
  languages: string[];
  certifications?: string;
  awards?: string;
  servicesOffered?: any;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  portfolio: Array<{
    portfolioId: number;
    imageUrl: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    category?: string;
    likesCount: number;
    commentsCount?: number;
    postId?: number;
    location?: string;
    createdAt?: string;
  }>;
}

export interface UpdatePhotographerProfilePayload {
  businessName?: string;
  specialties?: string[];
  experienceYears?: number;
  basePrice?: number;
  equipment?: string[];
  languages?: string[];
  servicesOffered?: any[];
  workRadius?: number;
  certifications?: string;
  awards?: string;
}

export interface PhotographerStats {
  totalBookings: number;
  currentMonthBookings: number;
  currentMonthRevenue: number;
  pendingRequests: number;
  activeConversations: number;
  portfolioViews: number;
  profileRating: number;
  totalReviews: number;
  completionRate: number;
  responseTime: string;
}

class PhotographerService {
  // Get photographer dashboard stats
  async getStats(): Promise<PhotographerStats> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.ME_STATS, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch photographer stats');
      }

      return result.data.stats as PhotographerStats;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get current authenticated photographer profile
  async getMyProfile(): Promise<PhotographerDetail> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.ME, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch photographer profile');
      }

      return result.data.photographer as PhotographerDetail;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get all photographers
  async getAll(filters?: {
    category?: string;
    city?: string;
    minRating?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Photographer[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = `${API_ENDPOINTS.PHOTOGRAPHERS.LIST}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch photographers');
      }

      return result.data.photographers;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get photographer by ID
  async getById(id: number): Promise<PhotographerDetail> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.DETAIL(id), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch photographer');
      }

      return result.data.photographer;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update current photographer profile (business/professional details)
  async updateMyProfile(payload: UpdatePhotographerProfilePayload): Promise<PhotographerDetail> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.ME, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update photographer profile');
      }

      return result.data.photographer as PhotographerDetail;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  async addPortfolioItems(photos: Array<{
    imageUrl: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    category?: string;
  }>): Promise<PhotographerDetail['portfolio']> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.ME_PORTFOLIO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ photos }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add portfolio items');
      }

      return result.data.portfolio as PhotographerDetail['portfolio'];
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  async deletePortfolioItem(id: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.ME_PORTFOLIO_ITEM(id), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete portfolio item');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new PhotographerService();

