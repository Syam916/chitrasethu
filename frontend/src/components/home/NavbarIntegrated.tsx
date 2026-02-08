import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Home, Compass, Calendar, Image, Users, MessageSquare, Bell, LogOut, Menu, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Popover, PopoverContent } from '../ui/popover';
import authService from '@/services/auth.service';
import moodboardService from '@/services/moodboard.service';
import { useNavigate } from 'react-router-dom';

interface User {
  userId: number;
  email: string;
  fullName: string;
  userType: string;
  isVerified: boolean;
  avatarUrl?: string;
  phone?: string;
  location?: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    userId: number;
    email: string;
    fullName: string;
    avatarUrl?: string;
    userType: string;
    photographerId?: number | null;
  }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const desktopSearchContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const currentSearchQueryRef = useRef<string>('');
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Explore', icon: Compass },
    { name: 'Event Photos', icon: Calendar },
    { name: 'Mood Board', icon: Image },
    { name: 'Requests', icon: MessageSquare },
    { name: 'Community Buzz', icon: Users },
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
      // Use desktop input for desktop view, mobile input for mobile view
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      const activeInput = isDesktop ? desktopSearchInputRef.current : mobileSearchInputRef.current;
      
      if (activeInput && searchOpen) {
        const rect = activeInput.getBoundingClientRect();
        // For position: fixed, use viewport coordinates directly (getBoundingClientRect already provides these)
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(320, rect.width), // Minimum 320px width
        });
        console.log('[Navbar] Dropdown position calculated:', {
          isDesktop,
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(320, rect.width),
          inputRect: rect
        });
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const isDesktop = window.innerWidth >= 1024;
      const searchContainer = isDesktop ? desktopSearchContainerRef.current : mobileSearchContainerRef.current;
      
      if (
        searchContainer &&
        !searchContainer.contains(event.target as Node) &&
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      // Calculate position immediately and after a short delay to ensure accuracy
      updateDropdownPosition();
      const timeoutId = setTimeout(() => {
        updateDropdownPosition();
      }, 10);
      
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      document.addEventListener('mousedown', handleClickOutside);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      setDropdownPosition(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // First try to get user from localStorage
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setLoading(false);
          return;
        }

        // If not in localStorage, fetch from API
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // If there's an error, redirect to login
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
      // Even if logout fails, clear local storage and redirect
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
    
    // Update ref with current query
    currentSearchQueryRef.current = trimmedQuery;
    
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
        console.log('[Navbar Search] Searching for:', trimmedQuery);
        const results = await moodboardService.searchUsers(trimmedQuery, abortController.signal);
        console.log('[Navbar Search] Results:', results);
        console.log('[Navbar Search] Current query ref:', currentSearchQueryRef.current);
        console.log('[Navbar Search] Trimmed query:', trimmedQuery);
        
        // Only update if request wasn't cancelled and query still matches current search
        if (!abortController.signal.aborted && currentSearchQueryRef.current === trimmedQuery) {
          console.log('[Navbar Search] Setting results:', results.length);
          setSearchResults(results);
        } else {
          console.log('[Navbar Search] Skipping results update - query mismatch or aborted');
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
          return;
        }
        // Log search errors for debugging
        console.error('[Navbar Search] Error:', error);
        console.error('[Navbar Search] Error message:', error.message);
        if (!abortController.signal.aborted && currentSearchQueryRef.current === trimmedQuery) {
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
      // For photographers, we MUST use photographerId, not userId
      // If photographerId is not available, the photographer profile might not exist
      if (result.photographerId) {
        navigate(`/photographer/profile/${result.photographerId}`);
      } else {
        // Fallback: try with userId, but this should be rare
        console.warn('Photographer ID not found in search results, using userId as fallback:', result.userId);
        navigate(`/photographer/profile/${result.userId}`);
      }
    } else {
      // For customers, navigate to their profile page using userId
      navigate(`/profile/${result.userId}`);
    }
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

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

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
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
    <nav className="sticky top-0 z-[100] bg-background/95 backdrop-blur-md border-b border-border shadow-sm overflow-x-hidden overflow-y-visible">
      <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2 min-w-0">
          {/* Left Side - Mobile Menu + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 min-w-0">
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
                      <Image className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-lg font-playfair font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                      ChitraSethu
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="space-y-2 pt-2">
                  {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className="w-full justify-start space-x-3 text-muted-foreground hover:text-primary hover:bg-muted"
                        onClick={() => {
                          window.location.href = getRoute(item.name);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Button>
                    );
                  })}
                  <div className="pt-4 border-t">
                    {user && user.userType === 'customer' && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start space-x-3 text-muted-foreground hover:text-primary hover:bg-muted"
                        onClick={() => {
                          navigate('/customer/messages');
                          setMobileMenuOpen(false);
                        }}
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">Messages</span>
                        <Badge variant="destructive" className="ml-auto">2</Badge>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-3 text-muted-foreground hover:text-primary hover:bg-muted"
                      onClick={() => {
                        navigate('/profile');
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
              onClick={() => navigate('/home')}
            >
              <img 
                src="/chitrasethu_logo.png" 
                alt="Chitrasethu Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <h1 className="hidden sm:block text-lg sm:text-2xl font-playfair font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                ChitraSethu
              </h1>
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
                  onClick={() => window.location.href = getRoute(item.name)}
                >
                  <IconComponent className="w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0" />
                  <span className="text-[10px] xl:text-xs font-medium whitespace-normal break-words leading-tight">{item.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Search Bar - Desktop only */}
          <div ref={desktopSearchContainerRef} className="hidden lg:flex items-center mx-1 xl:mx-2 flex-shrink-0 min-w-0 relative z-50">
            <div className="relative w-28 xl:w-36">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 xl:w-4 xl:h-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                ref={desktopSearchInputRef}
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
            {searchOpen && (searchQuery.trim().length >= 1 || searchResults.length > 0) && dropdownPosition && createPortal(
              <div 
                ref={searchDropdownRef}
                className="fixed w-80 bg-popover border rounded-md shadow-lg z-[9999]"
                style={{ 
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  maxHeight: '400px',
                }}
                onMouseDown={(e) => {
                  // Prevent input from losing focus when clicking dropdown
                  e.preventDefault();
                }}
              >
                <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
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

          {/* Mobile Search Bar - Only on mobile, beside notification */}
          <div ref={mobileSearchContainerRef} className="lg:hidden flex items-center flex-1 max-w-[120px] sm:max-w-[160px] min-w-0 relative z-50 mr-1">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
              <Input
                ref={mobileSearchInputRef}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (value.trim().length >= 1) {
                    setSearchOpen(true);
                  } else {
                    setSearchOpen(false);
                  }
                  handleSearch(value);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 1 || searchResults.length > 0) {
                    setSearchOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }
                }}
                className="pl-7 pr-2 h-8 text-xs bg-muted/50 border-none focus:bg-background transition-colors"
                autoComplete="off"
              />
              {searchLoading && (
                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground pointer-events-none" />
              )}
            </div>
            {searchOpen && (searchQuery.trim().length >= 1 || searchResults.length > 0) && dropdownPosition && createPortal(
              <div 
                ref={searchDropdownRef}
                className="fixed w-80 bg-popover border rounded-md shadow-lg z-[9999]"
                style={{ 
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  maxHeight: '400px',
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
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

          {/* Profile Section */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0 min-w-0">
            {/* Messages Icon - Only for customers, hidden on mobile (shown in menu) */}
            {user && user.userType === 'customer' && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hidden lg:flex"
                onClick={() => navigate('/customer/messages')}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  2
                </span>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-background"></span>
            </Button>
            
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
                      <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">{user.userType}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.userType}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/requests')}>
                    My Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/bookings')}>
                    My Bookings
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

export default Navbar;
