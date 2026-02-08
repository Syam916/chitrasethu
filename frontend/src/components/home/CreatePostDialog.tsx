import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, MapPin, Hash, Loader2, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import ImageUpload from '@/components/ui/image-upload';
import { useImageUpload } from '@/hooks/useImageUpload';
import postService from '@/services/post.service';
import uploadService from '@/services/upload.service';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/auth.service';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
  initialMode?: 'photo' | 'video';
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  open,
  onOpenChange,
  onPostCreated,
  initialMode = 'photo',
}) => {
  const user = authService.getStoredUser();
  const isPhotographer = user?.userType === 'photographer';
  const [mode, setMode] = useState<'photo' | 'video'>(initialMode);

  // Close dialog if customer tries to access it
  useEffect(() => {
    if (open && !isPhotographer) {
      onOpenChange(false);
    }
  }, [open, isPhotographer, onOpenChange]);

  // Reset mode when dialog opens
  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const { toast } = useToast();
  const { uploadMultiple, uploading, progress, error, uploadedImages } = useImageUpload({
    maxSize: 10,
    onError: (err) => {
      toast({
        title: 'Upload Failed',
        description: err,
        variant: 'destructive',
      });
    },
  });

  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate video files
    for (const file of files) {
      const validationError = uploadService.validateVideoFile(file, 100);
      if (validationError) {
        toast({
          title: 'Invalid Video',
          description: `${file.name}: ${validationError}`,
          variant: 'destructive',
        });
        return;
      }
    }

    setSelectedVideoFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'photo' && selectedFiles.length === 0) {
      toast({
        title: 'No Images',
        description: 'Please select at least one image',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'video' && selectedVideoFiles.length === 0) {
      toast({
        title: 'No Videos',
        description: 'Please select at least one video',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingPost(true);
      let mediaUrls: any[] = [];

      if (mode === 'photo') {
        // Upload images
        const images = await uploadMultiple(selectedFiles);
        if (images.length === 0) {
          throw new Error('Failed to upload images');
        }
        mediaUrls = images;
      } else {
        // Upload videos
        setUploadingVideos(true);
        setUploadProgress(0);
        
        const userId = authService.getStoredUser()?.userId;
        const folder = userId
          ? `chitrasethu/posts/videos/user_${userId}`
          : 'chitrasethu/posts/videos';
        
        const uploadedVideos = await uploadService.uploadMultipleVideos(
          selectedVideoFiles,
          folder,
          (progress) => setUploadProgress(progress)
        );

        // Convert videos to media URLs format with thumbnails
        mediaUrls = uploadedVideos.map((video) => ({
          url: video.url,
          thumbnailUrl: uploadService.getVideoThumbnailUrl(video.url, 800),
          publicId: video.publicId,
          resourceType: 'video',
        }));

        setUploadingVideos(false);
      }

      // Parse tags
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Create post
      await postService.create({
        caption: caption || undefined,
        location: location || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
        visibility: 'public',
        contentType: mode === 'video' ? 'video' : mediaUrls.length > 1 ? 'gallery' : 'image',
        media_urls: mediaUrls,
      });

      toast({
        title: 'Post Created',
        description: `Your ${mode === 'video' ? 'video' : 'photo'} post has been published successfully!`,
      });

      // Reset form
      setCaption('');
      setLocation('');
      setTags('');
      setSelectedFiles([]);
      setSelectedVideoFiles([]);
      setUploadProgress(0);
      
      // Close dialog and refresh
      onOpenChange(false);
      onPostCreated?.();
    } catch (err: any) {
      toast({
        title: 'Failed to Create Post',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingPost(false);
      setUploadingVideos(false);
    }
  };

  const isLoading = uploading || isCreatingPost || uploadingVideos;
  const currentProgress = mode === 'video' ? uploadProgress : progress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'video' ? 'Upload Video' : 'Create New Post'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'video' 
              ? 'Share your videos with the community'
              : 'Share your photos with the community'}
          </DialogDescription>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-2 border border-border rounded-lg p-1">
          <Button
            type="button"
            variant={mode === 'photo' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setMode('photo');
              setSelectedVideoFiles([]);
            }}
            className={mode === 'photo' ? 'bg-primary text-primary-foreground' : ''}
            disabled={isLoading}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Photos
          </Button>
          <Button
            type="button"
            variant={mode === 'video' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setMode('video');
              setSelectedFiles([]);
            }}
            className={mode === 'video' ? 'bg-primary text-primary-foreground' : ''}
            disabled={isLoading}
          >
            <Video className="w-4 h-4 mr-2" />
            Videos
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload */}
          {mode === 'photo' ? (
            <div className="space-y-2">
              <Label>Photos *</Label>
              <ImageUpload
                onImagesSelected={handleImagesSelected}
                maxFiles={10}
                maxSize={10}
                preview={true}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Videos *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <input
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/webm,video/mkv,video/flv,video/wmv"
                  multiple
                  onChange={handleVideoSelected}
                  disabled={isLoading}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      <Video className="w-4 h-4 mr-2" />
                      Select Videos
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports: MP4, MOV, AVI, WebM, MKV, FLV, WMV (Max 100MB each)
                </p>
                {selectedVideoFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      {selectedVideoFiles.length} video(s) selected:
                    </p>
                    <div className="space-y-1">
                      {selectedVideoFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                        >
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="text-muted-foreground ml-2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Add location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              <Hash className="w-4 h-4 inline mr-2" />
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="nature, portrait, wedding (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          {/* Progress */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {uploadingVideos 
                    ? 'Uploading videos...' 
                    : uploading 
                    ? 'Uploading images...' 
                    : 'Creating post...'}
                </span>
                <span className="font-medium">{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isLoading || 
                (mode === 'photo' && selectedFiles.length === 0) ||
                (mode === 'video' && selectedVideoFiles.length === 0)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadingVideos 
                    ? 'Uploading...' 
                    : uploading 
                    ? 'Uploading...' 
                    : 'Creating...'}
                </>
              ) : (
                <>
                  {mode === 'video' ? (
                    <Video className="w-4 h-4 mr-2" />
                  ) : (
                    <ImageIcon className="w-4 h-4 mr-2" />
                  )}
                  {mode === 'video' ? 'Upload Video' : 'Create Post'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;


