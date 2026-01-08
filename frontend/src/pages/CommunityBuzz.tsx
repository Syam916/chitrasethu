import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, MessageCircle, Heart, Share2, Award, Camera, Calendar, MapPin, Loader2, AlertCircle, Plus, Search, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Input } from '../components/ui/input';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import { socialPosts, photographers, upcomingEvents, trendingEvents } from '../data/dummyData';
import postService, { Post } from '../services/post.service';
import discussionService, { DiscussionTopic } from '../services/discussion.service';
import groupService, { CommunityGroup } from '../services/group.service';
import collaborationService, { Collaboration } from '../services/collaboration.service';
import { formatDistanceToNow } from 'date-fns';
import { CreateDiscussionDialog } from '../components/discussions/CreateDiscussionDialog';
import { CreateGroupDialog } from '../components/groups/CreateGroupDialog';
import { CreateCollaborationDialog } from '../components/collaborations/CreateCollaborationDialog';
import authService from '../services/auth.service';
import { useCommunityBuzzSocket } from '../hooks/useCommunityBuzzSocket';
import { useToast } from '../components/ui/use-toast';

const CommunityBuzz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [groupsView, setGroupsView] = useState<'my' | 'browse'>('my');
  
  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  
  // Discussion state
  const [discussionTopics, setDiscussionTopics] = useState<DiscussionTopic[]>([]);
  const [discussionCategories, setDiscussionCategories] = useState<Array<{ name: string; topicCount: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [discussionError, setDiscussionError] = useState<string | null>(null);
  const [createDiscussionOpen, setCreateDiscussionOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Check authentication
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  // Load posts when feed tab is active
  useEffect(() => {
    if (activeTab === 'feed') {
      loadPosts();
    }
  }, [activeTab]);

  // Load groups when groups tab is active
  useEffect(() => {
    if (activeTab === 'groups') {
      if (groupsView === 'my') {
        loadMyGroups();
      } else {
        loadAllGroups();
      }
    }
  }, [activeTab, groupsView]);

  // Load collaborations when collaborations tab is active
  useEffect(() => {
    if (activeTab === 'collaborations') {
      loadCollaborations();
    }
  }, [activeTab]);

  // Real-time updates
  useCommunityBuzzSocket({
    onNewDiscussion: (topic) => {
      // Add new discussion to the list if it matches current filter
      if (!selectedCategory || topic.category === selectedCategory) {
        setDiscussionTopics(prev => [topic, ...prev]);
      }
      loadDiscussionCategories(); // Refresh category counts
    },
    onNewReply: (reply) => {
      // Refresh discussions to update reply counts
      if (activeTab === 'discussions') {
        loadDiscussionTopics();
      }
    },
    onDiscussionUpdated: (topicId) => {
      // Refresh discussions when any discussion is updated
      if (activeTab === 'discussions') {
        loadDiscussionTopics();
      }
    },
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

  // Load discussion topics
  useEffect(() => {
    if (activeTab === 'discussions') {
      loadDiscussionTopics();
      loadDiscussionCategories();
    }
  }, [activeTab, selectedCategory]);

  const loadDiscussionTopics = async () => {
    try {
      setDiscussionLoading(true);
      setDiscussionError(null);
      const result = await discussionService.getAllTopics({
        limit: 50,
        offset: 0,
        category: selectedCategory || undefined,
        sort: 'activity'
      });
      setDiscussionTopics(result.topics);
    } catch (error: any) {
      console.error('Error loading discussions:', error);
      setDiscussionError(error.message || 'Failed to load discussions');
    } finally {
      setDiscussionLoading(false);
    }
  };

  const loadDiscussionCategories = async () => {
    try {
      const categories = await discussionService.getCategories();
      setDiscussionCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      const fetchedPosts = await postService.getAll(50, 0);
      setPosts(fetchedPosts);
      
      // Track which posts are liked by current user
      const likedPostIds = fetchedPosts
        .filter(post => post.isLikedByCurrentUser)
        .map(post => post.postId);
      setLikedPosts(likedPostIds);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      setPostsError(error.message || 'Failed to load posts');
      // Fallback to empty array on error
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const toggleLike = async (postId: number) => {
    try {
      const result = await postService.toggleLike(postId);
      
      // Update local state
      setLikedPosts(prev => 
        result.isLikedByCurrentUser
          ? [...prev.filter(id => id !== postId), postId]
          : prev.filter(id => id !== postId)
      );
      
      // Update post in list
      setPosts(prev => prev.map(post => 
        post.postId === postId
          ? { ...post, likesCount: result.likesCount, isLikedByCurrentUser: result.isLikedByCurrentUser }
          : post
      ));
    } catch (error: any) {
      console.error('Error toggling like:', error);
      // Show error toast if needed
    }
  };

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

  const handleRespondToCollaboration = async (collaborationId: number) => {
    try {
      await collaborationService.respondToCollaboration(collaborationId);
      alert('Response submitted successfully!');
      loadCollaborations(); // Reload collaborations
    } catch (error: any) {
      alert(error.message || 'Failed to submit response');
    }
  };

  // Community highlights (can be enhanced later with real data)
  const communityHighlights = [
    {
      id: 1,
      title: 'Photographer of the Month',
      subtitle: 'Outstanding wedding photography',
      photographer: photographers[0],
      type: 'award',
      image: photographers[0].portfolio[0]
    },
    {
      id: 2,
      title: 'Trending Technique',
      subtitle: 'Golden hour portrait tips',
      views: '12.5K',
      type: 'tutorial',
      image: photographers[1].portfolio[0]
    },
    {
      id: 3,
      title: 'Community Challenge',
      subtitle: 'Street Photography Contest',
      participants: 245,
      type: 'challenge',
      image: photographers[2].portfolio[0]
    }
  ];

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Community <span className="gradient-text">Buzz</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with fellow photographers, share experiences, and stay updated with the latest trends in photography.
          </p>
          
          <div className="flex justify-center space-x-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">2.5K+</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{discussionTopics.length}</div>
              <div className="text-sm text-muted-foreground">Active Discussions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="groups">My Groups</TabsTrigger>
            <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Community Feed */}
          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Community Highlights */}
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span>Community Highlights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {communityHighlights.map((highlight) => (
                        <div key={highlight.id} className="relative group cursor-pointer">
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img 
                              src={highlight.image} 
                              alt={highlight.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <Badge className="mb-2 bg-primary/80">
                              {highlight.type}
                            </Badge>
                            <h3 className="font-semibold text-sm">{highlight.title}</h3>
                            <p className="text-xs opacity-90">{highlight.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Social Posts */}
                <div className="space-y-6">
                  {postsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading posts...</span>
                    </div>
                  )}

                  {postsError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{postsError}</AlertDescription>
                    </Alert>
                  )}

                  {!postsLoading && !postsError && posts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">No posts yet</p>
                      <p>Be the first to share something with the community!</p>
                    </div>
                  )}

                  {!postsLoading && !postsError && posts.map((post) => (
                    <Card key={post.postId} className="glass-effect">
                      <CardContent className="p-0">
                        {/* Post Header */}
                        <div className="p-4 border-b border-border/50">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                              <AvatarImage src={post.avatarUrl} alt={post.fullName} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                                {post.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-1">
                                <h3 className="font-semibold text-sm">{post.fullName}</h3>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {post.userType}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {post.location && `${post.location} • `}
                                {formatTimeAgo(post.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Post Media */}
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="relative">
                            <div className="aspect-square bg-muted/20">
                              <img 
                                src={post.mediaUrls[0].url || post.thumbnailUrl} 
                                alt={post.caption || "Post content"} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {/* Post Actions & Content */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`flex items-center space-x-1 ${likedPosts.includes(post.postId) ? 'text-red-500' : ''}`}
                                onClick={() => toggleLike(post.postId)}
                              >
                                <Heart className={`w-5 h-5 ${likedPosts.includes(post.postId) ? 'fill-current' : ''}`} />
                                <span className="text-sm font-medium">{post.likesCount}</span>
                              </Button>
                              
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{post.commentsCount}</span>
                              </Button>
                              
                              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                                <Share2 className="w-5 h-5" />
                                <span className="text-sm font-medium">{post.sharesCount}</span>
                              </Button>
                            </div>
                          </div>

                          {post.caption && (
                            <p className="text-sm leading-relaxed mb-2">{post.caption}</p>
                          )}
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending Topics */}
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span>Trending Now</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {trendingEvents.map((event, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{event.posts}K posts</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {event.trending}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Photographers */}
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-primary" />
                      <span>Top Contributors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {photographers.slice(0, 4).map((photographer, index) => (
                        <div key={photographer.id} className="flex items-center space-x-3">
                          <div className="text-xs font-bold text-primary w-6">#{index + 1}</div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={photographer.image} alt={photographer.name} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary-glow text-white">
                              {photographer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{photographer.name}</p>
                            <p className="text-xs text-muted-foreground">{photographer.reviews} contributions</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Discussions */}
          <TabsContent value="discussions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="glass-effect">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Active Discussions</CardTitle>
                      {isAuthenticated && (
                        <Button
                          onClick={() => setCreateDiscussionOpen(true)}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Discussion
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {discussionLoading && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading discussions...</span>
                      </div>
                    )}

                    {discussionError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{discussionError}</AlertDescription>
                      </Alert>
                    )}

                    {!discussionLoading && !discussionError && (
                      <div className="space-y-4">
                        {discussionTopics.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No discussions found. Be the first to start one!</p>
                          </div>
                        ) : (
                          discussionTopics.map((topic) => (
                            <div 
                              key={topic.topicId} 
                              className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => {
                                navigate(`/discussions/${topic.topicId}`);
                              }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="font-semibold">{topic.title}</h3>
                                    {topic.isHot && (
                                      <Badge variant="destructive" className="text-xs">Hot</Badge>
                                    )}
                                    {topic.isPinned && (
                                      <Badge variant="secondary" className="text-xs">Pinned</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">Started by {topic.authorName}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {topic.category}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                  <span>{topic.repliesCount} replies</span>
                                  <span>Last active {formatTimeAgo(topic.lastActivityAt)}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/discussions/${topic.topicId}`);
                                }}>
                                  Join Discussion
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>Discussion Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        variant={selectedCategory === '' ? "default" : "ghost"} 
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory('')}
                      >
                        All ({discussionTopics.length})
                      </Button>
                      {discussionCategories.map((category) => (
                        <Button 
                          key={category.name} 
                          variant={selectedCategory === category.name ? "default" : "ghost"} 
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          {category.name} ({category.topicCount})
                        </Button>
                      ))}
                      {discussionCategories.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          Equipment<br />
                          Business<br />
                          Post-Processing<br />
                          Client Relations<br />
                          Techniques<br />
                          Inspiration
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 6).map((event) => (
                <Card key={event.id} className="glass-effect hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-primary/90">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" size="sm">
                        Join Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

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
                        <div className="flex gap-2 justify-center mt-4">
                          {isAuthenticated && (
                            <Button onClick={() => setCreateGroupOpen(true)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Start New Community
                            </Button>
                          )}
                          <Button 
                            variant="outline"
                            onClick={() => setGroupsView('browse')}
                          >
                            Browse All Groups
                          </Button>
                        </div>
                      </div>
                    ) : (
                      groups.map((group) => {
                        const userType = localStorage.getItem('userType');
                        const groupPath = userType === 'photographer' 
                          ? `/photographer/groups/${group.groupId}`
                          : `/groups/${group.groupId}`;
                        return (
                          <Card 
                            key={group.groupId} 
                            className="glass-effect hover:shadow-elegant transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(groupPath)}
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
                                  {group.role || group.userRole || 'member'}
                                </Badge>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs text-primary flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(groupPath);
                                  }}
                                >
                                  View Details <ChevronRight className="w-3 h-3" />
                                </Button>
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
                        const userType = localStorage.getItem('userType');
                        const groupPath = userType === 'photographer' 
                          ? `/photographer/groups/${group.groupId}`
                          : `/groups/${group.groupId}`;
                        return (
                          <Card 
                            key={group.groupId} 
                            className="glass-effect hover:shadow-elegant transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(groupPath)}
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
                                      navigate(groupPath);
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
              {isAuthenticated && (
                <Button onClick={() => setCreateCollaborationOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Collaboration
                </Button>
              )}
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
                      onClick={() => {
                        const userType = localStorage.getItem('userType');
                        if (userType === 'photographer') {
                          navigate(`/photographer/collaborations/${collab.collaborationId}`);
                        } else {
                          // For customers, we can use the same route or create customer-specific
                          navigate(`/photographer/collaborations/${collab.collaborationId}`);
                        }
                      }}
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
                        {isAuthenticated && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                const userType = localStorage.getItem('userType');
                                if (userType === 'photographer') {
                                  navigate(`/photographer/collaborations/${collab.collaborationId}`);
                                } else {
                                  navigate(`/photographer/collaborations/${collab.collaborationId}`);
                                }
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
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Trending */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Trending Hashtags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['#WeddingPhotography', '#PortraitMagic', '#StreetPhotography', '#NatureShots', '#FashionPhotography'].map((hashtag, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/30">
                        <span className="font-medium text-primary">{hashtag}</span>
                        <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 50) + 10}K posts</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Popular Techniques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Golden Hour Portraits', 'Long Exposure', 'Bokeh Effects', 'Light Painting', 'Macro Photography'].map((technique, index) => (
                      <div key={index} className="p-3 border border-border/50 rounded-lg">
                        <h4 className="font-medium">{technique}</h4>
                        <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 100) + 20} tutorials available</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Discussion Dialog */}
      <CreateDiscussionDialog
        open={createDiscussionOpen}
        onOpenChange={setCreateDiscussionOpen}
        onDiscussionCreated={() => {
          loadDiscussionTopics();
          loadDiscussionCategories();
        }}
      />

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

export default CommunityBuzz;
