import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Calendar, DollarSign, MessageSquare as MessageSquareIcon, Plus, Camera, Video, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import PhotographerNavbar from './PhotographerNavbar';
import PhotographerLeftSidebar from './PhotographerLeftSidebar';
import CreatePostDialog from '../home/CreatePostDialog';
import MainFeed from '../home/MainFeed';
import authService from '@/services/auth.service';
import photographerService, { PhotographerStats } from '@/services/photographer.service';
import bookingService, { Booking, BookingRequest } from '@/services/booking.service';
import defaultAvatar from '@/assets/photographer-1.jpg';

const PhotographerHomePage = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Stats state
  const [stats, setStats] = useState<PhotographerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Bookings state
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Requests state
  const [pendingRequests, setPendingRequests] = useState<BookingRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    } else {
      loadStats();
      loadBookings();
      loadRequests();
    }
  }, [navigate]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await photographerService.getStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setStatsError(error.message || 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);
      const result = await bookingService.getBookings('all');
      const upcoming = result.data.upcoming || [];
      setUpcomingBookings(upcoming.slice(0, 3)); // Show top 3
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      setBookingsError(error.message || 'Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError(null);
      const result = await bookingService.getRequests('pending');
      const pending = result.data.requests || [];
      setPendingRequests(pending.slice(0, 3)); // Show top 3
    } catch (error: any) {
      console.error('Error loading requests:', error);
      setRequestsError(error.message || 'Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handlePostCreated = () => {
    // Refresh the feed when a new post is created
    setRefreshTrigger(prev => prev + 1);
    setCreatePostOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navbar */}
      <PhotographerNavbar />
      
      {/* Main Layout */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Left Sidebar - 20% - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <PhotographerLeftSidebar />
          </div>
          
          {/* Main Feed - 60% - Full width on mobile */}
          <div className="lg:col-span-3">
            {/* Quick Stats Dashboard */}
            {statsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-effect">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {statsError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{statsError}</AlertDescription>
              </Alert>
            )}
            {!statsLoading && !statsError && stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                <Card className="glass-effect">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">{stats.currentMonthBookings}</p>
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
                        <p className="text-2xl font-bold">₹{(stats.currentMonthRevenue / 1000).toFixed(0)}K</p>
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
                        <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                        <p className="text-xs text-muted-foreground">Requests</p>
                      </div>
                      <MessageSquareIcon className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Feed Posts */}
            <MainFeed refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Sidebar - 20% - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
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
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
                    onClick={() => setCreatePostOpen(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Share Photos
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setCreatePostOpen(true)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setCreatePostOpen(true)}
                  >
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
                {bookingsLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                {bookingsError && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{bookingsError}</AlertDescription>
                  </Alert>
                )}
                {!bookingsLoading && !bookingsError && upcomingBookings.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No upcoming bookings
                  </div>
                )}
                {!bookingsLoading && !bookingsError && upcomingBookings.map((booking) => {
                  const eventDate = booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
                  const daysUntil = booking.daysUntil || null;
                  
                  return (
                    <div key={booking.bookingId} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{booking.customerName}</p>
                        <Badge variant="outline" className="text-xs">{booking.eventType}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{eventDate} • {booking.eventTime}</p>
                      <p className="text-xs text-muted-foreground">{booking.eventLocation}</p>
                      {daysUntil !== null && (
                        <p className="text-xs text-primary mt-2">In {daysUntil} days</p>
                      )}
                    </div>
                  );
                })}
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
                {requestsLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                {requestsError && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{requestsError}</AlertDescription>
                  </Alert>
                )}
                {!requestsLoading && !requestsError && pendingRequests.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No pending requests
                  </div>
                )}
                {!requestsLoading && !requestsError && pendingRequests.map((request) => {
                  const eventDate = request.eventDate ? new Date(request.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
                  
                  return (
                    <div key={request.requestId} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-2 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={request.customerAvatar || defaultAvatar} alt={request.customerName} />
                          <AvatarFallback className="text-xs">
                            {request.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{request.customerName}</p>
                          <p className="text-xs text-muted-foreground">{request.eventType}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{eventDate}</p>
                      <p className="text-xs text-primary font-medium mt-1">{request.budgetRange}</p>
                    </div>
                  );
                })}
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
                {statsLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
                {statsError && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{statsError}</AlertDescription>
                  </Alert>
                )}
                {!statsLoading && !statsError && stats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profile Rating</span>
                      <span className="font-semibold">{stats.profileRating.toFixed(1)} ⭐</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Reviews</span>
                      <span className="font-semibold">{stats.totalReviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold text-green-600">{stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <span className="font-semibold">{stats.responseTime}</span>
                    </div>
                  </>
                )}
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

