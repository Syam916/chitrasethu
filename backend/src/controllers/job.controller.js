import { query } from '../config/database.js';
import { sendJobApplicationEmail, sendApplicationConfirmationEmail, sendApplicationAcceptedEmail, sendApplicationRejectedEmail } from '../utils/email.service.js';

// Create a new job post
export const createJobPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if user is a photographer
    console.log(`Job post creation attempt - userId: ${userId}, userType: ${userType}`);
    
    if (userType !== 'photographer') {
      console.log(`User ${userId} is not a photographer (userType: ${userType})`);
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can post jobs. Please ensure your account is set up as a photographer.'
      });
    }

    // Get photographer_id from user_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );
    
    console.log(`Photographer record lookup for user_id ${userId}: ${photographerResult.length} record(s) found`);

    let photographerId;
    
    if (photographerResult.length === 0) {
      // User is marked as photographer but doesn't have a photographer profile
      // Create a basic photographer profile automatically
      console.log(`Creating photographer profile for user_id: ${userId}`);
      
      const newPhotographerResult = await query(
        `INSERT INTO photographers (user_id, specialties, is_active)
         VALUES ($1, $2, $3)
         RETURNING photographer_id`,
        [userId, JSON.stringify([]), true]
      );

      if (newPhotographerResult.length === 0) {
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create photographer profile. Please contact support.'
        });
      }

      photographerId = newPhotographerResult[0].photographer_id;
      console.log(`Created photographer profile with photographer_id: ${photographerId}`);
    } else {
      photographerId = photographerResult[0].photographer_id;
    }

    const {
      job_title,
      job_description,
      category,
      budget_min,
      budget_max,
      duration,
      urgency,
      location,
      required_skills,
      application_deadline,
      max_collaborators,
      is_remote
    } = req.body;

    // Validate required fields
    if (!job_title || !job_description || !category || !urgency || !location || !duration) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: job_title, job_description, category, urgency, location, duration'
      });
    }

    if (!budget_min || !budget_max || parseInt(budget_min) <= 0 || parseInt(budget_max) <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid budget_min and budget_max are required'
      });
    }

    if (parseInt(budget_min) > parseInt(budget_max)) {
      return res.status(400).json({
        status: 'error',
        message: 'budget_max must be greater than budget_min'
      });
    }

    // Prepare required_skills as JSONB
    const skillsJson = required_skills && Array.isArray(required_skills) 
      ? JSON.stringify(required_skills) 
      : JSON.stringify([]);

    // Insert job post into database
    // Note: The table has both 'title' and 'job_title' columns - we'll insert into both
    const result = await query(
      `INSERT INTO job_posts (
        photographer_id,
        posted_by_user_id,
        title,
        job_title,
        job_description,
        category,
        budget_min,
        budget_max,
        duration,
        urgency,
        location,
        required_skills,
        application_deadline,
        max_collaborators,
        is_remote,
        status,
        view_count,
        applications_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        photographerId,
        userId, // posted_by_user_id
        job_title, // title column (required)
        job_title, // job_title column
        job_description,
        category,
        parseInt(budget_min),
        parseInt(budget_max),
        duration,
        urgency,
        location,
        skillsJson,
        application_deadline || null,
        max_collaborators ? parseInt(max_collaborators) : null,
        is_remote || false,
        'open',
        0, // view_count default
        0  // applications_count default
      ]
    );

    const jobPost = result[0];

    res.status(201).json({
      status: 'success',
      message: 'Job post created successfully',
      data: {
        jobPost: {
          jobId: jobPost.job_id,
          photographerId: jobPost.photographer_id,
          jobTitle: jobPost.job_title,
          jobDescription: jobPost.job_description,
          category: jobPost.category,
          budgetMin: jobPost.budget_min,
          budgetMax: jobPost.budget_max,
          duration: jobPost.duration,
          urgency: jobPost.urgency,
          location: jobPost.location,
          requiredSkills: jobPost.required_skills,
          applicationDeadline: jobPost.application_deadline,
          maxCollaborators: jobPost.max_collaborators,
          isRemote: jobPost.is_remote,
          status: jobPost.status,
          viewCount: jobPost.view_count,
          applicationsCount: jobPost.applications_count,
          createdAt: jobPost.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create job post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create job post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all job posts
export const getAllJobPosts = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;

    // Only photographers can view job posts (this is a photographer collaboration marketplace)
    if (!userId || userType !== 'photographer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can view job posts. This is a photographer collaboration marketplace.'
      });
    }

    const { category, urgency, location, search, limit = 50, offset = 0 } = req.query;

    let sql = `
      SELECT jp.*, 
             p.business_name,
             up.full_name,
             up.avatar_url
      FROM job_posts jp
      JOIN photographers p ON jp.photographer_id = p.photographer_id
      JOIN users u ON p.user_id = u.user_id
      JOIN user_profiles up ON u.user_id = up.user_id
      WHERE jp.status IN ('open', 'filled') AND jp.archived_at IS NULL
    `;

    const params = [];
    let paramIndex = 1;

    // Exclude jobs created by the current photographer (they can see their own jobs in the analysis dashboard)
    sql += ` AND jp.posted_by_user_id != $${paramIndex}`;
    params.push(userId);
    paramIndex++;

    if (category) {
      sql += ` AND jp.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (urgency) {
      sql += ` AND jp.urgency = $${paramIndex}`;
      params.push(urgency);
      paramIndex++;
    }

    if (location) {
      sql += ` AND jp.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (jp.job_title ILIKE $${paramIndex} OR jp.job_description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY jp.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const jobPosts = await query(sql, params);

    // Check if user has applied to any of these jobs
    let userApplications = [];
    if (userId) {
      const jobIds = jobPosts.map(jp => jp.job_id);
      if (jobIds.length > 0) {
        const applicationsResult = await query(
          `SELECT job_id, status, created_at 
           FROM job_applications 
           WHERE applicant_id = $1 AND job_id = ANY($2)`,
          [userId, jobIds]
        );
        userApplications = applicationsResult;
      }
    }

    // Check accepted applications count for each job to determine if filled
    const jobIds = jobPosts.map(jp => jp.job_id);
    let acceptedCounts = [];
    if (jobIds.length > 0) {
      const countsResult = await query(
        `SELECT job_id, COUNT(*) as accepted_count
         FROM job_applications
         WHERE job_id = ANY($1) AND status = 'accepted'
         GROUP BY job_id`,
        [jobIds]
      );
      acceptedCounts = countsResult;
    }

    // Create maps for quick lookup
    const applicationMap = new Map();
    userApplications.forEach(app => {
      applicationMap.set(app.job_id, {
        hasApplied: true,
        status: app.status,
        appliedAt: app.created_at
      });
    });

    const acceptedCountMap = new Map();
    acceptedCounts.forEach(count => {
      acceptedCountMap.set(count.job_id, parseInt(count.accepted_count));
    });

    res.status(200).json({
      status: 'success',
      data: {
        jobPosts: jobPosts.map(jp => {
          const application = applicationMap.get(jp.job_id);
          const acceptedCount = acceptedCountMap.get(jp.job_id) || 0;
          const maxCollaborators = jp.max_collaborators;
          
          // Check if job is filled
          const isFilled = jp.status === 'filled' || 
            (maxCollaborators && acceptedCount >= maxCollaborators);
          
          return {
          jobId: jp.job_id,
          photographerId: jp.photographer_id,
          postedBy: jp.full_name,
          businessName: jp.business_name,
          posterAvatar: jp.avatar_url,
          jobTitle: jp.job_title,
          jobDescription: jp.job_description,
          category: jp.category,
          budgetMin: jp.budget_min,
          budgetMax: jp.budget_max,
          duration: jp.duration,
          urgency: jp.urgency,
          location: jp.location,
          requiredSkills: typeof jp.required_skills === 'string' 
            ? JSON.parse(jp.required_skills) 
            : (jp.required_skills || []),
          applicationDeadline: jp.application_deadline,
            maxCollaborators: maxCollaborators,
          isRemote: jp.is_remote,
          status: jp.status,
          viewCount: jp.view_count,
          applicationsCount: jp.applications_count,
            postedAt: jp.created_at,
            // Add application status
            hasApplied: application ? true : false,
            applicationStatus: application?.status || null,
            appliedAt: application?.appliedAt || null,
            // Add filled status
            isFilled: isFilled,
            acceptedApplicationsCount: acceptedCount
          };
        })
      }
    });
  } catch (error) {
    console.error('Get job posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch job posts'
    });
  }
};

// Get job post by ID
export const getJobPostById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const userType = req.user?.userType;

    // Only photographers can view job posts (this is a photographer collaboration marketplace)
    if (!userId || userType !== 'photographer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can view job posts. This is a photographer collaboration marketplace.'
      });
    }

    const { id } = req.params;

    const result = await query(
      `SELECT jp.*, 
              p.business_name,
              up.full_name,
              up.avatar_url
       FROM job_posts jp
       JOIN photographers p ON jp.photographer_id = p.photographer_id
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE jp.job_id = $1`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Job post not found'
      });
    }

    const jobPost = result[0];

    // Check if user has applied
    let applicationStatus = null;
    if (userId) {
      const applicationResult = await query(
        `SELECT status, created_at 
         FROM job_applications 
         WHERE job_id = $1 AND applicant_id = $2`,
        [id, userId]
      );
      if (applicationResult.length > 0) {
        applicationStatus = {
          hasApplied: true,
          status: applicationResult[0].status,
          appliedAt: applicationResult[0].created_at
        };
      }
    }

    // Check accepted applications count to determine if filled
    const acceptedCountResult = await query(
      `SELECT COUNT(*) as accepted_count
       FROM job_applications
       WHERE job_id = $1 AND status = 'accepted'`,
      [id]
    );
    const acceptedCount = parseInt(acceptedCountResult[0]?.accepted_count || 0);
    const maxCollaborators = jobPost.max_collaborators;
    const isFilled = jobPost.status === 'filled' || 
      (maxCollaborators && acceptedCount >= maxCollaborators);

    // Increment view count
    await query(
      `UPDATE job_posts SET view_count = view_count + 1 WHERE job_id = $1`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        jobPost: {
          jobId: jobPost.job_id,
          photographerId: jobPost.photographer_id,
          postedBy: jobPost.full_name,
          businessName: jobPost.business_name,
          posterAvatar: jobPost.avatar_url,
          jobTitle: jobPost.job_title,
          jobDescription: jobPost.job_description,
          category: jobPost.category,
          budgetMin: jobPost.budget_min,
          budgetMax: jobPost.budget_max,
          duration: jobPost.duration,
          urgency: jobPost.urgency,
          location: jobPost.location,
          requiredSkills: jobPost.required_skills,
          applicationDeadline: jobPost.application_deadline,
          maxCollaborators: jobPost.max_collaborators,
          isRemote: jobPost.is_remote,
          status: jobPost.status,
          viewCount: jobPost.view_count + 1,
          applicationsCount: jobPost.applications_count,
          postedAt: jobPost.created_at,
          // Add application status
          hasApplied: applicationStatus ? true : false,
          applicationStatus: applicationStatus?.status || null,
          appliedAt: applicationStatus?.appliedAt || null,
          // Add filled status
          isFilled: isFilled,
          acceptedApplicationsCount: acceptedCount
        }
      }
    });
  } catch (error) {
    console.error('Get job post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch job post'
    });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const { id } = req.params;
    const {
      applicant_name,
      applicant_email,
      applicant_phone,
      cover_letter,
      portfolio_url,
      experience_years,
      expected_rate,
      availability_start,
      availability_end,
      additional_info
    } = req.body;

    // Validate required fields
    if (!applicant_name || !applicant_email) {
      return res.status(400).json({
        status: 'error',
        message: 'Applicant name and email are required'
      });
    }

    // Check if job exists
    const jobResult = await query(
      `SELECT jp.*, 
              u.email as creator_email,
              up.full_name as creator_name
       FROM job_posts jp
       JOIN users u ON jp.posted_by_user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE jp.job_id = $1 AND jp.status = 'open'`,
      [id]
    );

    if (jobResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Job post not found or not open for applications'
      });
    }

    const job = jobResult[0];

    // Check if job is filled
    const acceptedCountResult = await query(
      `SELECT COUNT(*) as accepted_count
       FROM job_applications
       WHERE job_id = $1 AND status = 'accepted'`,
      [id]
    );
    const acceptedCount = parseInt(acceptedCountResult[0]?.accepted_count || 0);
    const maxCollaborators = job.max_collaborators;
    
    if (job.status === 'filled' || (maxCollaborators && acceptedCount >= maxCollaborators)) {
      return res.status(400).json({
        status: 'error',
        message: 'This job is no longer accepting applications. All positions have been filled.'
      });
    }

    // Check if user already applied
    const existingApplication = await query(
      'SELECT application_id FROM job_applications WHERE job_id = $1 AND applicant_id = $2',
      [id, userId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already applied for this job'
      });
    }

    // Insert application
    const applicationResult = await query(
      `INSERT INTO job_applications (
        job_id,
        applicant_id,
        applicant_name,
        applicant_email,
        applicant_phone,
        cover_letter,
        portfolio_url,
        experience_years,
        expected_rate,
        availability_start,
        availability_end,
        additional_info,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        id,
        userId,
        applicant_name,
        applicant_email,
        applicant_phone || null,
        cover_letter || null,
        portfolio_url || null,
        experience_years ? parseInt(experience_years) : null,
        expected_rate ? parseFloat(expected_rate) : null,
        availability_start || null,
        availability_end || null,
        additional_info || null,
        'pending'
      ]
    );

    const application = applicationResult[0];

    // Update job applications count
    await query(
      'UPDATE job_posts SET applications_count = applications_count + 1 WHERE job_id = $1',
      [id]
    );

    // Send emails
    const applicantData = {
      applicantName: applicant_name,
      applicantEmail: applicant_email,
      applicantPhone: applicant_phone,
      coverLetter: cover_letter,
      portfolioUrl: portfolio_url,
      experienceYears: experience_years,
      expectedRate: expected_rate,
      additionalInfo: additional_info
    };

    const jobData = {
      jobTitle: job.job_title,
      jobId: job.job_id
    };

    // Send email to job creator
    await sendJobApplicationEmail(
      job.creator_email,
      job.creator_name,
      applicantData,
      jobData
    );

    // Send confirmation email to applicant
    await sendApplicationConfirmationEmail(
      applicant_email,
      applicant_name,
      jobData
    );

    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: {
        application: {
          applicationId: application.application_id,
          jobId: application.job_id,
          applicantName: application.applicant_name,
          status: application.status,
          createdAt: application.created_at
        }
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get job analysis for photographer
export const getJobAnalysis = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get photographer_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can view job analysis'
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    // Get all jobs posted by this photographer
    const jobsResult = await query(
      `SELECT 
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE status = 'open') as open_jobs,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_jobs,
        SUM(view_count) as total_views,
        SUM(applications_count) as total_applications,
        AVG(applications_count) as avg_applications_per_job
       FROM job_posts
       WHERE photographer_id = $1 AND archived_at IS NULL`,
      [photographerId]
    );

    // Get jobs by category
    const categoryStats = await query(
      `SELECT 
        category,
        COUNT(*) as job_count,
        SUM(applications_count) as total_applications,
        SUM(view_count) as total_views
       FROM job_posts
       WHERE photographer_id = $1 AND archived_at IS NULL
       GROUP BY category
       ORDER BY job_count DESC`,
      [photographerId]
    );

    // Get recent applications with full details
    const recentApplications = await query(
      `SELECT 
        ja.application_id,
        ja.applicant_name,
        ja.applicant_email,
        ja.applicant_phone,
        ja.cover_letter,
        ja.portfolio_url,
        ja.experience_years,
        ja.expected_rate,
        ja.availability_start,
        ja.availability_end,
        ja.additional_info,
        ja.status,
        ja.created_at,
        jp.job_title,
        jp.job_id
       FROM job_applications ja
       JOIN job_posts jp ON ja.job_id = jp.job_id
       WHERE jp.photographer_id = $1
       ORDER BY ja.created_at DESC`,
      [photographerId]
    );

    // Get jobs with most applications
    const topJobs = await query(
      `SELECT 
        job_id,
        job_title,
        category,
        applications_count,
        view_count,
        created_at
       FROM job_posts
       WHERE photographer_id = $1 AND archived_at IS NULL
       ORDER BY applications_count DESC
       LIMIT 5`,
      [photographerId]
    );

    const stats = jobsResult[0];

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalJobs: parseInt(stats.total_jobs) || 0,
          openJobs: parseInt(stats.open_jobs) || 0,
          closedJobs: parseInt(stats.closed_jobs) || 0,
          totalViews: parseInt(stats.total_views) || 0,
          totalApplications: parseInt(stats.total_applications) || 0,
          avgApplicationsPerJob: parseFloat(stats.avg_applications_per_job) || 0
        },
        categoryStats: categoryStats.map(cat => ({
          category: cat.category,
          jobCount: parseInt(cat.job_count),
          totalApplications: parseInt(cat.total_applications),
          totalViews: parseInt(cat.total_views)
        })),
        recentApplications: recentApplications.map(app => ({
          applicationId: app.application_id,
          applicantName: app.applicant_name,
          applicantEmail: app.applicant_email,
          applicantPhone: app.applicant_phone,
          coverLetter: app.cover_letter,
          portfolioUrl: app.portfolio_url,
          experienceYears: app.experience_years,
          expectedRate: app.expected_rate,
          availabilityStart: app.availability_start,
          availabilityEnd: app.availability_end,
          additionalInfo: app.additional_info,
          status: app.status,
          jobTitle: app.job_title,
          jobId: app.job_id,
          appliedAt: app.created_at
        })),
        topJobs: topJobs.map(job => ({
          jobId: job.job_id,
          jobTitle: job.job_title,
          category: job.category,
          applicationsCount: job.applications_count,
          viewCount: job.view_count,
          postedAt: job.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Get job analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch job analysis'
    });
  }
};

