import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Plus, Download, Eye, Edit, Trash2, Copy, Share2, Calendar, Image as ImageIcon, TrendingUp, Loader2, Mail, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import photoBoothService, { PhotoBoothGallery, CreateGalleryRequest } from '@/services/photoBooth.service';

const PhotographerPhotoBoothPage = () => {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<PhotoBoothGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create modal form state
  const [eventName, setEventName] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'password' | 'private'>('public');
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<PhotoBoothGallery | null>(null);
  const [customerEmails, setCustomerEmails] = useState('');
  const [customerNames, setCustomerNames] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchGalleries();
  }, [navigate]);

  const fetchGalleries = async () => {
    try {
      setIsLoading(true);
      const data = await photoBoothService.getMyGalleries();
      setGalleries(data);
    } catch (error: any) {
      console.error('Error fetching galleries:', error);
      toast.error(error.message || 'Failed to fetch galleries');
    } finally {
      setIsLoading(false);
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy.toLowerCase()) {
      case 'public': return 'bg-green-500';
      case 'password': return 'bg-yellow-500';
      case 'private': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleCreateGallery = async () => {
    if (!eventName.trim()) {
      toast.error('Please enter an event name');
      return;
    }
    if (photoUrls.length === 0) {
      toast.error('Please add at least one photo');
      return;
    }
    if (privacy === 'password' && !password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    try {
      setIsCreating(true);
      const data: CreateGalleryRequest = {
        eventName: eventName.trim(),
        photoUrls,
        privacy,
        password: privacy === 'password' ? password : undefined,
        expiryDate: expiryDate || undefined,
        downloadEnabled,
        watermarkEnabled,
        description: description.trim() || undefined,
      };

      await photoBoothService.createGallery(data);
      toast.success('Gallery created successfully!');
      setShowCreateModal(false);
      resetCreateForm();
      fetchGalleries();
    } catch (error: any) {
      console.error('Error creating gallery:', error);
      toast.error(error.message || 'Failed to create gallery');
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setEventName('');
    setPrivacy('public');
    setPassword('');
    setExpiryDate('');
    setDownloadEnabled(true);
    setWatermarkEnabled(false);
    setDescription('');
    setPhotoUrls([]);
  };

  const handleDeleteGallery = async (galleryId: number) => {
    if (!confirm('Are you sure you want to delete this gallery?')) {
      return;
    }

    try {
      await photoBoothService.deleteGallery(galleryId);
      toast.success('Gallery deleted successfully!');
      fetchGalleries();
    } catch (error: any) {
      console.error('Error deleting gallery:', error);
      toast.error(error.message || 'Failed to delete gallery');
    }
  };

  const handleDownloadQR = async (galleryId: number, eventName: string) => {
    try {
      const { qrCodeUrl } = await photoBoothService.downloadQRCode(galleryId);
      
      // Create a link element to download the QR code
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `QR-${eventName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR code downloaded!');
    } catch (error: any) {
      console.error('Error downloading QR code:', error);
      toast.error(error.message || 'Failed to download QR code');
    }
  };

  const handleViewGallery = (galleryUrl: string) => {
    window.open(galleryUrl, '_blank');
  };

  const handleSendEmail = (gallery: PhotoBoothGallery) => {
    setSelectedGallery(gallery);
    setCustomerEmails('');
    setCustomerNames('');
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = async () => {
    if (!selectedGallery) return;

    const emails = customerEmails.split(',').map(email => email.trim()).filter(email => email);
    
    if (emails.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    const names = customerNames ? customerNames.split(',').map(name => name.trim()).filter(name => name) : undefined;

    try {
      setIsSendingEmail(true);
      const result = await photoBoothService.sendGalleryEmail(
        selectedGallery.galleryId,
        emails.length === 1 ? emails[0] : emails,
        names && names.length > 0 ? (names.length === 1 ? names[0] : names) : undefined
      );
      
      if (result.failed === 0) {
        toast.success(`Emails sent successfully to ${result.sent} recipient(s)!`);
        setShowEmailModal(false);
        setCustomerEmails('');
        setCustomerNames('');
        setSelectedGallery(null);
      } else {
        toast.warning(`Sent to ${result.sent} recipient(s), but ${result.failed} failed. Check console for details.`);
        console.error('Email send results:', result);
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send emails');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Photo <span className="gradient-text">Booth</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create QR codes for easy photo gallery sharing with your clients
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary-glow"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate New QR Code
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Galleries</p>
                  <p className="text-2xl font-bold">{galleries.length}</p>
                </div>
                <QrCode className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">
                    {galleries.reduce((sum, g) => sum + (g.accessCount || 0), 0)}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold">
                    {galleries.reduce((sum, g) => sum + (g.downloadCount || 0), 0)}
                  </p>
                </div>
                <Download className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Photos</p>
                  <p className="text-2xl font-bold">
                    {galleries.reduce((sum, g) => sum + (g.photoCount || 0), 0)}
                  </p>
                </div>
                <ImageIcon className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Photo Galleries</h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading galleries...</p>
          </div>
        )}

        {/* Galleries List */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery) => (
            <Card key={gallery.galleryId} className="glass-effect hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                {/* QR Code Image */}
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48 bg-white p-4 rounded-lg shadow-md">
                    <img 
                      src={gallery.qrCodeUrl} 
                      alt={`QR Code for ${gallery.eventName}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Gallery Info */}
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg mb-2">{gallery.eventName}</h3>
                  <div className="flex justify-center space-x-2 mb-3">
                    <Badge className={`${getPrivacyColor(gallery.privacy)} text-white`}>
                      {gallery.privacy}
                    </Badge>
                    <Badge variant="outline">{gallery.photoCount} photos</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created: {gallery.createdAt ? new Date(gallery.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {gallery.expiryDate && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(gallery.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <p className="font-semibold">{gallery.accessCount}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <p className="font-semibold">{gallery.downloadCount}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                </div>

                {/* QR Code String */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                    <code className="text-xs flex-1 truncate">{gallery.qrCode}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(gallery.qrCode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Gallery URL */}
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Gallery URL:</p>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                    <span className="text-xs flex-1 truncate">{gallery.galleryUrl}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => copyToClipboard(gallery.galleryUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Gallery Settings */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downloads</span>
                    <Badge variant={gallery.downloadEnabled ? "default" : "secondary"}>
                      {gallery.downloadEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Watermark</span>
                    <Badge variant={gallery.watermarkEnabled ? "default" : "secondary"}>
                      {gallery.watermarkEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleViewGallery(gallery.galleryUrl)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-10 p-0"
                    onClick={() => handleDownloadQR(gallery.galleryId, gallery.eventName)}
                    title="Download QR Code"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-10 p-0"
                    onClick={() => handleSendEmail(gallery)}
                    title="Send Email to Customers"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-10 p-0"
                    onClick={() => copyToClipboard(gallery.galleryUrl)}
                    title="Copy Gallery URL"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-10 p-0 text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteGallery(gallery.galleryId)}
                    title="Delete Gallery"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!isLoading && galleries.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">No photo galleries yet</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Gallery
            </Button>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && selectedGallery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Send Gallery Email</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowEmailModal(false);
                      setCustomerEmails('');
                      setCustomerNames('');
                      setSelectedGallery(null);
                    }}
                    disabled={isSendingEmail}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Send QR code and gallery link to customers via email
                  </p>
                  <div className="p-3 bg-muted/50 rounded-lg mb-4">
                    <p className="text-sm font-semibold">Gallery: {selectedGallery.eventName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedGallery.photoCount} photos • {selectedGallery.accessCount} views
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerEmails">
                    Customer Email(s) *
                    <span className="text-xs text-muted-foreground ml-2">
                      (Separate multiple emails with commas)
                    </span>
                  </Label>
                  <Textarea
                    id="customerEmails"
                    placeholder="customer1@example.com, customer2@example.com"
                    className="mt-2"
                    rows={3}
                    value={customerEmails}
                    onChange={(e) => setCustomerEmails(e.target.value)}
                    disabled={isSendingEmail}
                  />
                </div>

                <div>
                  <Label htmlFor="customerNames">
                    Customer Name(s)
                    <span className="text-xs text-muted-foreground ml-2">
                      (Optional - Separate multiple names with commas)
                    </span>
                  </Label>
                  <Textarea
                    id="customerNames"
                    placeholder="John Doe, Jane Smith"
                    className="mt-2"
                    rows={2}
                    value={customerNames}
                    onChange={(e) => setCustomerNames(e.target.value)}
                    disabled={isSendingEmail}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEmailModal(false);
                      setCustomerEmails('');
                      setCustomerNames('');
                      setSelectedGallery(null);
                    }}
                    disabled={isSendingEmail}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-primary to-primary-glow"
                    onClick={handleSendEmailSubmit}
                    disabled={isSendingEmail}
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl glass-effect max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generate QR Code Gallery</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input 
                    id="eventName" 
                    placeholder="e.g., Smith Wedding 2024" 
                    className="mt-2"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="privacy">Privacy</Label>
                  <Select value={privacy} onValueChange={(value: 'public' | 'password' | 'private') => setPrivacy(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="password">Password Protected</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {privacy === 'password' && (
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter password" 
                      className="mt-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="photoUrls">Photo URLs (one per line) *</Label>
                  <Textarea 
                    id="photoUrls" 
                    placeholder="Enter photo URLs, one per line&#10;https://cloudinary.com/photo1.jpg&#10;https://cloudinary.com/photo2.jpg"
                    className="mt-2"
                    rows={5}
                    value={photoUrls.join('\n')}
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').filter(url => url.trim());
                      setPhotoUrls(urls);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {photoUrls.length} photo{photoUrls.length !== 1 ? 's' : ''} added
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Gallery description..."
                    className="mt-2"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                  <Input 
                    id="expiry" 
                    type="date" 
                    className="mt-2"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="downloads">Allow Downloads</Label>
                  <Switch 
                    id="downloads" 
                    checked={downloadEnabled}
                    onCheckedChange={setDownloadEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="watermark">Add Watermark</Label>
                  <Switch 
                    id="watermark" 
                    checked={watermarkEnabled}
                    onCheckedChange={setWatermarkEnabled}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-primary to-primary-glow"
                    onClick={handleCreateGallery}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generate QR Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerPhotoBoothPage;

