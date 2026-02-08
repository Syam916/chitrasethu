import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { upcomingEvents, photographers, socialPosts, trendingEvents, collections, advertisements, suggestedConnections } from '../../data/dummyData';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-muted/30 to-muted/10 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-playfair font-bold mb-1 sm:mb-2">Upcoming Events</h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Discover and capture memorable moments</p>
        </div>

        <ScrollArea className="w-full -mx-3 sm:mx-0 px-3 sm:px-0">
          <div className="flex space-x-2 sm:space-x-3 md:space-x-6 pb-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-80 glass-effect hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Event Image */}
                    <div className="relative w-full h-40 sm:w-32 sm:h-32 overflow-hidden flex-shrink-0">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1 p-3 sm:p-4 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2">{event.title}</h3>
                      
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="text-[11px] sm:text-xs">{event.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="text-[11px] sm:text-xs">{event.time}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1 text-[11px] sm:text-xs">{event.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          <span className="text-[11px] sm:text-xs">{event.attendees} attendees</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 sm:mt-3">
                        <Badge 
                          variant={event.status === 'Booking Open' ? 'default' : 'secondary'}
                          className="text-[10px] sm:text-xs"
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