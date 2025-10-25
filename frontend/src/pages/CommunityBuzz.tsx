import React, { useState } from 'react';
import { TrendingUp, Users, MessageCircle, Heart, Share2, Award, Camera, Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import Navbar from '../components/home/Navbar';
import { socialPosts, photographers, upcomingEvents, trendingEvents } from '../data/dummyData';

const CommunityBuzz = () => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // Community highlights
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

  // Discussion topics
  const discussionTopics = [
    {
      id: 1,
      title: 'Best lens for wedding photography?',
      author: 'Sarah Photography',
      replies: 23,
      lastActive: '2 hours ago',
      category: 'Equipment',
      isHot: true
    },
    {
      id: 2,
      title: 'How to price portrait sessions in 2024',
      author: 'Pro Portraits',
      replies: 45,
      lastActive: '4 hours ago',
      category: 'Business',
      isHot: true
    },
    {
      id: 3,
      title: 'Color grading techniques for fashion shoots',
      author: 'Fashion Focus',
      replies: 18,
      lastActive: '1 day ago',
      category: 'Post-Processing',
      isHot: false
    },
    {
      id: 4,
      title: 'Managing client expectations',
      author: 'Wedding Wiz',
      replies: 67,
      lastActive: '2 days ago',
      category: 'Client Relations',
      isHot: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
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
              <div className="text-2xl font-bold text-primary">150+</div>
              <div className="text-sm text-muted-foreground">Daily Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Active Discussions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
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
                  {socialPosts.map((post) => (
                    <Card key={post.id} className="glass-effect">
                      <CardContent className="p-0">
                        {/* Post Header */}
                        <div className="p-4 border-b border-border/50">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                              <AvatarImage src={post.user.avatar} alt={post.user.name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                                {post.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-1">
                                <h3 className="font-semibold text-sm">{post.user.name}</h3>
                                {post.user.verified && (
                                  <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{post.user.username}</p>
                              <p className="text-xs text-muted-foreground">{post.content.location} • {post.engagement.timestamp}</p>
                            </div>
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
                        <div className="p-4">
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
                          </div>

                          <p className="text-sm leading-relaxed mb-2">{post.content.caption}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
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
                    <CardTitle>Active Discussions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {discussionTopics.map((topic) => (
                        <div key={topic.id} className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold">{topic.title}</h3>
                                {topic.isHot && (
                                  <Badge variant="destructive" className="text-xs">Hot</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">Started by {topic.author}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {topic.category}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-4">
                              <span>{topic.replies} replies</span>
                              <span>Last active {topic.lastActive}</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              Join Discussion
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      {['Equipment', 'Business', 'Post-Processing', 'Client Relations', 'Techniques', 'Inspiration'].map((category) => (
                        <Button key={category} variant="ghost" className="w-full justify-start">
                          {category}
                        </Button>
                      ))}
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
    </div>
  );
};

export default CommunityBuzz;