// Accept or reject a job application
export const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { applicationId } = req.params;
    const { status, rejectionReason } = req.body; // status: 'accepted' or 'rejected'

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either "accepted" or "rejected"'
      });
    }

    // Get application details and verify ownership
    const applicationResult = await query(
      `SELECT 
        ja.*,
        jp.job_title,
        jp.photographer_id,
        p.user_id as photographer_user_id
       FROM job_applications ja
       JOIN job_posts jp ON ja.job_id = jp.job_id
       JOIN photographers p ON jp.photographer_id = p.photographer_id
       WHERE ja.application_id = $1`,
      [applicationId]
    );

    if (applicationResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
    }

    const application = applicationResult[0];

    // Verify the user owns this job
    if (application.photographer_user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this application'
      });
    }

    // Check if already processed
    if (application.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Application has already been ${application.status}`
      });
    }

    // Update application status
    await query(
      `UPDATE job_applications 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE application_id = $2`,
      [status, applicationId]
    );

    // If accepting, check if job should be marked as filled
    if (status === 'accepted') {
      // Get current accepted count
      const acceptedCountResult = await query(
        `SELECT COUNT(*) as accepted_count
         FROM job_applications
         WHERE job_id = $1 AND status = 'accepted'`,
        [application.job_id]
      );
      const acceptedCount = parseInt(acceptedCountResult[0]?.accepted_count || 0);
      
      // Check if job has max_collaborators limit
      const jobInfo = await query(
        `SELECT max_collaborators, status FROM job_posts WHERE job_id = $1`,
        [application.job_id]
      );
      const maxCollaborators = jobInfo[0]?.max_collaborators;
      
      // Mark as filled if limit reached
      if (maxCollaborators && acceptedCount >= maxCollaborators) {
        await query(
          `UPDATE job_posts SET status = 'filled' WHERE job_id = $1`,
          [application.job_id]
        );
        console.log(`Job ${application.job_id} marked as filled (${acceptedCount}/${maxCollaborators} positions)`);
      }
    }

    // Prepare email data
    const jobData = {
      jobTitle: application.job_title,
      jobId: application.job_id
    };

    const applicantData = {
      applicantName: application.applicant_name,
      applicantEmail: application.applicant_email
    };

    // Send appropriate email
    if (status === 'accepted') {
      await sendApplicationAcceptedEmail(
        applicantData.applicantEmail,
        applicantData.applicantName,
        jobData
      );
    } else {
      await sendApplicationRejectedEmail(
        applicantData.applicantEmail,
        applicantData.applicantName,
        jobData,
        rejectionReason
      );
    }

    res.status(200).json({
      status: 'success',
      message: `Application ${status} successfully`,
      data: {
        applicationId: parseInt(applicationId),
        status: status
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update application status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

