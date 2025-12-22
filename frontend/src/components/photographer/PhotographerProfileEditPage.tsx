import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Eye, Upload, Plus, Trash2, Camera, Award, DollarSign, Globe, Calendar, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent } from '../ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import uploadService from '@/services/upload.service';
import photographerService, { PhotographerDetail } from '@/services/photographer.service';
import postService from '@/services/post.service';
import { useToast } from '@/hooks/use-toast';

const PhotographerProfileEditPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(authService.getStoredUser()?.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const [basicProfile, setBasicProfile] = useState({
    fullName: '',
    businessName: '',
    city: '',
    state: '',
    country: 'India',
    bio: '',
  });

  const [professionalProfile, setProfessionalProfile] = useState({
    specialties: [] as string[],
    experienceYears: '',
    basePrice: '',
    equipment: '',
    languages: '',
    certifications: '',
    awards: '',
  });

  const [servicesProfile, setServicesProfile] = useState({
    packages: [
      {
        id: 'pkg-1',
        name: '',
        durationHours: '',
        price: '',
        inclusions: '',
      },
    ],
    baseRatePerHour: '',
    travelChargePerKm: '',
    paymentTerms: '',
  });

  const [photographerData, setPhotographerData] = useState<PhotographerDetail | null>(null);
  const [portfolio, setPortfolio] = useState<PhotographerDetail['portfolio']>([]);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PhotographerDetail['portfolio'][0] | null>(null);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);
  // Load initial basic profile data from backend/local storage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Prefer fresh data from API, fall back to stored user
        let user = authService.getStoredUser();
        try {
          const current = await authService.getCurrentUser();
          user = current;
          localStorage.setItem('user', JSON.stringify(current));
        } catch {
          // ignore API error here, we'll just use stored user
        }

        if (user) {
          setBasicProfile((prev) => ({
            ...prev,
            fullName: user.fullName || '',
            city: (user as any).city || '',
            state: (user as any).state || '',
            bio: (user as any).bio || '',
          }));

          if (user.avatarUrl && !avatarUrl) {
            setAvatarUrl(user.avatarUrl);
          }
        }

        // Load photographer-specific profile (business/professional)
        try {
          const photographer = await photographerService.getMyProfile();
          setPhotographerData(photographer);
          setPortfolio(photographer.portfolio || []);
          setBasicProfile((prev) => ({
            ...prev,
            businessName: photographer.businessName || '',
          }));
          setProfessionalProfile({
            specialties: photographer.specialties || [],
            experienceYears: photographer.experienceYears?.toString() || '',
            basePrice: photographer.basePrice?.toString() || '',
            equipment: (photographer.equipment || []).join('\n'),
            languages: (photographer.languages || []).join(', '),
            certifications: photographer.certifications || '',
            awards: photographer.awards || '',
          });

          const rawServices = photographer.servicesOffered as any;
          let services: any = {};

          if (Array.isArray(rawServices)) {
            services = rawServices[0] || {};
          } else if (rawServices && typeof rawServices === 'object') {
            services = rawServices;
          }

          const packagesSource = Array.isArray(services.packages) ? services.packages : [];

          const packages = packagesSource.length
            ? packagesSource
            : [
                {
                  id: 'pkg-1',
                  name: '',
                  durationHours: '',
                  price: '',
                  inclusions: '',
                },
              ];

          setServicesProfile({
            packages: packages.map((pkg: any, index: number) => ({
              id: pkg.id || `pkg-${index + 1}`,
              name: pkg.name || '',
              durationHours:
                pkg.durationHours !== undefined && pkg.durationHours !== null
                  ? String(pkg.durationHours)
                  : '',
              price:
                pkg.price !== undefined && pkg.price !== null ? String(pkg.price) : '',
              inclusions: Array.isArray(pkg.inclusions)
                ? pkg.inclusions.join('\n')
                : pkg.inclusions || '',
            })),
            baseRatePerHour:
              services.baseRatePerHour !== undefined && services.baseRatePerHour !== null
                ? String(services.baseRatePerHour)
                : '',
            travelChargePerKm:
              services.travelChargePerKm !== undefined && services.travelChargePerKm !== null
                ? String(services.travelChargePerKm)
                : '',
            paymentTerms: services.paymentTerms || '',
          });
        } catch (err) {
          console.error('Failed to load photographer profile', err);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };

    loadProfile();
  }, [avatarUrl]);

  const specializations = [
    'Wedding Photography',
    'Fashion Photography',
    'Portrait Photography',
    'Event Photography',
    'Corporate Photography',
    'Product Photography',
    'Wildlife Photography',
    'Sports Photography',
    'Food Photography',
    'Architecture Photography'
  ];

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setAvatarProgress(0);

      const validationError = uploadService.validateFile(file, 10);
      if (validationError) {
        throw new Error(validationError);
      }

      const userId = authService.getStoredUser()?.userId;
      const folder = userId ? `chitrasethu/avatars/user_${userId}` : 'chitrasethu/avatars';

      const uploaded = await uploadService.uploadPhoto(file, folder, (p) => setAvatarProgress(p));
      setAvatarUrl(uploaded.url);

      toast({
        title: 'Avatar uploaded',
        description: 'Profile photo uploaded successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Could not upload photo',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setAvatarProgress(0), 800);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({
        fullName: basicProfile.fullName || undefined,
        city: basicProfile.city || undefined,
        state: basicProfile.state || undefined,
        bio: basicProfile.bio || undefined,
        avatarUrl,
      });

      await photographerService.updateMyProfile({
        businessName: basicProfile.businessName || undefined,
        specialties: professionalProfile.specialties,
        experienceYears: professionalProfile.experienceYears
          ? Number(professionalProfile.experienceYears)
          : undefined,
        basePrice: professionalProfile.basePrice
          ? Number(professionalProfile.basePrice)
          : undefined,
        equipment: professionalProfile.equipment
          ? professionalProfile.equipment
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        languages: professionalProfile.languages
          ? professionalProfile.languages
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined,
        servicesOffered: [{
          packages: servicesProfile.packages.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            durationHours: pkg.durationHours ? Number(pkg.durationHours) : undefined,
            price: pkg.price ? Number(pkg.price) : undefined,
            inclusions: pkg.inclusions
              ? pkg.inclusions.split('\n').map((line) => line.trim()).filter(Boolean)
              : [],
          })),
          baseRatePerHour: servicesProfile.baseRatePerHour
            ? Number(servicesProfile.baseRatePerHour)
            : undefined,
          travelChargePerKm: servicesProfile.travelChargePerKm
            ? Number(servicesProfile.travelChargePerKm)
            : undefined,
          paymentTerms: servicesProfile.paymentTerms || undefined,
        }],
        certifications: professionalProfile.certifications || undefined,
        awards: professionalProfile.awards || undefined,
      });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved.',
      });
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err.message || 'Could not save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-playfair font-bold mb-2">
                Edit <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your professional profile and portfolio
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/photographer/home')}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 max-w-4xl mx-auto">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          {/* BASIC INFORMATION */}
          <TabsContent value="basic">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="mt-2"
                      value={basicProfile.fullName}
                      onChange={(e) =>
                        setBasicProfile((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Studio/Company Name</Label>
                    <Input
                      id="businessName"
                      placeholder="John's Photography Studio"
                      className="mt-2"
                      value={basicProfile.businessName}
                      onChange={(e) =>
                        setBasicProfile((prev) => ({ ...prev, businessName: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="profilePhoto">Profile Photo</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs">
                          <span>Uploading...</span>
                          <span className="font-semibold">{avatarProgress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                        className="hidden"
                        onChange={handleAvatarSelect}
                        disabled={uploadingAvatar}
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                      {avatarUrl && (
                        <Button variant="ghost" size="sm" onClick={() => setAvatarUrl(undefined)} disabled={uploadingAvatar}>
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="coverPhoto">Cover Photo</Label>
                  <div className="mt-2">
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Cover
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      className="mt-2"
                      value={basicProfile.city}
                      onChange={(e) =>
                        setBasicProfile((prev) => ({ ...prev, city: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="Maharashtra"
                      className="mt-2"
                      value={basicProfile.state}
                      onChange={(e) =>
                        setBasicProfile((prev) => ({ ...prev, state: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      placeholder="India"
                      className="mt-2"
                      value={basicProfile.country}
                      onChange={(e) =>
                        setBasicProfile((prev) => ({ ...prev, country: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio/About Me</Label>
                  <Textarea 
                    id="bio"
                    placeholder="Tell clients about yourself, your photography style, and experience..."
                    rows={6}
                    className="mt-2"
                    value={basicProfile.bio}
                    onChange={(e) =>
                      setBasicProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROFESSIONAL DETAILS */}
          <TabsContent value="professional">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Professional Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Specializations *</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specializations.map((spec) => (
                      <label
                        key={spec}
                        className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={professionalProfile.specialties.includes(spec)}
                          onChange={(e) => {
                            setProfessionalProfile((prev) => {
                              if (e.target.checked) {
                                return {
                                  ...prev,
                                  specialties: [...prev.specialties, spec],
                                };
                              }
                              return {
                                ...prev,
                                specialties: prev.specialties.filter((s) => s !== spec),
                              };
                            });
                          }}
                        />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="5"
                      className="mt-2"
                      value={professionalProfile.experienceYears}
                      onChange={(e) =>
                        setProfessionalProfile((prev) => ({
                          ...prev,
                          experienceYears: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalBookings">Total Bookings Completed</Label>
                    <Input id="totalBookings" type="number" placeholder="150" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="certifications">Certifications</Label>
                  <Textarea 
                    id="certifications"
                    placeholder="List your professional certifications (one per line)..."
                    rows={3}
                    className="mt-2"
                    value={professionalProfile.certifications}
                    onChange={(e) =>
                      setProfessionalProfile((prev) => ({
                        ...prev,
                        certifications: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="awards">Awards & Recognition</Label>
                  <Textarea 
                    id="awards"
                    placeholder="List any awards or recognition you've received..."
                    rows={3}
                    className="mt-2"
                    value={professionalProfile.awards}
                    onChange={(e) =>
                      setProfessionalProfile((prev) => ({
                        ...prev,
                        awards: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="equipment">Equipment</Label>
                  <Textarea 
                    id="equipment"
                    placeholder="List your professional equipment (e.g., Canon 5D Mark IV, Sony A7 III)..."
                    rows={3}
                    className="mt-2"
                    value={professionalProfile.equipment}
                    onChange={(e) =>
                      setProfessionalProfile((prev) => ({
                        ...prev,
                        equipment: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="languages">Languages Spoken</Label>
                  <Input
                    id="languages"
                    placeholder="English, Hindi, Marathi"
                    className="mt-2"
                    value={professionalProfile.languages}
                    onChange={(e) =>
                      setProfessionalProfile((prev) => ({
                        ...prev,
                        languages: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PORTFOLIO */}
          <TabsContent value="portfolio">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Portfolio Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Photo Gallery</Label>
                  <p className="text-sm text-muted-foreground mb-3">Upload your best work (drag & drop supported)</p>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/heic';
                        input.multiple = true;
                        input.onchange = async (e: any) => {
                          const files = Array.from(e.target.files || []) as File[];
                          if (!files.length) return;
                          try {
                            const userId = authService.getStoredUser()?.userId;
                            const folder = userId
                              ? `chitrasethu/portfolio/user_${userId}`
                              : 'chitrasethu/portfolio';
                            const uploaded = await uploadService.uploadMultiplePhotos(
                              files,
                              folder,
                            );
                            const created = await photographerService.addPortfolioItems(
                              uploaded.map((photo) => ({
                                imageUrl: photo.url,
                                thumbnailUrl: photo.thumbnailUrl,
                              }))
                            );
                            setPortfolio((prev) => [...created, ...prev]);
                            toast({
                              title: 'Portfolio updated',
                              description: 'Photos added to your portfolio.',
                            });
                          } catch (err) {
                            console.error('Portfolio upload failed', err);
                            toast({
                              title: 'Upload failed',
                              description:
                                err instanceof Error ? err.message : 'Could not upload photos',
                              variant: 'destructive',
                            });
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: JPG, PNG, WebP (Max 10MB each)
                    </p>
                  </div>
                </div>

                {/* Instagram-style Portfolio Grid */}
                <div className="grid grid-cols-3 gap-1 md:gap-2">
                  {portfolio.map((item) => (
                    <div
                      key={item.portfolioId}
                      className="relative aspect-square bg-muted rounded-lg group overflow-hidden cursor-pointer"
                      onClick={() => {
                        setSelectedPortfolioItem(item);
                        setPortfolioModalOpen(true);
                      }}
                    >
                      <img
                        src={item.thumbnailUrl || item.imageUrl}
                        alt={item.title || 'Portfolio image'}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay with stats on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg">
                        <div className="flex items-center space-x-4 text-white">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-5 h-5 fill-current" />
                            <span className="font-semibold">{item.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-5 h-5 fill-current" />
                            <span className="font-semibold">{item.commentsCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Portfolio Detail Modal (Instagram-style) */}
                <Dialog open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen}>
                  <DialogContent className="max-w-5xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden">
                    {selectedPortfolioItem && (
                      <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                        {/* Image Section */}
                        <div className="relative w-full md:w-2/3 bg-black flex items-center justify-center aspect-square md:aspect-auto md:h-[90vh]">
                          <img
                            src={selectedPortfolioItem.imageUrl}
                            alt={selectedPortfolioItem.title || 'Portfolio image'}
                            className="w-full h-full object-contain"
                          />
                          {/* Delete button (only in edit mode) */}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-4 right-4"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await photographerService.deletePortfolioItem(selectedPortfolioItem.portfolioId);
                                setPortfolio((prev) =>
                                  prev.filter((p) => p.portfolioId !== selectedPortfolioItem.portfolioId)
                                );
                                setPortfolioModalOpen(false);
                                toast({
                                  title: 'Photo removed',
                                  description: 'Portfolio photo deleted successfully.',
                                });
                              } catch (err) {
                                console.error('Delete portfolio item failed', err);
                                toast({
                                  title: 'Delete failed',
                                  description:
                                    err instanceof Error
                                      ? err.message
                                      : 'Could not delete portfolio photo',
                                  variant: 'destructive',
                                });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Details Section (Instagram-style) */}
                        <div className="w-full md:w-1/3 flex flex-col border-l border-border bg-background">
                          {/* Header */}
                          <div className="p-4 border-b border-border flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={photographerData?.avatarUrl} />
                              <AvatarFallback>
                                {photographerData?.fullName?.charAt(0) || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{photographerData?.fullName || 'Photographer'}</p>
                              {selectedPortfolioItem.location && (
                                <p className="text-xs text-muted-foreground">{selectedPortfolioItem.location}</p>
                              )}
                            </div>
                          </div>

                          {/* Caption/Description */}
                          {(selectedPortfolioItem.title || selectedPortfolioItem.description) && (
                            <div className="p-4 border-b border-border">
                              <p className="text-sm whitespace-pre-wrap">
                                <span className="font-semibold">{photographerData?.fullName || 'Photographer'}</span>{' '}
                                {selectedPortfolioItem.title || selectedPortfolioItem.description}
                              </p>
                              {selectedPortfolioItem.createdAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {new Date(selectedPortfolioItem.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Stats Section */}
                          <div className="p-4 border-b border-border">
                            <div className="flex items-center space-x-6">
                              <div className="flex items-center space-x-2">
                                <Heart className="w-5 h-5" />
                                <span className="font-semibold">{selectedPortfolioItem.likesCount || 0} likes</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="w-5 h-5" />
                                <span className="font-semibold">{selectedPortfolioItem.commentsCount || 0} comments</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-4 border-b border-border flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                              <Heart className="w-5 h-5" />
                              <span>Like</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                              <MessageCircle className="w-5 h-5" />
                              <span>Comment</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                              <Share2 className="w-5 h-5" />
                              <span>Share</span>
                            </Button>
                          </div>

                          {/* Spacer */}
                          <div className="flex-1" />
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Separator />

                <div>
                  <Label>Video Portfolio</Label>
                  <p className="text-sm text-muted-foreground mb-3">Add YouTube or Vimeo links</p>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input placeholder="https://youtube.com/watch?v=..." className="flex-1" />
                      <Button variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SERVICES & PRICING */}
          <TabsContent value="services">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Services & Pricing</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setServicesProfile((prev) => ({
                        ...prev,
                        packages: [
                          ...prev.packages,
                          {
                            id: `pkg-${prev.packages.length + 1}`,
                            name: '',
                            durationHours: '',
                            price: '',
                            inclusions: '',
                          },
                        ],
                      }))
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {servicesProfile.packages.map((pkg, index) => (
                  <div key={pkg.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {pkg.name || `Package ${index + 1}`}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setServicesProfile((prev) => ({
                            ...prev,
                            packages: prev.packages.filter((p) => p.id !== pkg.id),
                          }))
                        }
                        disabled={servicesProfile.packages.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Package Name</Label>
                        <Input
                          className="mt-2"
                          value={pkg.name}
                          onChange={(e) =>
                            setServicesProfile((prev) => ({
                              ...prev,
                              packages: prev.packages.map((p) =>
                                p.id === pkg.id ? { ...p, name: e.target.value } : p
                              ),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Duration (hours)</Label>
                        <Input
                          type="number"
                          className="mt-2"
                          value={pkg.durationHours}
                          onChange={(e) =>
                            setServicesProfile((prev) => ({
                              ...prev,
                              packages: prev.packages.map((p) =>
                                p.id === pkg.id ? { ...p, durationHours: e.target.value } : p
                              ),
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          className="mt-2"
                          value={pkg.price}
                          onChange={(e) =>
                            setServicesProfile((prev) => ({
                              ...prev,
                              packages: prev.packages.map((p) =>
                                p.id === pkg.id ? { ...p, price: e.target.value } : p
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Inclusions</Label>
                      <Textarea
                        rows={4}
                        className="mt-2"
                        placeholder="One inclusion per line"
                        value={pkg.inclusions}
                        onChange={(e) =>
                          setServicesProfile((prev) => ({
                            ...prev,
                            packages: prev.packages.map((p) =>
                              p.id === pkg.id ? { ...p, inclusions: e.target.value } : p
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="baseRate">Base Rate per Hour (₹)</Label>
                    <Input
                      id="baseRate"
                      type="number"
                      placeholder="5000"
                      className="mt-2"
                      value={servicesProfile.baseRatePerHour}
                      onChange={(e) =>
                        setServicesProfile((prev) => ({
                          ...prev,
                          baseRatePerHour: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelCharge">Travel Charges (₹/km)</Label>
                    <Input
                      id="travelCharge"
                      type="number"
                      placeholder="50"
                      className="mt-2"
                      value={servicesProfile.travelChargePerKm}
                      onChange={(e) =>
                        setServicesProfile((prev) => ({
                          ...prev,
                          travelChargePerKm: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Textarea 
                    id="paymentTerms"
                    placeholder="e.g., 30% advance, 70% on delivery..."
                    rows={3}
                    className="mt-2"
                    value={servicesProfile.paymentTerms}
                    onChange={(e) =>
                      setServicesProfile((prev) => ({
                        ...prev,
                        paymentTerms: e.target.value,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTACT & SOCIAL */}
          <TabsContent value="contact">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Contact & Social Media</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone1">Phone Number (Primary) *</Label>
                    <Input id="phone1" type="tel" placeholder="+91 98765 43210" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="phone2">Phone Number (Secondary)</Label>
                    <Input id="phone2" type="tel" placeholder="+91 98765 43211" className="mt-2" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email1">Email (Primary) *</Label>
                    <Input id="email1" type="email" placeholder="john@photography.com" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="email2">Email (Business)</Label>
                    <Input id="email2" type="email" placeholder="business@photography.com" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input id="whatsapp" type="tel" placeholder="+91 98765 43210" className="mt-2" />
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4">Social Media Links</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input id="instagram" placeholder="@yourusername" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input id="facebook" placeholder="facebook.com/yourpage" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input id="youtube" placeholder="youtube.com/@yourchannel" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="website">Personal Website</Label>
                      <Input id="website" placeholder="www.yourwebsite.com" className="mt-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AVAILABILITY & TRAVEL */}
          <TabsContent value="availability">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Availability & Travel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Instant Booking</Label>
                    <p className="text-sm text-muted-foreground">Allow clients to book without approval</p>
                  </div>
                  <Switch />
                </div>

                <div>
                  <Label>Unavailable Dates</Label>
                  <p className="text-sm text-muted-foreground mb-3">Mark dates when you're not available</p>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Calendar integration coming soon</p>
                  </div>
                </div>

                <div>
                  <Label>Recurring Unavailability</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select weekdays you're typically unavailable</p>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <label key={day} className="flex flex-col items-center space-y-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <span className="text-sm font-medium">{day}</span>
                        <input type="checkbox" className="rounded" />
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Travel Preferences</h4>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Willing to Travel</Label>
                      <p className="text-sm text-muted-foreground">Accept bookings outside your city</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="maxDistance">Maximum Travel Distance (km)</Label>
                      <Input id="maxDistance" type="number" placeholder="200" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="travelCharges">Travel Charges (₹)</Label>
                      <Input id="travelCharges" type="number" placeholder="5000" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferredLocations">Preferred Travel Locations</Label>
                    <Input id="preferredLocations" placeholder="Mumbai, Pune, Goa" className="mt-2" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Booking Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="advanceBooking">Advance Booking Period (days)</Label>
                      <Input id="advanceBooking" type="number" placeholder="30" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="depositPercent">Deposit Required (%)</Label>
                      <Input id="depositPercent" type="number" placeholder="30" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                    <Textarea 
                      id="cancellationPolicy"
                      placeholder="Describe your cancellation and refund policy..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button at Bottom */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate('/photographer/home')}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button size="lg" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerProfileEditPage;

