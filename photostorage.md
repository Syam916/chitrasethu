# 📸 Complete Photo Storage & Management Guide for Chitrasethu

## 🎯 Overview

This guide covers everything about photo storage, upload, retrieval, and quality maintenance for your photography platform.

---

## 📦 Current Setup

✅ **Already Installed:**
- `cloudinary`: ^1.41.0 - Cloud-based image management
- `multer`: ^1.4.5-lts.1 - File upload middleware

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PHOTO STORAGE ARCHITECTURE                │
└─────────────────────────────────────────────────────────────┘

User Uploads Photo
       │
       ▼
┌──────────────────┐
│  Frontend (React)│
│  • File Input     │
│  • Preview        │
│  • Validation     │
└────────┬──────────┘
         │
         │ HTTP POST (multipart/form-data)
         ▼
┌──────────────────┐
│  Backend (Express)│
│  • Multer         │
│  • Validation     │
│  • Processing     │
└────────┬──────────┘
         │
         │ Upload to Cloud
         ▼
┌──────────────────┐
│   Cloudinary     │
│  • Storage        │
│  • Transformations│
│  • CDN Delivery   │
└────────┬──────────┘
         │
         │ Save URL to Database
         ▼
┌──────────────────┐
│  PostgreSQL      │
│  • photo_url      │
│  • metadata       │
└──────────────────┘
```

---

## 🎯 Option 1: Cloudinary (Recommended for Photography Platforms)

### ✅ Why Cloudinary?

1. **Built for Images**: Optimized for photo-heavy applications
2. **Automatic Optimization**: Compresses without quality loss
3. **Transformations**: Resize, crop, format conversion on-the-fly
4. **CDN**: Fast global delivery
5. **Free Tier**: 25GB storage, 25GB bandwidth/month
6. **Multiple Formats**: WebP, AVIF, JPEG, PNG
7. **Responsive Images**: Auto-generates different sizes
8. **Watermarking**: Built-in watermark support

### 📊 Cloudinary Pricing

| Plan | Storage | Bandwidth | Price |
|------|---------|-----------|-------|
| Free | 25 GB | 25 GB/month | $0 |
| Plus | 100 GB | 100 GB/month | $99/month |
| Advanced | 500 GB | 500 GB/month | $224/month |

**For Photography Platform**: Start with Free, upgrade to Plus when needed.

---

## 🎯 Option 2: AWS S3 + CloudFront (Enterprise Solution)

### ✅ When to Use AWS S3?

- **Large Scale**: Millions of photos
- **Custom Control**: Full control over storage
- **Cost Optimization**: Pay-as-you-go
- **Integration**: Already using AWS services

### 📊 AWS S3 Pricing (Approximate)

- **Storage**: $0.023/GB/month (Standard)
- **Transfer Out**: $0.09/GB (first 10TB)
- **Requests**: $0.005 per 1,000 requests

**For 1000 photos (avg 5MB each = 5GB):**
- Storage: ~$0.12/month
- Transfer: ~$0.45/month (if all viewed)
- **Total**: ~$0.57/month

---

## 🎯 Option 3: Hybrid Approach (Best for Production)

**Use Both:**
- **Cloudinary**: For user uploads, transformations, thumbnails
- **S3**: For long-term archival, backups

---

## 🚀 Implementation: Cloudinary Setup

### Step 1: Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register
2. Sign up (free account)
3. Get your credentials from Dashboard:
   - `CLOUD_NAME`
   - `API_KEY`
   - `API_SECRET`

### Step 2: Backend Configuration

**File**: `backend/.env`

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upload Settings
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp,heic
```

### Step 3: Create Upload Service

**File**: `backend/src/services/cloudinary.service.js`

```javascript
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Upload single image
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder || 'chitrasethu/photos',
        resource_type: 'image',
        format: 'auto', // Auto-optimize format (WebP, AVIF, etc.)
        quality: 'auto', // Auto quality optimization
        fetch_format: 'auto',
        ...options
      };

      // Upload from buffer
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              createdAt: result.created_at
            });
          }
        }
      ).end(fileBuffer);
    });
  }

  /**
   * Upload multiple images
   * @param {Array<Buffer>} fileBuffers - Array of file buffers
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleImages(fileBuffers, options = {}) {
    const uploadPromises = fileBuffers.map(buffer => 
      this.uploadImage(buffer, options)
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Generate optimized URL with transformations
   * @param {String} publicId - Cloudinary public ID
   * @param {Object} transformations - Transformation options
   * @returns {String} Optimized URL
   */
  getOptimizedUrl(publicId, transformations = {}) {
    const defaultTransformations = {
      quality: 'auto',
      fetch_format: 'auto',
      ...transformations
    };

    return cloudinary.url(publicId, defaultTransformations);
  }

  /**
   * Generate responsive image URLs
   * @param {String} publicId - Cloudinary public ID
   * @param {Number} maxWidth - Maximum width
   * @returns {Object} URLs for different sizes
   */
  getResponsiveUrls(publicId, maxWidth = 1920) {
    const sizes = [320, 640, 960, 1280, 1920].filter(w => w <= maxWidth);
    
    return sizes.reduce((urls, width) => {
      urls[width] = cloudinary.url(publicId, {
        width,
        quality: 'auto',
        fetch_format: 'auto',
        crop: 'limit'
      });
      return urls;
    }, {});
  }

  /**
   * Delete image
   * @param {String} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(publicId) {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Generate thumbnail URL
   * @param {String} publicId - Cloudinary public ID
   * @param {Number} width - Thumbnail width
   * @param {Number} height - Thumbnail height
   * @returns {String} Thumbnail URL
   */
  getThumbnailUrl(publicId, width = 300, height = 300) {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });
  }
}

export default new CloudinaryService();
```

### Step 4: Create Upload Controller

**File**: `backend/src/controllers/upload.controller.js`

```javascript
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryService from '../services/cloudinary.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

// Configure Multer with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.config(),
  params: {
    folder: 'chitrasethu/photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
    transformation: [
      {
        width: 1920,
        height: 1920,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|heic/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Upload single photo
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const userId = req.user.userId;
    const { category, description } = req.body;

    // Get upload result from Cloudinary
    const uploadResult = {
      url: req.file.path,
      publicId: req.file.filename,
      width: req.file.width,
      height: req.file.height,
      format: req.file.format,
      bytes: req.file.size
    };

    // Save to database (example for portfolio)
    // await query(`
    //   INSERT INTO photographer_portfolios (photographer_id, photo_url, public_id, width, height, format, bytes, category, description)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    // `, [userId, uploadResult.url, uploadResult.publicId, ...]);

    res.status(200).json({
      status: 'success',
      message: 'Photo uploaded successfully',
      data: {
        photo: uploadResult
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload photo',
      error: error.message
    });
  }
};

// Upload multiple photos
export const uploadMultiplePhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    const userId = req.user.userId;
    const photos = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      width: file.width,
      height: file.height,
      format: file.format,
      bytes: file.size
    }));

    res.status(200).json({
      status: 'success',
      message: `${photos.length} photos uploaded successfully`,
      data: {
        photos
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload photos',
      error: error.message
    });
  }
};

// Delete photo
export const deletePhoto = async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.user.userId;

    // Delete from Cloudinary
    await cloudinaryService.deleteImage(publicId);

    // Delete from database
    // await query('DELETE FROM photographer_portfolios WHERE public_id = $1 AND photographer_id = $2', [publicId, userId]);

    res.status(200).json({
      status: 'success',
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete photo',
      error: error.message
    });
  }
};
```

### Step 5: Create Upload Routes

**File**: `backend/src/routes/upload.routes.js`

```javascript
import express from 'express';
import multer from 'multer';
import { uploadPhoto, uploadMultiplePhotos, deletePhoto } from '../controllers/upload.controller.js';
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
    const allowedTypes = /jpeg|jpg|png|webp|heic/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// All routes require authentication
router.use(authenticateToken);

// Upload single photo
router.post('/photo', upload.single('photo'), uploadPhoto);

// Upload multiple photos
router.post('/photos', upload.array('photos', 10), uploadMultiplePhotos);

// Delete photo
router.delete('/photo/:publicId', deletePhoto);

