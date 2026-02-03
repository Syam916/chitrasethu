import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import NavbarIntegrated from './home/NavbarIntegrated';
import HeroSection from './home/HeroSection';
import LeftSidebar from './home/LeftSidebar';
import MainFeed from './home/MainFeed';
import RightSidebar from './home/RightSidebar';
import CreatePostDialog from './home/CreatePostDialog';
import { Button } from './ui/button';
import authService from '@/services/auth.service';

const HomePage = () => {
  const navigate = useNavigate();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handlePostCreated = () => {
    // Trigger feed refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navbar */}
      <NavbarIntegrated />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Layout */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Left Sidebar - 20% - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <LeftSidebar />
          </div>
          
          {/* Main Feed - 60% - Full width on mobile */}
          <div className="lg:col-span-3">
            {/* Create Post Button */}
            <div className="mb-4 sm:mb-6">
              <Button
                onClick={() => setCreatePostOpen(true)}
                className="w-full py-4 sm:py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create New Post
              </Button>
            </div>

            <MainFeed refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Sidebar - 20% - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;