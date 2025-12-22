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
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - 20% */}
          <div className="lg:col-span-1">
            <LeftSidebar />
          </div>
          
          {/* Main Feed - 60% */}
          <div className="lg:col-span-3">
            {/* Create Post Button */}
            <div className="mb-6">
              <Button
                onClick={() => setCreatePostOpen(true)}
                className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Post
              </Button>
            </div>

            <MainFeed refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Sidebar - 20% */}
          <div className="lg:col-span-1">
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