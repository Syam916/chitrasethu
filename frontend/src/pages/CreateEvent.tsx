import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  Tag,
  IndianRupee,
  FileText,
  Upload,
  X,
  Loader2,
} from 'lucide-react';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Calendar } from '../components/ui/calendar';
import { useToast } from '../hooks/use-toast';
import eventService from '../services/event.service';
import authService from '../services/auth.service';
import uploadService from '../services/upload.service';
import { cn } from '../lib/utils';

interface EventCategory {
  categoryId: number;
  categoryName: string;
  slug: string;
  description?: string;
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    endDate: '',
    location: '',
    venueName: '',
    city: '',
    state: '',
    expectedAttendees: '',
    minBudget: '',
    maxBudget: '',
    requirements: '',
    visibility: 'public' as 'public' | 'private',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to create an event',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Fetch categories
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const cats = await eventService.getCategories();
        setCategories(cats);
      } catch (error: any) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event categories. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [navigate, toast]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const fileArray = Array.from(files);
      
      // Store files for later upload
      setImageFiles(prev => [...prev, ...fileArray]);

      // Create preview URLs immediately for UI
      const previewUrls: string[] = [];
      fileArray.forEach(file => {
        const url = URL.createObjectURL(file);
        previewUrls.push(url);
      });
      setUploadedImages(prev => [...prev, ...previewUrls]);

      toast({
        title: 'Images added',
        description: `${fileArray.length} image(s) added. They will be uploaded when you create the event.`,
      });
    } catch (error: any) {
      console.error('Error adding images:', error);
      toast({
        title: 'Error',
        description: 'Failed to add images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke blob URL to free memory
    if (uploadedImages[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedImages[index]);
    }
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.categoryId || !formData.title || !formData.eventDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Category, Title, Event Date)',
        variant: 'destructive',
      });
      return;
    }

    if (formData.minBudget && formData.maxBudget) {
      const min = parseFloat(formData.minBudget);
      const max = parseFloat(formData.maxBudget);
      if (min > max) {
        toast({
          title: 'Validation Error',
          description: 'Minimum budget cannot be greater than maximum budget',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setLoading(true);

      // Upload images first if any
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        toast({
          title: 'Uploading images...',
          description: 'Please wait while we upload your images.',
        });

        try {
          const uploaded = await uploadService.uploadMultiplePhotos(
            imageFiles,
            'events',
            (progress) => {
              // Optional: show progress
              console.log(`Upload progress: ${progress}%`);
            }
          );
          imageUrls = uploaded.map(img => img.url);
          
          // Clean up blob URLs
          uploadedImages.forEach(url => {
            if (url.startsWith('blob:')) {
              URL.revokeObjectURL(url);
            }
          });
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          toast({
            title: 'Image Upload Failed',
            description: uploadError.message || 'Failed to upload some images. You can still create the event without images.',
            variant: 'destructive',
          });
          // Continue without images if upload fails
        }
      }

      const eventData = {
        categoryId: parseInt(formData.categoryId),
        title: formData.title,
        description: formData.description || undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime || undefined,
        endDate: formData.endDate || undefined,
        location: formData.location || undefined,
        venueName: formData.venueName || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : undefined,
        minBudget: formData.minBudget ? parseFloat(formData.minBudget) : undefined,
        maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : undefined,
        requirements: formData.requirements || undefined,
        visibility: formData.visibility,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      const createdEvent = await eventService.create(eventData);

      toast({
        title: 'Success!',
        description: 'Event created successfully',
      });

      // Navigate to event details or event photos page
      navigate(`/event-photos`);
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Create <span className="gradient-text">Event</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your event with photographers and find the perfect match for your photography needs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category" className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4" />
                      Event Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => handleInputChange('categoryId', value)}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title" className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      Event Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Royal Wedding Ceremony"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event, what kind of photography you need, style preferences..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Date & Time</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate" className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4" />
                      Event Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.eventDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.eventDate ? (
                            format(new Date(formData.eventDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.eventDate ? new Date(formData.eventDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              handleInputChange('eventDate', format(date, 'yyyy-MM-dd'));
                            }
                          }}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {formData.eventDate && (
                      <Input
                        type="hidden"
                        value={formData.eventDate}
                        required
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="eventTime" className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      Start Time
                    </Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => handleInputChange('eventTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4" />
                      End Date (if multi-day)
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground"
                          )}
                          disabled={!formData.eventDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? (
                            format(new Date(formData.endDate), "PPP")
                          ) : (
                            <span>Pick end date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.endDate ? new Date(formData.endDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              handleInputChange('endDate', format(date, 'yyyy-MM-dd'));
                            }
                          }}
                          disabled={(date) => {
                            const minDate = formData.eventDate 
                              ? new Date(formData.eventDate)
                              : new Date(new Date().setHours(0, 0, 0, 0));
                            return date < minDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {formData.endDate && (
                      <Input
                        type="hidden"
                        value={formData.endDate}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venueName" className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      Venue Name
                    </Label>
                    <Input
                      id="venueName"
                      placeholder="e.g., Grand Palace Hotel"
                      value={formData.venueName}
                      onChange={(e) => handleInputChange('venueName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      Full Address
                    </Label>
                    <Input
                      id="location"
                      placeholder="Complete address"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      City
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g., Mumbai"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      State
                    </Label>
                    <Input
                      id="state"
                      placeholder="e.g., Maharashtra"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Requirements */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Budget & Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expectedAttendees" className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Expected Attendees
                      </Label>
                      <Input
                        id="expectedAttendees"
                        type="number"
                        min="1"
                        placeholder="e.g., 250"
                        value={formData.expectedAttendees}
                        onChange={(e) => handleInputChange('expectedAttendees', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="minBudget" className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4" />
                        Min Budget (₹)
                      </Label>
                      <Input
                        id="minBudget"
                        type="number"
                        min="0"
                        placeholder="e.g., 50000"
                        value={formData.minBudget}
                        onChange={(e) => handleInputChange('minBudget', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxBudget" className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4" />
                        Max Budget (₹)
                      </Label>
                      <Input
                        id="maxBudget"
                        type="number"
                        min="0"
                        placeholder="e.g., 80000"
                        value={formData.maxBudget}
                        onChange={(e) => handleInputChange('maxBudget', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requirements" className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      Special Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="Any special requirements, deliverables, style preferences..."
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images & Tags */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Images & Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="images" className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4" />
                      Event Images
                    </Label>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tags" className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Add a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        Add
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={(e) => handleInputChange('visibility', e.target.value)}
                        className="mr-2"
                      />
                      <span>Public - Visible to everyone</span>
                    </Label>
                    <Label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={(e) => handleInputChange('visibility', e.target.value)}
                        className="mr-2"
                      />
                      <span>Private - Only you can see</span>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Be specific about your event type and requirements</p>
                  <p>• Include accurate date, time, and location</p>
                  <p>• Set a realistic budget range</p>
                  <p>• Add images to help photographers understand your vision</p>
                  <p>• Use tags to make your event more discoverable</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/event-photos')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary-glow"
              disabled={loading || categoriesLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

