import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface MoodBoard {
  boardId: number;
  userId: number;
  boardName: string;
  description?: string;
  coverImage?: string;
  images: string[];
  imageCount: number;
  category?: string;
  tags: string[];
  privacy: 'public' | 'private';
  views: number;
  saves: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  isOwner?: boolean;
  isCollaborator?: boolean;
  collaboratorPermission?: 'view' | 'comment' | 'edit' | null;
  isLikedByCurrentUser?: boolean;
  creator?: {
    fullName: string;
    avatarUrl?: string;
    userType: string;
    photographerId?: number;
  };
}

export interface CreateMoodBoardData {
  boardName: string;
  description?: string;
  category?: string;
  tags?: string[];
  privacy?: 'public' | 'private';
  coverImage?: string;
  images?: string[];
}

export interface UpdateMoodBoardData {
  boardName?: string;
  description?: string;
  category?: string;
  tags?: string[];
  privacy?: 'public' | 'private';
  coverImage?: string;
  images?: string[];
}

class MoodBoardService {
  // Get all mood boards
  async getAll(filters?: {
    category?: string;
    privacy?: 'all' | 'public' | 'private';
    search?: string;
    photographerId?: number;
    limit?: number;
    offset?: number;
  }): Promise<MoodBoard[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== 'all' && value !== 'All') {
            params.append(key, value.toString());
          }
        });
      }

      const url = `${API_ENDPOINTS.MOODBOARDS.LIST}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch mood boards');
      }

      return result.data.boards;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get mood board by ID
  async getById(id: number): Promise<MoodBoard> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.DETAIL(id), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch mood board');
      }

      return result.data.board;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Create new mood board
  async create(data: CreateMoodBoardData): Promise<MoodBoard> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create mood board');
      }

      return result.data.board;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update mood board
  async update(id: number, data: UpdateMoodBoardData): Promise<MoodBoard> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.UPDATE(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update mood board');
      }

      return result.data.board;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete mood board
  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.DELETE(id), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete mood board');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Add images to mood board
  async addImages(id: number, images: string[]): Promise<MoodBoard> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.ADD_IMAGES(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ images }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add images to mood board');
      }

      return result.data.board;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Remove image from mood board
  async removeImage(id: number, imageIndex: number): Promise<MoodBoard> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.REMOVE_IMAGE(id, imageIndex), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove image from mood board');
      }

      return result.data.board;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Toggle like on mood board
  async toggleLike(id: number): Promise<{
    boardId: number;
    isLikedByCurrentUser: boolean;
    likesCount: number;
    savesCount: number;
    viewsCount: number;
  }> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.LIKE(id), {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update like status');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get comments for mood board
  async getComments(id: number): Promise<Array<{
    commentId: number;
    boardId: number;
    userId: number;
    commentText: string;
    parentCommentId?: number | null;
    likesCount: number;
    isEdited: boolean;
    createdAt: string;
    updatedAt: string;
    fullName?: string;
    avatarUrl?: string;
    userType?: string;
  }>> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.COMMENTS(id), {
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

  // Add comment to mood board
  async addComment(id: number, commentText: string, parentCommentId?: number): Promise<{
    comment: {
      commentId: number;
      boardId: number;
      userId: number;
      commentText: string;
      parentCommentId?: number | null;
      createdAt: string;
      fullName?: string;
      avatarUrl?: string;
      userType?: string;
    };
    commentsCount: number;
  }> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.COMMENT(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ commentText, parentCommentId }),
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

  // Search users for collaboration
  async searchUsers(search: string, signal?: AbortSignal): Promise<Array<{
    userId: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    userType: string;
    photographerId?: number | null;
  }>> {
    try {
      const url = `${API_ENDPOINTS.MOODBOARDS.SEARCH_USERS}?search=${encodeURIComponent(search)}`;
      console.log('[Search Users] Calling API:', url);
      
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
        signal, // Support request cancellation
      });

      const result = await response.json();
      console.log('[Search Users] Response:', { status: response.status, result });

      if (!response.ok) {
        console.error('[Search Users] API Error:', result);
        throw new Error(result.message || 'Failed to search users');
      }

      console.log('[Search Users] Found users:', result.data?.users?.length || 0);
      return result.data.users;
    } catch (error: any) {
      // Re-throw abort errors as-is
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('[Search Users] Error:', error);
      throw new Error(handleApiError(error));
    }
  }

  // Get collaborators for a mood board
  async getCollaborators(boardId: number): Promise<Array<{
    collaboratorId: number;
    userId: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    userType: string;
    permissionLevel: 'view' | 'comment' | 'edit';
    invitedAt: string;
  }>> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.COLLABORATORS(boardId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch collaborators');
      }

      return result.data.collaborators;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Add collaborator to mood board
  async addCollaborator(boardId: number, userId: number, permissionLevel: 'view' | 'comment' | 'edit' = 'view'): Promise<{
    collaboratorId: number;
    userId: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    userType: string;
    permissionLevel: 'view' | 'comment' | 'edit';
    invitedAt: string;
  }> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.ADD_COLLABORATOR(boardId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ userId, permissionLevel }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add collaborator');
      }

      return result.data.collaborator;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Remove collaborator from mood board
  async removeCollaborator(boardId: number, collaboratorId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.REMOVE_COLLABORATOR(boardId, collaboratorId), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove collaborator');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update collaborator permission
  async updateCollaboratorPermission(boardId: number, collaboratorId: number, permissionLevel: 'view' | 'comment' | 'edit'): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.MOODBOARDS.UPDATE_COLLABORATOR_PERMISSION(boardId, collaboratorId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ permissionLevel }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update collaborator permission');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

const moodBoardService = new MoodBoardService();
export default moodBoardService;

