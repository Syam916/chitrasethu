import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import discussionService from '@/services/discussion.service';
import { useToast } from '@/hooks/use-toast';

interface CreateDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscussionCreated?: () => void;
}

const DISCUSSION_CATEGORIES = [
  'Equipment',
  'Business',
  'Post-Processing',
  'Client Relations',
  'Techniques',
  'Inspiration',
];

export const CreateDiscussionDialog: React.FC<CreateDiscussionDialogProps> = ({
  open,
  onOpenChange,
  onDiscussionCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your discussion',
        variant: 'destructive',
      });
      return;
    }

    if (!category) {
      toast({
        title: 'Category Required',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      await discussionService.createTopic({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
      });

      toast({
        title: 'Discussion Created',
        description: 'Your discussion has been posted successfully!',
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');

      // Close dialog
      onOpenChange(false);

      // Callback to refresh discussions
      if (onDiscussionCreated) {
        onDiscussionCreated();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create discussion',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
          <DialogDescription>
            Share your thoughts, ask questions, or start a conversation with the community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isCreating}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {DISCUSSION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What would you like to discuss?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about your discussion topic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              disabled={isCreating}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !title.trim() || !category}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Discussion'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};













