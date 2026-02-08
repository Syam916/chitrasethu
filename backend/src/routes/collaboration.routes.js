import express from 'express';
import {
  getAllCollaborations,
  getCollaborationById,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
  respondToCollaboration,
  updateResponseStatus,
  withdrawResponse
} from '../controllers/collaboration.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all collaborations
router.get('/', optionalAuth, getAllCollaborations);

// Get single collaboration
router.get('/:collaborationId', optionalAuth, getCollaborationById);

// Create new collaboration (requires authentication)
router.post('/', authenticateToken, createCollaboration);

// Update collaboration (requires authentication)
router.put('/:collaborationId', authenticateToken, updateCollaboration);

// Delete collaboration (requires authentication)
router.delete('/:collaborationId', authenticateToken, deleteCollaboration);

// Respond to collaboration (requires authentication)
router.post('/:collaborationId/respond', authenticateToken, respondToCollaboration);

// Update response status (requires authentication - only collaboration owner)
router.put('/:collaborationId/responses/:responseId/status', authenticateToken, updateResponseStatus);

// Withdraw own response (requires authentication)
router.post('/:collaborationId/withdraw', authenticateToken, withdrawResponse);

export default router;
















