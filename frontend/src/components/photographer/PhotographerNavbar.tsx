import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Home, MessageSquare, Users, Briefcase, Calendar, QrCode, Map, Bell, LogOut, Camera, Menu, X, Search, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import authService from '@/services/auth.service';
import moodboardService from '@/services/moodboard.service';

interface User {
  userId: number;
  email: string;
  fullName: string;
  userType: string;
  isVerified: boolean;
  avatarUrl?: string;
}

const PhotographerNavbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    userId: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    userType: string;
  }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const navItems = [
    { name: 'Home', icon: Home, path: '/photographer/home' },
    { name: 'Requests', icon: MessageSquare, path: '/photographer/requests' },
    { name: 'Community Buzz', icon: Users, path: '/photographer/community-buzz' },
    { name: 'Jobs', icon: Briefcase, path: '/photographer/jobs' },
    { name: 'Bookings', icon: Calendar, path: '/photographer/bookings' },
    { name: 'Photo Booth', icon: QrCode, path: '/photographer/photo-booth' },
    { name: 'Maps', icon: Map, path: '/photographer/maps' },
  ];

  useEffect(() => {
    // Cleanup search timeout and abort controller on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Calculate dropdown position and handle click outside
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (searchInputRef.current && searchOpen) {
        const rect = searchInputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: Math.max(320, rect.width), // Minimum 320px width
        });
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        updateDropdownPosition();
      }, 0);
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      setDropdownPosition(null);
    }

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setLoading(false);
          return;
        }

        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      navigate('/login');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = async (query: string) => {
    const trimmedQuery = query.trim();
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Cancel previous request if still pending
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    // If query is empty, clear results immediately
    if (trimmedQuery.length < 1) {
      setSearchResults([]);
      setSearchOpen(false);
      setSearchLoading(false);
      return;
    }

    // Backend requires minimum 2 characters - don't search with less
    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setSearchOpen(true);
      setSearchLoading(false);
      return;
    }

    // Open dropdown immediately without blocking
    setSearchOpen(true);

    // Very minimal debounce (150ms) - enough to not block typing but still feel responsive
    searchTimeoutRef.current = setTimeout(async () => {
      // Create new AbortController for this request
      const abortController = new AbortController();
      searchAbortControllerRef.current = abortController;

      // Set loading state after debounce
      setSearchLoading(true);

      try {
        const results = await moodboardService.searchUsers(trimmedQuery, abortController.signal);
        
        // Only update if request wasn't cancelled and query still matches
        if (!abortController.signal.aborted && searchQuery.trim() === trimmedQuery) {
          setSearchResults(results);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
          return;
        }
        // Silently handle search errors - don't block UI
        console.error('Search error:', error);
        if (!abortController.signal.aborted && searchQuery.trim() === trimmedQuery) {
          setSearchResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 150);
  };

  const handleSearchResultClick = (result: typeof searchResults[0]) => {
    if (result.userType === 'photographer') {
      // Navigate to photographer profile using userId (backend will resolve photographerId)
      navigate(`/photographer/profile/${result.userId}`);
    } else {
      // For customers, navigate to their profile settings or explore page
      navigate(`/explore`);
    }
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                ChitraSethu
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border shadow-sm overflow-x-hidden">
      <div className="w-full mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 min-w-0">
          {/* Left Side - Mobile Menu + Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 min-w-0">
            {/* Mobile Menu Button - Corner Position */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden -ml-1">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-playfair font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        ChitraSethu
                      </div>
                      <Badge variant="secondary" className="text-xs">Photographer</Badge>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className="w-full justify-start space-x-3 text-muted-foreground hover:text-primary hover:bg-muted"
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Button>
                    );
                  })}
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-muted-foreground hover:text-primary hover:bg-muted"
                      onClick={() => {
                        navigate('/photographer/messages');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium">Messages</span>
                      <Badge variant="destructive" className="ml-auto">3</Badge>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-muted-foreground hover:text-primary hover:bg-muted"
                      onClick={() => {
                        navigate('/photographer/profile/edit');
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span className="font-medium">Profile Settings</span>
                    </Button>
                    {user && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo Section - Responsive */}
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/photographer/home')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <Camera className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  ChitraSethu
                </h1>
                <Badge variant="secondary" className="text-[10px] sm:text-xs hidden sm:inline-block">Photographer</Badge>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Elements */}
          <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 flex-1 justify-center mx-1 xl:mx-2 min-w-0 flex-wrap">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors px-1.5 xl:px-2 flex-shrink-0"
                  onClick={() => navigate(item.path)}
                >
                  <IconComponent className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
                  <span className="text-[10px] xl:text-xs font-medium whitespace-normal break-words leading-tight">{item.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Search Bar - Desktop only */}
          <div ref={searchContainerRef} className="hidden lg:flex items-center mx-1 xl:mx-2 flex-shrink-0 min-w-0 relative">
            <div className="relative w-28 xl:w-36">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 xl:w-4 xl:h-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                ref={searchInputRef}
                placeholder="Search photographers, customers..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  // Update input value immediately - don't block
                  setSearchQuery(value);
                  // Open dropdown when typing
                  if (value.trim().length >= 1) {
                    setSearchOpen(true);
                  } else {
                    setSearchOpen(false);
                  }
                  // Trigger search asynchronously
                  handleSearch(value);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 1 || searchResults.length > 0) {
                    setSearchOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  // Close on Escape
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }
                }}
                className="pl-7 xl:pl-8 pr-2 h-7 xl:h-8 text-[10px] xl:text-xs bg-muted/50 border-none focus:bg-background transition-colors"
                autoComplete="off"
              />
              {searchLoading && (
                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground pointer-events-none" />
              )}
            </div>
            {searchOpen && (searchQuery.trim().length >= 1 || searchResults.length > 0) && (dropdownPosition || true) && createPortal(
              <div 
                ref={searchDropdownRef}
                className="fixed w-80 bg-popover border rounded-md shadow-lg z-[9999]"
                style={{ 
                  position: 'fixed',
                  top: dropdownPosition ? `${dropdownPosition.top}px` : '100px',
                  left: dropdownPosition ? `${dropdownPosition.left}px` : '100px',
                  width: dropdownPosition ? `${dropdownPosition.width}px` : '320px',
                  maxHeight: '400px',
                }}
                onMouseDown={(e) => {
                  // Prevent input from losing focus when clicking dropdown
                  e.preventDefault();
                }}
              >
                <div className="overflow-y-auto" style={{ maxHeight: '100%' }}>
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchQuery.trim().length === 1 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Type at least 2 characters to search
                    </div>
                  ) : searchResults.length === 0 && searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No results found for "{searchQuery.trim()}"
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.userId}
                          onClick={() => handleSearchResultClick(result)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={result.avatarUrl} alt={result.fullName} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                              {getInitials(result.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.fullName}</p>
                            <p className="text-xs text-muted-foreground capitalize truncate">
                              {result.userType}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {result.userType}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Start typing to search...
                    </div>
                  )}
                </div>
              </div>,
              document.body
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0">
            {/* Messages Icon - Hidden on mobile (shown in menu) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hidden lg:flex"
              onClick={() => navigate('/photographer/messages')}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                3
              </span>
            </Button>

            {/* Notifications Icon */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* Profile Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 p-2">
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-primary/20 flex-shrink-0">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-[10px] sm:text-xs">
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden xl:block text-left min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{user.fullName}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">Photographer</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-1 text-xs">Photographer</Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/photographer/profile/edit')}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/photographer/bookings')}>
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/photographer/event-photos')}>
                    Event Photos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/photographer/mood-boards')}>
                    Mood Boards
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PhotographerNavbar;

