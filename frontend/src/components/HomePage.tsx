import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarIntegrated from './home/NavbarIntegrated';
import HeroSection from './home/HeroSection';
import LeftSidebar from './home/LeftSidebar';
import MainFeed from './home/MainFeed';
import RightSidebar from './home/RightSidebar';
import CreatePostDialog from './home/CreatePostDialog';
import authService from '@/services/auth.service';

const HomePage = () => {
  const navigate = useNavigate();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postMode, setPostMode] = useState<'photo' | 'video'>('photo');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const user = authService.getStoredUser();
  const isPhotographer = user?.userType === 'photographer';

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
            <MainFeed refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Sidebar - 20% - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <RightSidebar 
              onCreatePostClick={isPhotographer ? () => {
                setPostMode('photo');
                setCreatePostOpen(true);
              } : undefined}
              onUploadVideoClick={isPhotographer ? () => {
                setPostMode('video');
                setCreatePostOpen(true);
              } : undefined}
              onCreateEventClick={isPhotographer ? () => {
                setPostMode('photo');
                setCreatePostOpen(true);
              } : undefined}
            />
          </div>
        </div>
      </div>

      {/* Create Post Dialog - Only for Photographers */}
      {isPhotographer && (
        <CreatePostDialog
          open={createPostOpen}
          onOpenChange={setCreatePostOpen}
          onPostCreated={handlePostCreated}
          initialMode={postMode}
        />
      )}
    </div>
  );
};

export default HomePage;