import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Calendar, Camera, Users, DollarSign, MessageCircle, Star, Filter, Loader2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import { eventCategories } from '../data/dummyData';
import avatarOne from '@/assets/photographer-1.jpg';
import avatarTwo from '@/assets/photographer-2.jpg';
import avatarThree from '@/assets/wedding-1.jpg';
import avatarFour from '@/assets/prewedding-1.jpg';
import bookingService from '@/services/booking.service';
import photographerService from '@/services/photographer.service';
import authService from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';

const Requests = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my-requests'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    projectTitle: '',
    category: '',
    budgetRange: '',
    eventDate: '',
    location: '',
    projectDescription: '',
    requirements: '',
    photographerId: '',
    bookingTime: '',
    durationHours: ''
  });
  
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPhotographers, setIsLoadingPhotographers] = useState(false);
  
  // My Requests state
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoadingMyRequests, setIsLoadingMyRequests] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock requests data
  const requests = [
    {
      id: 1,
      title: 'Wedding Photography - Traditional Ceremony',
      client: 'Priya & Rahul',
      avatar: avatarOne,
      budget: '₹45,000 - ₹60,000',
      date: '2024-02-15',
      location: 'Mumbai, Maharashtra',
      category: 'Wedding',
      description: 'Looking for an experienced wedding photographer for our traditional Indian ceremony. Need someone who understands cultural nuances and can capture candid moments.',
      requirements: ['Full day coverage', 'Traditional + Modern shots', 'Album included', '500+ edited photos'],
      urgency: 'High',
      proposals: 12,
      postedTime: '2 hours ago',
      status: 'Open'
    },
    {
      id: 2,
      title: 'Corporate Event Photography',
      client: 'Tech Solutions Inc.',
      avatar: avatarTwo,
      budget: '₹25,000 - ₹35,000',
      date: '2024-01-28',
      location: 'Bangalore, Karnataka',
      category: 'Corporate',
      description: 'Annual company conference photography required. Professional headshots and event coverage needed.',
      requirements: ['Event coverage 8 hours', 'Headshots for 50 employees', 'Same day delivery', 'High resolution files'],
      urgency: 'Medium',
      proposals: 8,
      postedTime: '1 day ago',
      status: 'Open'
    },
    {
      id: 3,
      title: 'Fashion Portfolio Shoot',
      client: 'Ananya Model',
      avatar: avatarThree,
      budget: '₹15,000 - ₹25,000',
      date: '2024-02-05',
      location: 'Delhi, NCR',
      category: 'Fashion',
      description: 'Need a creative photographer for portfolio shoot. Looking for someone with fashion photography experience.',
      requirements: ['Studio setup', '3-4 outfit changes', 'Retouching included', 'Online gallery'],
      urgency: 'Low',
      proposals: 15,
      postedTime: '3 days ago',
      status: 'Open'
    },
    {
      id: 4,
      title: 'Pre-Wedding Shoot at Beach',
      client: 'Rohit & Kavya',
      avatar: avatarFour,
      budget: '₹20,000 - ₹30,000',
      date: '2024-02-10',
      location: 'Goa',
      category: 'Pre Wedding',
      description: 'Romantic pre-wedding shoot at Goa beaches during sunset. Looking for creative and artistic photographer.',
      requirements: ['Sunset timing', 'Multiple locations', 'Drone shots', 'Quick turnaround'],
      urgency: 'High',
      proposals: 6,
      postedTime: '5 hours ago',
      status: 'Open'
    }
  ];

  // Load photographers when create tab is active
  useEffect(() => {
    if (activeTab === 'create') {
      loadPhotographers();
    }
  }, [activeTab]);

  // Load my requests when my-requests tab is active
  useEffect(() => {
    if (activeTab === 'my-requests') {
      loadMyRequests();
    }
  }, [activeTab]);

  const loadPhotographers = async () => {
    try {
      setIsLoadingPhotographers(true);
      const data = await photographerService.getAll();
      setPhotographers(data);
    } catch (error: any) {
      console.error('Error loading photographers:', error);
      toast.error('Failed to load photographers');
    } finally {
      setIsLoadingPhotographers(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const parseBudgetRange = (range: string): number => {
    // Extract the maximum value from budget range
    // e.g., "₹40,000 - ₹60,000" -> 60000
    const match = range.match(/₹?([\d,]+)\s*-\s*₹?([\d,]+)/);
    if (match) {
      const max = parseInt(match[2].replace(/,/g, ''));
      return max;
    }
    // Handle "Under ₹20,000" or "Above ₹60,000"
    if (range.includes('Under')) {
      const match = range.match(/₹?([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, '')) : 20000;
    }
    if (range.includes('Above')) {
      const match = range.match(/₹?([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, '')) : 60000;
    }
    return 50000; // Default
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.photographerId) {
      toast.error('Please select a photographer');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }
    if (!formData.budgetRange) {
      toast.error('Please select a budget range');
      return;
    }
    if (!formData.eventDate) {
      toast.error('Please select an event date');
      return;
    }
    if (!formData.location) {
      toast.error('Please enter a location');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const totalAmount = parseBudgetRange(formData.budgetRange);
      
      await bookingService.createRequest({
        photographer_id: parseInt(formData.photographerId),
        event_type: formData.category,
        booking_date: formData.eventDate,
        booking_time: formData.bookingTime || undefined,
        duration_hours: formData.durationHours ? parseFloat(formData.durationHours) : undefined,
        location: formData.location,
        venue_name: formData.location,
        total_amount: totalAmount,
        special_requirements: `${formData.projectDescription}\n\nRequirements: ${formData.requirements}`.trim()
      });

      toast.success('Booking request posted successfully!');
      
      // Reset form
      setFormData({
        projectTitle: '',
        category: '',
        budgetRange: '',
        eventDate: '',
        location: '',
        projectDescription: '',
        requirements: '',
        photographerId: '',
        bookingTime: '',
        durationHours: ''
      });
      
      // Switch to my-requests tab and refresh
      setActiveTab('my-requests');
      await loadMyRequests();
    } catch (error: any) {
      console.error('Error posting request:', error);
      toast.error(error.message || 'Failed to post booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMyRequests = async () => {
    try {
      setIsLoadingMyRequests(true);
      const response = await bookingService.getMyRequests();
      setMyRequests(response.data.requests);
    } catch (error: any) {
      console.error('Error loading my requests:', error);
      toast.error(error.message || 'Failed to load your requests');
    } finally {
      setIsLoadingMyRequests(false);
    }
  };

  const handleEditRequest = (request: any) => {
    setEditingRequest(request);
    // Pre-fill form with request data
    setFormData({
      projectTitle: '',
      category: request.eventType || '',
      budgetRange: request.budgetRange || '',
      eventDate: request.eventDate || '',
      location: request.eventLocation || '',
      projectDescription: request.requirements?.split('\n\n')[0] || '',
      requirements: request.requirements?.split('\n\n')[1]?.replace('Requirements: ', '') || '',
      photographerId: request.photographerId?.toString() || '',
      bookingTime: request.eventTime !== 'Not specified' ? request.eventTime : '',
      durationHours: request.duration?.toString() || ''
    });
    setShowEditModal(true);
    setActiveTab('create');
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRequest) return;

    try {
      setIsSubmitting(true);
      
      const updateData: any = {};
      if (formData.category) updateData.event_type = formData.category;
      if (formData.eventDate) updateData.booking_date = formData.eventDate;
      if (formData.bookingTime) updateData.booking_time = formData.bookingTime;
      if (formData.durationHours) updateData.duration_hours = parseFloat(formData.durationHours);
      if (formData.location) updateData.location = formData.location;
      if (formData.budgetRange) {
        updateData.total_amount = parseBudgetRange(formData.budgetRange);
      }
      if (formData.projectDescription || formData.requirements) {
        updateData.special_requirements = `${formData.projectDescription}\n\nRequirements: ${formData.requirements}`.trim();
      }

      await bookingService.updateRequest(editingRequest.requestId, updateData);
      toast.success('Request updated successfully!');
      setShowEditModal(false);
      setEditingRequest(null);
      await loadMyRequests();
      setActiveTab('my-requests');
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast.error(error.message || 'Failed to update request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredRequests = requests.filter(request => 
    selectedCategory === 'all' || request.category.toLowerCase() === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Photography <span className="gradient-text">Requests</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Post your photography needs or browse available opportunities. Connect with the right photographers for your projects.
          </p>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto">
            <strong>Browse Requests:</strong> View open photography opportunities posted by customers. <strong>Post Request:</strong> Create a booking request for a specific photographer. <strong>My Requests:</strong> Manage your posted requests and view proposals from photographers.
          </p>
          
          {/* Tabs */}
          <div className="flex justify-center space-x-4 mb-8">
            {[
              { id: 'browse', label: 'Browse Requests', icon: Camera },
              { id: 'create', label: 'Post Request', icon: Plus },
              { id: 'my-requests', label: 'My Requests', icon: Users }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Browse Requests Tab */}
        {activeTab === 'browse' && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-80">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Category Filter */}
                    <div>
                      <h4 className="font-medium mb-2">Category</h4>
                      <div className="space-y-1">
                        {eventCategories.slice(0, 6).map((category) => (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "ghost"}
                            className="w-full justify-start text-sm"
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Budget Filter */}
                    <div>
                      <h4 className="font-medium mb-2">Budget Range</h4>
                      <div className="space-y-1">
                        {['Under ₹20,000', '₹20,000 - ₹40,000', '₹40,000 - ₹60,000', 'Above ₹60,000'].map((budget) => (
                          <Button key={budget} variant="ghost" className="w-full justify-start text-sm">
                            {budget}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Urgency Filter */}
                    <div>
                      <h4 className="font-medium mb-2">Urgency</h4>
                      <div className="space-y-1">
                        {['High Priority', 'Medium Priority', 'Low Priority'].map((urgency) => (
                          <Button key={urgency} variant="ghost" className="w-full justify-start text-sm">
                            {urgency}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="glass-effect mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Request Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Requests</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Budget</span>
                      <span className="font-semibold">₹12.5L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Proposals</span>
                      <span className="font-semibold">9.2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">{filteredRequests.length} Active Requests</h2>
                  <p className="text-muted-foreground">Find photography opportunities that match your skills</p>
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>

              {/* Requests List */}
              <div className="space-y-6">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="glass-effect hover:shadow-elegant transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Client Info */}
                        <div className="flex items-center space-x-3 lg:w-64">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={request.avatar} alt={request.client} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                              {request.client.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{request.client}</h3>
                            <p className="text-sm text-muted-foreground">{request.postedTime}</p>
                          </div>
                        </div>
                        
                        {/* Request Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h2 className="text-lg font-semibold mb-2">{request.title}</h2>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{request.date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{request.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{request.budget}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getUrgencyColor(request.urgency)} text-white`}>
                                {request.urgency} Priority
                              </Badge>
                              <Badge variant="secondary">
                                {request.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">{request.description}</p>
                          
                          {/* Requirements */}
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Requirements:</h4>
                            <div className="flex flex-wrap gap-2">
                              {request.requirements.map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{request.proposals} proposals</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{request.status}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button size="sm">
                                Submit Proposal
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Request Tab */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {editingRequest ? 'Edit Photography Request' : 'Post a Photography Request'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {editingRequest 
                    ? 'Update your booking request details' 
                    : 'Tell photographers what you need for your project'}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={editingRequest ? handleUpdateRequest : handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!editingRequest && (
                      <div>
                        <Label htmlFor="photographer" className="block text-sm font-medium mb-2">
                          Select Photographer <span className="text-red-500">*</span>
                        </Label>
                        {isLoadingPhotographers ? (
                          <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading photographers...</span>
                          </div>
                        ) : (
                          <Select
                            value={formData.photographerId}
                            onValueChange={(value) => handleInputChange('photographerId', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a photographer" />
                            </SelectTrigger>
                            <SelectContent>
                              {photographers.length === 0 ? (
                                <SelectItem value="" disabled>No photographers available</SelectItem>
                              ) : (
                                photographers.map((photographer) => (
                                  <SelectItem key={photographer.photographerId} value={photographer.photographerId.toString()}>
                                    {photographer.businessName || photographer.fullName || `Photographer ${photographer.photographerId}`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                    {editingRequest && (
                      <div>
                        <Label className="block text-sm font-medium mb-2">Photographer</Label>
                        <div className="p-3 border border-border rounded-lg bg-muted/30">
                          <span className="text-sm font-medium">{editingRequest.photographerName || 'Selected Photographer'}</span>
                          <p className="text-xs text-muted-foreground mt-1">Photographer cannot be changed after request is created</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="projectTitle" className="block text-sm font-medium mb-2">Project Title</Label>
                      <Input
                        id="projectTitle"
                        placeholder="e.g., Wedding Photography - Beach Ceremony"
                        value={formData.projectTitle}
                        onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="block text-sm font-medium mb-2">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wedding">Wedding</SelectItem>
                          <SelectItem value="Fashion">Fashion</SelectItem>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Portrait">Portrait</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Pre Wedding">Pre Wedding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="budgetRange" className="block text-sm font-medium mb-2">
                        Budget Range <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.budgetRange}
                        onValueChange={(value) => handleInputChange('budgetRange', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Under ₹20,000">Under ₹20,000</SelectItem>
                          <SelectItem value="₹20,000 - ₹40,000">₹20,000 - ₹40,000</SelectItem>
                          <SelectItem value="₹40,000 - ₹60,000">₹40,000 - ₹60,000</SelectItem>
                          <SelectItem value="Above ₹60,000">Above ₹60,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="eventDate" className="block text-sm font-medium mb-2">
                        Event Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => handleInputChange('eventDate', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bookingTime" className="block text-sm font-medium mb-2">Event Time (Optional)</Label>
                      <Input
                        id="bookingTime"
                        type="time"
                        value={formData.bookingTime}
                        onChange={(e) => handleInputChange('bookingTime', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="durationHours" className="block text-sm font-medium mb-2">Duration (Hours, Optional)</Label>
                      <Input
                        id="durationHours"
                        type="number"
                        placeholder="e.g., 8"
                        min="1"
                        value={formData.durationHours}
                        onChange={(e) => handleInputChange('durationHours', e.target.value)}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="location" className="block text-sm font-medium mb-2">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="location"
                        placeholder="City, State"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="projectDescription" className="block text-sm font-medium mb-2">Project Description</Label>
                    <Textarea
                      id="projectDescription"
                      placeholder="Describe your photography needs in detail..."
                      rows={4}
                      value={formData.projectDescription}
                      onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="requirements" className="block text-sm font-medium mb-2">Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="List specific requirements (e.g., number of hours, deliverables, style preferences)..."
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          projectTitle: '',
                          category: '',
                          budgetRange: '',
                          eventDate: '',
                          location: '',
                          projectDescription: '',
                          requirements: '',
                          photographerId: '',
                          bookingTime: '',
                          durationHours: ''
                        });
                      }}
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-primary to-primary-glow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingRequest ? 'Updating...' : 'Posting...'}
                        </>
                      ) : editingRequest ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Update Request
                        </>
                      ) : (
                        'Post Request'
                      )}
                    </Button>
                    {editingRequest && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingRequest(null);
                          setShowEditModal(false);
                          setFormData({
                            projectTitle: '',
                            category: '',
                            budgetRange: '',
                            eventDate: '',
                            location: '',
                            projectDescription: '',
                            requirements: '',
                            photographerId: '',
                            bookingTime: '',
                            durationHours: ''
                          });
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">My Requests</h2>
                <p className="text-muted-foreground">Manage your photography requests and proposals</p>
              </div>
              <Button onClick={() => {
                setEditingRequest(null);
                setShowEditModal(false);
                setFormData({
                  projectTitle: '',
                  category: '',
                  budgetRange: '',
                  eventDate: '',
                  location: '',
                  projectDescription: '',
                  requirements: '',
                  photographerId: '',
                  bookingTime: '',
                  durationHours: ''
                });
                setActiveTab('create');
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>

            {isLoadingMyRequests ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading your requests...</span>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">You haven't created any requests yet</p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Request
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {myRequests.map((request) => (
                  <Card key={request.requestId} className="glass-effect">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{request.eventType} Photography</h3>
                          <p className="text-sm text-muted-foreground">
                            Posted {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        <Badge 
                          className={
                            request.status === 'pending' ? 'bg-orange-500 text-white' :
                            request.status === 'confirmed' ? 'bg-green-500 text-white' :
                            request.status === 'cancelled' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <p className="font-medium">{request.budgetRange}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">
                            {request.eventDate ? new Date(request.eventDate).toLocaleDateString() : 'TBD'}
                            {request.eventTime && request.eventTime !== 'Not specified' && ` at ${request.eventTime}`}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{request.eventLocation}</p>
                        </div>
                      </div>

                      {request.photographerName && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm text-muted-foreground">Photographer: </span>
                          <span className="font-medium">{request.photographerName}</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-4">
                        {request.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditRequest(request)}
                            >
                              Edit Request
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                // TODO: Navigate to proposals page when implemented
                                toast.info('Proposals feature coming soon!');
                              }}
                            >
                              View Proposals ({request.proposalsCount || 0})
                            </Button>
                          </>
                        )}
                        {request.status === 'confirmed' && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              toast.info('View booking details - coming soon!');
                            }}
                          >
                            View Booking Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;