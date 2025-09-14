import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { upcomingEvents, photographers, socialPosts, trendingEvents, collections, advertisements, suggestedConnections } from '../../data/dummyData';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-muted/30 to-muted/10 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-playfair font-bold mb-2">Upcoming Events</h2>
          <p className="text-muted-foreground">Discover and capture memorable moments</p>
        </div>

        <ScrollArea className="w-full">
          <div className="flex space-x-6 pb-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="flex-shrink-0 w-80 glass-effect hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Event Image */}
                    <div className="relative w-32 h-32 overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1 p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{event.title}</h3>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{event.date}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{event.time}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{event.attendees} attendees</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Badge 
                          variant={event.status === 'Booking Open' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
};

export default HeroSection;