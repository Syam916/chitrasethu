import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Eye, Upload, Plus, Trash2, Camera, Award, DollarSign, Globe, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';

const PhotographerProfileEditPage = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

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

  const handleSave = () => {
    setSaving(true);
    // TODO: API call to save profile
    setTimeout(() => {
      setSaving(false);
      console.log('Profile saved');
    }, 1000);
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
                    <Input id="fullName" placeholder="John Doe" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="businessName">Studio/Company Name</Label>
                    <Input id="businessName" placeholder="John's Photography Studio" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="profilePhoto">Profile Photo</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
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
                    <Input id="city" placeholder="Mumbai" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" placeholder="Maharashtra" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" placeholder="India" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio/About Me</Label>
                  <Textarea 
                    id="bio"
                    placeholder="Tell clients about yourself, your photography style, and experience..."
                    rows={6}
                    className="mt-2"
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
                      <label key={spec} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <Input id="experience" type="number" placeholder="5" className="mt-2" />
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
                  />
                </div>

                <div>
                  <Label htmlFor="awards">Awards & Recognition</Label>
                  <Textarea 
                    id="awards"
                    placeholder="List any awards or recognition you've received..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="equipment">Equipment</Label>
                  <Textarea 
                    id="equipment"
                    placeholder="List your professional equipment (e.g., Canon 5D Mark IV, Sony A7 III)..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="languages">Languages Spoken</Label>
                  <Input id="languages" placeholder="English, Hindi, Marathi" className="mt-2" />
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
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: JPG, PNG, WebP (Max 10MB each)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative aspect-square bg-muted rounded-lg group">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

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
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sample Service Package */}
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Wedding Premium Package</h4>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="packageName">Package Name</Label>
                      <Input id="packageName" defaultValue="Wedding Premium" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Input id="duration" type="number" defaultValue="8" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input id="price" type="number" defaultValue="40000" className="mt-2" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="inclusions">Inclusions</Label>
                    <Textarea 
                      id="inclusions"
                      defaultValue="Full day coverage&#10;500+ edited photos&#10;Album included&#10;Online gallery"
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="baseRate">Base Rate per Hour (₹)</Label>
                    <Input id="baseRate" type="number" placeholder="5000" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="travelCharge">Travel Charges (₹/km)</Label>
                    <Input id="travelCharge" type="number" placeholder="50" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Textarea 
                    id="paymentTerms"
                    placeholder="e.g., 30% advance, 70% on delivery..."
                    rows={3}
                    className="mt-2"
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

