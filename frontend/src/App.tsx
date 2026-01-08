import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import EventPhotos from "./pages/EventPhotos";
import MoodBoard from "./pages/MoodBoard";
import Requests from "./pages/Requests";
import CommunityBuzz from "./pages/CommunityBuzz";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import LoginPageIntegrated from "./components/LoginPageIntegrated";
import RegisterPageIntegrated from "./components/RegisterPageIntegrated";
import TestConnection from "./pages/TestConnection";
import ProfileSettings from "./pages/ProfileSettings";

// Photographer Routes
import PhotographerHome from "./pages/photographer/Home";
import PhotographerRequests from "./pages/photographer/Requests";
import PhotographerJobs from "./pages/photographer/Jobs";
import PhotographerBookings from "./pages/photographer/Bookings";
import PhotographerPhotoBooth from "./pages/photographer/PhotoBooth";
import PhotographerMaps from "./pages/photographer/Maps";
import PhotographerMessages from "./pages/photographer/Messages";
import PhotographerProfileEdit from "./pages/photographer/ProfileEdit";
import PhotographerCommunityBuzz from "./pages/photographer/CommunityBuzz";
import PhotographerProfilePublic from "./pages/photographer/ProfilePublic";
import PhotographerEventPhotos from "./pages/photographer/EventPhotos";
import PhotographerEventSessionCreate from "./pages/photographer/EventSessionCreate";
import PhotographerMoodBoards from "./pages/photographer/MoodBoards";
import PhotographerMoodBoardCreate from "./pages/photographer/MoodBoardCreate";
import PhotographerMoodBoardCreateCustom from "./pages/photographer/MoodBoardCreateCustom";
import PhotographerMoodBoardDetail from "./pages/photographer/MoodBoardDetail";
import PhotographerMoodBoardEdit from "./pages/photographer/MoodBoardEdit";
import PhotographerCommunity from "./pages/photographer/Community";
import PhotographerCommunityCollaborations from "./pages/photographer/CommunityCollaborations";

// Customer Routes
import CustomerMessages from "./pages/customer/Messages";
import PublicGallery from "./pages/PublicGallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPageIntegrated />} />
          <Route path="/login" element={<LoginPageIntegrated />} />
          <Route path="/register" element={<RegisterPageIntegrated />} />
          <Route path="/test" element={<TestConnection />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/event-photos" element={<EventPhotos />} />
          <Route path="/mood-board" element={<MoodBoard />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/community-buzz" element={<CommunityBuzz />} />
          
          {/* Customer Routes */}
          <Route path="/customer/messages" element={<CustomerMessages />} />
          
          {/* Public Routes */}
          <Route path="/gallery/:qrCode" element={<PublicGallery />} />
          
          {/* Photographer Routes */}
        <Route path="/photographer/home" element={<PhotographerHome />} />
        <Route path="/photographer/requests" element={<PhotographerRequests />} />
        <Route path="/photographer/community-buzz" element={<PhotographerCommunityBuzz />} />
        <Route path="/photographer/jobs" element={<PhotographerJobs />} />
        <Route path="/photographer/bookings" element={<PhotographerBookings />} />
        <Route path="/photographer/photo-booth" element={<PhotographerPhotoBooth />} />
        <Route path="/photographer/maps" element={<PhotographerMaps />} />
        <Route path="/photographer/messages" element={<PhotographerMessages />} />
        <Route path="/photographer/profile/edit" element={<PhotographerProfileEdit />} />
        <Route path="/photographer/profile/:id" element={<PhotographerProfilePublic />} />
        <Route path="/photographer/profile/public" element={<PhotographerProfilePublic />} />
        <Route path="/photographer/event-photos" element={<PhotographerEventPhotos />} />
        <Route path="/photographer/event-photos/create" element={<PhotographerEventSessionCreate />} />
        <Route path="/photographer/mood-boards" element={<PhotographerMoodBoards />} />
        <Route path="/photographer/mood-boards/create" element={<PhotographerMoodBoardCreate />} />
        <Route path="/photographer/mood-boards/create/custom" element={<PhotographerMoodBoardCreateCustom />} />
        <Route path="/photographer/mood-boards/:boardId/edit" element={<PhotographerMoodBoardEdit />} />
        <Route path="/photographer/mood-boards/:boardId" element={<PhotographerMoodBoardDetail />} />
        <Route path="/photographer/community" element={<PhotographerCommunity />} />
        <Route path="/photographer/community/collaborations" element={<PhotographerCommunityCollaborations />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
