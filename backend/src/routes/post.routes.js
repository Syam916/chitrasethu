import express from 'express';
import { 
  getAllPosts, 
  createPost, 
  getPostById, 
  deletePost,
  toggleLikePost,
  addCommentToPost,
  getCommentsForPost,
  getLikesForPost 
} from '../controllers/post.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all posts (public or authenticated)
router.get('/', optionalAuth, getAllPosts);

// Get single post
router.get('/:postId', optionalAuth, getPostById);

// Get comments for a post
router.get('/:postId/comments', optionalAuth, getCommentsForPost);

// Get likes for a post
router.get('/:postId/likes', optionalAuth, getLikesForPost);

// Create new post (requires authentication)
router.post('/', authenticateToken, createPost);

// Like/unlike post (requires authentication)
router.post('/:postId/like', authenticateToken, toggleLikePost);

// Add comment to post (requires authentication)
router.post('/:postId/comment', authenticateToken, addCommentToPost);

// Delete post (requires authentication)
router.delete('/:postId', authenticateToken, deletePost);

export default router;

			