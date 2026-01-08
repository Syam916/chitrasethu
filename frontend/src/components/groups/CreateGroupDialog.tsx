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
import { Switch } from '@/components/ui/switch';
import groupService from '@/services/group.service';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void;
}

const GROUP_TYPES = [
  { value: 'regional', label: 'Regional' },
  { value: 'project', label: 'Project' },
  { value: 'network', label: 'Network' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
];

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange,
  onGroupCreated,
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast({
        title: 'Group Name Required',
        description: 'Please enter a name for your group',
        variant: 'destructive',
      });
      return;
    }

    if (!groupType) {
      toast({
        title: 'Group Type Required',
        description: 'Please select a group type',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      await groupService.createGroup({
        groupName: groupName.trim(),
        groupType: groupType as any,
        description: description.trim() || undefined,
        isPublic,
      });

      toast({
        title: 'Group Created',
        description: 'Your community group has been created successfully!',
      });

      // Reset form
      setGroupName('');
      setGroupType('');
      setDescription('');
      setIsPublic(true);

      // Close dialog
      onOpenChange(false);

      // Callback to refresh groups
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create group',
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
          <DialogTitle>Create New Community Group</DialogTitle>
          <DialogDescription>
            Start a new community group to connect with photographers and collaborate on projects
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name *</Label>
            <Input
              id="groupName"
              placeholder="e.g., Wedding Photographers Mumbai"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isCreating}
              maxLength={255}
            />
          </div>

          {/* Group Type */}
          <div className="space-y-2">
            <Label htmlFor="groupType">Group Type *</Label>
            <Select value={groupType} onValueChange={setGroupType} disabled={isCreating}>
              <SelectTrigger id="groupType">
                <SelectValue placeholder="Select group type" />
              </SelectTrigger>
              <SelectContent>
                {GROUP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and focus of this group..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isCreating}
              className="resize-none"
            />
          </div>

          {/* Public/Private */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">Public Group</Label>
              <p className="text-sm text-muted-foreground">
                Public groups can be discovered and joined by anyone
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
              disabled={isCreating}
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
            <Button type="submit" disabled={isCreating || !groupName.trim() || !groupType}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};





