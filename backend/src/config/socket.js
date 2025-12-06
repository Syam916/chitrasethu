import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

// Initialize Socket.io server
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:4173'
      ],
      credentials: true,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket.io authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.error('❌ Socket auth: No token provided');
        return next(new Error('Authentication error: No token provided'));
      }

      // Get JWT secret (same as auth middleware)
      const jwtSecret = process.env.JWT_SECRET || 'your_secret_key';
      
      // Verify JWT token
      try {
        const decoded = jwt.verify(token, jwtSecret);
        
        // Check if decoded token has required fields
        if (!decoded.userId) {
          console.error('❌ Socket auth: Token missing userId. Decoded:', decoded);
          return next(new Error('Authentication error: Invalid token structure'));
        }
        
        socket.userId = decoded.userId;
        socket.userRole = decoded.userType || decoded.role || decoded.userRole || 'user';
        
        console.log(`✅ Socket authenticated: User ${socket.userId} (${socket.userRole || 'user'})`);
        next();
      } catch (verifyError) {
        console.error('❌ Socket auth: JWT verification failed:', {
          message: verifyError.message,
          name: verifyError.name,
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...'
        });
        
        // Provide more specific error message
        if (verifyError.name === 'JsonWebTokenError') {
          return next(new Error('Authentication error: Invalid token format'));
        } else if (verifyError.name === 'TokenExpiredError') {
          return next(new Error('Authentication error: Token expired'));
        } else {
          return next(new Error(`Authentication error: ${verifyError.message}`));
        }
      }
    } catch (error) {
      console.error('❌ Socket auth: Unexpected error:', error);
      return next(new Error('Authentication error: Unexpected error occurred'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (Socket ID: ${socket.id})`);

    // Join user's personal room for direct notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining a conversation
    socket.on('join_conversation', ({ conversationId }) => {
      try {
        // Verify user is part of this conversation
        const parts = conversationId.replace('conv_', '').split('_');
        const userId1 = parseInt(parts[0]);
        const userId2 = parseInt(parts[1]);

        if (socket.userId === userId1 || socket.userId === userId2) {
          socket.join(conversationId);
          console.log(`👥 User ${socket.userId} joined conversation: ${conversationId}`);
          
          // Notify other user that this user is online
          socket.to(conversationId).emit('user_online', {
            userId: socket.userId,
            conversationId
          });
        } else {
          socket.emit('error', { message: 'Unauthorized to join this conversation' });
        }
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving a conversation
    socket.on('leave_conversation', ({ conversationId }) => {
      try {
        socket.leave(conversationId);
        console.log(`👋 User ${socket.userId} left conversation: ${conversationId}`);
        
        // Notify other user
        socket.to(conversationId).emit('user_offline', {
          userId: socket.userId,
          conversationId
        });
      } catch (error) {
        console.error('Leave conversation error:', error);
      }
    });

    // Handle sending a message (real-time only, DB save happens in REST API)
    socket.on('send_message', (data) => {
      try {
        const { conversationId, message } = data;
        
        // Emit to all users in the conversation except sender
        socket.to(conversationId).emit('new_message', {
          message,
          conversationId
        });
        
        console.log(`📨 Message sent in ${conversationId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ conversationId, userName }) => {
      socket.to(conversationId).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        userName
      });
    });

    // Handle stop typing
    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user_stopped_typing', {
        conversationId,
        userId: socket.userId
      });
    });

    // Handle mark as read
    socket.on('mark_read', ({ conversationId }) => {
      socket.to(conversationId).emit('message_read', {
        conversationId,
        userId: socket.userId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId} (Socket ID: ${socket.id})`);
      
      // Notify all conversations that user went offline
      // This will be handled by client-side timeout
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('');
  console.log('🔌 ============================================');
  console.log('🔌 Socket.io Server Initialized');
  console.log('🔌 Real-time messaging enabled');
  console.log('🔌 ============================================');
  console.log('');

  return io;
};

// Get Socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

// Emit event to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Emit event to conversation
export const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(conversationId).emit(event, data);
  }
};

export default { initializeSocket, getIO, emitToUser, emitToConversation };

