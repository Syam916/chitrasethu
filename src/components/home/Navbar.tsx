import React from 'react';
import { Search, Home, Compass, Calendar, Image, Users, MessageSquare, Bell } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const Navbar = () => {
  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Explore', icon: Compass },
    { name: 'Event Photos', icon: Calendar },
    { name: 'Mood Board', icon: Image },
    { name: 'Requests', icon: MessageSquare },
    { name: 'Community Buzz', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              ChitraSethu
            </h1>
          </div>

          {/* Navigation Elements */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const getRoute = (name: string) => {
                const routes: {[key: string]: string} = {
                  'Home': '/home',
                  'Explore': '/explore',
                  'Event Photos': '/event-photos',
                  'Mood Board': '/mood-board',
                  'Requests': '/requests',
                  'Community Buzz': '/community-buzz',
                };
                return routes[name] || '/home';
              };
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => window.location.href = getRoute(item.name)}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search photographers, events..."
                className="pl-10 bg-muted/50 border-none focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                <AvatarImage src="/api/placeholder/32/32" alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">Photographer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;