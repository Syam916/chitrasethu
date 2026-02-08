import express from 'express';
import { getAllEvents, getEventById, getTrendingEvents, getEventCategories, createEvent } from '../controllers/event.controller.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get event categories (public)
router.get('/categories', getEventCategories);

// Get all events (public)
router.get('/', optionalAuth, getAllEvents);

// Get trending events
router.get('/trending', optionalAuth, getTrendingEvents);

// Create event (authenticated)
router.post('/', authenticateToken, createEvent);

// Get single event
router.get('/:eventId', optionalAuth, getEventById);

export default router;









