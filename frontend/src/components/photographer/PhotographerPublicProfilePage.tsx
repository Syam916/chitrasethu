import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Calendar,
  Award,
  Star,
  Users,
  Image as ImageIcon,
  Briefcase,
} from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import authService from '@/services/auth.service';
import {
  photographerStats,
  photographerBookings,
  photographerMoodBoards,
  photographerCollaborations,
} from '@/data/photographerDummyData';
import profileAvatar from '@/assets/photographer-1.jpg';
import coverPhoto from '@/assets/wedding-collection.jpg';

const PhotographerPublicProfilePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const profileDetails = {
    name: 'Aarav Mehta',
    specialization: 'Wedding & Lifestyle Photographer',
    location: 'Mumbai, India',
    email: 'hello@aaravstudios.com',
    phone: '+91 98765 43210',
    website: 'www.aaravstudios.com',
    instagram: '@aaravstudios',
    bio: `Award-winning photographer with 9+ years of experience in capturing weddings,
    editorial fashion shoots, and lifestyle stories. Featured in National Wedding Magazine,
    Harper’s Bazaar Brides, and Vogue India.`,
    experience: '9 years experience · 450+ weddings · 120+ fashion editorials',
    services: [
      { label: 'Wedding Stories', price: '₹45,000+', duration: '8-12 hours coverage' },
      { label: 'Pre-Wedding Films', price: '₹25,000+', duration: '4-6 hours coverage' },
      { label: 'Lifestyle Portraits', price: '₹15,000+', duration: '2-4 hours coverage' },
    ],
    testimonials: [
      {
        name: 'Kavya & Karthik',
        quote:
          'Every emotion, every candid smile was beautifully preserved. The album still makes us cry happy tears!',
      },
      {
        name: 'Fashion Forward Magazine',
        quote:
          'Aarav brings storytelling to life. His editorial sense and attention to detail elevate every frame.',
      },
    ],
  };

  const recentBookings = photographerBookings.slice(0, 3);
  const featuredBoards = photographerMoodBoards.slice(0, 3);
  const openCollaborations = photographerCollaborations.slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="relative">
        <div
          className="h-64 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${coverPhoto})` }}
        >
          <div className="h-full w-full bg-black/50 backdrop-blur-sm"></div>
        </div>
        <div className="container mx-auto px-4">
          <Card className="-mt-24 glass-effect border-border/40">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-24 h-24 ring-4 ring-primary/30">
                    <AvatarImage src={profileAvatar} alt={profileDetails.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xl">
                      AM
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-playfair font-bold">{profileDetails.name}</h1>
                      <Badge className="bg-primary/90">Top Rated</Badge>
                      <Badge variant="outline">360° Verified</Badge>
                    </div>
                    <p className="text-muted-foreground">{profileDetails.specialization}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {profileDetails.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" /> Winner: Wedding Photographer of the Year 2024
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" /> 4.9/5 · 180 verified reviews
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-gradient-to-r from-primary to-primary-glow">
                    <Calendar className="w-4 h-4 mr-2" />
                    Check Availability
                  </Button>
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Inquiry
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Studio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        {/* About + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-effect">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{profileDetails.bio}</p>
              <Separator />
              <p className="text-sm text-muted-foreground">{profileDetails.experience}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h3 className="text-2xl font-semibold">{photographerStats.totalBookings}</h3>
                  <p className="text-sm text-muted-foreground">Bookings Completed</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h3 className="text-2xl font-semibold">{photographerStats.revenue}</h3>
                  <p className="text-sm text-muted-foreground">Revenue Earned</p>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <h3 className="text-2xl font-semibold">{photographerStats.clientSatisfaction}%</h3>
                  <p className="text-sm text-muted-foreground">Client Satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {profileDetails.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {profileDetails.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> {profileDetails.website}
                </div>
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> {profileDetails.instagram}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Service Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileDetails.services.map((service) => (
                  <div key={service.label} className="p-3 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{service.label}</span>
                      <span className="text-primary font-semibold">{service.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{service.duration}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Portfolio & Mood Boards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Featured Mood Boards</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/photographer/mood-boards')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredBoards.map((board) => (
                <div key={board.boardId} className="space-y-2">
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img src={board.coverImage} alt={board.boardName} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-sm font-semibold">{board.boardName}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {board.imageCount} references · {board.category}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Collaborations</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/photographer/community/collaborations')}
              >
                Explore
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {openCollaborations.map((collab) => (
                <div key={collab.collaborationId} className="p-4 rounded-lg border border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{collab.title}</p>
                      <p className="text-xs text-muted-foreground">{collab.location}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {collab.collaborationType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{collab.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {collab.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-2xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Testimonials & Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-effect">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Client Stories</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/photographer/bookings')}>
                View Bookings
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileDetails.testimonials.map((testimonial) => (
                <div key={testimonial.name} className="p-4 rounded-lg border border-border/50 bg-muted/10 space-y-2">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    “{testimonial.quote}”
                  </p>
                  <p className="text-xs font-semibold text-right">{testimonial.name}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Upcoming Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.bookingId} className="p-3 rounded-lg border border-border/40 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{booking.eventType}</h3>
                    <Badge variant="outline" className="capitalize text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {booking.eventDate} · {booking.eventLocation}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {booking.customerName}
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    Package: {booking.packageName} · ₹{booking.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhotographerPublicProfilePage;


