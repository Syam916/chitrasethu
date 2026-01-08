import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Filter, Share2, BookmarkPlus, Loader2, AlertCircle } from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import authService from '@/services/auth.service';
import moodBoardService, { MoodBoard } from '@/services/moodboard.service';

const PhotographerMoodBoardsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<'all' | 'public' | 'private'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchBoards();
  }, [selectedPrivacy, selectedCategory]);

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedBoards = await moodBoardService.getAll({
        privacy: selectedPrivacy,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchTerm || undefined,
      });
      setBoards(fetchedBoards);
    } catch (err: any) {
      console.error('Error fetching mood boards:', err);
      setError(err.message || 'Failed to load mood boards');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchBoards();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const categories = useMemo(() => {
    const unique = new Set(boards.map((board) => board.category).filter(Boolean));
    return ['All', ...Array.from(unique)];
  }, [boards]);

  const filteredBoards = boards.filter((board) => {
    const matchesSearch =
      !searchTerm ||
      board.boardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrivacy = selectedPrivacy === 'all' || board.privacy === selectedPrivacy;
    const matchesCategory = selectedCategory === 'All' || board.category === selectedCategory;
    return matchesSearch && matchesPrivacy && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Mood <span className="gradient-text">Boards</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Organize visual inspiration for upcoming shoots, share creative direction with clients,
            and collaborate with your team.
          </p>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <Button className="bg-gradient-to-r from-primary to-primary-glow" onClick={() => navigate('/photographer/mood-boards/create')}>
              Create New Board
            </Button>
            <Button variant="outline">Import from Pinterest</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-3 glass-effect">
            <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-2/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search mood boards..."
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedPrivacy === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPrivacy('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedPrivacy === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPrivacy('public')}
                >
                  Public
                </Button>
                <Button
                  variant={selectedPrivacy === 'private' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPrivacy('private')}
                >
                  Private
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'ghost'}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {category}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grid">
          <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {isLoading ? (
              <Card className="glass-effect mt-6">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading mood boards...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="glass-effect mt-6">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={fetchBoards}>Try Again</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBoards.map((board) => (
                <Card key={board.boardId} className="glass-effect hover:shadow-elegant transition-all duration-300">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <img src={board.coverImage} alt={board.boardName} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-primary/90 text-xs capitalize">
                        {board.privacy}
                      </Badge>
                      {board.isCollaborator && (
                        <Badge variant="secondary" className="text-xs">
                          Collaborator
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="absolute bottom-3 right-3 text-xs">
                      {board.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{board.boardName}</CardTitle>
                      <Badge variant="outline">{board.imageCount} shots</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{board.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Views: {board.views}</span>
                      <span>Saves: {board.saves}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          // TODO: Implement share functionality
                          if (board.privacy === 'public') {
                            navigator.clipboard.writeText(`${window.location.origin}/photographer/mood-boards/${board.boardId}`);
                            alert('Board link copied to clipboard!');
                          } else {
                            alert('Private boards cannot be shared publicly');
                          }
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/photographer/mood-boards/${board.boardId}`)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
            {!isLoading && !error && filteredBoards.length === 0 && (
              <Card className="glass-effect mt-6">
                <CardContent className="p-6 text-center text-muted-foreground">
                  {boards.length === 0 
                    ? 'No mood boards yet. Create your first board to get started!'
                    : 'No boards match your search. Try adjusting filters or create a new board.'}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list">
            <Card className="glass-effect">
              <CardContent className="divide-y divide-border/40">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading mood boards...</p>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={fetchBoards}>Try Again</Button>
                  </div>
                ) : filteredBoards.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    {boards.length === 0 
                      ? 'No mood boards yet. Create your first board to get started!'
                      : 'No boards match your search. Try adjusting filters or create a new board.'}
                  </div>
                ) : (
                  filteredBoards.map((board) => (
                  <div key={board.boardId} className="py-4 flex flex-col md:flex-row md:items-center gap-4">
                    <img
                      src={board.coverImage}
                      alt={board.boardName}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="capitalize">{board.category}</Badge>
                        <Badge variant="outline" className="capitalize">{board.privacy}</Badge>
                        <Badge variant="outline">{board.imageCount} photos</Badge>
                      </div>
                      <h3 className="text-lg font-semibold">{board.boardName}</h3>
                      <p className="text-sm text-muted-foreground">{board.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/photographer/mood-boards/${board.boardId}`)}
                      >
                        Open Board
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (board.privacy === 'public') {
                            navigator.clipboard.writeText(`${window.location.origin}/photographer/mood-boards/${board.boardId}`);
                            alert('Board link copied to clipboard!');
                          } else {
                            alert('Private boards cannot be shared publicly');
                          }
                        }}
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="glass-effect">
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Elevate your client experience
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Share curated mood boards with clients ahead of shoots, collaborate on ideas, and lock your visual direction before the big day.
              </p>
            </div>
            <Button size="lg" variant="outline" onClick={() => navigate('/photographer/mood-boards/create/custom')}>
              Build Custom Board
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotographerMoodBoardsPage;


