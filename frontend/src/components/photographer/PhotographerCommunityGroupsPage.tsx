import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Bell, Shield, Plus, Search } from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import authService from '@/services/auth.service';
import { photographerCommunityGroups } from '@/data/photographerDummyData';

const PhotographerCommunityGroupsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            My <span className="gradient-text">Groups</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Collaborate with photography teams, manage event chat rooms, and stay connected with your creative network.
          </p>
          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            <Button className="bg-gradient-to-r from-primary to-primary-glow" onClick={() => navigate('/photographer/community-buzz')}>
              Explore Community Buzz
            </Button>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-6">
        <Card className="glass-effect">
          <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-2/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search groups, events, or collaborators..." className="pl-9" />
            </div>
            <Button variant="outline" onClick={() => navigate('/photographer/community/collaborations')}>
              Find Collaborations
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {photographerCommunityGroups.map((group) => (
            <Card key={group.groupId} className="glass-effect hover:shadow-elegant transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  <AvatarImage src={group.groupIcon} alt={group.groupName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                    {group.groupName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{group.groupName}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="capitalize">
                      {group.groupType}
                    </Badge>
                    <span>{group.memberCount} members</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last active {group.lastActivity}</span>
                  {group.unreadCount > 0 && (
                    <Badge variant="destructive">{group.unreadCount} new</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Bell className="w-4 h-4 mr-2" />
                    Mute Alerts
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant={group.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                    {group.role}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Roles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotographerCommunityGroupsPage;


