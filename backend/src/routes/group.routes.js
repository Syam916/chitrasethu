import express from 'express';
import {
  getAllGroups,
  getMyGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  updateMemberRole,
  removeMember,
  getGroupMessages,
  sendGroupMessage
} from '../controllers/group.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all groups (public)
router.get('/', optionalAuth, getAllGroups);

// Get current user's groups (requires authentication)
router.get('/my', authenticateToken, getMyGroups);

// Get single group
router.get('/:groupId', optionalAuth, getGroupById);

// Create new group (requires authentication)
router.post('/', authenticateToken, createGroup);

// Update group (requires authentication)
router.put('/:groupId', authenticateToken, updateGroup);

// Delete group (requires authentication)
router.delete('/:groupId', authenticateToken, deleteGroup);

// Join group (requires authentication)
router.post('/:groupId/join', authenticateToken, joinGroup);

// Leave group (requires authentication)
router.post('/:groupId/leave', authenticateToken, leaveGroup);

// Update member role (requires authentication)
router.put('/:groupId/members/:memberId/role', authenticateToken, updateMemberRole);

// Remove member (requires authentication)
router.delete('/:groupId/members/:memberId', authenticateToken, removeMember);

// Get group messages (requires authentication)
router.get('/:groupId/messages', authenticateToken, getGroupMessages);

// Send group message (requires authentication)
router.post('/:groupId/messages', authenticateToken, sendGroupMessage);

export default router;




