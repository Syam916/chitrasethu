import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Calendar, MapPin, DollarSign, MessageSquare, 
  Loader2, AlertCircle, CheckCircle, XCircle, UserMinus, Send,
  Clock, Users, Tag, FileText, MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import PhotographerNavbar from '@/components/photographer/PhotographerNavbar';
import NavbarIntegrated from '@/components/home/NavbarIntegrated';
import collaborationService, { Collaboration, CollaborationResponse } from '@/services/collaboration.service';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const CollaborationDetailPage = () => {
  const { collaborationId } = useParams<{ collaborationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collaboration, setCollaboration] = useState<Collaboration | null>(null);
  const [responses, setResponses] = useState<CollaborationResponse[]>([]);
  const [userResponse, setUserResponse] = useState<CollaborationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Response management
  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const currentUserId = parseInt(localStorage.getItem('userId') || '0');
  const userType = localStorage.getItem('userType');
  const isPhotographer = userType === 'photographer';
  const Navbar = isPhotographer ? PhotographerNavbar : NavbarIntegrated;
  const backPath = isPhotographer ? '/photographer/community-buzz' : '/community-buzz';
  const isOwner = collaboration?.userId === currentUserId;

  useEffect(() => {
    if (collaborationId) {
      loadCollaboration();
    }
  }, [collaborationId]);

  const loadCollaboration = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await collaborationService.getCollaborationById(parseInt(collaborationId!));
      setCollaboration(result.collaboration);
      setResponses(result.responses);
      setUserResponse(result.userResponse);
    } catch (error: any) {
      console.error('Error loading collaboration:', error);
      setError(error.message || 'Failed to load collaboration');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!collaborationId || !responseMessage.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message for your response',
        variant: 'destructive',
      });
      return;
    }

    try {
      setResponding(true);
      await collaborationService.respondToCollaboration(
        parseInt(collaborationId),
        responseMessage.trim()
      );
      toast({
        title: 'Success',
        description: 'Your response has been submitted successfully!',
      });
      setResponseMessage('');
      setRespondDialogOpen(false);
      loadCollaboration(); // Reload to get updated data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit response',
        variant: 'destructive',
      });
    } finally {
      setResponding(false);
    }
  };

  const handleUpdateResponseStatus = async (responseId: number, status: 'accepted' | 'declined') => {
    if (!collaborationId) return;

    try {
      setUpdatingStatus(responseId);
      await collaborationService.updateResponseStatus(
        parseInt(collaborationId),
        responseId,
        status
      );
      toast({
        title: 'Success',
        description: `Response ${status} successfully`,
      });
      loadCollaboration(); // Reload to get updated data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update response status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleWithdrawResponse = async () => {
    if (!collaborationId || !userResponse) return;

    if (!confirm('Are you sure you want to withdraw your response?')) {
      return;
    }

    try {
      setWithdrawing(true);
      await collaborationService.withdrawResponse(parseInt(collaborationId));
      toast({
        title: 'Success',
        description: 'Your response has been withdrawn',
      });
      loadCollaboration(); // Reload to get updated data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to withdraw response',
        variant: 'destructive',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading collaboration...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !collaboration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Collaboration not found'}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(backPath)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Buzz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(backPath)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community Buzz
          </Button>

          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 ring-4 ring-primary/20">
              <AvatarImage src={collaboration.posterAvatar} alt={collaboration.posterName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xl">
                {collaboration.posterName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{collaboration.title}</h1>
                <Badge variant={collaboration.collaborationType === 'seeking' ? 'secondary' : 'default'} className="capitalize">
                  {collaboration.collaborationType}
                </Badge>
                {!collaboration.isActive && (
                  <Badge variant="outline">Closed</Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">by {collaboration.posterName}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                {collaboration.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {collaboration.location}
                  </span>
                )}
                {collaboration.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {collaboration.date}
                  </span>
                )}
                {collaboration.budget && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {collaboration.budget}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {collaboration.responsesCount} responses
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Posted {formatTimeAgo(collaboration.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreVertical className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => toast({ title: 'Coming Soon', description: 'Edit collaboration will be available soon!' })}>
                      Edit Collaboration
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast({ title: 'Coming Soon', description: 'Close collaboration will be available soon!' })}>
                      Close Collaboration
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collaboration Details */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{collaboration.description}</p>
                </div>

                {collaboration.skills && collaboration.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {collaboration.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {collaboration.minBudget && collaboration.maxBudget && (
                    <div>
                      <p className="text-sm text-muted-foreground">Budget Range</p>
                      <p className="font-medium">₹{collaboration.minBudget.toLocaleString()} - ₹{collaboration.maxBudget.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{collaboration.isActive ? 'Active' : 'Closed'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responses Section */}
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Responses ({responses.length})
                  </CardTitle>
                  {!isOwner && !userResponse && collaboration.isActive && (
                    <Button onClick={() => setRespondDialogOpen(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      Respond
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No responses yet. Be the first to respond!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {responses.map((response) => (
                      <div
                        key={response.responseId}
                        className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={response.responderAvatar} alt={response.responderName} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                              {response.responderName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">{response.responderName}</p>
                                <p className="text-xs text-muted-foreground">{response.responderType}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(response.status)}
                                {isOwner && response.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7"
                                      onClick={() => handleUpdateResponseStatus(response.responseId, 'accepted')}
                                      disabled={updatingStatus === response.responseId}
                                    >
                                      {updatingStatus === response.responseId ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7"
                                      onClick={() => handleUpdateResponseStatus(response.responseId, 'declined')}
                                      disabled={updatingStatus === response.responseId}
                                    >
                                      {updatingStatus === response.responseId ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <XCircle className="w-3 h-3 text-red-500" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {response.message && (
                              <p className="text-sm text-muted-foreground mb-2">{response.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatTimeAgo(response.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!isOwner && !userResponse && collaboration.isActive && (
                  <Button onClick={() => setRespondDialogOpen(true)} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Respond to Collaboration
                  </Button>
                )}
                {!isOwner && userResponse && userResponse.status === 'pending' && (
                  <Button
                    onClick={handleWithdrawResponse}
                    variant="outline"
                    className="w-full"
                    disabled={withdrawing}
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Withdraw Response
                      </>
                    )}
                  </Button>
                )}
                {!isOwner && userResponse && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Your Response Status</p>
                    {getStatusBadge(userResponse.status)}
                    {userResponse.message && (
                      <p className="text-xs text-muted-foreground mt-2">{userResponse.message}</p>
                    )}
                  </div>
                )}
                {isOwner && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium mb-1">You are the owner</p>
                    <p className="text-xs text-muted-foreground">
                      Manage responses from the responses list
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Collaboration Info */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{collaboration.collaborationType}</p>
                </div>
                {collaboration.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{collaboration.location}</p>
                  </div>
                )}
                {collaboration.date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date/Timeframe</p>
                    <p className="font-medium">{collaboration.date}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(collaboration.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatTimeAgo(collaboration.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Respond Dialog */}
      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Collaboration</DialogTitle>
            <DialogDescription>
              Send a message to the collaboration owner expressing your interest
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
              <Textarea
                placeholder="Tell the owner why you're interested in this collaboration..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRespondDialogOpen(false);
                  setResponseMessage('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRespond} disabled={responding || !responseMessage.trim()}>
                {responding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollaborationDetailPage;

