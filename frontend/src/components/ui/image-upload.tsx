import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesSelected?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  preview?: boolean;
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesSelected,
  maxFiles = 10,
  maxSize = 10,
  preview = true,
  className = '',
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, maxFiles);
    setSelectedFiles(fileArray);

    // Create previews
    if (preview) {
      const urls: string[] = [];
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          urls.push(reader.result as string);
          if (urls.length === fileArray.length) {
            setPreviewUrls(urls);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Notify parent
    onImagesSelected?.(fileArray);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
    onImagesSelected?.(newFiles);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImagesSelected?.([]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer',
          'hover:border-primary hover:bg-accent/50',
          dragActive && 'border-primary bg-accent',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drop images here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {maxFiles > 1 ? `Up to ${maxFiles} images` : '1 image'} • Max {maxSize}MB each
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WebP, HEIC
            </p>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {preview && previewUrls.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'} selected
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
            >
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white bg-black/70 rounded px-2 py-1 truncate">
                    {selectedFiles[index]?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;


