import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Palette, Sparkles, UploadCloud, Lock, Globe, Hash, Plus, Image as ImageIcon, 
  Loader2, AlertCircle, X, CheckCircle2, Users, Calendar, Mail, FileText, 
  Wand2, Layout, Camera, Heart, Star, ArrowRight
} from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import authService from '@/services/auth.service';
import moodBoardService from '@/services/moodboard.service';
import uploadService from '@/services/upload.service';

const tagSuggestions = ['Wedding', 'Editorial', 'Lighting', 'Color Palette', 'Traditional', 'Candid', 'Elegant', 'Modern'];
const categoryOptions = ['Wedding', 'Fashion', 'Portrait', 'Event', 'Nature', 'Architecture', 'Color Palette', 'Other'];

// Board Templates
const boardTemplates = [
  {
    id: 'wedding',
    name: 'Wedding Mood Board',
    category: 'Wedding',
    description: 'Perfect for wedding photography inspiration',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    defaultTags: ['Wedding', 'Elegant', 'Traditional'],
    suggestedImages: 15
  },
  {
    id: 'fashion',
    name: 'Fashion Editorial',
    category: 'Fashion',
    description: 'High-fashion photography references',
    icon: Star,
    color: 'from-purple-500 to-indigo-500',
    defaultTags: ['Fashion', 'Editorial', 'Modern'],
    suggestedImages: 20
  },
  {
    id: 'portrait',
    name: 'Portrait Session',
    category: 'Portrait',
    description: 'Portrait photography inspiration',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    defaultTags: ['Portrait', 'Lighting', 'Candid'],
    suggestedImages: 12
  },
  {
    id: 'corporate',
    name: 'Corporate Event',
    category: 'Event',
    description: 'Professional event photography',
    icon: FileText,
    color: 'from-gray-500 to-slate-500',
    defaultTags: ['Corporate', 'Event', 'Professional'],
    suggestedImages: 10
  },
  {
    id: 'custom',
    name: 'Custom Template',
    category: 'Other',
    description: 'Start from scratch',
    icon: Wand2,
    color: 'from-primary to-primary-glow',
    defaultTags: [],
    suggestedImages: 0
  }
];

const PhotographerCreateCustomBoardPage = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [boardName, setBoardName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  
  // Client-specific fields
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [includeBranding, setIncludeBranding] = useState(true);
  const [allowClientComments, setAllowClientComments] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'template' | 'details' | 'images'>('template');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleTemplateSelect = (templateId: string) => {
    const template = boardTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCategory(template.category);
      setSelectedTags(template.defaultTags);
      setBoardName(template.name);
      setDescription(template.description);
      setStep('details');
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
    
    if (!boardName.trim()) {
      setError('Board name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Include client info in description if provided
      let fullDescription = description;
      if (clientName || eventDate || projectNotes) {
        fullDescription += '\n\n--- Client Information ---\n';
        if (clientName) fullDescription += `Client: ${clientName}\n`;
        if (eventDate) fullDescription += `Event Date: ${eventDate}\n`;
        if (eventLocation) fullDescription += `Location: ${eventLocation}\n`;
        if (projectNotes) fullDescription += `\nNotes: ${projectNotes}\n`;
      }

      const boardData = {
        boardName: boardName.trim(),
        description: fullDescription.trim() || undefined,
        category: category || undefined,
        tags: selectedTags,
        privacy: isPublic ? 'public' : 'private',
        coverImage: coverImage || undefined,
        images: images,
      };

      const newBoard = await moodBoardService.create(boardData);
      setSuccess(true);
      
      // TODO: Send email to client if email provided
      if (clientEmail) {
        // Future: Implement email sending
        console.log('Would send board to:', clientEmail);
      }
      
      setTimeout(() => {
        navigate('/photographer/mood-boards');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating mood board:', err);
      setError(err.message || 'Failed to create mood board. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Build <span className="gradient-text">Custom Board</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create a professional, client-ready mood board with templates and enhanced presentation features.
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
              <p className="text-sm text-green-500">Custom mood board created successfully! Redirecting...</p>
            </CardContent>
          </Card>
        )}

        {/* Step Indicator */}
        <Card className="glass-effect">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'template' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'template' ? 'bg-primary text-white' : 'bg-muted'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Choose Template</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${step === 'details' ? 'text-primary' : step === 'images' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' || step === 'images' ? 'bg-primary text-white' : 'bg-muted'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Details & Client Info</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${step === 'images' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'images' ? 'bg-primary text-white' : 'bg-muted'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Add Images</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Template Selection */}
          {step === 'template' && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Choose a Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Select a template to get started with pre-configured settings, or choose Custom to start from scratch.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {boardTemplates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-elegant ${
                          selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardContent className="p-6">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold mb-2">{template.name}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {template.defaultTags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {template.suggestedImages > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Suggested: {template.suggestedImages} images
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details & Client Info */}
          {(step === 'details' || step === 'images') && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 glass-effect">
                  <CardHeader>
                    <CardTitle>Mood Board Details</CardTitle>
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
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" /> Client Name
                      </Label>
                      <Input
                        placeholder="Client's name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4" /> Client Email
                      </Label>
                      <Input
                        type="email"
                        placeholder="client@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" /> Event Date
                      </Label>
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4" /> Event Location
                      </Label>
                      <Input
                        placeholder="Event location"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" /> Project Notes
                      </Label>
                      <Textarea
                        rows={3}
                        placeholder="Special requirements, preferences, etc."
                        value={projectNotes}
                        onChange={(e) => setProjectNotes(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Step 3: Images */}
              {step === 'images' && (
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>Add Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                          <p className="font-medium text-foreground">Upload Reference Images</p>
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
              )}

              {/* Sharing & Visibility */}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">Include Branding</p>
                      <p className="text-xs text-muted-foreground">Add your photographer branding to the board</p>
                    </div>
                    <Switch checked={includeBranding} onCheckedChange={setIncludeBranding} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-medium">Allow Client Comments</p>
                      <p className="text-xs text-muted-foreground">Let clients add comments and feedback</p>
                    </div>
                    <Switch checked={allowClientComments} onCheckedChange={setAllowClientComments} />
                  </div>
                  <div className="p-4 border border-border/40 rounded-lg bg-muted/10">
                    <p className="text-xs">
                      Once published, you can generate a client-friendly presentation link
                      or embed it inside your booking proposals. {clientEmail && 'An email will be sent to the client.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3">
            <div>
              {step === 'details' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('template')}
                >
                  Back
                </Button>
              )}
              {step === 'images' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('details')}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/photographer/mood-boards')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {step === 'template' && (
                <Button
                  type="button"
                  onClick={() => {
                    if (selectedTemplate) {
                      setStep('details');
                    } else {
                      setError('Please select a template');
                    }
                  }}
                >
                  Next: Details
                </Button>
              )}
              {step === 'details' && (
                <Button
                  type="button"
                  onClick={() => setStep('images')}
                >
                  Next: Add Images
                </Button>
              )}
              {step === 'images' && (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-primary-glow"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Custom Board'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhotographerCreateCustomBoardPage;

