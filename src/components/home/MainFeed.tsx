import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

const MainFeed = () => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);

  const posts = [
    {
      id: 1,
      user: {
        name: 'Rahul Photography',
        avatar: '/api/placeholder/40/40',
        username: '@rahulphotos',
        verified: true
      },
      content: {
        type: 'image',
        media: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
        caption: 'Captured this beautiful moment at yesterday\'s wedding ceremony. The emotions, the colors, the pure joy - everything was perfect! 📸✨ #WeddingPhotography #LoveStory #ChitraSethu',
        location: 'Grand Palace Hotel, Mumbai'
      },
      engagement: {
        likes: 1247,
        comments: 89,
        shares: 23,
        timestamp: '2 hours ago'
      },
      tags: ['Wedding', 'Portrait', 'Mumbai']
    },
    {
      id: 2,
      user: {
        name: 'Priya Lens',
        avatar: '/api/placeholder/40/40',
        username: '@priyalens',
        verified: false
      },
      content: {
        type: 'video',
        media: ['/api/placeholder/600/400'],
        caption: 'Behind the scenes of today\'s fashion shoot! The magic happens when creativity meets passion. What do you think of this setup? 🎬👗',
        location: 'Fashion Studio, Delhi'
      },
      engagement: {
        likes: 892,
        comments: 67,
        shares: 15,
        timestamp: '4 hours ago'
      },
      tags: ['Fashion', 'BTS', 'Studio']
    },
    {
      id: 3,
      user: {
        name: 'Vikram Captures',
        avatar: '/api/placeholder/40/40',
        username: '@vikramcaptures',
        verified: true
      },
      content: {
        type: 'image',
        media: ['/api/placeholder/600/400'],
        caption: 'Corporate headshots that tell a story. Professional photography isn\'t just about the camera - it\'s about connecting with your subject. 💼📷',
        location: 'Business District, Bangalore'
      },
      engagement: {
        likes: 634,
        comments: 42,
        shares: 18,
        timestamp: '6 hours ago'
      },
      tags: ['Corporate', 'Portrait', 'Professional']
    }
  ];

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

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="glass-effect overflow-hidden hover:shadow-elegant transition-all duration-300">
          {/* Post Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={post.user.avatar} alt={post.user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                    {post.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
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
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Post Media */}
          <div className="relative">
            <div className="aspect-square bg-muted/20">
              {post.content.type === 'video' ? (
                <div className="relative w-full h-full">
                  <img 
                    src={post.content.media[0]} 
                    alt="Video thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
              ) : (
                <img 
                  src={post.content.media[0]} 
                  alt="Post content" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Media Counter */}
            {post.content.media.length > 1 && (
              <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                1/{post.content.media.length}
              </div>
            )}
          </div>

          {/* Post Actions */}
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

            {/* Post Caption */}
            <div className="space-y-2">
              <p className="text-sm leading-relaxed">{post.content.caption}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Comments Preview */}
            <div className="mt-4 pt-3 border-t border-border/50">
              <Button variant="ghost" className="text-sm text-muted-foreground p-0 h-auto">
                View all {post.engagement.comments} comments
              </Button>
              
              {/* Add Comment */}
              <div className="flex items-center space-x-3 mt-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="Your avatar" />
                  <AvatarFallback className="text-xs bg-muted">You</AvatarFallback>
                </Avatar>
                <Input 
                  placeholder="Add a comment..."
                  className="flex-1 bg-muted/30 border-none text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MainFeed;