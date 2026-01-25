import express from 'express';
import { getAllEvents, getEventById, getTrendingEvents } from '../controllers/event.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all events (public)
router.get('/', optionalAuth, getAllEvents);

// Get trending events
router.get('/trending', optionalAuth, getTrendingEvents);

// Get single event
router.get('/:eventId', optionalAuth, getEventById);

export default router;

