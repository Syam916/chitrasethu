import React, { useState } from 'react';
import { Heart, Download, Share2, Plus, Grid, Bookmark, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/home/Navbar';
import { collections, socialPosts } from '../data/dummyData';

const MoodBoard = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedItems, setSavedItems] = useState<number[]>([]);

  const categories = [
    { id: 'all', name: 'All Categories', count: 120 },
    { id: 'wedding', name: 'Wedding', count: 45 },
    { id: 'fashion', name: 'Fashion', count: 32 },
    { id: 'portrait', name: 'Portrait', count: 28 },
    { id: 'event', name: 'Events', count: 25 },
    { id: 'nature', name: 'Nature', count: 18 },
    { id: 'architecture', name: 'Architecture', count: 15 }
  ];

  // Create a mood board data from existing images
  const moodBoardItems = [
    ...socialPosts.map(post => ({
      id: post.id,
      type: 'post' as const,
      image: post.content.media[0],
      title: post.content.caption.split(' ').slice(0, 5).join(' ') + '...',
      author: post.user.name,
      likes: post.engagement.likes,
      category: post.tags[0]?.toLowerCase() || 'general'
    })),
    ...collections.map(collection => ({
      id: collection.id + 100,
      type: 'collection' as const,
      image: collection.thumbnail,
      title: collection.title,
      author: collection.curator,
      likes: Math.floor(Math.random() * 500) + 100,
      category: collection.category.toLowerCase()
    }))
  ];

  const filteredItems = moodBoardItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    return matchesSearch && item.category === selectedCategory;
  });

  const toggleSave = (itemId: number) => {
    setSavedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Mood <span className="gradient-text">Board</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create inspiring mood boards for your photography projects. Save, organize, and share visual inspiration.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search mood boards and inspirations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg glass-effect border-primary/20 focus:border-primary"
            />
            <Button size="lg" className="absolute right-2 top-2">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow">
            <Plus className="w-5 h-5 mr-2" />
            Create New Board
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Categories */}
            <Card className="glass-effect mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
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

            {/* My Boards */}
            <Card className="glass-effect mb-6">
              <CardHeader>
                <CardTitle className="text-lg">My Boards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Wedding Inspiration', 'Fashion Shoots', 'Portrait Ideas', 'Color Palettes'].map((board, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                        <Grid className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{board}</p>
                        <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 20) + 5} items</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Board
                </Button>
              </CardContent>
            </Card>

            {/* Trending Tags */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">Trending Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['#minimalist', '#vintage', '#bohemian', '#modern', '#rustic', '#elegant', '#candid', '#artistic'].map((tag, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  Inspiration Gallery
                </h2>
                <p className="text-muted-foreground">
                  {filteredItems.length} items • Discover and save inspiring photography
                </p>
              </div>
              
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="break-inside-avoid">
                  <Card className="glass-effect hover:shadow-elegant transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{ aspectRatio: `${Math.random() * 0.5 + 0.75}` }}
                        />
                        
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => toggleSave(item.id)}
                              className={savedItems.includes(item.id) ? 'bg-primary text-white' : ''}
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Category Badge */}
                        <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                          {item.category}
                        </Badge>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-medium mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">by {item.author}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium">{item.likes}</span>
                          </div>
                          
                          <Button
                            variant={savedItems.includes(item.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleSave(item.id)}
                          >
                            <Bookmark className="w-4 h-4 mr-1" />
                            {savedItems.includes(item.id) ? 'Saved' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Grid className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No mood board items found</p>
                <Button onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Load More */}
            {filteredItems.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Inspiration
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodBoard;