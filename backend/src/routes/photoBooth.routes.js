import express from 'express';
import {
  createGallery,
  getMyGalleries,
  getGalleryById,
  updateGallery,
  deleteGallery,
  getPublicGallery,
  verifyPassword,
  downloadQRCode,
  sendGalleryEmail,
  trackAccess,
  trackPhotoDownload
} from '../controllers/photoBooth.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Photographer routes (authenticated)
router.post('/photographer/photo-booth/generate', authenticateToken, createGallery);
router.get('/photographer/photo-booth/galleries', authenticateToken, getMyGalleries);
router.get('/photographer/photo-booth/:galleryId', authenticateToken, getGalleryById);
router.put('/photographer/photo-booth/:galleryId', authenticateToken, updateGallery);
router.delete('/photographer/photo-booth/:galleryId', authenticateToken, deleteGallery);
router.get('/photographer/photo-booth/:galleryId/qr-code', authenticateToken, downloadQRCode);
router.post('/photographer/photo-booth/:galleryId/send-email', authenticateToken, sendGalleryEmail);

// Public routes (for customers)
router.get('/photo-booth/:qrCode', optionalAuth, getPublicGallery);
router.post('/photo-booth/:qrCode/verify-password', verifyPassword);
router.post('/photo-booth/:qrCode/access', trackAccess);
router.post('/photo-booth/photos/:photoId/download', trackPhotoDownload);

export default router;

