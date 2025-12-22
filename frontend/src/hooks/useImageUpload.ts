import { useState, useCallback } from 'react';
import uploadService, { UploadedImage } from '@/services/upload.service';

interface UseImageUploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
  onSuccess?: (images: UploadedImage[]) => void;
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
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
      }

      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        return `File size exceeds ${maxSize}MB limit. Current: ${fileSizeMB.toFixed(2)}MB`;
      }

      return null;
    },
    [allowedTypes, maxSize]
  );

  const uploadSingle = useCallback(
    async (file: File, folder?: string): Promise<UploadedImage | null> => {
      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        // Upload with progress tracking
        const result = await uploadService.uploadPhoto(file, folder, (prog) => {
          setProgress(prog);
        });

        setProgress(100);
        setUploadedImages([result]);
        onSuccess?.([result]);

        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to upload image';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [validateFile, onSuccess, onError]
  );

  const uploadMultiple = useCallback(
    async (files: File[], folder?: string): Promise<UploadedImage[]> => {
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

        // Upload with progress tracking
        const results = await uploadService.uploadMultiplePhotos(files, folder, (prog) => {
          setProgress(prog);
        });

        setProgress(100);
        setUploadedImages(results);
        onSuccess?.(results);

        return results;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to upload images';
        setError(errorMessage);
        onError?.(errorMessage);
        return [];
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [validateFile, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedImages([]);
  }, []);

  const removeImage = useCallback((publicId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }, []);

  return {
    uploadSingle,
    uploadMultiple,
    uploading,
    progress,
    error,
    uploadedImages,
    reset,
    removeImage,
    validateFile,
  };
};


