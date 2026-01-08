import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign, CheckCircle, Phone, Mail, MessageSquare, Star, Loader2, X, User, Building2, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import bookingService, { Booking } from '@/services/booking.service';
import { toast } from 'sonner';

const PhotographerBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBookings, setCurrentBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPrepareModal, setShowPrepareModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [preparationNotes, setPreparationNotes] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getBookings();
      setBookings(response.data.bookings);
      setCurrentBookings(response.data.current);
      setUpcomingBookings(response.data.upcoming);
      setPastBookings(response.data.past);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error(error.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'unpaid': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null, timeString: string) => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      const dateStr = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
      return `${dateStr}${timeString && timeString !== 'Not specified' ? ` at ${timeString}` : ''}`;
    } catch {
      return dateString;
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handlePrepare = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPrepareModal(true);
    // Load saved preparation notes if any (future: from localStorage or API)
    const savedNotes = localStorage.getItem(`prep_notes_${booking.bookingId}`);
    if (savedNotes) {
      setPreparationNotes(savedNotes);
    }
  };

  const handleSavePreparationNotes = () => {
    if (!selectedBooking) return;
    // Save to localStorage (future: save to API)
    localStorage.setItem(`prep_notes_${selectedBooking.bookingId}`, preparationNotes);
    toast.success('Preparation notes saved!');
    setShowPrepareModal(false);
    setPreparationNotes('');
  };

  const handleContactCustomer = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedBooking || !contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    try {
      await bookingService.sendMessageToCustomer(selectedBooking.bookingId, contactMessage);
      toast.success('Message sent to customer successfully!');
      setShowContactModal(false);
      setContactMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    }
  };

  const handleCallCustomer = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailCustomer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const renderBookingCard = (booking: Booking, showActions: boolean = false) => (
    <Card key={booking.bookingId} className="glass-effect hover:shadow-elegant transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Customer Info */}
          <div className="flex items-start space-x-4 lg:w-64">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={booking.customerAvatar || undefined} alt={booking.customerName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                {booking.customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{booking.customerName}</h3>
              <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
              <div className="flex space-x-1 mt-2">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => window.location.href = `tel:${booking.customerPhone}`}>
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => window.location.href = `mailto:${booking.customerEmail}`}>
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
                  <Badge variant="secondary">{booking.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(booking.eventDate)} at {booking.eventTime}</span>
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
                <p className="text-2xl font-bold text-primary">₹{booking.price.toLocaleString('en-IN')}</p>
                <Badge className={`${getPaymentStatusColor(booking.paymentStatus)} text-white mt-2`}>
                  {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Special Requirements */}
            {booking.requirements && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Special Requirements</h4>
                <p className="text-sm text-muted-foreground">{booking.requirements}</p>
              </div>
            )}

            {/* Days Until for Upcoming */}
            {booking.daysUntil !== null && booking.bookingStatus === 'upcoming' && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-primary font-semibold">📅 In {booking.daysUntil} days</p>
              </div>
            )}

            {/* Completed At for Past */}
            {booking.bookingStatus === 'past' && booking.completedAt && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Completed on {formatDate(booking.completedAt)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {showActions && (
                <>
                  {booking.bookingStatus === 'current' && (
                    <>
                      <Button onClick={() => toast.info('Start Shoot feature coming soon!')}>
                        Start Shoot
                      </Button>
                      <Button variant="outline" onClick={() => handleViewDetails(booking)}>
                        View Details
                      </Button>
                      <Button variant="outline" onClick={() => handleContactCustomer(booking)}>
                        Contact Customer
                      </Button>
                    </>
                  )}
                  {booking.bookingStatus === 'upcoming' && (
                    <>
                      <Button onClick={() => handlePrepare(booking)}>
                        Prepare
                      </Button>
                      <Button variant="outline" onClick={() => handleViewDetails(booking)}>
                        View Details
                      </Button>
                      <Button variant="outline" onClick={() => handleContactCustomer(booking)}>
                        Contact Customer
                      </Button>
                    </>
                  )}
                  {booking.bookingStatus === 'past' && (
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
          
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
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
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : currentBookings.length > 0 ? (
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
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : upcomingBookings.length > 0 ? (
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
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : pastBookings.length > 0 ? (
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

      {/* View Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this photography booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0">
              {/* Customer Info */}
              <div className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                  <AvatarImage src={selectedBooking.customerAvatar || undefined} alt={selectedBooking.customerName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                    {selectedBooking.customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedBooking.customerName}</h3>
                  <div className="space-y-1 mt-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedBooking.customerEmail}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedBooking.customerPhone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-2">{selectedBooking.status}</Badge>
                  <Badge className={`${getPaymentStatusColor(selectedBooking.paymentStatus)} text-white`}>
                    {selectedBooking.paymentStatus.charAt(0).toUpperCase() + selectedBooking.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Event Date & Time</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(selectedBooking.eventDate, selectedBooking.eventTime)}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Location</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedBooking.eventLocation}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Duration</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedBooking.duration} hours</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Event Type</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedBooking.eventType}</p>
                </div>
              </div>

              {/* Financial Details */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span>Financial Details</span>
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold text-primary">₹{selectedBooking.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Advance Paid</p>
                    <p className="text-lg font-semibold">₹{selectedBooking.advanceAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Amount</p>
                    <p className="text-lg font-semibold">₹{selectedBooking.pendingAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {selectedBooking.requirements && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Special Requirements</span>
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBooking.requirements}</p>
                </div>
              )}

              {/* Booking Timeline */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-3">Booking Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(selectedBooking.createdAt)}</span>
                  </div>
                  {selectedBooking.confirmedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confirmed:</span>
                      <span>{formatDate(selectedBooking.confirmedAt)}</span>
                    </div>
                  )}
                  {selectedBooking.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span>{formatDate(selectedBooking.completedAt)}</span>
                    </div>
                  )}
                  {selectedBooking.daysUntil !== null && selectedBooking.bookingStatus === 'upcoming' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Days Until Event:</span>
                      <span className="font-semibold text-primary">{selectedBooking.daysUntil} days</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex-shrink-0">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {selectedBooking && (
              <Button onClick={() => {
                setShowDetailsModal(false);
                handleContactCustomer(selectedBooking);
              }}>
                Contact Customer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prepare Modal */}
      <Dialog open={showPrepareModal} onOpenChange={setShowPrepareModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Preparation Checklist</DialogTitle>
            <DialogDescription>
              Prepare for {selectedBooking?.eventType} on {selectedBooking ? formatDate(selectedBooking.eventDate) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
              {/* Quick Info */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Event Date</p>
                    <p className="font-semibold">{formatDateTime(selectedBooking.eventDate, selectedBooking.eventTime)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold">{selectedBooking.eventLocation}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-semibold">{selectedBooking.duration} hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-semibold">{selectedBooking.customerName}</p>
                  </div>
                </div>
              </div>

              {/* Preparation Checklist */}
              <div className="space-y-2">
                <h4 className="font-semibold">Preparation Checklist</h4>
                <div className="space-y-2">
                  {[
                    'Equipment checked and charged',
                    'Backup equipment prepared',
                    'Location scouted (if needed)',
                    'Contract and documents ready',
                    'Payment arrangements confirmed',
                    'Special requirements reviewed',
                    'Contact information saved',
                    'Backup plan prepared'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 hover:bg-muted/30 rounded">
                      <input
                        type="checkbox"
                        id={`check-${index}`}
                        className="w-4 h-4 rounded"
                        defaultChecked={localStorage.getItem(`prep_check_${selectedBooking.bookingId}_${index}`) === 'true'}
                        onChange={(e) => {
                          localStorage.setItem(`prep_check_${selectedBooking.bookingId}_${index}`, e.target.checked.toString());
                        }}
                      />
                      <label htmlFor={`check-${index}`} className="text-sm cursor-pointer flex-1">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preparation Notes */}
              <div className="space-y-2">
                <Label htmlFor="prep-notes">Preparation Notes</Label>
                <Textarea
                  id="prep-notes"
                  placeholder="Add any notes, reminders, or special instructions for this booking..."
                  value={preparationNotes}
                  onChange={(e) => setPreparationNotes(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  These notes are saved locally and will help you prepare for the event.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex-shrink-0">
            <Button variant="outline" onClick={() => {
              setShowPrepareModal(false);
              setPreparationNotes('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleSavePreparationNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Customer Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contact Customer</DialogTitle>
            <DialogDescription>
              Get in touch with {selectedBooking?.customerName}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
              {/* Customer Info */}
              <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedBooking.customerAvatar || undefined} alt={selectedBooking.customerName} />
                  <AvatarFallback>
                    {selectedBooking.customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedBooking.customerName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.customerEmail}</p>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  onClick={() => handleCallCustomer(selectedBooking.customerPhone)}
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">Call</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  onClick={() => handleEmailCustomer(selectedBooking.customerEmail)}
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-sm">Email</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  onClick={() => toast.info('Messaging feature coming soon!')}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Message</span>
                </Button>
              </div>

              {/* Send Message */}
              <div className="space-y-2">
                <Label htmlFor="contact-message">Send a Message</Label>
                <Textarea
                  id="contact-message"
                  placeholder={`Type your message to ${selectedBooking.customerName}...`}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  This message will be sent directly to the customer via email.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4 flex-shrink-0">
            <Button variant="outline" onClick={() => {
              setShowContactModal(false);
              setContactMessage('');
            }}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!contactMessage.trim()}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotographerBookingsPage;

