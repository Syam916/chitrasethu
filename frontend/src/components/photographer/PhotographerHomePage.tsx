import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Calendar, DollarSign, MessageSquare as MessageSquareIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import PhotographerNavbar from './PhotographerNavbar';
import PhotographerLeftSidebar from './PhotographerLeftSidebar';
import authService from '@/services/auth.service';
import { photographerFeedPosts, photographerStats, photographerBookingRequests, photographerBookings } from '@/data/photographerDummyData';
import defaultAvatar from '@/assets/photographer-1.jpg';

const PhotographerHomePage = () => {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

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

            {/* Feed Posts */}
            <div className="space-y-6">
              {photographerFeedPosts.map((post) => (
                <Card key={post.id} className="glass-effect overflow-hidden hover:shadow-elegant transition-all duration-300">
                  {/* Post Header */}
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                          <AvatarImage src={post.photographer.avatar} alt={post.photographer.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                            {post.photographer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-1">
                            <h3 className="font-semibold text-sm">{post.photographer.name}</h3>
                            {post.photographer.verified && (
                              <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{post.photographer.username}</p>
                          <p className="text-xs text-muted-foreground">{post.content.location} • {post.engagement.timestamp}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Post Media */}
                  <div className="relative">
                    <div className="aspect-square bg-muted/20">
                      <img 
                        src={post.content.media[0]} 
                        alt="Post content" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Post Actions & Content */}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center space-x-1 ${likedPosts.includes(post.id) ? 'text-red-500' : ''}`}
                          onClick={() => toggleLike(post.id)}
                        >
                          <Heart className={`w-5 h-5 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{post.engagement.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.engagement.comments}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.engagement.shares}</span>
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className={savedPosts.includes(post.id) ? 'text-primary' : ''}
                        onClick={() => toggleSave(post.id)}
                      >
                        <Bookmark className={`w-5 h-5 ${savedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>

                    <p className="text-sm leading-relaxed mb-2">{post.content.caption}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-border/50">
                      <Avatar className="w-8 h-8">
                          <AvatarImage src={defaultAvatar} alt="Your avatar" />
                        <AvatarFallback className="text-xs bg-muted">You</AvatarFallback>
                      </Avatar>
                      <Input 
                        placeholder="Add a comment..."
                        className="flex-1 bg-muted/30 border-none text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Right Sidebar - 20% */}
          <div className="lg:col-span-1 space-y-6">
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
    </div>
  );
};

export default PhotographerHomePage;