export default router;
```

### Step 6: Install Required Package

```bash
cd backend
npm install multer-storage-cloudinary
```

---

## 🎨 Frontend Implementation

### Step 1: Create Upl


## 🎨 Frontend Implementation

### Step 1: Create Upload Service

**File**: `frontend/src/services/upload.service.ts`

```typescript
import { API_BASE_URL, getAuthHeader } from '../config/api';

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    photo: {
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    };
  };
}

export interface MultipleUploadResponse {
  status: string;
  message: string;
  data: {
    photos: Array<{
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>;
  };
}

class UploadService {
  /**
   * Upload single photo
   */
  async uploadPhoto(file: File, category?: string, description?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    if (category) formData.append('category', category);
    if (description) formData.append('description', description);

    const response = await fetch(`${API_BASE_URL}/upload/photo`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload photo');
    }

    return response.json();
  }

  /**
   * Upload multiple photos
   */
  async uploadMultiplePhotos(
    files: File[],
    category?: string
  ): Promise<MultipleUploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    if (category) formData.append('category', category);

    const response = await fetch(`${API_BASE_URL}/upload/photos`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload photos');
    }

    return response.json();
  }

  /**
   * Delete photo
   */
  async deletePhoto(publicId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/upload/photo/${publicId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete photo');
    }
  }

