import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, UploadCloud, Image as ImageIcon, Eye, Share2, Lock } from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import authService from '@/services/auth.service';
import { photographerEvents } from '@/data/photographerDummyData';

const PhotographerEventPhotosPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const eventsByStatus = useMemo(() => {
    return {
      current: photographerEvents.filter((event) => event.status === 'current'),
      upcoming: photographerEvents.filter((event) => event.status === 'upcoming'),
      past: photographerEvents.filter((event) => event.status === 'past'),
    };
  }, []);

  const renderEventCard = (event: (typeof photographerEvents)[number]) => (
    <Card key={event.eventId} className="glass-effect hover:shadow-elegant transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{event.eventName}</CardTitle>
            <p className="text-xs text-muted-foreground">{event.eventType}</p>
          </div>
          <Badge variant="outline" className="capitalize">
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg overflow-hidden">
          <img src={event.coverPhoto} alt={event.eventName} className="w-full h-48 object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{event.eventDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>{event.photoCount} photos</span>
          </div>
          <div className="flex items-center gap-2">
            {event.privacy === 'public' ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="capitalize">{event.privacy}</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Client: <span className="font-medium text-foreground">{event.customerName}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Album Code: <span className="font-medium text-foreground">{event.albumName}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="flex-1">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share Gallery
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Event <span className="gradient-text">Galleries</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your event sessions, upload galleries, and share albums with clients in just a few clicks.
          </p>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <Button className="bg-gradient-to-r from-primary to-primary-glow" onClick={() => navigate('/photographer/event-photos/create')}>
              Create New Session
            </Button>
            <Button variant="outline" onClick={() => navigate('/photographer/photo-booth')}>
              Manage QR Galleries
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="current" className="space-y-6">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {eventsByStatus.current.map(renderEventCard)}
            </div>
            {eventsByStatus.current.length === 0 && (
              <Card className="glass-effect mt-6">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No current events. Create a new session to get started.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {eventsByStatus.upcoming.map(renderEventCard)}
            </div>
            {eventsByStatus.upcoming.length === 0 && (
              <Card className="glass-effect mt-6">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No upcoming events scheduled. Add a session request to see it here.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {eventsByStatus.past.map(renderEventCard)}
            </div>
            {eventsByStatus.past.length === 0 && (
              <Card className="glass-effect mt-6">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Past events will appear here once completed and archived.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PhotographerEventPhotosPage;


