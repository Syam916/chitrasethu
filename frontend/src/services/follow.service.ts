import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface FollowUser {
  userId: number;
  photographerId?: number;
  fullName: string;
  avatarUrl?: string;
  userType: string;
  followedAt: string;
}

export interface FollowStatus {
  isFollowing: boolean;
}

export interface FollowersResponse {
  followers: FollowUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface FollowingResponse {
  following: FollowUser[];
  total: number;
  limit: number;
  offset: number;
}

class FollowService {
  // Follow a photographer
  async followPhotographer(photographerId: number): Promise<FollowStatus> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.FOLLOW(photographerId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to follow photographer');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Unfollow a photographer
  async unfollowPhotographer(photographerId: number): Promise<FollowStatus> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.FOLLOW(photographerId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to unfollow photographer');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get follow status (check if current user follows a photographer)
  async getFollowStatus(photographerId: number): Promise<FollowStatus> {
    try {
      const response = await fetch(API_ENDPOINTS.PHOTOGRAPHERS.FOLLOW_STATUS(photographerId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get follow status');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get list of followers for a photographer
  async getFollowers(
    photographerId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<FollowersResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const url = `${API_ENDPOINTS.PHOTOGRAPHERS.FOLLOWERS(photographerId)}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch followers');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get list of who a photographer is following
  async getFollowing(
    photographerId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<FollowingResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const url = `${API_ENDPOINTS.PHOTOGRAPHERS.FOLLOWING(photographerId)}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch following list');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get current user's following list (works for both customers and photographers)
  async getMyFollowing(limit: number = 50, offset: number = 0): Promise<FollowingResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const url = `${API_ENDPOINTS.PHOTOGRAPHERS.ME_FOLLOWING}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch following list');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new FollowService();

