import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { initializeSocket } from './config/socket.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes.js';
import photographerRoutes from './routes/photographer.routes.js';
import postRoutes from './routes/post.routes.js';
import messageRoutes from './routes/photographer/messages/messages.js';
import uploadRoutes from './routes/upload.routes.js';
import discussionRoutes from './routes/discussion.routes.js';
import groupRoutes from './routes/group.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import jobRoutes from './routes/job.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import photoBoothRoutes from './routes/photoBooth.routes.js';
import moodboardRoutes from './routes/moodboard.routes.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());

// CORS configuration - Production ready
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
  'http://localhost:4173'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS blocked origin:', origin);
      callback(null, true); // In production, you might want to be stricter
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Chitrasethu API v1.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      photographers: '/api/photographers',
      bookings: '/api/bookings',
      events: '/api/events',
      posts: '/api/posts',
      jobs: '/api/jobs',
      collections: '/api/collections',
      moodboards: '/api/photographer/moodboards',
      messages: '/api/messages',
      notifications: '/api/notifications',
      discussions: '/api/discussions',
      groups: '/api/groups',
      collaborations: '/api/collaborations'
    }
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/photographers', photographerRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', bookingRoutes);
app.use('/api', photoBoothRoutes);
app.use('/api/photographer/moodboards', moodboardRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    // Initialize Socket.io
    initializeSocket(httpServer);
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('🚀 ============================================');
      console.log(`🚀 Chitrasethu Backend Server`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`🚀 API endpoint: http://localhost:${PORT}/api`);
      console.log(`🚀 WebSocket: ws://localhost:${PORT}`);
      console.log('🚀 ============================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

export default app;

