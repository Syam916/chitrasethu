import express from 'express';
import { createJobPost, getAllJobPosts, getJobPostById, applyForJob, getJobAnalysis, updateApplicationStatus } from '../controllers/job.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create job post (requires authentication)
router.post('/', authenticateToken, createJobPost);

// Get all job posts (requires photographer authentication)
router.get('/', authenticateToken, getAllJobPosts);

// Get job analysis (requires authentication)
router.get('/analysis', authenticateToken, getJobAnalysis);

// Get job post by ID (requires photographer authentication)
router.get('/:id', authenticateToken, getJobPostById);

// Apply for a job (requires authentication)
router.post('/:id/apply', authenticateToken, applyForJob);

// Update application status (accept/reject) - requires authentication
router.put('/applications/:applicationId/status', authenticateToken, updateApplicationStatus);

export default router;

