import express from 'express';
import multer from 'multer';
import {
  uploadPhoto,
  uploadMultiplePhotos,
  uploadVideo,
  uploadMultipleVideos,
  deletePhoto,
  getOptimizedUrl,
  uploadAttachment
} from '../controllers/upload.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure Multer (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|webp|heic/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, PNG, WebP, HEIC) are allowed!'));
  }
});

// Video upload (videos only) up to 100MB
const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type for videos
    const allowedTypes = /mp4|mov|avi|webm|mkv|flv|wmv/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only video files (MP4, MOV, AVI, WebM, MKV, FLV, WMV) are allowed!'));
  }
});

// Attachment upload (images/videos/docs/audio) up to 25MB
const attachmentUpload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, documents, and audio files
    const allowed = /jpeg|jpg|png|webp|heic|mp4|mov|avi|pdf|doc|docx|xls|xlsx|webm|mp3|wav|m4a|ogg|aac/;
    const mimetype = allowed.test(file.mimetype.toLowerCase());
    const extname = allowed.test(file.originalname.toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed'));
  }
});

// All routes require authentication
router.use(authenticateToken);

// Upload single photo
router.post('/photo', upload.single('photo'), uploadPhoto);

// Upload multiple photos (max 10)
router.post('/photos', upload.array('photos', 10), uploadMultiplePhotos);

// Upload single video
router.post('/video', videoUpload.single('video'), uploadVideo);

// Upload multiple videos (max 5)
router.post('/videos', videoUpload.array('videos', 5), uploadMultipleVideos);

// Delete photo
router.delete('/photo/:publicId', deletePhoto);

// Get optimized URL
router.get('/optimized/:publicId', getOptimizedUrl);

// Upload attachment (images/videos/docs)
router.post('/attachment', attachmentUpload.single('file'), uploadAttachment);

export default router;


