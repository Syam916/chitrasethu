import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, MapPin, Search, Filter, Bookmark, Send } from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import authService from '@/services/auth.service';
import { photographerCollaborations } from '@/data/photographerDummyData';

const PhotographerFindCollaborationsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'seeking' | 'offering'>('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const filteredCollaborations = photographerCollaborations.filter((collab) => {
    const matchesSearch =
      collab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collab.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || collab.collaborationType === typeFilter;
    const matchesLocation = locationFilter === 'all' || collab.location.includes(locationFilter);
    return matchesSearch && matchesType && matchesLocation;
  });

  const uniqueLocations = Array.from(
    new Set(photographerCollaborations.map((collab) => collab.location.split(',')[0].trim()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Find <span className="gradient-text">Collaborations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover trusted photographers, editors, drone pilots, and creative partners for upcoming projects.
          </p>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <Button className="bg-gradient-to-r from-primary to-primary-glow" onClick={() => navigate('/photographer/community-buzz')}>
              Browse Community Buzz
            </Button>
            <Button variant="outline">
              <Briefcase className="w-4 h-4 mr-2" />
              Post Collaboration
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-6">
        <Card className="glass-effect">
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for collaborators, skills, or keywords..."
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Role Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="seeking">Seeking Collaborator</SelectItem>
                <SelectItem value="offering">Offering Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={(v) => setLocationFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCollaborations.map((collab) => (
            <Card key={collab.collaborationId} className="glass-effect hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{collab.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{collab.postedBy}</p>
                  </div>
                  <Badge variant={collab.collaborationType === 'seeking' ? 'secondary' : 'default'} className="capitalize">
                    {collab.collaborationType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{collab.location}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{collab.description}</p>
                <div className="flex flex-wrap gap-2">
                  {collab.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{collab.responses} responses</span>
                  <span>{new Date(collab.postedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Respond
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCollaborations.length === 0 && (
          <Card className="glass-effect">
            <CardContent className="p-6 text-center text-muted-foreground">
              No collaborations match your filters. Try broadening your search or create a collaboration request.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PhotographerFindCollaborationsPage;


