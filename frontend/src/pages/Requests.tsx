import React, { useState } from 'react';
import { Plus, Clock, MapPin, Calendar, Camera, Users, DollarSign, MessageCircle, Star, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import Navbar from '../components/home/Navbar';
import { eventCategories } from '../data/dummyData';
import avatarOne from '@/assets/photographer-1.jpg';
import avatarTwo from '@/assets/photographer-2.jpg';
import avatarThree from '@/assets/wedding-1.jpg';
import avatarFour from '@/assets/prewedding-1.jpg';

const Requests = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my-requests'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Photography <span className="gradient-text">Requests</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Post your photography needs or browse available opportunities. Connect with the right photographers for your projects.
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
                <CardTitle className="text-2xl">Post a Photography Request</CardTitle>
                <p className="text-muted-foreground">Tell photographers what you need for your project</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title</label>
                    <Input placeholder="e.g., Wedding Photography - Beach Ceremony" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select className="w-full p-3 border border-border rounded-lg bg-background">
                      <option>Select Category</option>
                      <option>Wedding</option>
                      <option>Fashion</option>
                      <option>Corporate</option>
                      <option>Portrait</option>
                      <option>Event</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget Range</label>
                    <select className="w-full p-3 border border-border rounded-lg bg-background">
                      <option>Select Budget</option>
                      <option>Under ₹20,000</option>
                      <option>₹20,000 - ₹40,000</option>
                      <option>₹40,000 - ₹60,000</option>
                      <option>Above ₹60,000</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date</label>
                    <Input type="date" />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <Input placeholder="City, State" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Project Description</label>
                  <Textarea 
                    placeholder="Describe your photography needs in detail..."
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Requirements</label>
                  <Textarea 
                    placeholder="List specific requirements (e.g., number of hours, deliverables, style preferences)..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Save as Draft</Button>
                  <Button className="bg-gradient-to-r from-primary to-primary-glow">
                    Post Request
                  </Button>
                </div>
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>

            <div className="grid gap-6">
              {/* Sample user requests */}
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Birthday Party Photography</h3>
                      <p className="text-sm text-muted-foreground">Posted 2 days ago</p>
                    </div>
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Budget:</span>
                      <p className="font-medium">₹15,000 - ₹25,000</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">March 15, 2024</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Proposals:</span>
                      <p className="font-medium">7 received</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm">View Proposals</Button>
                    <Button variant="outline" size="sm">Edit Request</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests;