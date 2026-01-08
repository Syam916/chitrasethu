import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Palette, Sparkles, UploadCloud, Lock, Globe, Hash, Image as ImageIcon, Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import authService from '@/services/auth.service';
import moodBoardService, { MoodBoard } from '@/services/moodboard.service';
import uploadService from '@/services/upload.service';

const tagSuggestions = ['Wedding', 'Editorial', 'Lighting', 'Color Palette', 'Traditional', 'Candid'];
const categoryOptions = ['Wedding', 'Fashion', 'Portrait', 'Event', 'Nature', 'Architecture', 'Color Palette', 'Other'];

const PhotographerEditMoodBoardPage = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const [board, setBoard] = useState<MoodBoard | null>(null);
  const [boardName, setBoardName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadBoard();
  }, [boardId, navigate]);

  const loadBoard = async () => {
    if (!boardId) return;
    
    try {
      setIsLoading(true);
      const boardData = await moodBoardService.getById(parseInt(boardId));
      setBoard(boardData);
      setBoardName(boardData.boardName);
      setDescription(boardData.description || '');
      setCategory(boardData.category || '');
      setSelectedTags(boardData.tags || []);
      setIsPublic(boardData.privacy === 'public');
      setCoverImage(boardData.coverImage || null);
      setImages(boardData.images || []);
    } catch (err: any) {
      console.error('Error loading mood board:', err);
      setError(err.message || 'Failed to load mood board');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = uploadService.validateFile(file, 10);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const uploaded = await uploadService.uploadPhoto(file, 'moodboards/cover', (progress) => {
        setUploadProgress(progress);
      });
      setCoverImage(uploaded.url);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validationError = uploadService.validateFile(file, 10);
      if (validationError) {
        setError(`${file.name}: ${validationError}`);
        return;
      }
    }

    try {
      setIsUploading(true);
      setError(null);
      const uploaded = await uploadService.uploadMultiplePhotos(files, 'moodboards/images', (progress) => {
        setUploadProgress(progress);
      });
      setImages((prev) => [...prev, ...uploaded.map((img) => img.url)]);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!boardId || !boardName.trim()) {
      setError('Board name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const boardData = {
        boardName: boardName.trim(),
        description: description.trim() || undefined,
        category: category || undefined,
        tags: selectedTags,
        privacy: isPublic ? 'public' : 'private',
        coverImage: coverImage || undefined,
        images: images,
      };

      await moodBoardService.update(parseInt(boardId), boardData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/photographer/mood-boards/${boardId}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating mood board:', err);
      setError(err.message || 'Failed to update mood board. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <PhotographerNavbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="glass-effect">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading mood board...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <PhotographerNavbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="glass-effect border-destructive">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
              <p className="text-destructive mb-4">{error || 'Mood board not found'}</p>
              <Button onClick={() => navigate('/photographer/mood-boards')}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Edit <span className="gradient-text">Mood Board</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Update your mood board details, images, and settings.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-6">
        {error && (
          <Card className="glass-effect border-destructive">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setError(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="glass-effect border-green-500">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-500">Mood board updated successfully! Redirecting...</p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass-effect">
              <CardHeader>
                <CardTitle>Mood Board Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4" /> Board Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Royal Wedding Aesthetic"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" /> Description
                  </Label>
                  <Textarea
                    rows={4}
                    placeholder="Outline the color palette, mood, lighting, and references for this shoot..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    Category
                  </Label>
                  <select
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4" /> Tags
                  </Label>
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
                  {selectedTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} variant="default" className="gap-1">
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => toggleTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <ImageIcon className="w-4 h-4" /> Cover Image
                  </Label>
                  {coverImage ? (
                    <div className="relative">
                      <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setCoverImage(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground cursor-pointer hover:border-primary transition-colors"
                      onClick={() => coverImageInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <div className="space-y-2">
                          <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
                          <p>Uploading... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <>
                          Drag & drop images or{' '}
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              coverImageInputRef.current?.click();
                            }}
                          >
                            browse files
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageUpload}
                  />
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
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect mt-6">
            <CardHeader>
              <CardTitle>Upload References</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="p-4 border border-dashed border-border rounded-lg bg-muted/10 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="space-y-2">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                    <p className="font-medium text-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium text-foreground">Upload Photos</p>
                    <p className="text-xs mt-1 text-muted-foreground">JPEG, PNG up to 10MB each</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImagesUpload}
              />
              
              {images.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Images ({images.length})</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Reference ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/photographer/mood-boards/${boardId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary-glow"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Board'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotographerEditMoodBoardPage;

