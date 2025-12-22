import express from 'express';
import { 
  createBookingRequest,
  getCustomerBookings,
  updateBookingRequest,
  getPhotographerRequests, 
  getPhotographerBookings,
  acceptBookingRequest, 
  declineBookingRequest, 
  sendMessageToCustomer,
  requestMoreInfo 
} from '../controllers/booking.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a booking request (customer creates request for photographer)
router.post('/bookings', authenticateToken, createBookingRequest);

// Get customer's own booking requests
router.get('/bookings/my-requests', authenticateToken, getCustomerBookings);

// Update a booking request (customer edits their request)
router.put('/bookings/:id', authenticateToken, updateBookingRequest);

// Get all booking requests for authenticated photographer
router.get('/photographer/requests', authenticateToken, getPhotographerRequests);

// Get photographer's bookings (confirmed, in_progress, completed)
router.get('/photographer/bookings', authenticateToken, getPhotographerBookings);

// Accept a booking request
router.put('/photographer/requests/:id/accept', authenticateToken, acceptBookingRequest);

// Decline a booking request
router.put('/photographer/requests/:id/decline', authenticateToken, declineBookingRequest);

// Send message from photographer to customer
router.post('/photographer/bookings/:id/message', authenticateToken, sendMessageToCustomer);

// Request more info from customer
router.post('/photographer/requests/:id/request-info', authenticateToken, requestMoreInfo);

export default router;

