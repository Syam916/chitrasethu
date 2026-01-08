import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface CommunityGroup {
  groupId: number;
  creatorId: number;
  creatorName: string;
  creatorAvatar?: string;
  groupName: string;
  groupType: 'regional' | 'project' | 'network' | 'equipment' | 'other';
  description?: string;
  groupIconUrl?: string;
  memberCount: number;
  isPublic: boolean;
  isActive: boolean;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  userRole?: 'admin' | 'moderator' | 'member' | null;
  role?: 'admin' | 'moderator' | 'member';
  unreadCount?: number;
}

export interface GroupMember {
  memberId: number;
  userId: number;
  fullName: string;
  avatarUrl?: string;
  userType: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  unreadCount: number;
}

export interface CreateGroupData {
  groupName: string;
  groupType: 'regional' | 'project' | 'network' | 'equipment' | 'other';
  description?: string;
  groupIconUrl?: string;
  isPublic?: boolean;
}

export interface GroupMessage {
  messageId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  senderType: string;
  messageText: string;
  messageType: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  createdAt: string;
}

class GroupService {
  // Get all groups
  async getAllGroups(params?: {
    limit?: number;
    offset?: number;
    groupType?: string;
    search?: string;
  }): Promise<{ groups: CommunityGroup[]; total: number; limit: number; offset: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.groupType) queryParams.append('groupType', params.groupType);
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_ENDPOINTS.GROUPS.LIST}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch groups');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get user's groups
  async getMyGroups(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ groups: CommunityGroup[]; total: number; limit: number; offset: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `${API_ENDPOINTS.GROUPS.MY}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch your groups');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get single group with members
  async getGroupById(groupId: number): Promise<{ group: CommunityGroup; members: GroupMember[] }> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.DETAIL(groupId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch group');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Create new group
  async createGroup(data: CreateGroupData): Promise<CommunityGroup> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create group');
      }

      return result.data.group;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update group
  async updateGroup(groupId: number, data: Partial<CreateGroupData & { isPublic?: boolean }>): Promise<CommunityGroup> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.UPDATE(groupId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update group');
      }

      return result.data.group;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete group
  async deleteGroup(groupId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.DELETE(groupId), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete group');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Join group
  async joinGroup(groupId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.JOIN(groupId), {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to join group');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Leave group
  async leaveGroup(groupId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.LEAVE(groupId), {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to leave group');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update member role
  async updateMemberRole(groupId: number, memberId: number, role: 'admin' | 'moderator' | 'member'): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.UPDATE_MEMBER_ROLE(groupId, memberId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update member role');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Remove member
  async removeMember(groupId: number, memberId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.REMOVE_MEMBER(groupId, memberId), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to remove member');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get group messages
  async getGroupMessages(
    groupId: number,
    params?: { limit?: number; offset?: number }
  ): Promise<{ messages: GroupMessage[]; total: number; limit: number; offset: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `${API_ENDPOINTS.GROUPS.MESSAGES(groupId)}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch group messages');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Send group message
  async sendGroupMessage(
    groupId: number,
    data: {
      messageText: string;
      messageType?: 'text' | 'image' | 'file';
      attachmentUrl?: string;
    }
  ): Promise<GroupMessage> {
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS.SEND_MESSAGE(groupId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          messageText: data.messageText,
          messageType: data.messageType || 'text',
          attachmentUrl: data.attachmentUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send message');
      }

      return result.data.message;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new GroupService();




