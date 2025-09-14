import React from 'react';
import { Plus, Camera, Video, Image, Calendar, TrendingUp, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const RightSidebar = () => {
  const trendingEvents = [
    { name: 'Wedding Season', posts: 1.2, trending: '+23%' },
    { name: 'Fashion Week', posts: 0.8, trending: '+45%' },
    { name: 'Corporate Events', posts: 0.6, trending: '+12%' },
    { name: 'Birthday Parties', posts: 0.9, trending: '+18%' }
  ];

  const collections = [
    {
      id: 1,
      title: 'Best Wedding Shots',
      images: 4,
      thumbnail: '/api/placeholder/100/100',
      curator: 'ChitraSethu Team'
    },
    {
      id: 2,
      title: 'Fashion Portfolio',
      images: 8,
      thumbnail: '/api/placeholder/100/100',
      curator: 'Style Magazine'
    },
    {
      id: 3,
      title: 'Event Highlights',
      images: 6,
      thumbnail: '/api/placeholder/100/100',
      curator: 'Event Masters'
    }
  ];

  const advertisements = [
    {
      id: 1,
      title: 'Premium Lens Collection',
      subtitle: '50% off on Canon & Nikon',
      image: '/api/placeholder/150/100',
      cta: 'Shop Now'
    },
    {
      id: 2,
      title: 'Photography Workshop',
      subtitle: 'Master the art of portraits',
      image: '/api/placeholder/150/100',
      cta: 'Register'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Plus className="w-5 h-5 text-primary" />
            <span>Create Post</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full justify-start bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary">
              <Camera className="w-4 h-4 mr-2" />
              Share Photos
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Video className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
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

      {/* Featured Collections */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Collections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collections.map((collection) => (
              <div key={collection.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="relative">
                  <img 
                    src={collection.thumbnail} 
                    alt={collection.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1">
                    {collection.images}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{collection.title}</h4>
                  <p className="text-xs text-muted-foreground">{collection.curator}</p>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" size="sm">
              View All Collections
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advertisements */}
      <div className="space-y-4">
        {advertisements.map((ad) => (
          <Card key={ad.id} className="glass-effect overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img 
                  src={ad.image} 
                  alt={ad.title}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-white font-medium text-sm mb-1">{ad.title}</h4>
                  <p className="text-white/80 text-xs mb-2">{ad.subtitle}</p>
                  <Button size="sm" variant="secondary" className="text-xs">
                    {ad.cta}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suggested Connections */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Suggested for You</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Alex Photography', 'Sarah Studios', 'Mumbai Shots'].map((name, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={`/api/placeholder/32/32?${index}`} alt={name} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-primary-glow text-white">
                    {name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{name}</p>
                  <p className="text-xs text-muted-foreground">Photographer</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs px-2">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;