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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
