import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, MessageCircle, Shield, Calendar, MapPin, Sparkles, Share2, Link, ChevronRight, Loader2, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import PhotographerNavbar from './PhotographerNavbar';
import groupService, { CommunityGroup } from '@/services/group.service';
import collaborationService, { Collaboration } from '@/services/collaboration.service';
import eventService, { Event } from '@/services/event.service';
import { formatDistanceToNow } from 'date-fns';
import { CreateGroupDialog } from '../groups/CreateGroupDialog';
import { CreateCollaborationDialog } from '../collaborations/CreateCollaborationDialog';
import { useCommunityBuzzSocket } from '@/hooks/useCommunityBuzzSocket';
import { useToast } from '../ui/use-toast';

const PhotographerCommunityBuzzPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('groups');
  const [groupsView, setGroupsView] = useState<'my' | 'browse'>('my');

  // Groups state
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [allGroups, setAllGroups] = useState<CommunityGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [allGroupsLoading, setAllGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [allGroupsError, setAllGroupsError] = useState<string | null>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<number | null>(null);

  // Collaborations state
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [collaborationsLoading, setCollaborationsLoading] = useState(false);
  const [collaborationsError, setCollaborationsError] = useState<string | null>(null);
  const [createCollaborationOpen, setCreateCollaborationOpen] = useState(false);

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Load groups
  useEffect(() => {
    if (activeTab === 'groups') {
      if (groupsView === 'my') {
        loadMyGroups();
      } else {
        loadAllGroups();
      }
    }
  }, [activeTab, groupsView]);

  // Load collaborations
  useEffect(() => {
    if (activeTab === 'collaborations') {
      loadCollaborations();
    }
  }, [activeTab]);

  // Load events
  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab]);

  // Real-time updates
  useCommunityBuzzSocket({
    onNewGroup: (group) => {
      // Add new group to the list
      if (activeTab === 'groups') {
        loadMyGroups();
      }
    },
    onNewCollaboration: (collaboration) => {
      // Add new collaboration to the list
      if (activeTab === 'collaborations') {
        loadCollaborations();
      }
    },
    onCollaborationUpdated: (collaborationId) => {
      // Refresh collaborations when updated
      if (activeTab === 'collaborations') {
        loadCollaborations();
      }
    }
  });

  const loadMyGroups = async () => {
    try {
      setGroupsLoading(true);
      setGroupsError(null);
      const result = await groupService.getMyGroups({ limit: 50, offset: 0 });
      setGroups(result.groups);
    } catch (error: any) {
      console.error('Error loading groups:', error);
      setGroupsError(error.message || 'Failed to load groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  const loadAllGroups = async () => {
    try {
      setAllGroupsLoading(true);
      setAllGroupsError(null);
      const params: any = { limit: 50, offset: 0 };
      if (groupSearch) {
        params.search = groupSearch;
      }
      const result = await groupService.getAllGroups(params);
      setAllGroups(result.groups);
    } catch (error: any) {
      console.error('Error loading all groups:', error);
      setAllGroupsError(error.message || 'Failed to load groups');
    } finally {
      setAllGroupsLoading(false);
    }
  };

  const loadCollaborations = async () => {
    try {
      setCollaborationsLoading(true);
      setCollaborationsError(null);
      const result = await collaborationService.getAllCollaborations({ limit: 50, offset: 0 });
      setCollaborations(result.collaborations);
    } catch (error: any) {
      console.error('Error loading collaborations:', error);
      setCollaborationsError(error.message || 'Failed to load collaborations');
    } finally {
      setCollaborationsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const handleJoinGroup = async (groupId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      setJoiningGroupId(groupId);
      await groupService.joinGroup(groupId);
      toast({
        title: 'Success!',
        description: 'You have successfully joined the group.',
      });
      // Reload both views
      if (groupsView === 'my') {
        loadMyGroups();
      } else {
        loadAllGroups();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join group',
        variant: 'destructive',
      });
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleRespondToCollaboration = async (collaborationId: number) => {
    try {
      await collaborationService.respondToCollaboration(collaborationId);
      alert('Response submitted successfully!');
      loadCollaborations(); // Reload collaborations
    } catch (error: any) {
      alert(error.message || 'Failed to submit response');
    }
  };

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      const result = await eventService.getAll({ limit: 6, offset: 0 });
      setEvents(result.events);
    } catch (error: any) {
      console.error('Error loading events:', error);
      setEventsError(error.message || 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1">
            Photographer Community
          </Badge>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">
            Community <span className="gradient-text">Buzz</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow photographers, collaborate on projects, and stay in sync with live event discussions.
          </p>
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            <Button 
              className="bg-gradient-to-r from-primary to-primary-glow" 
              onClick={() => setCreateGroupOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Community
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Open Active Chats
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="groups">
              <Users className="w-4 h-4 mr-2" />
              My Groups
            </TabsTrigger>
            <TabsTrigger value="collaborations">
              <Share2 className="w-4 h-4 mr-2" />
              Collaborations
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Live Events
            </TabsTrigger>
          </TabsList>

          {/* Groups */}
          <TabsContent value="groups" className="space-y-6">
            {/* Sub-tabs for My Groups vs Browse All */}
            <div className="flex items-center justify-between mb-4">
              <Tabs value={groupsView} onValueChange={(v) => setGroupsView(v as 'my' | 'browse')} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="my">My Groups</TabsTrigger>
                  <TabsTrigger value="browse">Browse All Groups</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Search for Browse view */}
            {groupsView === 'browse' && (
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search groups by name..."
                    value={groupSearch}
                    onChange={(e) => {
                      setGroupSearch(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadAllGroups();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
                <Button onClick={loadAllGroups} variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            )}

            {/* My Groups View */}
            {groupsView === 'my' && (
              <>
                {groupsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading groups...</span>
                  </div>
                )}

                {groupsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{groupsError}</AlertDescription>
                  </Alert>
                )}

                {!groupsLoading && !groupsError && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {groups.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold mb-2">No groups yet</p>
                        <p>Join a group or create your own community to get started!</p>
                        <Button 
                          className="mt-4" 
                          variant="outline"
                          onClick={() => setGroupsView('browse')}
                        >
                          Browse All Groups
                        </Button>
                      </div>
                    ) : (
                      groups.map((group) => (
                        <Card 
                          key={group.groupId} 
                          className="glass-effect hover:shadow-elegant transition-all duration-300 cursor-pointer"
                          onClick={() => navigate(`/photographer/groups/${group.groupId}`)}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                                <AvatarImage src={group.groupIconUrl} alt={group.groupName} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                                  {group.groupName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{group.groupName}</CardTitle>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {group.groupType}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{group.description}</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{group.memberCount} members</span>
                              <span>Last active {formatTimeAgo(group.lastActivityAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant={group.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                {group.role || group.userRole}
                              </Badge>
                              <div className="flex items-center gap-2">
                                {group.unreadCount && group.unreadCount > 0 && (
                                  <Badge variant="destructive">{group.unreadCount} new</Badge>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs text-primary flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/photographer/groups/${group.groupId}`);
                                  }}
                                >
                                  View Details <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </>
            )}

            {/* Browse All Groups View */}
            {groupsView === 'browse' && (
              <>
                {allGroupsLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading groups...</span>
                  </div>
                )}

                {allGroupsError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{allGroupsError}</AlertDescription>
                  </Alert>
                )}

                {!allGroupsLoading && !allGroupsError && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {allGroups.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-semibold mb-2">No groups found</p>
                        <p>Try adjusting your search or create a new group!</p>
                      </div>
                    ) : (
                      allGroups.map((group) => {
                        const isMember = group.role || group.userRole;
                        return (
                          <Card 
                            key={group.groupId} 
                            className="glass-effect hover:shadow-elegant transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`/photographer/groups/${group.groupId}`)}
                          >
                            <CardHeader className="pb-4">
                              <div className="flex items-start gap-3">
                                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                                  <AvatarImage src={group.groupIconUrl} alt={group.groupName} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                                    {group.groupName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">{group.groupName}</CardTitle>
                                    <Badge variant="outline" className="capitalize text-xs">
                                      {group.groupType}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{group.description}</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{group.memberCount} members</span>
                                <span>Last active {formatTimeAgo(group.lastActivityAt)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                {isMember ? (
                                  <Badge variant={group.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                    {group.role || group.userRole}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Public Group
                                  </Badge>
                                )}
                                <div className="flex items-center gap-2">
                                  {!isMember && (
                                    <Button 
                                      size="sm" 
                                      className="text-xs"
                                      onClick={(e) => handleJoinGroup(group.groupId, e)}
                                      disabled={joiningGroupId === group.groupId}
                                    >
                                      {joiningGroupId === group.groupId ? (
                                        <>
                                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                          Joining...
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-3 h-3 mr-1" />
                                          Join
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-xs text-primary flex items-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/photographer/groups/${group.groupId}`);
                                    }}
                                  >
                                    View <ChevronRight className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Collaborations */}
          <TabsContent value="collaborations" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setCreateCollaborationOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Post Collaboration
              </Button>
            </div>

            {collaborationsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading collaborations...</span>
              </div>
            )}

            {collaborationsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{collaborationsError}</AlertDescription>
              </Alert>
            )}

            {!collaborationsLoading && !collaborationsError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {collaborations.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Share2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No collaborations yet</p>
                    <p>Browse available collaborations or post your own!</p>
                  </div>
                ) : (
                  collaborations.map((collab) => (
                    <Card 
                      key={collab.collaborationId} 
                      className="glass-effect hover:shadow-elegant transition-all duration-300 cursor-pointer"
                      onClick={() => navigate(`/photographer/collaborations/${collab.collaborationId}`)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                            <AvatarImage src={collab.posterAvatar} alt={collab.posterName} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                              {collab.posterName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{collab.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{collab.posterName}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant={collab.collaborationType === 'seeking' ? 'secondary' : 'default'} className="capitalize">
                            {collab.collaborationType}
                          </Badge>
                          {collab.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {collab.location}
                            </span>
                          )}
                          {collab.date && <span>{collab.date}</span>}
                          {collab.budget && <span className="font-medium text-primary">{collab.budget}</span>}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {collab.description}
                        </p>
                        {collab.skills && collab.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {collab.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{collab.responsesCount} responses</span>
                          <span>Posted {formatTimeAgo(collab.createdAt)}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/photographer/collaborations/${collab.collaborationId}`);
                            }}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRespondToCollaboration(collab.collaborationId);
                            }}
                          >
                            Respond
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="space-y-6">
            {eventsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading events...</span>
              </div>
            )}

            {eventsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{eventsError}</AlertDescription>
              </Alert>
            )}

            {!eventsLoading && !eventsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold mb-2">No live events available</p>
                    <p>Check back soon for upcoming events!</p>
                  </div>
                ) : (
                  events.map((event) => {
                    const eventImage = event.images?.[0] || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800';
                    const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    const eventTime = event.eventTime 
                      ? new Date(`2000-01-01T${event.eventTime}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })
                      : 'TBD';
                    const priceRange = event.minBudget > 0 
                      ? `₹${event.minBudget.toLocaleString()} - ₹${event.maxBudget.toLocaleString()}`
                      : 'Contact for pricing';

                    return (
                      <Card key={event.eventId} className="glass-effect overflow-hidden hover:shadow-elegant transition-all duration-300">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={eventImage}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-3 left-3 bg-primary/90">
                            {event.categoryName}
                          </Badge>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                            <Badge variant="outline">{priceRange}</Badge>
                          </div>
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                          )}
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{eventDate} {eventTime !== 'TBD' && `at ${eventTime}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                            {event.expectedAttendees && (
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                <span>{event.expectedAttendees} expected</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                // TODO: Navigate to event chat room
                                toast({
                                  title: 'Event Chat',
                                  description: 'Event chat feature coming soon!',
                                });
                              }}
                            >
                              Join Chat
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                // TODO: Navigate to event details
                                toast({
                                  title: 'Event Details',
                                  description: 'Event detail page coming soon!',
                                });
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Collaboration Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Share Resources',
                    description: 'Upload shot lists, timelines, and location maps so the whole crew stays aligned.',
                  },
                  {
                    title: 'Pin Key Messages',
                    description: 'Use pinned messages for vendor contacts, deliverable dates, and client expectations.',
                  },
                  {
                    title: 'Link Deliverables',
                    description: 'Attach Google Drive or Dropbox links so editors and second shooters access files easily.',
                  },
                ].map((tip, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/60 bg-muted/20">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      {tip.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="glass-effect">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Need a private workspace for your next event?</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Create dedicated chat rooms for weddings, corporate events, or workshops. Invite clients, team members, and vendors to collaborate in real time with shared timelines, shot lists, and deliverables.
              </p>
            </div>
            <Button size="lg" variant="outline">
              <Link className="w-4 h-4 mr-2" />
              Launch Event Room
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onGroupCreated={() => {
          loadMyGroups();
        }}
      />

      {/* Create Collaboration Dialog */}
      <CreateCollaborationDialog
        open={createCollaborationOpen}
        onOpenChange={setCreateCollaborationOpen}
        onCollaborationCreated={() => {
          loadCollaborations();
        }}
      />
    </div>
  );
};

export default PhotographerCommunityBuzzPage;
