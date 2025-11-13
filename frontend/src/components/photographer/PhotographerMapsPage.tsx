import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, MapPin, Camera, Calendar, Users, Star, Navigation, List } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import { photographers, upcomingEvents } from '@/data/dummyData';

const PhotographerMapsPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Discover <span className="gradient-text">Nearby</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find photographers and events near you on an interactive map
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="photographers" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="photographers">
              <Camera className="w-4 h-4 mr-2" />
              Photographers
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* View Mode Toggle */}
          <div className="flex justify-center space-x-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <Map className="w-4 h-4 mr-2" />
              Map View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </Button>
          </div>

          {/* Photographers Tab */}
          <TabsContent value="photographers" className="space-y-6">
            {viewMode === 'map' ? (
              /* Map View Placeholder */
              <Card className="glass-effect">
                <CardContent className="p-8">
                  <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Map integration coming soon
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Google Maps / Mapbox integration will be added here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* List View */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Nearby Photographers</h2>
                  <Badge variant="secondary">{photographers.length} found</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photographers.map((photographer) => (
                    <Card key={photographer.id} className="glass-effect hover:shadow-elegant transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3 mb-3">
                          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                            <AvatarImage src={photographer.image} alt={photographer.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                              {photographer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{photographer.name}</h3>
                            <p className="text-xs text-muted-foreground">{photographer.experience}</p>
                            <Badge className="mt-1 text-xs">{photographer.badge}</Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 mb-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{photographer.location}</span>
                          <span className="text-xs text-primary ml-auto">2.5 km</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {photographer.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-sm">{photographer.rating}</span>
                            <span className="text-xs text-muted-foreground">({photographer.reviews})</span>
                          </div>
                          <span className="font-semibold text-primary text-sm">{photographer.price}</span>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Navigation className="w-3 h-3 mr-1" />
                            Directions
                          </Button>
                          <Button size="sm" className="flex-1">
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {viewMode === 'map' ? (
              /* Map View Placeholder */
              <Card className="glass-effect">
                <CardContent className="p-8">
                  <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Map integration coming soon
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Event locations will be displayed on an interactive map
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* List View */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Nearby Events</h2>
                  <Badge variant="secondary">{upcomingEvents.length} found</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
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
                          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                            {event.price}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-1">{event.title}</h3>
                          
                          <div className="space-y-1 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{event.date} at {event.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{event.location}</span>
                              <span className="text-primary ml-auto">1.8 km</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{event.attendees} attendees</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Navigation className="w-3 h-3 mr-1" />
                              Directions
                            </Button>
                            <Button size="sm" className="flex-1">
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Map Integration Note */}
        <Card className="glass-effect mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Map className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Interactive Map Coming Soon</h3>
                <p className="text-sm text-muted-foreground">
                  We're working on integrating Google Maps to provide you with an interactive map view. 
                  You'll be able to see real-time locations, get directions, and filter by distance and availability.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li>• Real-time location tracking</li>
                  <li>• Distance-based filtering</li>
                  <li>• Turn-by-turn directions</li>
                  <li>• Cluster view for dense areas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotographerMapsPage;

