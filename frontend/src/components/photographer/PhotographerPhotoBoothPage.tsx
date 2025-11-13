import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Plus, Download, Eye, Edit, Trash2, Copy, Share2, Calendar, Image as ImageIcon, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import { photographerPhotoBooths } from '@/data/photographerDummyData';

const PhotographerPhotoBoothPage = () => {
  const navigate = useNavigate();
  const [galleries] = useState(photographerPhotoBooths);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

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
    // TODO: Show toast notification
    console.log('Copied to clipboard:', text);
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
                    {galleries.reduce((sum, g) => sum + g.accessCount, 0)}
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
                    {galleries.reduce((sum, g) => sum + g.downloadCount, 0)}
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
                    {galleries.reduce((sum, g) => sum + g.photoCount, 0)}
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

        {/* Galleries List */}
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
                    Created: {new Date(gallery.createdAt).toLocaleDateString()}
                  </p>
                  {gallery.expiryDate && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {gallery.expiryDate}
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
                    <Badge variant={gallery.watermark ? "default" : "secondary"}>
                      {gallery.watermark ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="w-10 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="w-10 p-0">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="w-10 p-0">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="w-10 p-0 text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">No photo galleries yet</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Gallery
            </Button>
          </div>
        )}

        {/* Create Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generate QR Code Gallery</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Event Name</Label>
                  <Input id="eventName" placeholder="e.g., Smith Wedding 2024" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="privacy">Privacy</Label>
                  <select className="w-full p-2 border border-border rounded-lg mt-2">
                    <option value="public">Public</option>
                    <option value="password">Password Protected</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="downloads">Allow Downloads</Label>
                  <Switch id="downloads" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="watermark">Add Watermark</Label>
                  <Switch id="watermark" />
                </div>

                <div>
                  <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                  <Input id="expiry" type="date" className="mt-2" />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-primary to-primary-glow">
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
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

