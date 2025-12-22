import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Save, X, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import authService from '@/services/auth.service';
import uploadService from '@/services/upload.service';
import followService from '@/services/follow.service';
import FollowersFollowingModal from '@/components/ui/FollowersFollowingModal';
import { useToast } from '@/hooks/use-toast';

interface User {
  userId: number;
  email: string;
  fullName: string;
  userType: string;
  isVerified: boolean;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  city?: string;
  state?: string;
  bio?: string;
}

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [followingCount, setFollowingCount] = useState(0);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    city: '',
    state: '',
    bio: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        const userData = await authService.getCurrentUser();
        
        // If user is a photographer, redirect to photographer profile
        if (userData.userType === 'photographer') {
          navigate('/photographer/profile/public');
          return;
        }
        
        setUser(userData);
        setAvatarUrl(userData.avatarUrl);
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          city: userData.city || '',
          state: userData.state || '',
          bio: userData.bio || ''
        });

        // Load following count for customers
        if (userData.userType === 'customer') {
          try {
            const followingData = await followService.getMyFollowing(1, 0);
            setFollowingCount(followingData.total);
          } catch (err) {
            console.error('Failed to load following count:', err);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      setAvatarProgress(0);

      const validationError = uploadService.validateFile(file, 10);
      if (validationError) throw new Error(validationError);

      const userId = user?.userId;
      const folder = userId ? `chitrasethu/avatars/user_${userId}` : 'chitrasethu/avatars';

      const uploaded = await uploadService.uploadPhoto(file, folder, (p) => setAvatarProgress(p));
      setAvatarUrl(uploaded.url);
      setSuccess('Profile photo uploaded. Click Save to persist.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
      setTimeout(() => setAvatarProgress(0), 800);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        bio: formData.bio,
        avatarUrl,
      });
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setUser(updatedUser);
      setAvatarUrl(updatedUser.avatarUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        city: user.city || '',
        state: user.state || '',
        bio: user.bio || ''
      });
    }
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType.toLowerCase()) {
      case 'admin':
        return 'bg-red-500';
      case 'photographer':
        return 'bg-blue-500';
      case 'customer':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="h-64 bg-muted rounded-lg"></div>
                </div>
                <div className="lg:col-span-2">
                  <div className="h-96 bg-muted rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load user data</p>
            <Button onClick={() => navigate('/home')} className="mt-4">
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-playfair font-bold gradient-text mb-2">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                        <AvatarImage src={avatarUrl} alt={user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-2xl">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                        className="hidden"
                        onChange={handleAvatarSelect}
                        disabled={avatarUploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                      >
                        <Camera className="w-4 h-4 mr-1" />
                        {avatarUploading ? `Uploading ${avatarProgress}%` : 'Change'}
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-playfair">{user.fullName}</CardTitle>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Badge className={`${getUserTypeColor(user.userType)} text-white`}>
                      {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                    </Badge>
                    {user.isVerified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.phone}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.location}</span>
                      </div>
                    )}
                    {user.userType === 'customer' && (
                      <button
                        onClick={() => setFollowingModalOpen(true)}
                        className="flex items-center space-x-3 w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          <span className="font-semibold">{followingCount}</span> following
                        </span>
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Personal Information</span>
                    </CardTitle>
                    {!editing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                        className="flex items-center space-x-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{saving ? 'Saving...' : 'Save'}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={true} // Email usually can't be changed
                        className="bg-muted/50"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="bg-background/50"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="bg-background/50"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="bg-background/50"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className="bg-background/50"
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full min-h-[100px] px-3 py-2 bg-background/50 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-muted/50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Account Information */}
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Account Information</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>User ID</Label>
                        <Input
                          value={user.userId.toString()}
                          disabled
                          className="bg-muted/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <Input
                          value={user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                          disabled
                          className="bg-muted/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Verification Status</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={user.isVerified ? 'Verified' : 'Not Verified'}
                          disabled
                          className="bg-muted/50"
                        />
                        {user.isVerified ? (
                          <Badge className="bg-green-500 text-white">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Following Modal for Customers */}
      {user?.userType === 'customer' && (
        <FollowersFollowingModal
          open={followingModalOpen}
          onOpenChange={setFollowingModalOpen}
          photographerId={0} // Not used for my following
          type="following"
          title="Following"
        />
      )}
    </div>
  );
};

export default ProfileSettings;
