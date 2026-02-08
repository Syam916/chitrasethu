import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Eye, Upload, Plus, Trash2, Camera, Award, DollarSign, Globe, Calendar, Heart, MessageCircle, Share2, Users, UserPlus, Video, Image } from 'lucide-react';
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
import followService from '@/services/follow.service';
import FollowersFollowingModal from '../ui/FollowersFollowingModal';
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
  const [portfolioView, setPortfolioView] = useState<'photos' | 'videos'>('photos');
  
  // Separate photos and videos from portfolio
  const portfolioPhotos = portfolio.filter(item => !item.mediaType || item.mediaType === 'image');
  const portfolioVideos = portfolio.filter(item => item.mediaType === 'video');
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

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
      // First update basic user profile
      await authService.updateProfile({
        fullName: basicProfile.fullName || undefined,
        city: basicProfile.city || undefined,
        state: basicProfile.state || undefined,
        bio: basicProfile.bio || undefined,
        avatarUrl,
      });

      // Try to update photographer profile
      // If photographer record doesn't exist, getMyProfile will create it automatically
      try {
        // First ensure photographer profile exists by trying to get it
        // This will auto-create if it doesn't exist (based on backend logic)
        await photographerService.getMyProfile();
      } catch (getError: any) {
        // If getMyProfile fails, the photographer record might not exist
        // The backend should create it, but if it doesn't, we'll continue anyway
        console.warn('Could not fetch photographer profile, will try to update anyway:', getError);
      }

      // Now update the photographer profile
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

      // Reload the profile data to reflect changes
      try {
        const updatedProfile = await photographerService.getMyProfile();
        setPhotographerData(updatedProfile);
      } catch (reloadError) {
        // Profile update succeeded but couldn't reload - not critical
        console.warn('Profile updated but could not reload:', reloadError);
      }

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
    } catch (err: any) {
      console.error('Save profile error:', err);
      toast({
        title: 'Save failed',
        description: err.message || 'Could not save profile. Please try again.',
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
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-playfair font-bold mb-1 md:mb-2">
                Edit <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Manage your professional profile and portfolio
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex-1 md:flex-initial" onClick={() => navigate('/photographer/home')}>
                <X className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 md:flex-initial">
                <Eye className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button size="sm" className="flex-1 md:flex-initial" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
                <span className="sm:hidden">{saving ? '...' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <Tabs defaultValue="basic" className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-3 lg:grid-cols-6 max-w-4xl mx-auto">
              <TabsTrigger value="basic" className="whitespace-nowrap text-xs sm:text-sm">Basic</TabsTrigger>
              <TabsTrigger value="professional" className="whitespace-nowrap text-xs sm:text-sm">Professional</TabsTrigger>
              <TabsTrigger value="portfolio" className="whitespace-nowrap text-xs sm:text-sm">Portfolio</TabsTrigger>
              <TabsTrigger value="services" className="whitespace-nowrap text-xs sm:text-sm">Services</TabsTrigger>
              <TabsTrigger value="contact" className="whitespace-nowrap text-xs sm:text-sm">Contact</TabsTrigger>
              <TabsTrigger value="availability" className="whitespace-nowrap text-xs sm:text-sm">Availability</TabsTrigger>
            </TabsList>
          </div>

          {/* BASIC INFORMATION */}
          <TabsContent value="basic">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                  <Camera className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
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
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center flex-shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs">
                          <span>Uploading...</span>
                          <span className="font-semibold">{avatarProgress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
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
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                      {avatarUrl && (
                        <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => setAvatarUrl(undefined)} disabled={uploadingAvatar}>
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Followers & Following Section */}
                {photographerData?.photographerId && (
                  <div>
                    <Label>Followers & Following</Label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {/* Followers Card */}
                      <div
                        className="border border-border rounded-lg p-3 md:p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setFollowersModalOpen(true)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xl md:text-2xl font-bold text-primary">
                                {photographerData?.followerCount ?? 0}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground">Followers</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </div>
                      </div>

                      {/* Following Card */}
                      <div
                        className="border border-border rounded-lg p-3 md:p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setFollowingModalOpen(true)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <UserPlus className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                            <div>
                              <p className="text-xl md:text-2xl font-bold text-primary">
                                {photographerData?.followingCount ?? 0}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground">Following</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="coverPhoto">Cover Photo</Label>
                  <div className="mt-2">
                    <div className="w-full h-32 sm:h-48 bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center px-4">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                  <Award className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Professional Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                <div>
                  <Label>Specializations *</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">Select all that apply</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {specializations.map((spec) => (
                      <label
                        key={spec}
                        className="flex items-center space-x-2 p-2 md:p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="rounded flex-shrink-0"
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
                        <span className="text-xs sm:text-sm">{spec}</span>
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
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Photo & Video Management Section with Toggle */}
              <Card className="glass-effect">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                      {portfolioView === 'photos' ? (
                        <>
                          <Image className="w-4 h-4 md:w-5 md:h-5" />
                          <span>Photo Management</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4 md:w-5 md:h-5" />
                          <span>Video Management</span>
                        </>
                      )}
                    </CardTitle>
                    {/* Toggle Buttons */}
                    <div className="flex items-center space-x-2 border border-border rounded-lg p-1">
                      <Button
                        variant={portfolioView === 'photos' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPortfolioView('photos')}
                        className={portfolioView === 'photos' ? 'bg-primary text-primary-foreground' : ''}
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Photos
                      </Button>
                      <Button
                        variant={portfolioView === 'videos' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPortfolioView('videos')}
                        className={portfolioView === 'videos' ? 'bg-primary text-primary-foreground' : ''}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Videos
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                  {/* Photo Management Content */}
                  {portfolioView === 'photos' && (
                    <>
                  <div>
                    <Label>Photo Gallery</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">Upload your best photos (drag & drop supported)</p>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 md:p-8 text-center">
                      <Camera className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
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
                      <p className="text-xs text-muted-foreground mt-2 px-2">
                        Supports: JPG, PNG, WebP (Max 10MB each)
                      </p>
                    </div>
                  </div>

                  {/* Photo Grid */}
                  {portfolioPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-2">
                      {portfolioPhotos.map((item) => (
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
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No photos in your portfolio yet. Upload some photos to get started!</p>
                    </div>
                  )}
                    </>
                  )}

                  {/* Video Management Content */}
                  {portfolioView === 'videos' && (
                    <>
                  <div>
                    <Label>Video Portfolio</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">Upload your best videos</p>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 md:p-8 text-center">
                      <Video className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'video/mp4,video/mov,video/avi,video/webm,video/mkv,video/flv,video/wmv';
                          input.multiple = true;
                          input.onchange = async (e: any) => {
                            const files = Array.from(e.target.files || []) as File[];
                            if (!files.length) return;
                            
                            // Validate files
                            for (const file of files) {
                              const validationError = uploadService.validateVideoFile(file, 100);
                              if (validationError) {
                                toast({
                                  title: 'Upload failed',
                                  description: `${file.name}: ${validationError}`,
                                  variant: 'destructive',
                                });
                                return;
                              }
                            }
                            
                            try {
                              const userId = authService.getStoredUser()?.userId;
                              const folder = userId
                                ? `chitrasethu/portfolio/videos/user_${userId}`
                                : 'chitrasethu/portfolio/videos';
                              const uploaded = await uploadService.uploadMultipleVideos(
                                files,
                                folder,
                              );
                              const created = await photographerService.addPortfolioItems(
                                uploaded.map((video) => ({
                                  videoUrl: video.url,
                                  thumbnailUrl: uploadService.getVideoThumbnailUrl(video.url, 500), // Generate thumbnail from video
                                }))
                              );
                              setPortfolio((prev) => [...created, ...prev]);
                              toast({
                                title: 'Portfolio updated',
                                description: 'Videos added to your portfolio.',
                              });
                            } catch (err) {
                              console.error('Video upload failed', err);
                              toast({
                                title: 'Upload failed',
                                description:
                                  err instanceof Error ? err.message : 'Could not upload videos',
                                variant: 'destructive',
                              });
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Videos
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 px-2">
                        Supports: MP4, MOV, AVI, WebM, MKV, FLV, WMV (Max 100MB each)
                      </p>
                    </div>
                  </div>

                  {/* Video Grid */}
                  {portfolioVideos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-2">
                      {portfolioVideos.map((item) => (
                        <div
                          key={item.portfolioId}
                          className="relative aspect-square bg-muted rounded-lg group overflow-hidden cursor-pointer"
                          onClick={() => {
                            setSelectedPortfolioItem(item);
                            setPortfolioModalOpen(true);
                          }}
                        >
                          {item.videoUrl ? (
                            <>
                              {item.thumbnailUrl && item.thumbnailUrl !== item.videoUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.title || 'Portfolio video'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                                  <Video className="w-16 h-16 text-white opacity-30" />
                                </div>
                              )}
                              {/* Always visible play button overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all rounded-lg">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Video className="w-8 h-8 md:w-10 md:h-10 text-gray-900 fill-current" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black">
                              <Video className="w-12 h-12 text-white opacity-50" />
                            </div>
                          )}
                          {/* Stats overlay */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 fill-current" />
                              <span className="font-semibold">{item.likesCount || 0}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4 fill-current" />
                              <span className="font-semibold">{item.commentsCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No videos in your portfolio yet. Upload some videos to get started!</p>
                    </div>
                  )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

                {/* Portfolio Detail Modal (Instagram-style) */}
                <Dialog open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen}>
                  <DialogContent className="max-w-5xl w-full p-0 gap-0 max-h-[95vh] md:max-h-[90vh] overflow-hidden">
                    {selectedPortfolioItem && (
                      <div className="flex flex-col md:flex-row h-full max-h-[95vh] md:max-h-[90vh]">
                        {/* Media Section */}
                        <div className="relative w-full md:w-2/3 bg-black flex items-center justify-center aspect-square md:aspect-auto md:h-[90vh] max-h-[50vh] md:max-h-[90vh]">
                          {selectedPortfolioItem.mediaType === 'video' && selectedPortfolioItem.videoUrl ? (
                            <video
                              src={selectedPortfolioItem.videoUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <img
                              src={selectedPortfolioItem.imageUrl}
                              alt={selectedPortfolioItem.title || 'Portfolio image'}
                              className="w-full h-full object-contain"
                            />
                          )}
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
                                  title: selectedPortfolioItem.mediaType === 'video' ? 'Video removed' : 'Photo removed',
                                  description: `Portfolio ${selectedPortfolioItem.mediaType === 'video' ? 'video' : 'photo'} deleted successfully.`,
                                });
                              } catch (err) {
                                console.error('Delete portfolio item failed', err);
                                toast({
                                  title: 'Delete failed',
                                  description:
                                    err instanceof Error
                                      ? err.message
                                      : `Could not delete portfolio ${selectedPortfolioItem.mediaType === 'video' ? 'video' : 'photo'}`,
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
                          <div className="p-3 md:p-4 border-b border-border flex items-center space-x-2 md:space-x-3">
                            <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                              <AvatarImage src={photographerData?.avatarUrl} />
                              <AvatarFallback>
                                {photographerData?.fullName?.charAt(0) || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs md:text-sm truncate">{photographerData?.fullName || 'Photographer'}</p>
                              {selectedPortfolioItem.location && (
                                <p className="text-xs text-muted-foreground truncate">{selectedPortfolioItem.location}</p>
                              )}
                            </div>
                          </div>

                          {/* Caption/Description */}
                          {(selectedPortfolioItem.title || selectedPortfolioItem.description) && (
                            <div className="p-3 md:p-4 border-b border-border">
                              <p className="text-xs md:text-sm whitespace-pre-wrap break-words">
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
                          <div className="p-3 md:p-4 border-b border-border">
                            <div className="flex items-center space-x-4 md:space-x-6">
                              <div className="flex items-center space-x-1 md:space-x-2">
                                <Heart className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="font-semibold text-xs md:text-sm">{selectedPortfolioItem.likesCount || 0} likes</span>
                              </div>
                              <div className="flex items-center space-x-1 md:space-x-2">
                                <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                                <span className="font-semibold text-xs md:text-sm">{selectedPortfolioItem.commentsCount || 0} comments</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-3 md:p-4 border-b border-border flex items-center flex-wrap gap-2 md:space-x-4">
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
                              <Heart className="w-4 h-4 md:w-5 md:h-5" />
                              <span>Like</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
                              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                              <span>Comment</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm">
                              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
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
          </TabsContent>

          {/* SERVICES & PRICING */}
          <TabsContent value="services">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardHeader className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Services & Pricing</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto mt-2 sm:mt-0"
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
                    <span className="hidden sm:inline">Add Package</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                {servicesProfile.packages.map((pkg, index) => (
                  <div key={pkg.id} className="border border-border rounded-lg p-3 md:p-4 space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm md:text-base truncate">
                        {pkg.name || `Package ${index + 1}`}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                  <Globe className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Contact & Social Media</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
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
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Availability & Travel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 md:p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm md:text-base">Instant Booking</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Allow clients to book without approval</p>
                  </div>
                  <Switch className="flex-shrink-0" />
                </div>

                <div>
                  <Label>Unavailable Dates</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">Mark dates when you're not available</p>
                  <div className="border rounded-lg p-3 md:p-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">Calendar integration coming soon</p>
                  </div>
                </div>

                <div>
                  <Label>Recurring Unavailability</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">Select weekdays you're typically unavailable</p>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <label key={day} className="flex flex-col items-center space-y-1 md:space-y-2 p-2 md:p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <span className="text-xs sm:text-sm font-medium">{day}</span>
                        <input type="checkbox" className="rounded w-3 h-3 md:w-4 md:h-4" />
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Travel Preferences</h4>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 md:p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label className="text-sm md:text-base">Willing to Travel</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">Accept bookings outside your city</p>
                    </div>
                    <Switch defaultChecked className="flex-shrink-0" />
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
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 md:mt-8 px-3 md:px-0">
          <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/photographer/home')}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button size="lg" className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Followers/Following Modals */}
      {photographerData?.photographerId && (
        <>
          <FollowersFollowingModal
            open={followersModalOpen}
            onOpenChange={setFollowersModalOpen}
            photographerId={photographerData.photographerId}
            type="followers"
            title="Followers"
          />
          <FollowersFollowingModal
            open={followingModalOpen}
            onOpenChange={setFollowingModalOpen}
            photographerId={photographerData.photographerId}
            type="following"
            title="Following"
          />
        </>
      )}
    </div>
  );
};

export default PhotographerProfileEditPage;

