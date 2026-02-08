import { API_BASE_URL, getAuthHeader } from '../config/api';

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  thumbnailUrl: string;
  createdAt: string;
}

export interface UploadedAttachment {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  createdAt: string;
  originalName?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
}

export interface UploadResponse {
  status: string;
  message: string;
  data: {
    photo: UploadedImage;
  };
}

export interface MultipleUploadResponse {
  status: string;
  message: string;
  data: {
    photos: UploadedImage[];
  };
}

class UploadService {
  /**
   * Upload single photo
   */
  async uploadPhoto(
    file: File,
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('photo', file);
    if (folder) formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          resolve(response.data.photo);
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Failed to upload photo'));
          } catch {
            reject(new Error('Failed to upload photo'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload/photo`);
      
      // Add auth header
      const authHeader = getAuthHeader();
      if (authHeader.Authorization) {
        xhr.setRequestHeader('Authorization', authHeader.Authorization);
      }

      xhr.send(formData);
    });
  }

  /**
   * Upload multiple photos
   */
  async uploadMultiplePhotos(
    files: File[],
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedImage[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    if (folder) formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response: MultipleUploadResponse = JSON.parse(xhr.responseText);
          resolve(response.data.photos);
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Failed to upload photos'));
          } catch {
            reject(new Error('Failed to upload photos'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload/photos`);
      
      // Add auth header
      const authHeader = getAuthHeader();
      if (authHeader.Authorization) {
        xhr.setRequestHeader('Authorization', authHeader.Authorization);
      }

      xhr.send(formData);
    });
  }

  /**
   * Upload single video
   */
  async uploadVideo(
    file: File,
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedAttachment> {
    const formData = new FormData();
    formData.append('video', file);
    if (folder) formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data.video as UploadedAttachment);
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Failed to upload video'));
          } catch {
            reject(new Error('Failed to upload video'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload/video`);

      const authHeader = getAuthHeader();
      if (authHeader.Authorization) {
        xhr.setRequestHeader('Authorization', authHeader.Authorization);
      }

      xhr.send(formData);
    });
  }

  /**
   * Upload multiple videos
   */
  async uploadMultipleVideos(
    files: File[],
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedAttachment[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('videos', file);
    });
    if (folder) formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data.videos as UploadedAttachment[]);
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Failed to upload videos'));
          } catch {
            reject(new Error('Failed to upload videos'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload/videos`);

      const authHeader = getAuthHeader();
      if (authHeader.Authorization) {
        xhr.setRequestHeader('Authorization', authHeader.Authorization);
      }

      xhr.send(formData);
    });
  }

  /**
   * Upload attachment (image/video/document)
   */
  async uploadAttachment(
    file: File,
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadedAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data.attachment as UploadedAttachment);
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Failed to upload attachment'));
          } catch {
            reject(new Error('Failed to upload attachment'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload/attachment`);

      const authHeader = getAuthHeader();
      if (authHeader.Authorization) {
        xhr.setRequestHeader('Authorization', authHeader.Authorization);
      }

      xhr.send(formData);
    });
  }

  /**
   * Delete photo
   */
  async deletePhoto(publicId: string): Promise<void> {
    // Encode publicId for URL
    const encodedPublicId = encodeURIComponent(publicId);
    
    const response = await fetch(`${API_BASE_URL}/upload/photo/${encodedPublicId}`, {
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
  getOptimizedUrl(
    originalUrl: string,
    width?: number,
    height?: number,
    quality: 'auto' | number = 'auto'
  ): string {
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
   * Get video thumbnail URL from Cloudinary video URL
   * Cloudinary can generate thumbnails from videos by extracting a frame
   */
  getVideoThumbnailUrl(videoUrl: string, size: number = 500): string {
    if (!videoUrl) return '';
    
    // If using Cloudinary, generate thumbnail from video
    if (videoUrl.includes('cloudinary.com') && videoUrl.includes('/video/')) {
      try {
        // Cloudinary video URL format examples:
        // https://res.cloudinary.com/{cloud_name}/video/upload/{version}/{public_id}.{format}
        // https://res.cloudinary.com/{cloud_name}/video/upload/{transformations}/{public_id}.{format}
        // https://res.cloudinary.com/{cloud_name}/video/upload/{public_id}.{format}
        
        // Parse the URL to extract cloud name and path
        const urlMatch = videoUrl.match(/https?:\/\/res\.cloudinary\.com\/([^\/]+)\/video\/upload\/(.+)$/);
        if (!urlMatch) {
          console.warn('Invalid Cloudinary video URL format:', videoUrl);
          return videoUrl;
        }
        
        const cloudName = urlMatch[1];
        const pathAfterUpload = urlMatch[2];
        
        // Extract public_id (remove version if present, remove file extension)
        // Path format could be: "v1234567890/folder/file.mp4" or "folder/file.mp4"
        let publicId = pathAfterUpload;
        
        // Remove version prefix if present (starts with 'v' followed by digits)
        if (publicId.match(/^v\d+\//)) {
          publicId = publicId.replace(/^v\d+\//, '');
        }
        
        // Remove file extension
        publicId = publicId.replace(/\.(mp4|mov|avi|webm|mkv|flv|wmv|m4v)$/i, '');
        
        // Build transformations for thumbnail
        const transformations = [
          'so_1', // Start offset - get frame at 1 second
          `w_${size}`,
          `h_${size}`,
          'c_fill',
          'q_auto',
          'f_auto'
        ];
        
        // Construct thumbnail URL
        const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${publicId}.jpg`;
        
        return thumbnailUrl;
      } catch (error) {
        console.warn('Failed to generate video thumbnail URL:', error, videoUrl);
        return videoUrl; // Fallback to video URL
      }
    }
    
    return videoUrl; // Fallback to video URL if not Cloudinary
  }

  /**
   * Get responsive image srcset
   */
  getResponsiveSrcSet(originalUrl: string, maxWidth: number = 1920): string {
    const sizes = [320, 640, 960, 1280, 1920].filter((w) => w <= maxWidth);
    return sizes
      .map((size) => `${this.getOptimizedUrl(originalUrl, size)} ${size}w`)
      .join(', ');
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSizeMB: number = 10): string | null {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.';
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit. Current size: ${fileSizeMB.toFixed(2)}MB`;
    }

    return null;
  }

  /**
   * Validate video file before upload
   */
  validateVideoFile(file: File, maxSizeMB: number = 100): string | null {
    // Check file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm', 'video/mkv', 'video/flv', 'video/wmv'];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Only MP4, MOV, AVI, WebM, MKV, FLV, and WMV videos are allowed.';
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit. Current size: ${fileSizeMB.toFixed(2)}MB`;
    }

    return null;
  }
}

export default new UploadService();


