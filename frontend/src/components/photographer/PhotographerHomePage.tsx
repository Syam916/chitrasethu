import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Calendar, DollarSign, MessageSquare as MessageSquareIcon, Plus, Camera, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import PhotographerNavbar from './PhotographerNavbar';
import PhotographerLeftSidebar from './PhotographerLeftSidebar';
import CreatePostDialog from '../home/CreatePostDialog';
import MainFeed from '../home/MainFeed';
import authService from '@/services/auth.service';
import { photographerStats, photographerBookingRequests, photographerBookings } from '@/data/photographerDummyData';
import defaultAvatar from '@/assets/photographer-1.jpg';

const PhotographerHomePage = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleSave = (postId: number) => {
    setSavedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // Get upcoming bookings
  const upcomingBookings = photographerBookings.filter(b => b.status === 'upcoming').slice(0, 3);
  
  // Get pending requests
  const pendingRequests = photographerBookingRequests.filter(r => r.status === 'pending').slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navbar */}
      <PhotographerNavbar />
      
      {/* Main Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - 20% */}
          <div className="lg:col-span-1">
            <PhotographerLeftSidebar />
          </div>
          
          {/* Main Feed - 60% */}
          <div className="lg:col-span-3">
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">{photographerStats.currentMonthBookings}</p>
                      <p className="text-xs text-muted-foreground">Bookings</p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">₹{(photographerStats.currentMonthRevenue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{photographerStats.pendingRequests}</p>
                      <p className="text-xs text-muted-foreground">Requests</p>
                    </div>
                    <MessageSquareIcon className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Post Button */}
            <div className="mb-6">
              <Button
                onClick={() => setCreatePostOpen(true)}
                className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Post
              </Button>
            </div>

            {/* Feed Posts */}
            <MainFeed refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Sidebar - 20% */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create Post Section */}
            <Card className="glass-effect">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <span>Create Post</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary">
                    <Camera className="w-4 h-4 mr-2" />
                    Share Photos
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div key={booking.bookingId} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{booking.customerName}</p>
                      <Badge variant="outline" className="text-xs">{booking.eventType}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{booking.eventDate} • {booking.eventTime}</p>
                    <p className="text-xs text-muted-foreground">{booking.eventLocation}</p>
                    {booking.daysUntil && (
                      <p className="text-xs text-primary mt-2">In {booking.daysUntil} days</p>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate('/photographer/bookings')}
                >
                  View All Bookings
                </Button>
              </CardContent>
            </Card>

            {/* New Requests */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MessageSquareIcon className="w-5 h-5 text-primary" />
                  <span>New Requests</span>
                  <Badge variant="destructive" className="ml-auto">{pendingRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.requestId} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={request.customerAvatar} alt={request.customerName} />
                        <AvatarFallback className="text-xs">
                          {request.customerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{request.customerName}</p>
                        <p className="text-xs text-muted-foreground">{request.eventType}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{request.eventDate}</p>
                    <p className="text-xs text-primary font-medium mt-1">{request.budgetRange}</p>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => navigate('/photographer/requests')}
                >
                  View All Requests
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats Summary */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile Rating</span>
                  <span className="font-semibold">{photographerStats.profileRating} ⭐</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="font-semibold">{photographerStats.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold text-green-600">{photographerStats.completionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Response Time</span>
                  <span className="font-semibold">{photographerStats.responseTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default PhotographerHomePage;

