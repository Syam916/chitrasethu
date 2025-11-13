import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Upload,
  Plus,
  Tag,
  IndianRupee,
  FileText,
} from 'lucide-react';
import PhotographerNavbar from './PhotographerNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import authService from '@/services/auth.service';

const PhotographerCreateEventSessionPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />

      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Create <span className="gradient-text">Event Session</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Set up a new event gallery, collect client requirements, and invite your team in one seamless workflow.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-effect">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" /> Event Name
                </label>
                <Input placeholder="e.g., Meera & Arjun Wedding" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" /> Event Date
                </label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" /> Start Time
                </label>
                <Input type="time" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" /> Location
                </label>
                <Input placeholder="Venue / Studio / City" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" /> Client Names
                </label>
                <Input placeholder="Meera & Arjun" />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <IndianRupee className="w-4 h-4" /> Package Budget
                </label>
                <Input placeholder="₹35,000" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4" /> Event Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Wedding', 'Pre-Wedding', 'Corporate', 'Fashion', 'Portrait'].map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" /> Client Brief
                </label>
                <Textarea rows={4} placeholder="Describe the expectations, style preference, deliverables..." />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                Create a session and send invites to your team. Upload shot lists, attach reference mood boards, and
                generate a client portal link instantly.
              </p>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add Shot List
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Attach Vendor Details
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Link Mood Board
              </Button>
              <div className="p-4 rounded-lg border border-border/40 bg-muted/10">
                <p className="text-xs">
                  Once the session is saved, QR codes and client gallery links will be auto-generated. You can manage access
                  and privacy settings from the Photo Booth section.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Upload Checklist</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="p-4 border border-border/40 rounded-lg bg-muted/10">
              <h3 className="font-semibold text-foreground mb-2">RAW Upload</h3>
              <p>Upload RAW shots directly from your camera or external drive.</p>
              <Button variant="ghost" size="sm" className="mt-3 pl-0">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
            <div className="p-4 border border-border/40 rounded-lg bg-muted/10">
              <h3 className="font-semibold text-foreground mb-2">Select Editors</h3>
              <p>Assign in-house editors or external collaborators for post-production.</p>
              <Button variant="ghost" size="sm" className="mt-3 pl-0">
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
            </div>
            <div className="p-4 border border-border/40 rounded-lg bg-muted/10">
              <h3 className="font-semibold text-foreground mb-2">Deliverables</h3>
              <p>Set album type, number of edited photos, and delivery deadlines.</p>
              <Button variant="ghost" size="sm" className="mt-3 pl-0">
                <FileText className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/photographer/event-photos')}>
            Cancel
          </Button>
          <Button className="bg-gradient-to-r from-primary to-primary-glow">
            Save Session
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerCreateEventSessionPage;


