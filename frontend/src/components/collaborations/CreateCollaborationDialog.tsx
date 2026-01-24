import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import collaborationService from '@/services/collaboration.service';
import { useToast } from '@/hooks/use-toast';

interface CreateCollaborationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCollaborationCreated?: () => void;
}

export const CreateCollaborationDialog: React.FC<CreateCollaborationDialogProps> = ({
  open,
  onOpenChange,
  onCollaborationCreated,
}) => {
  const [collaborationType, setCollaborationType] = useState<'seeking' | 'offering'>('seeking');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your collaboration',
        variant: 'destructive',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please provide a description',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      await collaborationService.createCollaboration({
        collaborationType,
        title: title.trim(),
        description: description.trim(),
        skills: skills.length > 0 ? skills : undefined,
        location: location.trim() || undefined,
        date: date || undefined,
        budget: budget.trim() || undefined,
        minBudget: minBudget ? parseFloat(minBudget) : undefined,
        maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
      });

      toast({
        title: 'Collaboration Posted',
        description: 'Your collaboration has been posted successfully!',
      });

      // Reset form
      setCollaborationType('seeking');
      setTitle('');
      setDescription('');
      setSkills([]);
      setSkillInput('');
      setLocation('');
      setDate('');
      setBudget('');
      setMinBudget('');
      setMaxBudget('');

      // Close dialog
      onOpenChange(false);

      // Callback to refresh collaborations
      if (onCollaborationCreated) {
        onCollaborationCreated();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create collaboration',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Collaboration</DialogTitle>
          <DialogDescription>
            {collaborationType === 'seeking'
              ? 'Looking for photographers to collaborate with?'
              : 'Offering your services for collaboration?'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Collaboration Type */}
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={collaborationType}
              onValueChange={(value) => setCollaborationType(value as 'seeking' | 'offering')}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seeking">I'm Seeking Collaboration</SelectItem>
                <SelectItem value="offering">I'm Offering Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Need Second Shooter for Wedding - Feb 25"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the collaboration opportunity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              disabled={isCreating}
              className="resize-none"
            />
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills</Label>
            <div className="flex gap-2">
              <Input
                id="skills"
                placeholder="Add a skill (e.g., Wedding Photography)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                disabled={isCreating}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                disabled={isCreating || !skillInput.trim()}
              >
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-destructive"
                      disabled={isCreating}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Mumbai, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date/Timeframe</Label>
            <Input
              id="date"
              placeholder="e.g., 2024-02-25 or Ongoing"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (Optional)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                id="budget"
                placeholder="Budget range"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={isCreating}
              />
              <Input
                placeholder="Min (₹)"
                type="number"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                disabled={isCreating}
              />
              <Input
                placeholder="Max (₹)"
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                disabled={isCreating}
              />
            </div>
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
            <Button type="submit" disabled={isCreating || !title.trim() || !description.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Collaboration'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};







