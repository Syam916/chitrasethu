import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface Conversation {
  conversationId: string;
  participantId: number;
  participantName: string;
  participantAvatar: string | null;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
}

export interface Message {
  id: number;
  sender: 'photographer' | 'customer';
  senderId: number;
  receiverId: number;
  text: string;
  messageType: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
}

export interface SendMessageData {
  conversationId: string;
  messageText: string;
  messageType?: string;
  attachmentUrl?: string;
  attachmentFileName?: string;
}

class MessageService {
  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGES.CONVERSATIONS}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch conversations');
      }

      return result.data.conversations;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<{ messages: Message[]; participantId: number }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGES.CONVERSATION(conversationId)}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch messages');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Send a message
  async sendMessage(data: SendMessageData): Promise<Message> {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGES.SEND}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
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

  // Mark messages as read
  async markAsRead(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${API_ENDPOINTS.MESSAGES.MARK_READ(conversationId)}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to mark messages as read');
      }
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new MessageService();

