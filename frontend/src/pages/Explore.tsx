import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Heart, Bookmark, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import photographerService, { Photographer } from '../services/photographer.service';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch photographers on mount and when category changes
  const loadPhotographers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Only use search filter for API call
      // Category filtering will be done client-side since API category might refer to event categories
      const filters: any = {};
      if (searchQuery) {
        filters.search = searchQuery;
      }

      const data = await photographerService.getAll(filters);
      setPhotographers(data);
    } catch (err: any) {
      console.error('Error loading photographers:', err);
      setError(err.message || 'Failed to load photographers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotographers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPhotographers();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Reload when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPhotographers();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Derive categories from photographer specialties
  const eventCategories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    
    photographers.forEach(photographer => {
      photographer.specialties?.forEach(specialty => {
        const normalized = specialty.toLowerCase();
        categoryMap.set(normalized, (categoryMap.get(normalized) || 0) + 1);
      });
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        id: name,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count);

    return [
      { id: 'all', name: 'All Categories', count: photographers.length },
      ...categories
    ];
  }, [photographers]);

  // Filter photographers based on selected category and search
  const filteredPhotographers = useMemo(() => {
    return photographers.filter(photographer => {
      const matchesSearch = 
        photographer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photographer.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photographer.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photographer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photographer.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      if (selectedCategory === 'all') return matchesSearch;
      
      return matchesSearch && photographer.specialties?.some(specialty => 
        specialty.toLowerCase() === selectedCategory.toLowerCase()
      );
    });
  }, [photographers, searchQuery, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Client-side filtering will handle the rest
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <NavbarIntegrated />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Explore <span className="gradient-text">Photographers</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover talented photographers in your area. Find the perfect match for your special moments.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or specialty..."
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
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : eventCategories.length > 0 ? (
                    eventCategories.map((category) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No categories available
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">Under ₹15,000</Button>
                    <Button variant="ghost" className="w-full justify-start">₹15,000 - ₹25,000</Button>
                    <Button variant="ghost" className="w-full justify-start">₹25,000 - ₹50,000</Button>
                    <Button variant="ghost" className="w-full justify-start">Above ₹50,000</Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4">Rating</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2].map((rating) => (
                      <Button key={rating} variant="ghost" className="w-full justify-start">
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: rating }, (_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          ))}
                          <span className="ml-2">& above</span>
                        </div>
                      </Button>
                    ))}
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
                  {filteredPhotographers.length} Photographers Found
                </h2>
                <p className="text-muted-foreground">
                  {selectedCategory !== 'all' && `Filtered by: ${eventCategories.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading photographers...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={loadPhotographers}
                >
                  Try Again
                </Button>
              </Alert>
            )}

            {/* Photographer Cards */}
            {!isLoading && !error && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredPhotographers.map((photographer) => {
                  const displayName = photographer.businessName || photographer.fullName || 'Photographer';
                  const location = photographer.location || `${photographer.city || ''}${photographer.city && photographer.state ? ', ' : ''}${photographer.state || ''}`.trim() || 'Location not specified';
                  const portfolioImage = photographer.portfolio?.[0]?.imageUrl || photographer.portfolio?.[0]?.thumbnailUrl || photographer.avatarUrl;
                  const badge = photographer.isPremium ? 'Premium' : photographer.isVerified ? 'Verified' : '';

                  return (
                    <Card 
                      key={photographer.photographerId} 
                      className="glass-effect hover:shadow-elegant transition-all duration-300 group overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/photographer/profile/${photographer.photographerId}`)}
                    >
                      <CardContent className="p-0">
                        {viewMode === 'grid' ? (
                          <div className="relative">
                            {/* Portfolio Preview */}
                            <div className="aspect-square bg-muted/20 overflow-hidden">
                              {portfolioImage ? (
                                <img 
                                  src={portfolioImage} 
                                  alt={displayName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-glow/20">
                                  <MapPin className="w-12 h-12 text-muted-foreground opacity-50" />
                                </div>
                              )}
                            </div>
                            
                            {/* Floating Badge */}
                            {badge && (
                              <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
                                {badge}
                              </Badge>
                            )}
                            
                            {/* Content */}
                            <div className="p-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                                  <AvatarImage src={photographer.avatarUrl} alt={displayName} />
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                                    {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">{displayName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {photographer.experienceYears ? `${photographer.experienceYears}+ years` : 'Professional'}
                                  </p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implement favorite functionality
                                  }}
                                >
                                  <Heart className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              {photographer.specialties && photographer.specialties.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {photographer.specialties.slice(0, 3).map((specialty, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                  {photographer.specialties.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{photographer.specialties.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1 mb-3">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate">{location}</span>
                              </div>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">
                                    {photographer.rating ? photographer.rating.toFixed(1) : 'N/A'}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ({photographer.totalReviews || 0})
                                  </span>
                                </div>
                                <span className="font-semibold text-primary">
                                  ₹{photographer.basePrice ? photographer.basePrice.toLocaleString() : 'N/A'}
                                </span>
                              </div>
                              
                              <Button 
                                className="w-full" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/photographer/profile/${photographer.photographerId}`);
                                }}
                              >
                                View Profile
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // List View
                          <div className="flex p-4 space-x-4">
                            <div className="relative">
                              <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                                <AvatarImage src={photographer.avatarUrl} alt={displayName} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                                  {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {badge && (
                                <Badge className="absolute -top-1 -right-1 text-xs px-1">
                                  {badge}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold">{displayName}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {photographer.experienceYears ? `${photographer.experienceYears}+ years experience` : 'Professional photographer'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center space-x-1 mb-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-medium">
                                      {photographer.rating ? photographer.rating.toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      ({photographer.totalReviews || 0})
                                    </span>
                                  </div>
                                  <span className="font-semibold text-primary">
                                    ₹{photographer.basePrice ? photographer.basePrice.toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 mb-2">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{location}</span>
                              </div>
                              
                              {photographer.specialties && photographer.specialties.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {photographer.specialties.map((specialty, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/photographer/profile/${photographer.photographerId}`);
                                  }}
                                >
                                  View Profile
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implement bookmark functionality
                                  }}
                                >
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implement favorite functionality
                                  }}
                                >
                                  <Heart className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredPhotographers.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground mb-2">
                  {photographers.length === 0 
                    ? 'No photographers available at the moment'
                    : 'No photographers found matching your criteria'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      loadPhotographers();
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;