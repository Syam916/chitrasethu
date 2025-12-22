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
   * Upload single image from buffer
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder || 'chitrasethu/posts',
        resource_type: 'image',
        quality: 'auto',
        transformation: [
          {
            width: 1920,
            height: 1920,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto' // request auto format conversion in transformation
          }
        ],
        ...options
      };

      // Upload from buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              thumbnailUrl: this.getThumbnailUrl(result.public_id),
              createdAt: result.created_at
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
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
   * Upload any supported file (image/video/raw)
   * @param {Buffer} fileBuffer
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async uploadFile(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder || 'chitrasethu/attachments',
        resource_type: options.resource_type || 'auto',
        ...options
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              resourceType: result.resource_type,
              format: result.format,
              bytes: result.bytes,
              createdAt: result.created_at
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
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
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple images
   * @param {Array<String>} publicIds - Array of public IDs
   * @returns {Promise<Array>} Array of deletion results
   */
  async deleteMultipleImages(publicIds) {
    const deletePromises = publicIds.map(publicId => 
      this.deleteImage(publicId)
    );
    return Promise.all(deletePromises);
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
      fetch_format: 'auto',
      gravity: 'auto'
    });
  }

  /**
   * Check if Cloudinary is configured
   * @returns {Boolean} True if configured
   */
  isConfigured() {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
  }
}

export default new CloudinaryService();


