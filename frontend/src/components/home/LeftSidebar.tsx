import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Camera, Cake, Users, Shirt, Star, MapPin, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { photographers } from '../../data/dummyData';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // Map event type IDs to category slugs used in EventPhotos page
  const getCategorySlug = (typeId: string): string => {
    const categoryMap: Record<string, string> = {
      'all': 'all',
      'wedding': 'wedding',
      'event': 'events', // Database uses 'events' not 'event'
      'birthday': 'birthday',
      'prewedding': 'pre-wedding', // Database uses 'pre-wedding' with hyphen
      'fashion': 'fashion',
      'modelling': 'fashion' // Modelling might map to fashion or portrait, using fashion for now
    };
    return categoryMap[typeId] || typeId;
  };
  
  const handleCategoryClick = (typeId: string) => {
    setSelectedFilter(typeId);
    const categorySlug = getCategorySlug(typeId);
    if (categorySlug === 'all') {
      navigate('/event-photos');
    } else {
      navigate(`/event-photos?category=${categorySlug}`);
    }
  };

  const eventTypes = [
    { id: 'all', name: 'All Events', icon: Camera, count: 150 },
    { id: 'wedding', name: 'Wedding', icon: Heart, count: 45 },
    { id: 'event', name: 'Events', icon: Users, count: 32 },
    { id: 'birthday', name: 'Birthday', icon: Cake, count: 28 },
    { id: 'prewedding', name: 'Pre Wedding', icon: Heart, count: 22 },
    { id: 'fashion', name: 'Fashion', icon: Shirt, count: 18 },
    { id: 'modelling', name: 'Modelling', icon: Camera, count: 15 }
  ];

  // Use imported photographers data directly
  const featuredPhotographers = photographers.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary" />
            <span>Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Input 
              placeholder="Search photographers..."
              className="bg-muted/50 border-none"
            />
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Filters */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Event Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {eventTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <Button
                  key={type.id}
                  variant={selectedFilter === type.id ? "default" : "ghost"}
                  className="w-full justify-between text-sm"
                  onClick={() => handleCategoryClick(type.id)}
                >
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4" />
                    <span>{type.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {type.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Featured Photographers */}
      <Card className="glass-effect">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Featured Photographers</CardTitle>
        </CardHeader>
        <CardContent>
                        <div className="space-y-4">
            {featuredPhotographers.map((photographer) => (
              <div 
                key={photographer.id}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage src={photographer.image} alt={photographer.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                        {photographer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 text-xs px-1"
                    >
                      {photographer.badge}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{photographer.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{photographer.description}</p>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">{photographer.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium">{photographer.rating}</span>
                        <span className="text-xs text-muted-foreground">({photographer.reviews})</span>
                      </div>
                      <span className="text-xs font-semibold text-primary">{photographer.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4" size="sm">
            View All Photographers
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeftSidebar;