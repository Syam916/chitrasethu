import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface DiscussionTopic {
  topicId: number;
  userId: number;
  authorName: string;
  authorAvatar?: string;
  authorType: string;
  title: string;
  description?: string;
  category: string;
  repliesCount: number;
  viewsCount: number;
  isHot: boolean;
  isPinned: boolean;
  isLocked: boolean;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  replyId: number;
  topicId: number;
  userId: number;
  authorName: string;
  authorAvatar?: string;
  authorType: string;
  replyText: string;
  parentReplyId?: number | null;
  likesCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicData {
  title: string;
  description?: string;
  category: string;
}

export interface CreateReplyData {
  replyText: string;
  parentReplyId?: number;
}

export interface DiscussionCategory {
  name: string;
  topicCount: number;
}

class DiscussionService {
  // Get all topics
  async getAllTopics(params?: {
    limit?: number;
    offset?: number;
    category?: string;
    sort?: 'latest' | 'activity' | 'hot';
  }): Promise<{ topics: DiscussionTopic[]; total: number; limit: number; offset: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.sort) queryParams.append('sort', params.sort);

      const url = `${API_ENDPOINTS.DISCUSSIONS.LIST}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch discussion topics');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get single topic with replies
  async getTopicById(topicId: number): Promise<{ topic: DiscussionTopic; replies: DiscussionReply[] }> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.DETAIL(topicId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch discussion topic');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Create new topic
  async createTopic(data: CreateTopicData): Promise<DiscussionTopic> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create discussion topic');
      }

      return result.data.topic;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update topic
  async updateTopic(topicId: number, data: Partial<CreateTopicData>): Promise<DiscussionTopic> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.UPDATE(topicId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update discussion topic');
      }

      return result.data.topic;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete topic
  async deleteTopic(topicId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.DELETE(topicId), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete discussion topic');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Add reply to topic
  async addReply(topicId: number, data: CreateReplyData): Promise<DiscussionReply> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.ADD_REPLY(topicId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add reply');
      }

      return result.data.reply;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update reply
  async updateReply(replyId: number, replyText: string): Promise<DiscussionReply> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.UPDATE_REPLY(replyId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ replyText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update reply');
      }

      return result.data.reply;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete reply
  async deleteReply(replyId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.DELETE_REPLY(replyId), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete reply');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get categories
  async getCategories(): Promise<DiscussionCategory[]> {
    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS.CATEGORIES, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch categories');
      }

      return result.data.categories;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new DiscussionService();










