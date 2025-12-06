import express from 'express';
import { getConversations, getMessages, sendMessage, markAsRead } from '../../../controllers/message.controller.js';
import { authenticateToken } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// Test route to verify messages routes are working
router.get('/test', (req, res) => {
  res.json({ status: 'success', message: 'Messages routes are working!' });
});

// All routes require authentication
router.use(authenticateToken);

// Get all conversations for the authenticated user
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/conversations/:conversationId', getMessages);

// Send a message
router.post('/send', sendMessage);

// Mark messages as read
router.put('/conversations/:conversationId/read', markAsRead);

export default router;

