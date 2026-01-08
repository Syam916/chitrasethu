import { API_ENDPOINTS, getAuthHeader, handleApiError } from '../config/api';

export interface JobPost {
  jobId: number;
  photographerId: number;
  postedBy?: string;
  businessName?: string;
  posterAvatar?: string;
  jobTitle: string;
  jobDescription: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  duration: string;
  urgency: 'urgent' | 'moderate' | 'flexible';
  location: string;
  requiredSkills: string[] | any;
  applicationDeadline?: string | null;
  maxCollaborators?: number | null;
  isRemote: boolean;
  status: 'open' | 'closed' | 'filled';
  viewCount: number;
  applicationsCount: number;
  postedAt: string;
  // Application status
  hasApplied?: boolean;
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
  appliedAt?: string | null;
  // Filled status
  isFilled?: boolean;
  acceptedApplicationsCount?: number;
}

export interface CreateJobPostData {
  job_title: string;
  job_description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  duration: string;
  urgency: 'urgent' | 'moderate' | 'flexible';
  location: string;
  required_skills: string[];
  application_deadline?: string | null;
  max_collaborators?: number | null;
  is_remote: boolean;
}

export interface JobApplicationData {
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  cover_letter?: string;
  portfolio_url?: string;
  experience_years?: number;
  expected_rate?: number;
  availability_start?: string;
  availability_end?: string;
  additional_info?: string;
}

export interface JobAnalysis {
  overview: {
    totalJobs: number;
    openJobs: number;
    closedJobs: number;
    totalViews: number;
    totalApplications: number;
    avgApplicationsPerJob: number;
  };
  categoryStats: Array<{
    category: string;
    jobCount: number;
    totalApplications: number;
    totalViews: number;
  }>;
  recentApplications: Array<{
    applicationId: number;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    coverLetter?: string;
    portfolioUrl?: string;
    experienceYears?: number;
    expectedRate?: number;
    availabilityStart?: string;
    availabilityEnd?: string;
    additionalInfo?: string;
    status: string;
    jobTitle: string;
    jobId: number;
    appliedAt: string;
  }>;
  topJobs: Array<{
    jobId: number;
    jobTitle: string;
    category: string;
    applicationsCount: number;
    viewCount: number;
    postedAt: string;
  }>;
}

class JobService {
  // Create a new job post
  async create(data: CreateJobPostData): Promise<JobPost> {
    try {
      const response = await fetch(API_ENDPOINTS.JOBS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create job post');
      }

      return result.data.jobPost;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get all job posts
  async getAll(filters?: {
    category?: string;
    urgency?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<JobPost[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = `${API_ENDPOINTS.JOBS.LIST}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch job posts');
      }

      return result.data.jobPosts;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get job post by ID
  async getById(id: number): Promise<JobPost> {
    try {
      const response = await fetch(API_ENDPOINTS.JOBS.DETAIL(id), {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch job post');
      }

      return result.data.jobPost;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Apply for a job
  async apply(jobId: number, data: JobApplicationData): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.JOBS.APPLY(jobId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit application');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Get job analysis
  async getAnalysis(): Promise<JobAnalysis> {
    try {
      const response = await fetch(API_ENDPOINTS.JOBS.ANALYSIS, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch job analysis');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  // Update application status (accept/reject)
  async updateApplicationStatus(applicationId: number, status: 'accepted' | 'rejected', rejectionReason?: string): Promise<any> {
    try {
      const response = await fetch(API_ENDPOINTS.JOBS.UPDATE_APPLICATION_STATUS(applicationId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status, rejectionReason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update application status');
      }

      return result.data;
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new JobService();

