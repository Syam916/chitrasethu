import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface Post {
  postId: number;
  userId: number;
  fullName: string;
  avatarUrl?: string;
  userType: string;
  contentType: string;
  caption?: string;
  mediaUrls: string[];
  thumbnailUrl?: string;
  location?: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
}

class PostService {
  // Get all posts
  async getAll(limit: number = 50, offset: number = 0): Promise<Post[]> {
    try {
      const url = `${API_ENDPOINTS.POSTS.LIST}?limit=${limit}&offset=${offset}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch posts');
      }

      return result.data.posts;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new PostService();

