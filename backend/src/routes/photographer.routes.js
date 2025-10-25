import express from 'express';
import { getAllPhotographers, getPhotographerById } from '../controllers/photographer.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAllPhotographers);
router.get('/:id', optionalAuth, getPhotographerById);

export default router;

