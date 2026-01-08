import express from 'express';
import {
  getAllMoodBoards,
  getMoodBoardById,
  createMoodBoard,
  updateMoodBoard,
  deleteMoodBoard,
  addImagesToMoodBoard,
  removeImageFromMoodBoard,
  toggleLikeMoodBoard,
  addCommentToMoodBoard,
  getCommentsForMoodBoard,
  searchUsersForCollaboration,
  addCollaborator,
  getCollaborators,
  removeCollaborator,
  updateCollaboratorPermission
} from '../controllers/moodboard.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all mood boards (public or authenticated)
router.get('/', optionalAuth, getAllMoodBoards);

// Get single mood board by ID
router.get('/:boardId', optionalAuth, getMoodBoardById);

// Create new mood board (requires authentication)
router.post('/', authenticateToken, createMoodBoard);

// Update mood board (requires authentication)
router.put('/:boardId', authenticateToken, updateMoodBoard);

// Delete mood board (requires authentication)
router.delete('/:boardId', authenticateToken, deleteMoodBoard);

// Add images to mood board (requires authentication)
router.post('/:boardId/images', authenticateToken, addImagesToMoodBoard);

// Remove image from mood board (requires authentication)
router.delete('/:boardId/images/:imageIndex', authenticateToken, removeImageFromMoodBoard);

// Like/unlike mood board (requires authentication)
router.post('/:boardId/like', authenticateToken, toggleLikeMoodBoard);

// Get comments for mood board (optional auth - public boards can be viewed)
router.get('/:boardId/comments', optionalAuth, getCommentsForMoodBoard);

// Add comment to mood board (requires authentication)
router.post('/:boardId/comment', authenticateToken, addCommentToMoodBoard);

// Collaborator management (requires authentication)
router.get('/users/search', authenticateToken, searchUsersForCollaboration);
router.post('/:boardId/collaborators', authenticateToken, addCollaborator);
router.get('/:boardId/collaborators', authenticateToken, getCollaborators);
router.delete('/:boardId/collaborators/:collaboratorId', authenticateToken, removeCollaborator);
router.put('/:boardId/collaborators/:collaboratorId/permission', authenticateToken, updateCollaboratorPermission);

export default router;

