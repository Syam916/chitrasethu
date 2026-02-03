import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface Collaboration {
  collaborationId: number;
  userId: number;
  posterName: string;
  posterAvatar?: string;
  posterType: string;
  collaborationType: 'seeking' | 'offering';
  title: string;
  description: string;
  skills: string[];
  location?: string;
  date?: string;
  budget?: string;
  minBudget?: number;
  maxBudget?: number;
  responsesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationResponse {
  responseId: number;
  collaborationId: number;
  userId: number;
  responderName: string;
  responderAvatar?: string;
  responderType: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollaborationData {
  collaborationType: 'seeking' | 'offering';
  title: string;
  description: string;
  skills?: string[];
  location?: string;
  date?: string;
  budget?: string;
  minBudget?: number;
  maxBudget?: number;
}

class CollaborationService {
  // Get all collaborations
  async getAllCollaborations(params?: {
    limit?: number;
    offset?: number;
    collaborationType?: 'seeking' | 'offering';
    location?: string;
    search?: string;
  }): Promise<{ collaborations: Collaboration[]; total: number; limit: number; offset: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.collaborationType) queryParams.append('collaborationType', params.collaborationType);
      if (params?.location) queryParams.append('location', params.location);
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_ENDPOINTS.COLLABORATIONS.LIST}?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch collaborations');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get single collaboration with responses
  async getCollaborationById(collaborationId: number): Promise<{
    collaboration: Collaboration;
    responses: CollaborationResponse[];
    userResponse: CollaborationResponse | null;
  }> {
    try {
      const response = await fetch(API_ENDPOINTS.COLLABORATIONS.DETAIL(collaborationId), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch collaboration');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Create new collaboration
  async createCollaboration(data: CreateCollaborationData): Promise<Collaboration> {
    try {
      const response = await fetch(API_ENDPOINTS.COLLABORATIONS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create collaboration');
      }

      return result.data.collaboration;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update collaboration
  async updateCollaboration(
    collaborationId: number,
    data: Partial<CreateCollaborationData & { isActive?: boolean }>
  ): Promise<Collaboration> {
    try {
      const response = await fetch(API_ENDPOINTS.COLLABORATIONS.UPDATE(collaborationId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update collaboration');
      }

      return result.data.collaboration;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Delete collaboration
  async deleteCollaboration(collaborationId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.COLLABORATIONS.DELETE(collaborationId), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete collaboration');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Respond to collaboration
  async respondToCollaboration(collaborationId: number, message?: string): Promise<CollaborationResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.COLLABORATIONS.RESPOND(collaborationId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit response');
      }

      return result.data.response;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update response status
  async updateResponseStatus(
    collaborationId: number,
    responseId: number,
    status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  ): Promise<void> {
    try {
      const response = await fetch(
        API_ENDPOINTS.COLLABORATIONS.UPDATE_RESPONSE_STATUS(collaborationId, responseId),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update response status');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Withdraw response
  async withdrawResponse(collaborationId: number): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.COLLABORATIONS.WITHDRAW(collaborationId), {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to withdraw response');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new CollaborationService();














