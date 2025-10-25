import express from 'express';
import { getAllPosts } from '../controllers/post.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAllPosts);

export default router;

