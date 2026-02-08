import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Image, Layout, Users, Camera, FileEdit, Eye, Plus, Calendar, MessageSquare, Briefcase, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const PhotographerLeftSidebar = () => {
  const navigate = useNavigate();

  const navSections = [
    {
      title: 'My Profile',
      icon: User,
      items: [
        { name: 'Edit Profile', path: '/photographer/profile/edit', icon: FileEdit },
        { name: 'View as Public', path: '/photographer/profile/public', icon: Eye }
      ]
    },
    {
      title: 'Event Photos',
      icon: Camera,
      items: [
        { name: 'My Events', path: '/photographer/event-photos', icon: Image },
        { name: 'Create Session', path: '/photographer/event-photos/create', icon: Plus }
      ]
    },
    {
      title: 'Mood Boards',
      icon: Layout,
      items: [
        { name: 'My Boards', path: '/photographer/mood-boards', icon: Layout },
        { name: 'Create Board', path: '/photographer/mood-boards/create', icon: Plus }
      ]
    },
    {
      title: 'Community',
      icon: Users,
      items: [
        { name: 'Community Buzz', path: '/photographer/community-buzz', icon: MessageCircle },
        { name: 'My Groups', path: '/photographer/community-buzz?tab=groups', icon: Users },
        { name: 'Find Collaborations', path: '/photographer/community-buzz?tab=collaborations', icon: Users }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Profile Quick Actions */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="space-y-2">
            {navSections.map((section) => {
              const SectionIcon = section.icon;
              return (
                <div key={section.title} className="mb-4">
                  <div className="flex items-center space-x-2 mb-2 px-2">
                    <SectionIcon className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{section.title}</span>
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Button
                          key={item.name}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => navigate(item.path)}
                        >
                          <ItemIcon className="w-4 h-4 mr-2" />
                          {item.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm"
              onClick={() => navigate('/photographer/bookings')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              My Bookings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm"
              onClick={() => navigate('/photographer/requests')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Requests
              <Badge variant="destructive" className="ml-auto">4</Badge>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm"
              onClick={() => navigate('/photographer/jobs')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotographerLeftSidebar;

