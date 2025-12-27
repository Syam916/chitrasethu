import express from 'express';
import {
  getAllPhotographers,
  getPhotographerById,
  updateMyPhotographerProfile,
  getMyPhotographerProfile,
  addMyPortfolioItems,
  deleteMyPortfolioItem,
} from '../controllers/photographer.controller.js';
import {
  followPhotographer,
  unfollowPhotographer,
  getFollowStatus,
  getFollowers,
  getFollowing,
  getMyFollowing,
} from '../controllers/follow.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAllPhotographers);
router.get('/me', authenticateToken, getMyPhotographerProfile);
router.get('/:id', optionalAuth, getPhotographerById);
router.put('/me', authenticateToken, updateMyPhotographerProfile);
router.post('/me/portfolio', authenticateToken, addMyPortfolioItems);
router.delete('/me/portfolio/:id', authenticateToken, deleteMyPortfolioItem);

// Follow routes - IMPORTANT: /me routes must come before /:id routes
router.get('/me/following', authenticateToken, getMyFollowing);
router.post('/:photographerId/follow', authenticateToken, followPhotographer);
router.delete('/:photographerId/follow', authenticateToken, unfollowPhotographer);
router.get('/:photographerId/follow/status', optionalAuth, getFollowStatus);
router.get('/:photographerId/followers', optionalAuth, getFollowers);
router.get('/:photographerId/following', optionalAuth, getFollowing);

export default router;

