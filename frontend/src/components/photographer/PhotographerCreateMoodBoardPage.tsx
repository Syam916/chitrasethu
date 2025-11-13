import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Sparkles, UploadCloud, Lock, Globe, Hash, Plus, Image as ImageIcon } from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import authService from '@/services/auth.service';

const tagSuggestions = ['Wedding', 'Editorial', 'Lighting', 'Color Palette', 'Traditional', 'Candid'];

const PhotographerCreateMoodBoardPage = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>(['Wedding', 'Candid']);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Create <span className="gradient-text">Mood Board</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Capture visual inspiration, reference lighting setups, and share creative direction with clients and collaborators.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-effect">
            <CardHeader>
              <CardTitle>Mood Board Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4" /> Board Name
                </label>
                <Input placeholder="e.g., Royal Wedding Aesthetic" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" /> Description
                </label>
                <Textarea rows={4} placeholder="Outline the color palette, mood, lighting, and references for this shoot..." />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4" /> Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tagSuggestions.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4" /> Cover Image
                </label>
                <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
                  Drag & drop images or
                  <Button variant="link" size="sm" className="px-2">
                    browse files
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Sharing & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium flex items-center gap-2">
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {isPublic ? 'Public Board' : 'Private Board'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isPublic
                      ? 'Anyone with the link can view and save references.'
                      : 'Only invited collaborators can access this board.'}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Invite Collaborators
              </Button>
              <div className="p-4 border border-border/40 rounded-lg bg-muted/10">
                <p className="text-xs">
                  Once the board is published, you can generate a client-friendly presentation link
                  or embed it inside your booking proposals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Upload References</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="p-4 border border-border/40 rounded-lg bg-muted/10 text-center">
              <UploadCloud className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-foreground">Upload Photos</p>
              <p className="text-xs mt-1">JPEG, PNG up to 10MB each</p>
            </div>
            <div className="p-4 border border-border/40 rounded-lg bg-muted/10 text-center">
              <UploadCloud className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-foreground">Attach Videos</p>
              <p className="text-xs mt-1">MP4, MOV up to 100MB</p>
            </div>
            <div className="p-4 border border-border/40 rounded-lg bg-muted/10 text-center">
              <UploadCloud className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium text-foreground">Embed Inspiration</p>
              <p className="text-xs mt-1">Paste Pinterest or Behance links</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/photographer/mood-boards')}>
            Cancel
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            Publish Board
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerCreateMoodBoardPage;


