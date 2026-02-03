import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface Event {
  eventId: number;
  creatorId: number;
  creatorName: string;
  creatorAvatar?: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  endDate?: string;
  location: string;
  venueName?: string;
  city?: string;
  state?: string;
  expectedAttendees?: number;
  budgetRange?: string;
  minBudget: number;
  maxBudget: number;
  requirements?: string;
  status: string;
  visibility: string;
  images?: string[];
  tags?: string[];
  viewsCount: number;
  interestedCount: number;
  createdAt: string;
  updatedAt: string;
  isInterested?: boolean;
}

export interface TrendingEvent {
  name: string;
  posts: number;
  trending: string;
}

class EventService {
  // Get all events
  async getAll(filters?: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: string;
    city?: string;
    search?: string;
  }): Promise<{ events: Event[]; total: number; limit: number; offset: number }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = `${API_ENDPOINTS.EVENTS.LIST}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch events');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get event by ID
  async getById(id: number): Promise<Event> {
    try {
      const response = await fetch(API_ENDPOINTS.EVENTS.DETAIL(id), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch event');
      }

      return result.data.event;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get trending events
  async getTrending(limit: number = 6): Promise<TrendingEvent[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.EVENTS.LIST}/trending?limit=${limit}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch trending events');
      }

      return result.data.trending;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new EventService();








