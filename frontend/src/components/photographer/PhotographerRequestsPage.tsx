import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, DollarSign, CheckCircle, XCircle, MessageCircle, Phone, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import bookingService, { BookingRequest } from '@/services/booking.service';

const PhotographerRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [navigate, filterStatus, filterUrgency]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getRequests(
        filterStatus === 'all' ? undefined : filterStatus,
        filterUrgency === 'all' ? undefined : filterUrgency
      );
      setRequests(response.data.requests);
      setPendingCount(response.data.pendingCount);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error(error.message || 'Failed to fetch booking requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      setIsProcessing(true);
      await bookingService.acceptRequest(requestId);
      toast.success('Booking request accepted successfully!');
      await fetchRequests(); // Refresh the list
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error(error.message || 'Failed to accept booking request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsProcessing(true);
      await bookingService.declineRequest(selectedRequest.requestId, declineReason || undefined);
      toast.success('Booking request declined');
      setShowDeclineModal(false);
      setDeclineReason('');
      setSelectedRequest(null);
      await fetchRequests(); // Refresh the list
    } catch (error: any) {
      console.error('Error declining request:', error);
      toast.error(error.message || 'Failed to decline booking request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!selectedRequest || !infoMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setIsProcessing(true);
      await bookingService.requestMoreInfo(selectedRequest.requestId, infoMessage);
      toast.success('Information request sent to customer');
      setShowInfoModal(false);
      setInfoMessage('');
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Error requesting info:', error);
      toast.error(error.message || 'Failed to send information request');
    } finally {
      setIsProcessing(false);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-orange-500';
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Format date for display
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

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Not specified') return 'TBD';
    return timeString;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-playfair font-bold mb-4 text-center">
            Booking <span className="gradient-text">Requests</span>
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Manage customer booking requests and grow your photography business
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {requests.length} Requests
          </h2>
          <Badge variant="secondary">
            {pendingCount} Pending
          </Badge>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading requests...</span>
          </div>
        )}

        {/* Requests List */}
        {!isLoading && (
          <div className="space-y-6">
            {requests.length > 0 ? (
              requests.map((request) => (
                <Card key={request.requestId} className="glass-effect hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Customer Info */}
                      <div className="flex items-start space-x-4 lg:w-64">
                        <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                          <AvatarImage src={request.customerAvatar} alt={request.customerName} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                            {request.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{request.customerName}</h3>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{request.requestedAt ? new Date(request.requestedAt).toLocaleDateString() : 'Recent'}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-xl font-semibold mb-2">{request.eventType} Photography</h2>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(request.eventDate)} at {formatTime(request.eventTime)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{request.eventLocation}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{request.duration} hours</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{request.guestCount} guests</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={`${getUrgencyColor(request.urgency)} text-white`}>
                              {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)} Priority
                            </Badge>
                            <Badge className={`${getStatusColor(request.status)} text-white`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Budget Range</h4>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-lg text-primary">{request.budgetRange}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Requirements:</h4>
                          <p className="text-sm text-muted-foreground">{request.requirements}</p>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium">{request.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{request.customerEmail}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <div className="flex flex-wrap gap-3">
                            <Button 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptRequest(request.requestId)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept Request
                            </Button>
                            <Button 
                              variant="destructive"
                              className="flex-1"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDeclineModal(true);
                              }}
                              disabled={isProcessing}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowInfoModal(true);
                              }}
                              disabled={isProcessing}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Request More Info
                            </Button>
                          </div>
                        )}

                        {request.status === 'confirmed' && (
                          <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-600 font-medium">Request Accepted - Booking Confirmed</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-auto"
                              onClick={() => navigate(`/photographer/bookings?bookingId=${request.requestId}`)}
                            >
                              View Booking Details
                            </Button>
                          </div>
                        )}

                        {request.status === 'cancelled' && (
                          <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-red-600 font-medium">Request Declined</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No requests found matching your filters</p>
                <Button onClick={() => { setFilterStatus('all'); setFilterUrgency('all'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Decline Modal */}
        <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Booking Request</DialogTitle>
              <DialogDescription>
                Are you sure you want to decline this booking request? You can optionally provide a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for declining..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeclineModal(false);
                setDeclineReason('');
                setSelectedRequest(null);
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeclineRequest} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request More Info Modal */}
        <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request More Information</DialogTitle>
              <DialogDescription>
                Send a message to the customer requesting additional information about their booking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="What information would you like to know?"
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowInfoModal(false);
                setInfoMessage('');
                setSelectedRequest(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleRequestMoreInfo} disabled={isProcessing || !infoMessage.trim()}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PhotographerRequestsPage;