  /**
   * Get optimized image URL
   */
  getOptimizedUrl(originalUrl: string, width?: number, height?: number, quality: 'auto' | number = 'auto'): string {
    if (!originalUrl) return '';
    
    // If using Cloudinary, add transformations
    if (originalUrl.includes('cloudinary.com')) {
      const parts = originalUrl.split('/upload/');
      if (parts.length === 2) {
        const transformations: string[] = [];
        
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        if (quality === 'auto') {
          transformations.push('q_auto');
        } else {
          transformations.push(`q_${quality}`);
        }
        transformations.push('f_auto'); // Auto format (WebP, AVIF)
        transformations.push('c_limit'); // Maintain aspect ratio
        
        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
      }
    }
    
    return originalUrl;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(originalUrl: string, size: number = 300): string {
    return this.getOptimizedUrl(originalUrl, size, size, 80);
  }

  /**
   * Get responsive image srcset
   */
  getResponsiveSrcSet(originalUrl: string, maxWidth: number = 1920): string {
    const sizes = [320, 640, 960, 1280, 1920].filter(w => w <= maxWidth);
    return sizes
      .map(size => `${this.getOptimizedUrl(originalUrl, size)} ${size}w`)
      .join(', ');
  }
}

export default new UploadService();
```

### Step 2: Create Upload Hook

**File**: `frontend/src/hooks/useImageUpload.ts`

```typescript
import { useState, useCallback } from 'react';
import uploadService from '@/services/upload.service';

interface UseImageUploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    maxSize = 10, // 10MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'],
    onSuccess,
    onError,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    return null;
  }, [allowedTypes, maxSize]);

  const uploadSingle = useCallback(async (file: File, category?: string, description?: string): Promise<string | null> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Simulate progress (Cloudinary doesn't provide progress events)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadService.uploadPhoto(file, category, description);
      
      clearInterval(progressInterval);
      setProgress(100);

      const url = result.data.photo.url;
      onSuccess?.(url);
      
      return url;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [validateFile, onSuccess, onError]);

  const uploadMultiple = useCallback(async (files: File[], category?: string): Promise<string[]> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate all files
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(`${file.name}: ${validationError}`);
        }
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadService.uploadMultiplePhotos(files, category);
      
      clearInterval(progressInterval);
      setProgress(100);

      const urls = result.data.photos.map(p => p.url);
      urls.forEach(url => onSuccess?.(url));
      
      return urls;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload images';
      setError(errorMessage);
      onError?.(errorMessage);
      return [];
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [validateFile, onSuccess, onError]);

  return {
    uploadSingle,
    uploadMultiple,
    uploading,
    progress,
    error,
  };
};
```

### Step 3: Create Image Upload Component

**File**: `frontend/src/components/ui/image-upload.tsx`

```typescript
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  maxSize?: number;
  category?: string;
  description?: string;
  preview?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  onRemove,
  maxSize = 10,
  category,
  description,
  preview,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
  const { uploadSingle, uploading, progress, error } = useImageUpload({
    maxSize,
    onSuccess: (url) => {
      setPreviewUrl(url);
      onUpload(url);
    },
    onError: (err) => {
      console.error('Upload error:', err);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadSingle(file, category, description);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        {previewUrl ? (
          <div className="relative group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full 










1. Database migration script
Add missing columns to existing tables:
-- photographer_portfoliosALTER TABLE photographer_portfolios ADD COLUMN IF NOT EXISTS public_id VARCHAR(255),ADD COLUMN IF NOT EXISTS width INT,ADD COLUMN IF NOT EXISTS height INT,ADD COLUMN IF NOT EXISTS format VARCHAR(10),ADD COLUMN IF NOT EXISTS bytes INT,ADD COLUMN IF NOT EXISTS cloudinary_folder VARCHAR(255);CREATE INDEX IF NOT EXISTS idx_portfolios_public_id ON photographer_portfolios(public_id);-- user_profilesALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR(255);-- messagesALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_public_id VARCHAR(255);
2. Backend files
A. Cloudinary service (backend/src/services/cloudinary.service.js)
Upload single/multiple images
Generate optimized URLs
Generate responsive URLs
Delete images
Generate thumbnails
B. Upload controller (backend/src/controllers/upload.controller.js)
uploadPhoto — single photo upload
uploadMultiplePhotos — batch upload
deletePhoto — delete with cleanup
updatePhoto — replace existing photo
C. Upload routes (backend/src/routes/upload.routes.js)
POST /api/upload/photo — single upload
POST /api/upload/photos — multiple upload
DELETE /api/upload/photo/:publicId — delete
PUT /api/upload/photo/:publicId — update
D. Portfolio controller updates (backend/src/controllers/photographer.controller.js)
Update portfolio upload to use Cloudinary
Store public_id and metadata
E. Post controller updates (backend/src/controllers/post.controller.js)
Update post media upload to use Cloudinary
Store structured JSONB with public_ids
3. Environment variables (backend/.env)
CLOUDINARY_CLOUD_NAME=your_cloud_
4. Frontend files
A. Upload service (frontend/src/services/upload.service.ts)
uploadPhoto(file, folder) — upload with progress
uploadMultiplePhotos(files, folder) — batch upload
deletePhoto(publicId) — delete
getOptimizedUrl(publicId, options) — get transformed URL
B. Upload hook (frontend/src/hooks/useUpload.ts)
File validation
Upload progress tracking
Error handling
Preview generation
C. Upload component (frontend/src/components/ui/ImageUpload.tsx)
Drag & drop
Preview
Progress bar
Multiple file support
Production considerations
1. Image optimization strategy
Thumbnails: 300x300 (fill crop)
Medium: 800x800 (limit)
Large: 1920x1920 (limit)
Original: stored, served on demand
2. Folder structure in Cloudinary
chitrasethu/  ├── avatars/  │   └── user_{userId}/  ├── portfolios/  │   └── photographer_{photographerId}/  ├── posts/  │   └── user_{userId}/  ├── events/  │   └── event_{eventId}/  ├── collections/  │   └── user_{userId}/  └── messages/      └── conversation_{conversationId}/
3. JSONB structure for arrays
{  "media_urls": [    {      "url": "https://res.cloudinary.com/...",      "public_id": "chitrasethu/posts/user_123/abc123",      "width": 1920,      "height": 1080,      "format": "webp",      "bytes": 245678,      "thumbnail_url": "https://res.cloudinary.com/.../w_300,h_300,c_fill/..."    }  ]}
4. Security
File type validation (MIME + extension)
File size limits (10MB per image)
Rate limiting on upload endpoints
Signed uploads for sensitive content
Virus scanning (Cloudinary add-on)
5. Performance
Lazy loading for images
Responsive images (srcset)
WebP/AVIF format auto-conversion
CDN delivery (Cloudinary)
Image caching headers
6. Error handling
Upload failures → retry mechanism
Invalid files → clear error messages
Quota exceeded → user notification
Network issues → progress saving