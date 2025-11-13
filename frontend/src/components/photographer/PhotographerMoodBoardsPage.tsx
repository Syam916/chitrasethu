import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Filter, Share2, BookmarkPlus } from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import authService from '@/services/auth.service';
import { photographerMoodBoards } from '@/data/photographerDummyData';

const PhotographerMoodBoardsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrivacy, setSelectedPrivacy] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const categories = useMemo(() => {
    const unique = new Set(photographerMoodBoards.map((board) => board.category));
    return ['All', ...Array.from(unique)];
  }, []);

  const filteredBoards = photographerMoodBoards.filter((board) => {
    const matchesSearch =
      board.boardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrivacy = selectedPrivacy === 'all' || board.privacy === selectedPrivacy;
    return matchesSearch && matchesPrivacy;
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
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => setSearchTerm(category === 'All' ? '' : category)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBoards.map((board) => (
                <Card key={board.boardId} className="glass-effect hover:shadow-elegant transition-all duration-300">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <img src={board.coverImage} alt={board.boardName} className="w-full h-full object-cover" />
                    <Badge className="absolute top-3 left-3 bg-primary/90 text-xs capitalize">
                      {board.privacy}
                    </Badge>
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
                      <Button size="sm" className="flex-1">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredBoards.length === 0 && (
              <Card className="glass-effect mt-6">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No boards match your search. Try adjusting filters or create a new board.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list">
            <Card className="glass-effect">
              <CardContent className="divide-y divide-border/40">
                {filteredBoards.map((board) => (
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
                      <Button size="sm">Open Board</Button>
                      <Button size="sm" variant="outline">Share</Button>
                    </div>
                  </div>
                ))}
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
            <Button size="lg" variant="outline" onClick={() => navigate('/photographer/mood-boards/create')}>
              Build Custom Board
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotographerMoodBoardsPage;


