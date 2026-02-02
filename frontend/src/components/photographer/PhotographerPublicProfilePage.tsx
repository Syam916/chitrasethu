import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  Award,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Edit3,
  UserPlus,
  UserMinus,
  Users,
} from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import NavbarIntegrated from '../home/NavbarIntegrated';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent } from '../ui/dialog';
import FollowersFollowingModal from '../ui/FollowersFollowingModal';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/auth.service';
import photographerService, { PhotographerDetail } from '@/services/photographer.service';
import followService from '@/services/follow.service';
import profileAvatar from '@/assets/photographer-1.jpg';
import coverPhoto from '@/assets/wedding-collection.jpg';

const PhotographerPublicProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState<PhotographerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PhotographerDetail['portfolio'][0] | null>(null);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if user is a photographer when accessing their own profile
        if (!id) {
          const currentUser = authService.getStoredUser();
          if (currentUser && currentUser.userType !== 'photographer') {
            // Customer trying to access photographer profile - redirect to their profile
            navigate('/profile');
            return;
          }
        }

        let data: PhotographerDetail;
        if (id) {
          data = await photographerService.getById(Number(id));
          // Get follow status using the actual photographerId from the loaded profile
          if (authService.isAuthenticated() && data.photographerId) {
            try {
              const followStatus = await followService.getFollowStatus(data.photographerId);
              setIsFollowing(followStatus.isFollowing);
            } catch (err) {
              console.error('Failed to get follow status:', err);
            }
          }
        } else {
          data = await photographerService.getMyProfile();
          setIsFollowing(false); // Can't follow yourself
        }

        setProfile(data);
      } catch (err: any) {
        // If customer tries to access /photographers/me, redirect them
        if (err.message?.includes('Only photographers') || err.message?.includes('403')) {
          navigate('/profile');
          return;
        }
        // If profile not found, redirect to edit page to create it
        if (err.message?.includes('not found') || err.message?.includes('404')) {
          console.log('Photographer profile not found, redirecting to edit page');
          navigate('/photographer/profile/edit');
          return;
        }
        setError(err.message || 'Failed to load photographer profile');
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground mb-4">{error || 'Unable to load photographer profile.'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const locationLabel =
    [profile.city, profile.state].filter(Boolean).join(', ') || profile.location || 'Location not specified';

  const servicesOffered = profile.servicesOffered
    ? Array.isArray(profile.servicesOffered)
      ? profile.servicesOffered[0]
      : profile.servicesOffered
    : null;

  const packages = servicesOffered?.packages || [];
  const isOwnProfile = !id || id === authService.getStoredUser()?.userId?.toString();

  const handleFollow = async () => {
    if (!profile || isOwnProfile) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await followService.unfollowPhotographer(profile.photographerId);
        setIsFollowing(false);
        setProfile({
          ...profile,
          followerCount: (profile.followerCount || 0) - 1,
          isFollowing: false,
        });
        toast({
          title: 'Unfollowed',
          description: `You unfollowed ${profile.fullName}`,
        });
      } else {
        await followService.followPhotographer(profile.photographerId);
        setIsFollowing(true);
        setProfile({
          ...profile,
          followerCount: (profile.followerCount || 0) + 1,
          isFollowing: true,
        });
        toast({
          title: 'Following',
          description: `You are now following ${profile.fullName}`,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update follow status',
        variant: 'destructive',
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Use customer navbar for customers, photographer navbar for photographers
  const currentUser = authService.getStoredUser();
  const isCustomer = currentUser && currentUser.userType !== 'photographer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {isCustomer ? <NavbarIntegrated /> : <PhotographerNavbar />}

      {/* Cover Photo & Header */}
      <div className="relative">
        <div className="h-64 w-full bg-cover bg-center" style={{ backgroundImage: `url(${coverPhoto})` }}>
          <div className="h-full w-full bg-black/50 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-4">
          <Card className="-mt-24 glass-effect border-border/40">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-24 h-24 ring-4 ring-primary/30">
                    <AvatarImage src={profile.avatarUrl || profileAvatar} alt={profile.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xl">
                      {profile.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-playfair font-bold">{profile.fullName}</h1>
                      {profile.isVerified && <Badge className="bg-primary/90">Verified</Badge>}
                      {profile.isPremium && <Badge variant="outline">Premium</Badge>}
                    </div>
                    <p className="text-muted-foreground">{profile.businessName || 'Professional Photographer'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {locationLabel}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />{' '}
                        {profile.experienceYears ? `${profile.experienceYears}+ years` : 'Experienced'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />{' '}
                        {profile.rating ? `${profile.rating.toFixed(1)}/5` : 'New'} · {profile.totalReviews ?? 0}{' '}
                        reviews
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <Button variant="outline" onClick={() => navigate('/photographer/profile/edit')}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant={isFollowing ? 'outline' : 'default'}
                      className={isFollowing ? '' : 'bg-gradient-to-r from-primary to-primary-glow'}
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                  <Button className="bg-gradient-to-r from-primary to-primary-glow">
                    <Calendar className="w-4 h-4 mr-2" />
                    Check Availability
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* About + Professional Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-effect">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio || 'This photographer has not added a bio yet.'}
              </p>
              <Separator />

              {/* Specializations */}
              {profile.specialties && profile.specialties.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((spec, idx) => (
                      <Badge key={idx} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {profile.equipment && profile.equipment.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Equipment</h3>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(profile.equipment) ? profile.equipment.join(', ') : profile.equipment}
                  </p>
                </div>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Languages</h3>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(profile.languages) ? profile.languages.join(', ') : profile.languages}
                  </p>
                </div>
              )}

              {/* Certifications */}
              {profile.certifications && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Certifications</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{profile.certifications}</p>
                </div>
              )}

              {/* Awards */}
              {profile.awards && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Awards & Recognition</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{profile.awards}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h3 className="text-2xl font-semibold">{profile.totalBookings ?? 0}</h3>
                  <p className="text-sm text-muted-foreground">Completed Bookings</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h3 className="text-2xl font-semibold">
                    {profile.basePrice ? `₹${profile.basePrice.toLocaleString()}` : '—'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Starting Price</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h3 className="text-2xl font-semibold">
                    {profile.rating ? `${profile.rating.toFixed(1)}/5` : '—'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Client Rating</p>
                </div>
              </div>

              {/* Follow Stats */}
              {(profile.followerCount !== undefined || profile.followingCount !== undefined) && (
                <>
                  <Separator />
                  <div className="flex gap-6 pt-4">
                    {profile.followerCount !== undefined && (
                      <button
                        onClick={() => setFollowersModalOpen(true)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-semibold">{profile.followerCount}</span>{' '}
                          <span className="text-muted-foreground">followers</span>
                        </span>
                      </button>
                    )}
                    {profile.followingCount !== undefined && (
                      <button
                        onClick={() => setFollowingModalOpen(true)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-semibold">{profile.followingCount}</span>{' '}
                          <span className="text-muted-foreground">following</span>
                        </span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {profile.email}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> {profile.phone}
                  </div>
                )}
                {locationLabel && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> {locationLabel}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services & Pricing */}
            {packages.length > 0 && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Service Packages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {packages.map((pkg: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{pkg.name || 'Package'}</span>
                        {pkg.price && (
                          <span className="text-primary font-semibold">₹{pkg.price.toLocaleString()}</span>
                        )}
                      </div>
                      {pkg.durationHours && (
                        <p className="text-xs text-muted-foreground mt-1">{pkg.durationHours} hours</p>
                      )}
                      {pkg.inclusions && pkg.inclusions.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Array.isArray(pkg.inclusions) ? pkg.inclusions.join(', ') : pkg.inclusions}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Portfolio - Instagram Style */}
        {profile.portfolio && profile.portfolio.length > 0 && (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {profile.portfolio.map((item) => (
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
            </CardContent>
          </Card>
        )}

        {/* Portfolio Detail Modal */}
        <Dialog open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen}>
          <DialogContent className="max-w-5xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden">
            {selectedPortfolioItem && (
              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                <div className="relative w-full md:w-2/3 bg-black flex items-center justify-center aspect-square md:aspect-auto md:h-[90vh]">
                  <img
                    src={selectedPortfolioItem.imageUrl}
                    alt={selectedPortfolioItem.title || 'Portfolio image'}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-full md:w-1/3 flex flex-col border-l border-border bg-background">
                  <div className="p-4 border-b border-border flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={profile.avatarUrl} />
                      <AvatarFallback>{profile.fullName?.charAt(0) || 'P'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{profile.fullName}</p>
                      {selectedPortfolioItem.location && (
                        <p className="text-xs text-muted-foreground">{selectedPortfolioItem.location}</p>
                      )}
                    </div>
                  </div>
                  {(selectedPortfolioItem.title || selectedPortfolioItem.description) && (
                    <div className="p-4 border-b border-border">
                      <p className="text-sm whitespace-pre-wrap">
                        <span className="font-semibold">{profile.fullName}</span>{' '}
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
                  <div className="flex-1" />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Followers/Following Modals */}
      {profile && (
        <>
          <FollowersFollowingModal
            open={followersModalOpen}
            onOpenChange={setFollowersModalOpen}
            photographerId={profile.photographerId}
            type="followers"
            title="Followers"
          />
          <FollowersFollowingModal
            open={followingModalOpen}
            onOpenChange={setFollowingModalOpen}
            photographerId={profile.photographerId}
            type="following"
            title="Following"
          />
        </>
      )}
    </div>
  );
};

export default PhotographerPublicProfilePage;
