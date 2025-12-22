import React, { useState } from 'react';
import { X, Image as ImageIcon, MapPin, Hash, Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: () => void;
}

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  open,
  onOpenChange,
  onPostCreated,
}) => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      toast({
        title: 'No Images',
        description: 'Please select at least one image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreatingPost(true);

      // Upload images first
      const images = await uploadMultiple(selectedFiles);

      if (images.length === 0) {
        throw new Error('Failed to upload images');
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
        contentType: images.length > 1 ? 'gallery' : 'image',
        media_urls: images,
      });

      toast({
        title: 'Post Created',
        description: 'Your post has been published successfully!',
      });

      // Reset form
      setCaption('');
      setLocation('');
      setTags('');
      setSelectedFiles([]);
      
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
    }
  };

  const isLoading = uploading || isCreatingPost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your photos with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
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
                  {uploading ? 'Uploading...' : 'Creating post...'}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
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
            <Button type="submit" disabled={isLoading || selectedFiles.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Create Post
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


