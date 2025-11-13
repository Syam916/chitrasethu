import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, MapPin, DollarSign, Clock, Users, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import { photographerJobPostings } from '@/data/photographerDummyData';

const PhotographerJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(photographerJobPostings);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'moderate': return 'bg-yellow-500';
      case 'flexible': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.jobDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const jobCategories = [
    'Video Editor',
    'Photography Assistant',
    'Drone Operator',
    'Photo Retoucher',
    'Second Shooter',
    'Lighting Assistant',
    'Makeup Artist',
    'Stylist'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <PhotographerNavbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Jobs & <span className="gradient-text">Collaborations</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Post job opportunities or find talented professionals to collaborate with
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="post">Post a Job</TabsTrigger>
          </TabsList>

          {/* Browse Jobs Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {jobCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{filteredJobs.length} Jobs Available</h2>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.jobId} className="glass-effect hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Job Poster Info */}
                      <div className="flex items-start space-x-4 lg:w-48">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={job.posterAvatar} alt={job.postedBy} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-xs">
                            {job.postedBy.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{job.postedBy}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recent'}
                          </p>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">{job.jobTitle}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{job.category}</Badge>
                              <Badge className={`${getUrgencyColor(job.urgency)} text-white`}>
                                {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)}
                              </Badge>
                              <Badge variant="outline">{job.status}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              ₹{job.budgetMin.toLocaleString()} - ₹{job.budgetMax.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">{job.duration}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">{job.jobDescription}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{job.applicationCount} applications</span>
                          </div>
                        </div>

                        {/* Required Skills */}
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button>Apply Now</Button>
                          <Button variant="outline">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No jobs found matching your criteria</p>
                <Button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Post Job Tab */}
          <TabsContent value="post">
            <Card className="glass-effect max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Post a Job Opportunity</CardTitle>
                <p className="text-muted-foreground">Find talented professionals to collaborate with</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle"
                      placeholder="e.g., Need Video Editor for Wedding"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobCategories.map(cat => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                    <Input 
                      id="budgetMin"
                      type="number"
                      placeholder="15000"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                    <Input 
                      id="budgetMax"
                      type="number"
                      placeholder="25000"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input 
                      id="duration"
                      placeholder="e.g., 5 days"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      placeholder="e.g., Remote / Mumbai"
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe the job requirements, deliverables, and any specific details..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="skills">Required Skills (comma separated)</Label>
                    <Input 
                      id="skills"
                      placeholder="e.g., Premiere Pro, Color Grading, Audio Mixing"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Save as Draft</Button>
                  <Button className="bg-gradient-to-r from-primary to-primary-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PhotographerJobsPage;

