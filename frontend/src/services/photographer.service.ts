import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface Photographer {
  photographerId: number;
  userId: number;
  fullName: string;
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
  portfolio: Array<{
    portfolioId: number;
    imageUrl: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    category?: string;
    likesCount: number;
  }>;
}

class PhotographerService {
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
}

export default new PhotographerService();

