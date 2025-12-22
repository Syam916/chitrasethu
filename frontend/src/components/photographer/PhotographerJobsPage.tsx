import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, MapPin, DollarSign, Clock, Users, Search, Filter, AlertCircle, CheckCircle2, X, BarChart3, Eye, Calendar, Check, XCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import PhotographerNavbar from './PhotographerNavbar';
import authService from '@/services/auth.service';
import jobService, { JobPost, JobApplicationData, JobAnalysis } from '@/services/job.service';

interface JobPostForm {
  job_title: string;
  job_description: string;
  category: string;
  budget_min: string;
  budget_max: string;
  duration: string;
  urgency: 'urgent' | 'moderate' | 'flexible' | '';
  location: string;
  required_skills: string;
  // Optional fields
  application_deadline: string;
  max_collaborators: string;
  is_remote: boolean;
  // System-managed fields (not in form, handled by backend):
  // view_count: auto-incremented when job is viewed
  // applications_count: auto-incremented when applications are submitted
  // archived_at: set when job is archived (soft delete)
}

const PhotographerJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof JobPostForm, string>>>({});
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  
  // Analysis state
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobAnalysis['recentApplications'][0] | null>(null);
  const [applicationDetailsOpen, setApplicationDetailsOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Application form state
  const [applicationForm, setApplicationForm] = useState<JobApplicationData>({
    applicant_name: '',
    applicant_email: '',
    applicant_phone: '',
    cover_letter: '',
    portfolio_url: '',
    experience_years: undefined,
    expected_rate: undefined,
    availability_start: '',
    availability_end: '',
    additional_info: ''
  });
  
  const [jobForm, setJobForm] = useState<JobPostForm>({
    job_title: '',
    job_description: '',
    category: '',
    budget_min: '',
    budget_max: '',
    duration: '',
    urgency: '',
    location: '',
    required_skills: '',
    application_deadline: '',
    max_collaborators: '',
    is_remote: false
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const fetchedJobs = await jobService.getAll({
          category: filterCategory !== 'all' ? filterCategory : undefined,
          search: searchQuery || undefined,
        });
        setJobs(fetchedJobs);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        // On error, keep empty array or show error message
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [filterCategory, searchQuery]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'moderate': return 'bg-yellow-500';
      case 'flexible': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Filter jobs client-side (API already filters by category and search, but we do additional filtering)
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
                         job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const handleInputChange = (field: keyof JobPostForm, value: string) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof JobPostForm, string>> = {};

    if (!jobForm.job_title.trim()) {
      errors.job_title = 'Job title is required';
    }

    if (!jobForm.job_description.trim()) {
      errors.job_description = 'Job description is required';
    }

    if (!jobForm.category) {
      errors.category = 'Category is required';
    }

    if (!jobForm.urgency) {
      errors.urgency = 'Urgency level is required';
    }

    if (!jobForm.budget_min || parseInt(jobForm.budget_min) <= 0) {
      errors.budget_min = 'Valid minimum budget is required';
    }

    if (!jobForm.budget_max || parseInt(jobForm.budget_max) <= 0) {
      errors.budget_max = 'Valid maximum budget is required';
    }

    if (jobForm.budget_min && jobForm.budget_max && parseInt(jobForm.budget_min) > parseInt(jobForm.budget_max)) {
      errors.budget_max = 'Maximum budget must be greater than minimum budget';
    }

    if (!jobForm.duration.trim()) {
      errors.duration = 'Duration is required';
    }

    if (!jobForm.location.trim()) {
      errors.location = 'Location is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      // Parse required_skills from comma-separated string to JSON array
      const skillsArray = jobForm.required_skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

      // Prepare data according to job_posts table schema
      const jobPostData = {
        job_title: jobForm.job_title.trim(),
        job_description: jobForm.job_description.trim(),
        category: jobForm.category,
        budget_min: parseInt(jobForm.budget_min),
        budget_max: parseInt(jobForm.budget_max),
        duration: jobForm.duration.trim(),
        urgency: jobForm.urgency as 'urgent' | 'moderate' | 'flexible',
        location: jobForm.location.trim(),
        required_skills: skillsArray,
        // Optional fields
        application_deadline: jobForm.application_deadline || null,
        max_collaborators: jobForm.max_collaborators ? parseInt(jobForm.max_collaborators) : null,
        is_remote: jobForm.is_remote,
      };

      // Call API to create job post
      const createdJob = await jobService.create(jobPostData);
      
      console.log('Job post created successfully:', createdJob);

      // Clear draft from localStorage
      localStorage.removeItem('jobPostDraft');

      // Reset form on success
      setJobForm({
        job_title: '',
        job_description: '',
        category: '',
        budget_min: '',
        budget_max: '',
        duration: '',
        urgency: '',
        location: '',
        required_skills: '',
        application_deadline: '',
        max_collaborators: '',
        is_remote: false
      });
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
      
      // Refresh the jobs list to show the newly posted job
      try {
        const fetchedJobs = await jobService.getAll();
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Error refreshing jobs list:', error);
      }
      
    } catch (error: any) {
      console.error('Error posting job:', error);
      setSubmitError(error.message || 'Failed to post job. Please try again.');
      setTimeout(() => setSubmitError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save form data to localStorage as draft
    localStorage.setItem('jobPostDraft', JSON.stringify(jobForm));
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 2000);
  };

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('jobPostDraft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setJobForm(draftData);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
    
    // Load user info for application form
    const loadUserInfo = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setApplicationForm(prev => ({
            ...prev,
            applicant_name: user.fullName || '',
            applicant_email: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    loadUserInfo();
  }, []);

  // Fetch analysis data
  const fetchAnalysis = async () => {
    try {
      setIsLoadingAnalysis(true);
      const data = await jobService.getAnalysis();
      setAnalysis(data);
    } catch (error: any) {
      console.error('Error fetching analysis:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (job: JobPost) => {
    try {
      const fullJob = await jobService.getById(job.jobId);
      setSelectedJob(fullJob);
      setViewDetailsOpen(true);
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      setSubmitError('Failed to load job details');
    }
  };

  // Handle apply now
  const handleApplyNow = (job: JobPost) => {
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  // Handle view application details
  const handleViewApplication = (application: JobAnalysis['recentApplications'][0]) => {
    setSelectedApplication(application);
    setApplicationDetailsOpen(true);
  };

  // Handle accept application
  const handleAcceptApplication = async (applicationId: number) => {
    try {
      setIsUpdatingStatus(true);
      await jobService.updateApplicationStatus(applicationId, 'accepted');
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setApplicationDetailsOpen(false);
        fetchAnalysis(); // Refresh analysis
      }, 2000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to accept application');
      setTimeout(() => setSubmitError(null), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle reject application
  const handleRejectApplication = async (applicationId: number) => {
    try {
      setIsUpdatingStatus(true);
      await jobService.updateApplicationStatus(applicationId, 'rejected', rejectionReason || undefined);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setApplicationDetailsOpen(false);
        setShowRejectModal(false);
        setRejectionReason('');
        fetchAnalysis(); // Refresh analysis
      }, 2000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to reject application');
      setTimeout(() => setSubmitError(null), 5000);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle application submit
  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsApplying(true);
    setApplyError(null);
    setApplySuccess(false);

    try {
      await jobService.apply(selectedJob.jobId, applicationForm);
      setApplySuccess(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccess(false);
        // Reset form and refresh jobs list
        (async () => {
          try {
            const user = await authService.getCurrentUser();
            setApplicationForm({
              applicant_name: user?.fullName || '',
              applicant_email: user?.email || '',
              applicant_phone: '',
              cover_letter: '',
              portfolio_url: '',
              experience_years: undefined,
              expected_rate: undefined,
              availability_start: '',
              availability_end: '',
              additional_info: ''
            });
          } catch (error) {
            console.error('Error loading user info:', error);
          }
          // Refresh jobs list to update application status
          try {
            const fetchedJobs = await jobService.getAll({
              category: filterCategory !== 'all' ? filterCategory : undefined,
              search: searchQuery || undefined,
            });
            setJobs(fetchedJobs);
          } catch (error) {
            console.error('Error refreshing jobs:', error);
          }
        })();
      }, 2000);
    } catch (error: any) {
      setApplyError(error.message || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

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
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="post">Post a Job</TabsTrigger>
            <TabsTrigger value="analysis" onClick={fetchAnalysis}>Analysis</TabsTrigger>
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
              <h2 className="text-2xl font-semibold">
                {isLoading ? 'Loading...' : `${filteredJobs.length} Jobs Available`}
              </h2>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading jobs...</p>
              </div>
            )}

            {/* Jobs List */}
            {!isLoading && (
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
                              {job.isFilled ? (
                                <Badge className="bg-gray-600 text-white">
                                  Filled
                                </Badge>
                              ) : (
                              <Badge variant="outline">{job.status}</Badge>
                              )}
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

                        {job.isFilled && (
                          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-gray-600">
                            <div className="flex items-center space-x-2">
                              <X className="w-4 h-4 text-gray-600" />
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                This job has been filled
                                {job.maxCollaborators && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({job.acceptedApplicationsCount || 0}/{job.maxCollaborators} positions)
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{job.applicationsCount || 0} applications</span>
                            {job.maxCollaborators && (
                              <span className="text-xs text-muted-foreground">
                                ({job.acceptedApplicationsCount || 0}/{job.maxCollaborators} filled)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Required Skills */}
                        {(() => {
                          // Handle requiredSkills - it might be a string (JSON) or array
                          let skillsArray: string[] = [];
                          if (Array.isArray(job.requiredSkills)) {
                            skillsArray = job.requiredSkills;
                          } else if (typeof job.requiredSkills === 'string') {
                            try {
                              skillsArray = JSON.parse(job.requiredSkills);
                            } catch {
                              skillsArray = [];
                            }
                          }
                          
                          return skillsArray.length > 0 ? (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Required Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {skillsArray.map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {job.isFilled ? (
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-gray-600 text-white px-4 py-2">
                              <X className="w-4 h-4 mr-2" />
                              Job Filled
                            </Badge>
                            {job.maxCollaborators && (
                              <span className="text-sm text-muted-foreground">
                                ({job.acceptedApplicationsCount || 0}/{job.maxCollaborators} positions filled)
                              </span>
                            )}
                          </div>
                        ) : job.hasApplied ? (
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-500 text-white px-4 py-2">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Applied
                            </Badge>
                            {job.applicationStatus && job.applicationStatus !== 'pending' && (
                              <Badge 
                                variant={job.applicationStatus === 'accepted' ? 'default' : 'destructive'}
                                className={job.applicationStatus === 'accepted' ? 'bg-green-600' : ''}
                              >
                                {job.applicationStatus.charAt(0).toUpperCase() + job.applicationStatus.slice(1)}
                              </Badge>
                            )}
                          </div>
                        ) : (
                        <div className="flex space-x-2">
                            <Button onClick={() => handleApplyNow(job)}>Apply Now</Button>
                            <Button variant="outline" onClick={() => handleViewDetails(job)}>View Details</Button>
                        </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredJobs.length === 0 && (
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
              <CardContent>
                {submitSuccess && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Job posted successfully!</span>
                  </div>
                )}
                
                {submitError && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{submitError}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Job Title */}
                    <div className="md:col-span-2">
                      <Label htmlFor="job_title" className="text-sm font-medium">
                        Job Title <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="job_title"
                        value={jobForm.job_title}
                        onChange={(e) => handleInputChange('job_title', e.target.value)}
                        placeholder="e.g., Need Video Editor for Wedding"
                        className={`mt-2 ${formErrors.job_title ? 'border-destructive' : ''}`}
                      />
                      {formErrors.job_title && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.job_title}
                        </p>
                      )}
                    </div>

                    {/* Category */}
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={jobForm.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger className={`mt-2 ${formErrors.category ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.category && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.category}
                        </p>
                      )}
                    </div>

                    {/* Urgency */}
                    <div>
                      <Label htmlFor="urgency" className="text-sm font-medium">
                        Urgency <span className="text-destructive">*</span>
                      </Label>
                      <Select 
                        value={jobForm.urgency} 
                        onValueChange={(value) => handleInputChange('urgency', value as JobPostForm['urgency'])}
                      >
                        <SelectTrigger className={`mt-2 ${formErrors.urgency ? 'border-destructive' : ''}`}>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.urgency && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.urgency}
                        </p>
                      )}
                    </div>

                    {/* Budget Min */}
                    <div>
                      <Label htmlFor="budget_min" className="text-sm font-medium">
                        Budget Min (₹) <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="budget_min"
                        type="number"
                        min="0"
                        value={jobForm.budget_min}
                        onChange={(e) => handleInputChange('budget_min', e.target.value)}
                        placeholder="15000"
                        className={`mt-2 ${formErrors.budget_min ? 'border-destructive' : ''}`}
                      />
                      {formErrors.budget_min && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.budget_min}
                        </p>
                      )}
                    </div>

                    {/* Budget Max */}
                    <div>
                      <Label htmlFor="budget_max" className="text-sm font-medium">
                        Budget Max (₹) <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="budget_max"
                        type="number"
                        min="0"
                        value={jobForm.budget_max}
                        onChange={(e) => handleInputChange('budget_max', e.target.value)}
                        placeholder="25000"
                        className={`mt-2 ${formErrors.budget_max ? 'border-destructive' : ''}`}
                      />
                      {formErrors.budget_max && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.budget_max}
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div>
                      <Label htmlFor="duration" className="text-sm font-medium">
                        Duration <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="duration"
                        value={jobForm.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 5 days"
                        className={`mt-2 ${formErrors.duration ? 'border-destructive' : ''}`}
                      />
                      {formErrors.duration && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.duration}
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium">
                        Location <span className="text-destructive">*</span>
                      </Label>
                      <Input 
                        id="location"
                        value={jobForm.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., Remote / Mumbai"
                        className={`mt-2 ${formErrors.location ? 'border-destructive' : ''}`}
                      />
                      {formErrors.location && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.location}
                        </p>
                      )}
                    </div>

                    {/* Job Description */}
                    <div className="md:col-span-2">
                      <Label htmlFor="job_description" className="text-sm font-medium">
                        Job Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea 
                        id="job_description"
                        value={jobForm.job_description}
                        onChange={(e) => handleInputChange('job_description', e.target.value)}
                        placeholder="Describe the job requirements, deliverables, and any specific details..."
                        rows={4}
                        className={`mt-2 ${formErrors.job_description ? 'border-destructive' : ''}`}
                      />
                      {formErrors.job_description && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {formErrors.job_description}
                        </p>
                      )}
                    </div>

                    {/* Optional Fields Section */}
                    <div className="md:col-span-2 pt-4 border-t border-border">
                      <h3 className="text-lg font-semibold mb-4">Additional Information (Optional)</h3>
                    </div>

                    {/* Application Deadline */}
                    <div>
                      <Label htmlFor="application_deadline" className="text-sm font-medium">
                        Application Deadline
                      </Label>
                      <Input 
                        id="application_deadline"
                        type="date"
                        value={jobForm.application_deadline}
                        onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty for no deadline
                      </p>
                    </div>

                    {/* Max Collaborators */}
                    <div>
                      <Label htmlFor="max_collaborators" className="text-sm font-medium">
                        Max Collaborators
                      </Label>
                      <Input 
                        id="max_collaborators"
                        type="number"
                        min="1"
                        value={jobForm.max_collaborators}
                        onChange={(e) => handleInputChange('max_collaborators', e.target.value)}
                        placeholder="e.g., 3"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum number of collaborators needed
                      </p>
                    </div>

                    {/* Is Remote */}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2 mt-6">
                        <Checkbox
                          id="is_remote"
                          checked={jobForm.is_remote}
                          onCheckedChange={(checked) => setJobForm(prev => ({ ...prev, is_remote: checked === true }))}
                        />
                        <Label htmlFor="is_remote" className="text-sm font-medium cursor-pointer">
                          This is a remote job
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        Check if the job can be done remotely
                      </p>
                    </div>

                    {/* Required Skills */}
                    <div className="md:col-span-2">
                      <Label htmlFor="required_skills" className="text-sm font-medium">
                        Required Skills (comma separated)
                      </Label>
                      <Input 
                        id="required_skills"
                        value={jobForm.required_skills}
                        onChange={(e) => handleInputChange('required_skills', e.target.value)}
                        placeholder="e.g., Premiere Pro, Color Grading, Audio Mixing"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate multiple skills with commas
                      </p>
                    </div>

                    {/* System-Managed Fields Info */}
                    <div className="md:col-span-2 pt-4 border-t border-border">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          <strong>Note:</strong> The following fields are automatically managed by the system and do not need to be set:
                        </p>
                        <ul className="text-xs text-muted-foreground mt-2 ml-4 list-disc space-y-1">
                          <li><strong>view_count</strong>: Automatically incremented when the job is viewed</li>
                          <li><strong>applications_count</strong>: Automatically incremented when applications are submitted</li>
                          <li><strong>archived_at</strong>: Set automatically when the job is archived (soft delete)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t border-border">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      disabled={isSubmitting}
                    >
                      Save as Draft
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-primary to-primary-glow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Post Job
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {isLoadingAnalysis ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading analysis...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="glass-effect">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Jobs</p>
                          <p className="text-3xl font-bold">{analysis.overview.totalJobs}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Applications</p>
                          <p className="text-3xl font-bold">{analysis.overview.totalApplications}</p>
                        </div>
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Views</p>
                          <p className="text-3xl font-bold">{analysis.overview.totalViews}</p>
                        </div>
                        <Eye className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Stats */}
                {analysis.categoryStats.length > 0 && (
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle>Jobs by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.categoryStats.map((stat, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{stat.category}</p>
                              <p className="text-sm text-muted-foreground">{stat.jobCount} jobs</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{stat.totalApplications} applications</p>
                              <p className="text-sm text-muted-foreground">{stat.totalViews} views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Jobs */}
                {analysis.topJobs.length > 0 && (
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle>Top Performing Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.topJobs.map((job) => (
                          <div key={job.jobId} className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold">{job.jobTitle}</h3>
                                <p className="text-sm text-muted-foreground">{job.category}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Posted: {new Date(job.postedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-medium">{job.applicationsCount} applications</p>
                                <p className="text-sm text-muted-foreground">{job.viewCount} views</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Applications */}
                {analysis.recentApplications.length > 0 && (
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle>Applications ({analysis.recentApplications.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysis.recentApplications.map((app) => (
                          <div key={app.applicationId} className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-semibold text-lg">{app.applicantName}</p>
                                  <Badge 
                                    variant={
                                      app.status === 'accepted' ? 'default' : 
                                      app.status === 'rejected' ? 'destructive' : 
                                      'secondary'
                                    }
                                    className={
                                      app.status === 'accepted' ? 'bg-green-500' : 
                                      app.status === 'rejected' ? 'bg-red-500' : 
                                      ''
                                    }
                                  >
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  <Briefcase className="w-3 h-3 inline mr-1" />
                                  {app.jobTitle}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {app.applicantEmail}
                                  </span>
                                  {app.applicantPhone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {app.applicantPhone}
                                    </span>
                                  )}
                                  <span>
                                    {new Date(app.appliedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {app.coverLetter && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {app.coverLetter.substring(0, 150)}...
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewApplication(app)}
                              >
                                View Details
                              </Button>
                              {app.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAcceptApplication(app.applicationId)}
                                    disabled={isUpdatingStatus}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedApplication(app);
                                      setShowRejectModal(true);
                                    }}
                                    disabled={isUpdatingStatus}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No analysis data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Details Modal */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.jobTitle}</DialogTitle>
            <DialogDescription>Full job details and requirements</DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedJob.posterAvatar} alt={selectedJob.postedBy} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white">
                    {selectedJob.postedBy?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedJob.postedBy}</p>
                  {selectedJob.businessName && (
                    <p className="text-sm text-muted-foreground">{selectedJob.businessName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Posted: {new Date(selectedJob.postedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedJob.jobDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedJob.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  <Badge className={`${getUrgencyColor(selectedJob.urgency)} text-white`}>
                    {selectedJob.urgency.charAt(0).toUpperCase() + selectedJob.urgency.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedJob.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedJob.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">
                    ₹{selectedJob.budgetMin.toLocaleString()} - ₹{selectedJob.budgetMax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">{selectedJob.status}</Badge>
                </div>
                {selectedJob.applicationDeadline && (
                  <div>
                    <p className="text-sm text-muted-foreground">Application Deadline</p>
                    <p className="font-medium">
                      {new Date(selectedJob.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedJob.maxCollaborators && (
                  <div>
                    <p className="text-sm text-muted-foreground">Max Collaborators</p>
                    <p className="font-medium">{selectedJob.maxCollaborators}</p>
                  </div>
                )}
              </div>

              {(() => {
                let skillsArray: string[] = [];
                if (Array.isArray(selectedJob.requiredSkills)) {
                  skillsArray = selectedJob.requiredSkills;
                } else if (typeof selectedJob.requiredSkills === 'string') {
                  try {
                    skillsArray = JSON.parse(selectedJob.requiredSkills);
                  } catch {
                    skillsArray = [];
                  }
                }
                
                return skillsArray.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {skillsArray.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {selectedJob.isFilled && (
                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-gray-600">
                  <div className="flex items-center space-x-2">
                    <X className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">This job has been filled</p>
                      {selectedJob.maxCollaborators && (
                        <p className="text-sm text-muted-foreground">
                          All {selectedJob.maxCollaborators} position(s) have been filled. This job is no longer accepting applications.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span><Eye className="w-4 h-4 inline mr-1" />{selectedJob.viewCount} views</span>
                  <span><Users className="w-4 h-4 inline mr-1" />{selectedJob.applicationsCount} applications</span>
                  {selectedJob.maxCollaborators && (
                    <span className="text-xs">
                      ({selectedJob.acceptedApplicationsCount || 0}/{selectedJob.maxCollaborators} positions filled)
                    </span>
                  )}
                </div>
                {selectedJob.isFilled ? (
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className="bg-gray-600 text-white px-4 py-2">
                      <X className="w-4 h-4 mr-2" />
                      Job Filled
                    </Badge>
                    {selectedJob.maxCollaborators && (
                      <p className="text-sm text-muted-foreground">
                        {selectedJob.acceptedApplicationsCount || 0} of {selectedJob.maxCollaborators} positions filled
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This job is no longer accepting applications
                    </p>
                  </div>
                ) : selectedJob.hasApplied ? (
                  <Badge className="bg-green-500 text-white px-4 py-2">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Applied
                    {selectedJob.applicationStatus && selectedJob.applicationStatus !== 'pending' && (
                      <span className="ml-2">
                        ({selectedJob.applicationStatus.charAt(0).toUpperCase() + selectedJob.applicationStatus.slice(1)})
                      </span>
                    )}
                  </Badge>
                ) : (
                  <Button onClick={() => { setViewDetailsOpen(false); handleApplyNow(selectedJob); }}>
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Apply Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.jobTitle}</DialogTitle>
            <DialogDescription>Fill out the form below to apply for this job</DialogDescription>
          </DialogHeader>
          
          {applySuccess && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Application submitted successfully! An email has been sent to the job creator.</span>
            </div>
          )}
          
          {applyError && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{applyError}</span>
            </div>
          )}

          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="applicant_name">Full Name *</Label>
                <Input
                  id="applicant_name"
                  value={applicationForm.applicant_name}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="applicant_email">Email *</Label>
                <Input
                  id="applicant_email"
                  type="email"
                  value={applicationForm.applicant_email}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="applicant_phone">Phone</Label>
                <Input
                  id="applicant_phone"
                  type="tel"
                  value={applicationForm.applicant_phone}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicant_phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={applicationForm.experience_years || ''}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, experience_years: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label htmlFor="expected_rate">Expected Rate (₹)</Label>
                <Input
                  id="expected_rate"
                  type="number"
                  min="0"
                  value={applicationForm.expected_rate || ''}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, expected_rate: e.target.value ? parseFloat(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={applicationForm.portfolio_url}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div>
                <Label htmlFor="availability_start">Available From</Label>
                <Input
                  id="availability_start"
                  type="date"
                  value={applicationForm.availability_start}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, availability_start: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="availability_end">Available Until</Label>
                <Input
                  id="availability_end"
                  type="date"
                  value={applicationForm.availability_end}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, availability_end: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cover_letter">Cover Letter</Label>
              <Textarea
                id="cover_letter"
                rows={4}
                value={applicationForm.cover_letter}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, cover_letter: e.target.value }))}
                placeholder="Tell the job creator why you're a good fit for this position..."
              />
            </div>
            
            <div>
              <Label htmlFor="additional_info">Additional Information</Label>
              <Textarea
                id="additional_info"
                rows={3}
                value={applicationForm.additional_info}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, additional_info: e.target.value }))}
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isApplying}>
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Application Details Modal */}
      <Dialog open={applicationDetailsOpen} onOpenChange={setApplicationDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Full application information</DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedApplication.applicantName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedApplication.jobTitle}</p>
                  <Badge 
                    variant={
                      selectedApplication.status === 'accepted' ? 'default' : 
                      selectedApplication.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    }
                    className={
                      selectedApplication.status === 'accepted' ? 'bg-green-500 mt-2' : 
                      selectedApplication.status === 'rejected' ? 'bg-red-500 mt-2' : 
                      'mt-2'
                    }
                  >
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedApplication.applicantEmail}
                  </p>
                </div>
                {selectedApplication.applicantPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedApplication.applicantPhone}
                    </p>
                  </div>
                )}
                {selectedApplication.experienceYears && (
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedApplication.experienceYears} years</p>
                  </div>
                )}
                {selectedApplication.expectedRate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Rate</p>
                    <p className="font-medium">₹{selectedApplication.expectedRate.toLocaleString()}</p>
                  </div>
                )}
                {selectedApplication.availabilityStart && (
                  <div>
                    <p className="text-sm text-muted-foreground">Available From</p>
                    <p className="font-medium">{new Date(selectedApplication.availabilityStart).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedApplication.availabilityEnd && (
                  <div>
                    <p className="text-sm text-muted-foreground">Available Until</p>
                    <p className="font-medium">{new Date(selectedApplication.availabilityEnd).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-semibold mb-2">Cover Letter</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}

              {selectedApplication.portfolioUrl && (
                <div>
                  <h4 className="font-semibold mb-2">Portfolio</h4>
                  <a 
                    href={selectedApplication.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {selectedApplication.portfolioUrl}
                  </a>
                </div>
              )}

              {selectedApplication.additionalInfo && (
                <div>
                  <h4 className="font-semibold mb-2">Additional Information</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {selectedApplication.additionalInfo}
                  </p>
                </div>
              )}

              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setApplicationDetailsOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    disabled={isUpdatingStatus}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAcceptApplication(selectedApplication.applicationId)}
                    disabled={isUpdatingStatus}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Application Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? An email will be sent to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejection_reason"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Optionally provide feedback to the applicant..."
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be included in the rejection email sent to the applicant.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedApplication) {
                    handleRejectApplication(selectedApplication.applicationId);
                  }
                }}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotographerJobsPage;

