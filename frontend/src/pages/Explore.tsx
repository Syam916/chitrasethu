import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, Heart, Bookmark } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import Navbar from '../components/home/Navbar';
import { photographers, eventCategories } from '../data/dummyData';

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPhotographers = photographers.filter(photographer => {
    const matchesSearch = photographer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photographer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photographer.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    
    return matchesSearch && photographer.specialties.some(specialty => 
      specialty.toLowerCase() === selectedCategory.toLowerCase()
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
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

            {/* Photographer Cards */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredPhotographers.map((photographer) => (
                <Card key={photographer.id} className="glass-effect hover:shadow-elegant transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-0">
                    {viewMode === 'grid' ? (
                      <div className="relative">
                        {/* Portfolio Preview */}
                        <div className="aspect-square bg-muted/20 overflow-hidden">
                          <img 
                            src={photographer.portfolio[0]} 
                            alt={photographer.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Floating Badge */}
                        <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm">
                          {photographer.badge}
                        </Badge>
                        
                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                              <AvatarImage src={photographer.image} alt={photographer.name} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                                {photographer.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{photographer.name}</h3>
                              <p className="text-sm text-muted-foreground">{photographer.experience}</p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {photographer.description}
                          </p>
                          
                          <div className="flex items-center space-x-1 mb-3">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{photographer.location}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {photographer.specialties.slice(0, 3).map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{photographer.rating}</span>
                              <span className="text-sm text-muted-foreground">({photographer.reviews})</span>
                            </div>
                            <span className="font-semibold text-primary">{photographer.price}</span>
                          </div>
                          
                          <Button className="w-full mt-4" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <div className="flex p-4 space-x-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                            <AvatarImage src={photographer.image} alt={photographer.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                              {photographer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <Badge className="absolute -top-1 -right-1 text-xs px-1">
                            {photographer.badge}
                          </Badge>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{photographer.name}</h3>
                              <p className="text-sm text-muted-foreground">{photographer.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-1 mb-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{photographer.rating}</span>
                                <span className="text-sm text-muted-foreground">({photographer.reviews})</span>
                              </div>
                              <span className="font-semibold text-primary">{photographer.price}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 mb-2">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{photographer.location}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {photographer.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button size="sm">View Profile</Button>
                            <Button variant="outline" size="sm">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPhotographers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">No photographers found matching your criteria</p>
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

export default Explore;