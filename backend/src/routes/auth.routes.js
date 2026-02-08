import express from 'express';
import { register, login, getCurrentUser, getUserById, logout, updateProfile } from '../controllers/auth.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.get('/user/:id', optionalAuth, getUserById); // Optional auth - can view other users' profiles
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

export default router;

