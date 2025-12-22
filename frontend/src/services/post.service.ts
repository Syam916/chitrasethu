import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';
import { UploadedImage } from './upload.service';

export interface Post {
  postId: number;
  userId: number;
  fullName: string;
  avatarUrl?: string;
  userType: string;
  photographerId?: number;
  contentType: string;
  caption?: string;
  mediaUrls: UploadedImage[];
  thumbnailUrl?: string;
  location?: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  createdAt: string;
  isLikedByCurrentUser?: boolean;
}

export interface CreatePostData {
  caption?: string;
  location?: string;
  tags?: string[];
  visibility?: 'public' | 'followers' | 'private';
  contentType?: 'image' | 'video' | 'text' | 'gallery';
  media_urls: UploadedImage[];
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

  // Create new post
  async create(postData: CreatePostData): Promise<Post> {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create post');
      }

      return result.data.post;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get single post
  async getById(postId: number): Promise<Post> {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.DETAIL(postId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch post');
      }

      return result.data.post;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete post
  async delete(postId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.DETAIL(postId), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete post');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Toggle like on a post
  async toggleLike(postId: number): Promise<{
    postId: number;
    isLikedByCurrentUser: boolean;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  }> {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.LIKE(postId), {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update like');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get comments for a post
  async getComments(postId: number): Promise<Array<{
    commentId: number;
    postId: number;
    userId: number;
    commentText: string;
    parentCommentId?: number | null;
    createdAt: string;
    fullName?: string;
    avatarUrl?: string;
  }>> {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.COMMENTS(postId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch comments');
      }

      return result.data.comments;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get users who liked a post
  async getLikes(postId: number): Promise<Array<{
    likeId: number;
    postId: number;
    userId: number;
    fullName: string;
    avatarUrl?: string;
    userType: string;
  }>> {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.LIKES(postId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch likes');
      }

      return result.data.likes;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Add a comment to a post
  async addComment(
    postId: number,
    commentText: string,
    parentCommentId?: number
  ): Promise<{
    comment: {
      commentId: number;
      postId: number;
      userId: number;
      commentText: string;
      parentCommentId?: number | null;
      createdAt: string;
      fullName?: string;
      avatarUrl?: string;
    };
    commentsCount: number;
  }> {
    try {
      const response = await fetch(API_ENDPOINTS.POSTS.COMMENT(postId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          commentText,
          parentCommentId: parentCommentId ?? null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add comment');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new PostService();

