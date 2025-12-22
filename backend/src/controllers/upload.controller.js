import cloudinaryService from '../services/cloudinary.service.js';

/**
 * Upload single photo
 */
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Check if Cloudinary is configured
    if (!cloudinaryService.isConfigured()) {
      return res.status(500).json({
        status: 'error',
        message: 'Image upload service is not configured'
      });
    }

    const userId = req.user.userId;
    const { folder } = req.body;

    // Determine folder based on context
    const uploadFolder = folder || `chitrasethu/posts/user_${userId}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(
      req.file.buffer,
      { folder: uploadFolder }
    );

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

/**
 * Upload multiple photos
 */
export const uploadMultiplePhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No files uploaded'
      });
    }

    // Check if Cloudinary is configured
    if (!cloudinaryService.isConfigured()) {
      return res.status(500).json({
        status: 'error',
        message: 'Image upload service is not configured'
      });
    }

    const userId = req.user.userId;
    const { folder } = req.body;

    // Determine folder
    const uploadFolder = folder || `chitrasethu/posts/user_${userId}`;

    // Upload all files
    const fileBuffers = req.files.map(file => file.buffer);
    const uploadResults = await cloudinaryService.uploadMultipleImages(
      fileBuffers,
      { folder: uploadFolder }
    );

    res.status(200).json({
      status: 'success',
      message: `${uploadResults.length} photos uploaded successfully`,
      data: {
        photos: uploadResults
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

/**
 * Delete photo
 */
export const deletePhoto = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        status: 'error',
        message: 'Public ID is required'
      });
    }

    // Delete from Cloudinary
    await cloudinaryService.deleteImage(publicId);

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

/**
 * Get optimized image URL
 */
export const getOptimizedUrl = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, quality } = req.query;

    const transformations = {};
    if (width) transformations.width = parseInt(width);
    if (height) transformations.height = parseInt(height);
    if (quality) transformations.quality = quality;

    const optimizedUrl = cloudinaryService.getOptimizedUrl(publicId, transformations);

    res.status(200).json({
      status: 'success',
      data: {
        url: optimizedUrl
      }
    });
  } catch (error) {
    console.error('Get URL error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate optimized URL',
      error: error.message
    });
  }
};

/**
 * Upload a generic attachment (image/video/document)
 */
export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    if (!cloudinaryService.isConfigured()) {
      return res.status(500).json({
        status: 'error',
        message: 'Upload service is not configured'
      });
    }

    const userId = req.user.userId;
    const { folder } = req.body;
    const uploadFolder = folder || `chitrasethu/attachments/user_${userId}`;

    // Get original filename and extension
    const originalName = req.file.originalname || 'attachment';
    const fileExtension = originalName.includes('.') ? originalName.split('.').pop() : null;
    const fileNameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    
    // Sanitize filename for Cloudinary (remove special chars, keep alphanumeric, dash, underscore)
    const sanitizedFileName = fileNameWithoutExt
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50); // Limit length
    
    // Create public_id with original filename
    const publicIdBase = `${uploadFolder}/${sanitizedFileName}_${Date.now()}`;
    const publicId = fileExtension ? `${publicIdBase}.${fileExtension}` : publicIdBase;

    // Choose resource type based on MIME
    const mime = (req.file.mimetype || '').toLowerCase();
    let resourceType = 'raw'; // Default for documents and audio
    if (mime.startsWith('image/')) resourceType = 'image';
    else if (mime.startsWith('video/')) resourceType = 'video';
    // Audio files use 'raw' resource type (default)

    const result = await cloudinaryService.uploadFile(req.file.buffer, {
      folder: uploadFolder,
      resource_type: resourceType,
      public_id: publicId,
      filename_override: originalName,
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      format: fileExtension || undefined,
      // Preserve original filename in context
      context: {
        alt: originalName,
        caption: originalName
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Attachment uploaded successfully',
      data: {
        attachment: {
          ...result,
          originalName: originalName,
          fileName: originalName,
          mimeType: req.file.mimetype,
          size: req.file.size
        }
      }
    });
  } catch (error) {
    console.error('Attachment upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload attachment',
      error: error.message
    });
  }
};


