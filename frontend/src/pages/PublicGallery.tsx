import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Lock, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Loader2,
  Calendar,
  Images,
  Share2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getGalleryByQRCode, verifyPassword, trackPhotoDownload, PublicGallery, GalleryPhoto } from '@/services/publicGallery.service';

const PublicGallery = () => {
  const { qrCode } = useParams<{ qrCode: string }>();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState<PublicGallery | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordVerifying, setIsPasswordVerifying] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (qrCode) {
      loadGallery();
    }
  }, [qrCode]);

  const loadGallery = async () => {
    if (!qrCode) return;

    try {
      setIsLoading(true);
      const data = await getGalleryByQRCode(qrCode);
      setGallery(data);

      // If password required, show password form
      if (data.requiresPassword) {
        setPhotos([]);
      } else {
        setPhotos(data.photos || []);
        setCurrentPhotoIndex(0);
      }
    } catch (error: any) {
      console.error('Error loading gallery:', error);
      toast.error(error.message || 'Failed to load gallery');
      
      // Redirect after error message
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qrCode || !password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }

    try {
      setIsPasswordVerifying(true);
      setPasswordError('');
      const result = await verifyPassword(qrCode, password);
      setPhotos(result.photos);
      setCurrentPhotoIndex(0);
      
      // Update gallery state to remove password requirement
      if (gallery) {
        setGallery({
          ...gallery,
          requiresPassword: false,
          photos: result.photos
        });
      }
      
      toast.success('Password verified!');
    } catch (error: any) {
      console.error('Password verification error:', error);
      setPasswordError(error.message || 'Incorrect password');
      setPassword('');
    } finally {
      setIsPasswordVerifying(false);
    }
  };

  const handlePhotoClick = (photo: GalleryPhoto, index: number) => {
    setSelectedPhoto(photo);
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      const newIndex = currentPhotoIndex - 1;
      setCurrentPhotoIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      const newIndex = currentPhotoIndex + 1;
      setCurrentPhotoIndex(newIndex);
      setSelectedPhoto(photos[newIndex]);
    }
  };

  const handleDownloadPhoto = async (photo: GalleryPhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!gallery?.downloadEnabled) {
      toast.error('Downloads are disabled for this gallery');
      return;
    }

    try {
      // Track download
      await trackPhotoDownload(photo.photoId);

      // Download image
      const link = document.createElement('a');
      link.href = photo.photoUrl;
      link.download = `photo-${photo.photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Photo downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      // Still try to download even if tracking fails
      const link = document.createElement('a');
      link.href = photo.photoUrl;
      link.download = `photo-${photo.photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareGallery = () => {
    if (navigator.share && gallery) {
      navigator.share({
        title: gallery.eventName,
        text: `Check out this photo gallery: ${gallery.eventName}`,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copy
        copyGalleryUrl();
      });
    } else {
      copyGalleryUrl();
    }
  };

  const copyGalleryUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Gallery URL copied to clipboard!');
  };

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPhotoIndex > 0) {
        const newIndex = currentPhotoIndex - 1;
        setCurrentPhotoIndex(newIndex);
        setSelectedPhoto(photos[newIndex]);
      } else if (e.key === 'ArrowRight' && currentPhotoIndex < photos.length - 1) {
        const newIndex = currentPhotoIndex + 1;
        setCurrentPhotoIndex(newIndex);
        setSelectedPhoto(photos[newIndex]);
      } else if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentPhotoIndex, photos]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
        <Card className="glass-effect max-w-md w-full">
          <CardContent className="p-8 text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Gallery Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The gallery you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{gallery.eventName}</h1>
              {gallery.description && (
                <p className="text-muted-foreground">{gallery.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Images className="w-4 h-4" />
                  <span>{gallery.photoCount} photos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{gallery.accessCount} views</span>
                </div>
                {gallery.expiryDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {new Date(gallery.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleShareGallery}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Password Protection Form */}
        {gallery.requiresPassword && photos.length === 0 && (
          <Card className="glass-effect max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Password Protected</h2>
                <p className="text-muted-foreground">
                  This gallery is password protected. Please enter the password to continue.
                </p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className={passwordError ? 'border-red-500' : ''}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPasswordVerifying}
                >
                  {isPasswordVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Access Gallery'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Photo Gallery Grid */}
        {photos.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.photoId}
                  className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => handlePhotoClick(photo, index)}
                >
                  <img
                    src={photo.thumbnailUrl || photo.photoUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {gallery.downloadEnabled && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleDownloadPhoto(photo, e)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!gallery.downloadEnabled && (
              <div className="text-center mt-8 p-4 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  Downloads are disabled for this gallery
                </p>
              </div>
            )}
          </>
        )}

        {!gallery.requiresPassword && photos.length === 0 && (
          <Card className="glass-effect">
            <CardContent className="p-12 text-center">
              <Images className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Photos</h3>
              <p className="text-muted-foreground">
                This gallery doesn't have any photos yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          {currentPhotoIndex > 0 && (
            <button
              className="absolute left-4 text-white hover:text-gray-300 z-10 p-2 bg-black/50 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handlePreviousPhoto();
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Photo */}
          <div
            className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.photoUrl}
              alt={`Photo ${currentPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Next Button */}
          {currentPhotoIndex < photos.length - 1 && (
            <button
              className="absolute right-4 text-white hover:text-gray-300 z-10 p-2 bg-black/50 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Photo Info & Download */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center gap-4">
              <span className="text-white text-sm">
                {currentPhotoIndex + 1} / {photos.length}
              </span>
              {gallery.downloadEnabled && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPhoto(selectedPhoto, e);
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicGallery;

