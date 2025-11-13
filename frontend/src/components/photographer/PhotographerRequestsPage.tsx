import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, DollarSign, CheckCircle, XCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import { photographerBookingRequests } from '@/data/photographerDummyData';

const PhotographerRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(photographerBookingRequests);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleAcceptRequest = (requestId: number) => {
    setRequests(prev => prev.map(req => 
      req.requestId === requestId ? { ...req, status: 'accepted' } : req
    ));
    // TODO: API call to accept request
    console.log('Accepted request:', requestId);
  };

  const handleDeclineRequest = (requestId: number) => {
    setRequests(prev => prev.map(req => 
      req.requestId === requestId ? { ...req, status: 'declined' } : req
    ));
    // TODO: API call to decline request
    console.log('Declined request:', requestId);
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
      case 'accepted': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || req.urgency === filterUrgency;
    return matchesStatus && matchesUrgency;
  });

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
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
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
            {filteredRequests.length} Requests
          </h2>
          <Badge variant="secondary">
            {requests.filter(r => r.status === 'pending').length} Pending
          </Badge>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.map((request) => (
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
                            <span>{request.eventDate} at {request.eventTime}</span>
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
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Request
                        </Button>
                        <Button 
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDeclineRequest(request.requestId)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                        <Button variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Request More Info
                        </Button>
                      </div>
                    )}

                    {request.status === 'accepted' && (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Request Accepted - Booking Confirmed</span>
                        <Button variant="outline" size="sm" className="ml-auto">
                          View Booking Details
                        </Button>
                      </div>
                    )}

                    {request.status === 'declined' && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-600 font-medium">Request Declined</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">No requests found matching your filters</p>
            <Button onClick={() => { setFilterStatus('all'); setFilterUrgency('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerRequestsPage;

