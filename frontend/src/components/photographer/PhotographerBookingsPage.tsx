import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign, CheckCircle, Phone, Mail, MessageSquare, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import { photographerBookings } from '@/data/photographerDummyData';

const PhotographerBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings] = useState(photographerBookings);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const currentBookings = bookings.filter(b => b.status === 'current');
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'past');

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'unpaid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderBookingCard = (booking: any, showActions: boolean = false) => (
    <Card key={booking.bookingId} className="glass-effect hover:shadow-elegant transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Customer Info */}
          <div className="flex items-start space-x-4 lg:w-64">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={booking.customerAvatar} alt={booking.customerName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                {booking.customerName.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{booking.customerName}</h3>
              <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
              <div className="flex space-x-1 mt-2">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-semibold">{booking.eventType}</h2>
                  <Badge variant="secondary">{booking.packageName}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.eventDate} at {booking.eventTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.eventLocation}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{booking.duration} hours</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">₹{booking.price.toLocaleString()}</p>
                <Badge className={`${getPaymentStatusColor(booking.paymentStatus)} text-white mt-2`}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Checklist for Current/Upcoming */}
            {(booking.status === 'current' || booking.status === 'upcoming') && booking.checklist && (
              <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3">Preparation Checklist</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(booking.checklist).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${value ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Days Until for Upcoming */}
            {booking.daysUntil && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-primary font-semibold">📅 In {booking.daysUntil} days</p>
              </div>
            )}

            {/* Past Booking Info */}
            {booking.status === 'past' && (
              <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <Badge variant={booking.deliveryStatus === 'delivered' ? 'default' : 'secondary'}>
                    {booking.deliveryStatus}
                  </Badge>
                </div>
                {booking.photoCount && (
                  <div>
                    <p className="text-xs text-muted-foreground">Photos</p>
                    <p className="font-semibold">{booking.photoCount}</p>
                  </div>
                )}
                {booking.rating && (
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{booking.rating}</span>
                    </div>
                  </div>
                )}
                {booking.revenue && (
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="font-semibold text-green-600">₹{booking.revenue.toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {booking.review && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm italic">"{booking.review}"</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {showActions && (
                <>
                  {booking.status === 'current' && (
                    <>
                      <Button>Start Shoot</Button>
                      <Button variant="outline">View Details</Button>
                      <Button variant="outline">Contact Customer</Button>
                    </>
                  )}
                  {booking.status === 'upcoming' && (
                    <>
                      <Button>Prepare</Button>
                      <Button variant="outline">View Details</Button>
                      <Button variant="outline">Reschedule</Button>
                    </>
                  )}
                  {booking.status === 'past' && (
                    <>
                      <Button variant="outline">View Gallery</Button>
                      <Button variant="outline">Request Review</Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            My <span className="gradient-text">Bookings</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage all your photography bookings in one place
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{currentBookings.length}</div>
              <div className="text-sm text-muted-foreground">Current</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{upcomingBookings.length}</div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{pastBookings.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="current">
              Current
              {currentBookings.length > 0 && (
                <Badge variant="secondary" className="ml-2">{currentBookings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingBookings.length > 0 && (
                <Badge variant="secondary" className="ml-2">{upcomingBookings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          {/* Current Bookings */}
          <TabsContent value="current" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Current Bookings</h2>
            </div>
            {currentBookings.length > 0 ? (
              <div className="space-y-6">
                {currentBookings.map(booking => renderBookingCard(booking, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No current bookings</p>
              </div>
            )}
          </TabsContent>

          {/* Upcoming Bookings */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Upcoming Bookings</h2>
            </div>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-6">
                {upcomingBookings.map(booking => renderBookingCard(booking, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No upcoming bookings</p>
              </div>
            )}
          </TabsContent>

          {/* Past Bookings */}
          <TabsContent value="past" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Past Bookings</h2>
            </div>
            {pastBookings.length > 0 ? (
              <div className="space-y-6">
                {pastBookings.map(booking => renderBookingCard(booking, true))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No past bookings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PhotographerBookingsPage;

