import { io, Socket } from 'socket.io-client';

// Derive socket URL from API URL - handles both HTTP and HTTPS
const getSocketUrl = () => {
  // Use production URL as default fallback
  const apiUrl = import.meta.env.VITE_API_URL || 'https://chitrasethu.onrender.com/api';
  // Remove /api suffix and ensure proper protocol for WebSocket
  const baseUrl = apiUrl.replace('/api', '');
  console.log('🔌 Socket URL:', baseUrl);
  return baseUrl;
};

const SOCKET_URL = getSocketUrl();

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Initialize socket connection
  connect(token: string): Socket {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected:', this.socket.id);
      return this.socket;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      console.log('🔌 Disconnecting existing socket...');
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('🔌 Connecting to Socket.io server:', SOCKET_URL);
    console.log('🔑 Token length:', token ? token.length : 0);

    if (!token) {
      throw new Error('No authentication token provided');
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: false, // Reuse connection if possible
      autoConnect: true
    });

    this.setupEventListeners();
    return this.socket;
  }

  // Setup default event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('❌ Error details:', {
        message: error.message,
        type: error.type,
        description: error.description
      });
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Join a conversation room
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', { conversationId });
      console.log('👥 Joined conversation:', conversationId);
    }
  }

  // --- Voice call signaling helpers ---

  // Send a generic voice call signal (offer/answer/ice/end)
  sendVoiceSignal(
    event:
      | 'voice_call_offer'
      | 'voice_call_answer'
      | 'voice_call_ice_candidate'
      | 'voice_call_end',
    payload: any
  ) {
    if (this.socket?.connected) {
      this.socket.emit(event, payload);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', { conversationId });
      console.log('👋 Left conversation:', conversationId);
    }
  }

  // Send a message via socket
  sendMessage(conversationId: string, message: any) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { conversationId, message });
      console.log('📨 Message sent via socket');
    }
  }

  // Emit typing event
  startTyping(conversationId: string, userName: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, userName });
    }
  }

  // Emit stop typing event
  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('stop_typing', { conversationId });
    }
  }

  // Mark messages as read
  markAsRead(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { conversationId });
    }
  }

  // Listen to an event
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();

