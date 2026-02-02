import express from 'express';
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  addReply,
  updateReply,
  deleteReply,
  getCategories
} from '../controllers/discussion.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all discussion topics
router.get('/', optionalAuth, getAllTopics);

// Get categories
router.get('/categories', getCategories);

// Get single topic with replies
router.get('/:topicId', optionalAuth, getTopicById);

// Create new topic (requires authentication)
router.post('/', authenticateToken, createTopic);

// Update topic (requires authentication)
router.put('/:topicId', authenticateToken, updateTopic);

// Delete topic (requires authentication)
router.delete('/:topicId', authenticateToken, deleteTopic);

// Add reply to topic (requires authentication)
router.post('/:topicId/replies', authenticateToken, addReply);

// Update reply (requires authentication)
router.put('/replies/:replyId', authenticateToken, updateReply);

// Delete reply (requires authentication)
router.delete('/replies/:replyId', authenticateToken, deleteReply);

export default router;











