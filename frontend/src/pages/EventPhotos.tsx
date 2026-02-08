import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Camera, Filter, Search, Grid, List, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import eventService, { Event } from '../services/event.service';
import { useToast } from '../hooks/use-toast';

const EventPhotos = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get category from URL parameter, default to 'all'
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  
  // Update category when URL parameter changes
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    setSelectedCategory(category);
  }, [searchParams]);
  
  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const filters: any = {
          limit: 100,
          offset: 0,
        };
        
        // Add search filter if query exists
        if (debouncedSearchQuery.trim()) {
          filters.search = debouncedSearchQuery.trim();
        }
        
        // Add category filter if not 'all'
        if (selectedCategory !== 'all') {
          filters.category = selectedCategory;
        }
        
        const response = await eventService.getAll(filters);
        setEvents(response.events);
      } catch (error: any) {
        console.error('Failed to fetch events:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load events. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast, debouncedSearchQuery, selectedCategory]);

  // Extract unique categories from events
  const eventCategories = React.useMemo(() => {
    const categoryMap = new Map<string, number>();
    events.forEach(event => {
      const slug = event.categorySlug || 'other';
      categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1);
    });

    const categories = Array.from(categoryMap.entries()).map(([slug, count]) => ({
      id: slug,
      name: events.find(e => e.categorySlug === slug)?.categoryName || slug,
      count,
    }));

    return [
      { id: 'all', name: 'All Events', count: events.length },
      ...categories
    ];
  }, [events]);

  // Events are already filtered by API, but we can do additional client-side filtering if needed
  const filteredEvents = events;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (minBudget: number, maxBudget: number) => {
    if (minBudget > 0 && maxBudget > 0) {
      return `₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}`;
    } else if (minBudget > 0) {
      return `₹${minBudget.toLocaleString()}+`;
    }
    return 'Contact for pricing';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'TBD';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getEventImage = (event: Event) => {
    if (event.images && Array.isArray(event.images) && event.images.length > 0) {
      return event.images[0];
    }
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800';
  };

  const handleBookPhotographer = (event: Event) => {
    // Navigate to requests page with event information
    navigate(`/requests?eventId=${event.eventId}&eventTitle=${encodeURIComponent(event.title)}`);
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setCurrentImageIndex(0); // Reset to first image when opening dialog
    setEventDialogOpen(true);
  };

  const handleCardClick = (event: Event) => {
    handleViewDetails(event);
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
          
          <div className="flex justify-center mb-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-glow"
              onClick={() => navigate('/events/create')}
            >
              <Camera className="w-5 h-5 mr-2" />
              Create Your Event
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search events by name, location, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg glass-effect border-primary/20 focus:border-primary"
            />
            <Button 
              size="lg" 
              className="absolute right-2 top-2"
              onClick={() => setFilterDialogOpen(true)}
            >
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
                      onClick={() => handleCategoryChange(category.id)}
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
                    <span className="font-semibold">{events.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold">
                      {events.filter(e => {
                        const eventDate = new Date(e.eventDate);
                        const now = new Date();
                        return eventDate.getMonth() === now.getMonth() && 
                               eventDate.getFullYear() === now.getFullYear();
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Open Events</span>
                    <span className="font-semibold text-green-600">
                      {events.filter(e => e.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. Price</span>
                    <span className="font-semibold">
                      {events.length > 0 
                        ? `₹${Math.round(events.reduce((sum, e) => sum + (e.minBudget || 0), 0) / events.length).toLocaleString()}`
                        : 'N/A'}
                    </span>
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
                  className="bg-gradient-to-r from-primary to-primary-glow"
                  onClick={() => navigate('/events/create')}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading events...</span>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredEvents.map((event) => (
                  <Card 
                    key={event.eventId} 
                    className="glass-effect hover:shadow-elegant transition-all duration-300 group overflow-hidden cursor-pointer"
                    onClick={() => handleCardClick(event)}
                  >
                    <CardContent className="p-0">
                      {viewMode === 'grid' ? (
                        <div>
                          {/* Event Image */}
                          <div className="relative aspect-video overflow-hidden">
                            <img 
                              src={getEventImage(event)} 
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-3 left-3">
                              <Badge className={`${getStatusColor(event.status)} text-white capitalize`}>
                                {event.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary">
                                {event.categoryName}
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
                              {formatPrice(event.minBudget, event.maxBudget)}
                            </div>
                          </div>
                          
                          {/* Event Details */}
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {event.description || 'No description available'}
                            </p>
                            
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(event.eventDate)} {event.eventTime && `at ${formatTime(event.eventTime)}`}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">
                                  {event.venueName || event.location || `${event.city || ''}${event.city && event.state ? ', ' : ''}${event.state || ''}`}
                                </span>
                              </div>
                              
                              {event.expectedAttendees && (
                                <div className="flex items-center space-x-2">
                                  <Users className="w-4 h-4" />
                                  <span>{event.expectedAttendees} attendees expected</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2 mt-4" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                className="flex-1" 
                                size="sm"
                                onClick={() => handleBookPhotographer(event)}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Book Photographer
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(event)}
                              >
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
                              src={getEventImage(event)} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {event.description || 'No description available'}
                                </p>
                              </div>
                              <div className="ml-4 text-right">
                                <Badge className={`${getStatusColor(event.status)} text-white mb-2 capitalize`}>
                                  {event.status.replace('_', ' ')}
                                </Badge>
                                <div className="text-lg font-semibold text-primary">{formatPrice(event.minBudget, event.maxBudget)}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(event.eventDate)}</span>
                              </div>
                              {event.expectedAttendees && (
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{event.expectedAttendees} attendees</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1 col-span-2">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">
                                  {event.venueName || event.location || `${event.city || ''}${event.city && event.state ? ', ' : ''}${event.state || ''}`}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                size="sm"
                                onClick={() => handleBookPhotographer(event)}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Book Photographer
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(event)}
                              >
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
            )}

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No events found matching your criteria</p>
                <Button onClick={() => {setSearchQuery(''); handleCategoryChange('all');}}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.categoryName} • {formatDate(selectedEvent.eventDate)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Event Images - Carousel */}
                {selectedEvent.images && Array.isArray(selectedEvent.images) && selectedEvent.images.length > 0 ? (
                  <div className="relative aspect-video overflow-hidden rounded-lg group">
                    <img 
                      src={selectedEvent.images[currentImageIndex]} 
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Counter */}
                    {selectedEvent.images.length > 1 && (
                      <>
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          {currentImageIndex + 1} / {selectedEvent.images.length}
                        </div>
                        
                        {/* Previous Button */}
                        {currentImageIndex > 0 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => prev - 1);
                            }}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </Button>
                        )}
                        
                        {/* Next Button */}
                        {currentImageIndex < selectedEvent.images.length - 1 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(prev => prev + 1);
                            }}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        )}
                        
                        {/* Image Dots Indicator */}
                        {selectedEvent.images.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {selectedEvent.images.map((_, index) => (
                              <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentImageIndex 
                                    ? 'bg-white w-6' 
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(index);
                                }}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                    <Camera className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                
                {/* Thumbnail Gallery (if multiple images) */}
                {selectedEvent.images && Array.isArray(selectedEvent.images) && selectedEvent.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {selectedEvent.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-primary ring-2 ring-primary' 
                            : 'border-transparent hover:border-primary/50'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`${selectedEvent.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date & Time</p>
                      <p className="font-semibold">
                        {formatDate(selectedEvent.eventDate)} 
                        {selectedEvent.eventTime && ` at ${formatTime(selectedEvent.eventTime)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">
                        {selectedEvent.venueName || selectedEvent.location || 
                         `${selectedEvent.city || ''}${selectedEvent.city && selectedEvent.state ? ', ' : ''}${selectedEvent.state || ''}`}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.expectedAttendees && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Attendees</p>
                        <p className="font-semibold">{selectedEvent.expectedAttendees} guests</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedEvent.status)}>
                      {selectedEvent.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About This Event</h3>
                    <p className="text-muted-foreground">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Budget */}
                <div>
                  <h3 className="font-semibold mb-2">Budget Range</h3>
                  <p className="text-lg font-semibold text-primary">
                    {formatPrice(selectedEvent.minBudget, selectedEvent.maxBudget)}
                  </p>
                </div>

                {/* Requirements */}
                {selectedEvent.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <p className="text-muted-foreground">{selectedEvent.requirements}</p>
                  </div>
                )}

                {/* Creator Info */}
                {selectedEvent.creatorName && (
                  <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Event Creator</p>
                      <p className="font-semibold">{selectedEvent.creatorName}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      setEventDialogOpen(false);
                      handleBookPhotographer(selectedEvent);
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Book Photographer
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setEventDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Events</DialogTitle>
            <DialogDescription>
              Refine your event search by category and status
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="space-y-2">
                {eventCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      handleCategoryChange(category.id);
                      setFilterDialogOpen(false);
                    }}
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                handleCategoryChange('all');
                setSearchQuery('');
                setFilterDialogOpen(false);
              }}
            >
              Clear All
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventPhotos;