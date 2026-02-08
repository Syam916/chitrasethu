import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Download, Share2, Plus, Grid, Bookmark, Search, Filter, Loader2, AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import NavbarIntegrated from '../components/home/NavbarIntegrated';
import { useNavigate } from 'react-router-dom';
import moodBoardService, { MoodBoard } from '@/services/moodboard.service';
import authService from '@/services/auth.service';

const MoodBoard = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPhotographer = authService.getStoredUser()?.userType === 'photographer';

  useEffect(() => {
    fetchPublicBoards();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPublicBoards();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const fetchPublicBoards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // If user is authenticated, fetch all accessible boards (public + owned + collaborator)
      // If not authenticated, only fetch public boards
      const isAuthenticated = authService.isAuthenticated();
      const fetchedBoards = await moodBoardService.getAll({
        privacy: isAuthenticated ? 'all' : 'public', // Authenticated users see all accessible boards
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      setBoards(fetchedBoards);
    } catch (err: any) {
      console.error('Error fetching mood boards:', err);
      setError(err.message || 'Failed to load mood boards');
    } finally {
      setIsLoading(false);
    }
  };

  // Get categories from actual boards
  const categories = useMemo(() => {
    const categoryCounts = new Map<string, number>();
    boards.forEach(board => {
      if (board.category) {
        categoryCounts.set(board.category, (categoryCounts.get(board.category) || 0) + 1);
      }
    });

    const categoryList = Array.from(categoryCounts.entries()).map(([name, count]) => ({
      id: name.toLowerCase(),
      name,
      count
    }));

    return [
      { id: 'all', name: 'All Categories', count: boards.length },
      ...categoryList.sort((a, b) => b.count - a.count)
    ];
  }, [boards]);

  // Convert boards to display format
  // For customers: show only public boards in main gallery (collaborator boards shown in sidebar)
  // For photographers: show all boards
  const moodBoardItems = useMemo(() => {
    const boardsToShow = isPhotographer 
      ? boards 
      : boards.filter(b => b.privacy === 'public' || b.isCollaborator);
    
    return boardsToShow.map(board => ({
      id: board.boardId,
      type: 'board' as const,
      image: board.coverImage || (board.images && board.images.length > 0 ? board.images[0] : ''),
      title: board.boardName,
      author: board.creator?.fullName || 'Photographer',
      likes: board.likes,
      category: board.category?.toLowerCase() || 'general',
      boardId: board.boardId,
      imageCount: board.imageCount,
      views: board.views,
      isCollaborator: board.isCollaborator
    }));
  }, [boards, isPhotographer]);

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
      <NavbarIntegrated />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-6 sm:py-10 md:py-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold mb-2 sm:mb-4">
            Mood <span className="gradient-text">Board</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Create inspiring mood boards for your photography projects. Save, organize, and share visual inspiration.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-4 sm:mb-6 px-2">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground z-10" />
              <Input
                placeholder="Search mood boards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-12 pr-20 sm:pr-28 h-10 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg glass-effect border-primary/20 focus:border-primary"
              />
              <Button size="sm" className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-7 sm:h-8 md:h-10 px-2 sm:px-3 text-xs sm:text-sm">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>
          </div>
          
          {isPhotographer && (
            <Button 
              size="sm"
              className="bg-gradient-to-r from-primary to-primary-glow text-xs sm:text-sm md:text-base h-9 sm:h-10 md:h-11 px-4 sm:px-6"
              onClick={() => navigate('/photographer/mood-boards/create')}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">Create New Board</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 order-2 lg:order-1">
            {/* Categories */}
            <Card className="glass-effect mb-4 sm:mb-6">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-1.5 sm:space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-between text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="truncate">{category.name}</span>
                      <Badge variant="secondary" className="text-[10px] sm:text-xs ml-2 flex-shrink-0">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* My Boards - Only for Photographers */}
            {isPhotographer && (
              <Card className="glass-effect mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">My Boards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your mood boards in the photographer dashboard.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => navigate('/photographer/mood-boards')}
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    Go to My Boards
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Collaborator Boards - For Customers */}
            {!isPhotographer && authService.isAuthenticated() && (
              <Card className="glass-effect mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Shared With Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Boards that photographers have shared with you.
                  </p>
                  <div className="space-y-2">
                    {boards.filter(b => b.isCollaborator).map(board => (
                      <div
                        key={board.boardId}
                        className="p-2 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/photographer/mood-boards/${board.boardId}`)}
                      >
                        <p className="text-sm font-medium">{board.boardName}</p>
                        <p className="text-xs text-muted-foreground">by {board.creator?.fullName}</p>
                      </div>
                    ))}
                    {boards.filter(b => b.isCollaborator).length === 0 && (
                      <p className="text-xs text-muted-foreground">No boards shared with you yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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
          <div className="flex-1 order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-semibold mb-1">
                  Inspiration Gallery
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : `${filteredItems.length} items • Discover and save inspiring photography`}
                </p>
              </div>
              
              {isPhotographer && (
                <Button 
                  size="sm"
                  className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
                  onClick={() => navigate('/photographer/mood-boards/create')}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Upload Image</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading mood boards...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <Card className="glass-effect">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={fetchPublicBoards}>Try Again</Button>
                </CardContent>
              </Card>
            )}

            {/* Masonry Grid */}
            {!isLoading && !error && (
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 sm:gap-4 md:gap-6 space-y-3 sm:space-y-4 md:space-y-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                    <Card className="glass-effect hover:shadow-elegant transition-all duration-300 group overflow-hidden cursor-pointer"
                      onClick={() => item.boardId && navigate(`/photographer/mood-boards/${item.boardId}`)}
                    >
                      <CardContent className="p-0">
                        <div className="relative">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              style={{ aspectRatio: '4/3', minHeight: '200px' }}
                            />
                          ) : (
                            <div className="w-full bg-muted flex items-center justify-center" style={{ aspectRatio: '4/3', minHeight: '200px' }}>
                              <Grid className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSave(item.id);
                                }}
                                className={savedItems.includes(item.id) ? 'bg-primary text-white' : ''}
                              >
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.boardId) {
                                    navigate(`/photographer/mood-boards/${item.boardId}`);
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.boardId) {
                                    navigator.clipboard.writeText(`${window.location.origin}/photographer/mood-boards/${item.boardId}`);
                                    alert('Board link copied!');
                                  }
                                }}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Category Badge */}
                          <div className="absolute top-2 left-2 flex gap-2">
                            {item.category && (
                              <Badge className="bg-black/70 text-white capitalize">
                                {item.category}
                              </Badge>
                            )}
                            {item.isCollaborator && (
                              <Badge variant="secondary" className="text-xs">
                                Shared
                              </Badge>
                            )}
                          </div>
                          {item.imageCount !== undefined && (
                            <Badge variant="secondary" className="absolute top-2 right-2">
                              {item.imageCount} shots
                            </Badge>
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="p-3 sm:p-4">
                          <h3 className="font-medium text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2">{item.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">by {item.author}</p>
                          
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Heart className="w-3 h-3 text-red-500 flex-shrink-0" />
                                <span>{item.likes}</span>
                              </div>
                              {item.views !== undefined && (
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3 flex-shrink-0" />
                                  <span>{item.views}</span>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              variant={savedItems.includes(item.id) ? "default" : "outline"}
                              size="sm"
                              className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(item.id);
                              }}
                            >
                              <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">{savedItems.includes(item.id) ? 'Saved' : 'Save'}</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && !error && filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Grid className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">
                  {boards.length === 0 
                    ? 'No public mood boards available yet. Check back soon!'
                    : 'No mood board items match your search'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button onClick={() => {setSearchQuery(''); setSelectedCategory('all');}}>
                    Clear Filters
                  </Button>
                )}
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