import React, { useState } from 'react';
import { Calendar, MapPin, Users, Camera, Filter, Search, Grid, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import { upcomingEvents, eventCategories } from '../data/dummyData';

const EventPhotos = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    return matchesSearch && event.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'booking open': return 'bg-green-500';
      case 'limited spots': return 'bg-yellow-500';
      case 'vip access': return 'bg-purple-500';
      case 'exclusive': return 'bg-red-500';
      case 'premium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Event <span className="gradient-text">Photography</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover upcoming events and connect with photographers to capture your special moments.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search events by name, location, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg glass-effect border-primary/20 focus:border-primary"
            />
            <Button size="lg" className="absolute right-2 top-2">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">Event Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eventCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-between"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glass-effect mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Events</span>
                    <span className="font-semibold">{upcomingEvents.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Available Spots</span>
                    <span className="font-semibold text-green-600">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Price</span>
                    <span className="font-semibold">₹28,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  {filteredEvents.length} Events Available
                </h2>
                <p className="text-muted-foreground">
                  Find the perfect event for your photography needs
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Events Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredEvents.map((event) => (
                <Card key={event.id} className="glass-effect hover:shadow-elegant transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      <div>
                        {/* Event Image */}
                        <div className="relative aspect-video overflow-hidden">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className={`${getStatusColor(event.status)} text-white`}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary">
                              {event.category}
                            </Badge>
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
                            {event.price}
                          </div>
                        </div>
                        
                        {/* Event Details */}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{event.date} at {event.time}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>{event.attendees} attendees expected</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 mt-4">
                            <Button className="flex-1" size="sm">
                              <Camera className="w-4 h-4 mr-2" />
                              Book Photographer
                            </Button>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="flex p-4 space-x-4">
                        <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            </div>
                            <div className="ml-4 text-right">
                              <Badge className={`${getStatusColor(event.status)} text-white mb-2`}>
                                {event.status}
                              </Badge>
                              <div className="text-lg font-semibold text-primary">{event.price}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{event.attendees} attendees</span>
                            </div>
                            <div className="flex items-center space-x-1 col-span-2">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm">
                              <Camera className="w-4 h-4 mr-2" />
                              Book Photographer
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No events found matching your criteria</p>
                <Button onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPhotos;