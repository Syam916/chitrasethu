import React from 'react';
import Navbar from './home/Navbar';
import HeroSection from './home/HeroSection';
import LeftSidebar from './home/LeftSidebar';
import MainFeed from './home/MainFeed';
import RightSidebar from './home/RightSidebar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navbar */}
      <Navbar />
      
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
            <MainFeed />
          </div>
          
          {/* Right Sidebar - 20% */}
          <div className="lg:col-span-1">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;