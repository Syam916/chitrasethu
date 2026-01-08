import { query } from '../config/database.js';
import { emitToAll, emitToUser } from '../config/socket.js';

// Get all collaborations
export const getAllCollaborations = async (req, res) => {
  try {
    const { limit = 50, offset = 0, collaborationType, location, search } = req.query;
    const userId = req.user?.userId || null;

    let whereClause = 'c.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (collaborationType) {
      whereClause += ` AND c.collaboration_type = $${paramIndex++}`;
      params.push(collaborationType);
    }

    if (location) {
      whereClause += ` AND c.location ILIKE $${paramIndex++}`;
      params.push(`%${location}%`);
    }

    if (search) {
      whereClause += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add limit and offset parameters
    params.push(parseInt(limit), parseInt(offset));
    const limitParamIndex = paramIndex;
    const offsetParamIndex = paramIndex + 1;

    const collaborations = await query(
      `SELECT 
         c.*,
         up.full_name as poster_name,
         up.avatar_url as poster_avatar,
         u.user_type as poster_type
       FROM collaborations c
       JOIN users u ON c.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
      params
    );

    // Get total count
    let countWhere = 'WHERE is_active = true';
    const countParams = [];
    let countIndex = 1;

    if (collaborationType) {
      countWhere += ` AND collaboration_type = $${countIndex++}`;
      countParams.push(collaborationType);
    }

    if (location) {
      countWhere += ` AND location ILIKE $${countIndex++}`;
      countParams.push(`%${location}%`);
    }

    if (search) {
      countWhere += ` AND (title ILIKE $${countIndex} OR description ILIKE $${countIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM collaborations ${countWhere}`,
      countParams
    );
    const total = parseInt(countResult[0].total);

    res.status(200).json({
      status: 'success',
      data: {
        collaborations: collaborations.map(c => ({
          collaborationId: c.collaboration_id,
          userId: c.user_id,
          posterName: c.poster_name,
          posterAvatar: c.poster_avatar,
          posterType: c.poster_type,
          collaborationType: c.collaboration_type,
          title: c.title,
          description: c.description,
          skills: c.skills ? (typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills) : [],
          location: c.location,
          date: c.date,
          budget: c.budget,
          minBudget: c.min_budget ? parseFloat(c.min_budget) : null,
          maxBudget: c.max_budget ? parseFloat(c.max_budget) : null,
          responsesCount: c.responses_count,
          isActive: c.is_active,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch collaborations'
    });
  }
};

// Get single collaboration with responses
export const getCollaborationById = async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const userId = req.user?.userId || null;

    const collaborations = await query(
      `SELECT 
         c.*,
         up.full_name as poster_name,
         up.avatar_url as poster_avatar,
         u.user_type as poster_type
       FROM collaborations c
       JOIN users u ON c.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE c.collaboration_id = $1`,
      [collaborationId]
    );

    if (collaborations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Collaboration not found'
      });
    }

    const collaboration = collaborations[0];

    // Get responses
    const responses = await query(
      `SELECT 
         cr.*,
         up.full_name as responder_name,
         up.avatar_url as responder_avatar,
         u.user_type as responder_type
       FROM collaboration_responses cr
       JOIN users u ON cr.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE cr.collaboration_id = $1
       ORDER BY cr.created_at ASC`,
      [collaborationId]
    );

    // Check if current user has responded
    let userResponse = null;
    if (userId) {
      const userResponses = await query(
        'SELECT * FROM collaboration_responses WHERE collaboration_id = $1 AND user_id = $2',
        [collaborationId, userId]
      );
      if (userResponses.length > 0) {
        userResponse = userResponses[0];
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        collaboration: {
          collaborationId: collaboration.collaboration_id,
          userId: collaboration.user_id,
          posterName: collaboration.poster_name,
          posterAvatar: collaboration.poster_avatar,
          posterType: collaboration.poster_type,
          collaborationType: collaboration.collaboration_type,
          title: collaboration.title,
          description: collaboration.description,
          skills: collaboration.skills,
          location: collaboration.location,
          date: collaboration.date,
          budget: collaboration.budget,
          minBudget: collaboration.min_budget ? parseFloat(collaboration.min_budget) : null,
          maxBudget: collaboration.max_budget ? parseFloat(collaboration.max_budget) : null,
          responsesCount: collaboration.responses_count,
          isActive: collaboration.is_active,
          createdAt: collaboration.created_at,
          updatedAt: collaboration.updated_at
        },
        responses: responses.map(r => ({
          responseId: r.response_id,
          collaborationId: r.collaboration_id,
          userId: r.user_id,
          responderName: r.responder_name,
          responderAvatar: r.responder_avatar,
          responderType: r.responder_type,
          message: r.message,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        })),
        userResponse: userResponse ? {
          responseId: userResponse.response_id,
          message: userResponse.message,
          status: userResponse.status,
          createdAt: userResponse.created_at
        } : null
      }
    });
  } catch (error) {
    console.error('Get collaboration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch collaboration'
    });
  }
};

// Create new collaboration
export const createCollaboration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      collaborationType,
      title,
      description,
      skills,
      location,
      date,
      budget,
      minBudget,
      maxBudget
    } = req.body;

    if (!collaborationType || !['seeking', 'offering'].includes(collaborationType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Collaboration type must be "seeking" or "offering"'
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Description is required'
      });
    }

    // Parse skills if string
    let parsedSkills = skills;
    if (typeof skills === 'string') {
      parsedSkills = JSON.parse(skills);
    }

    const result = await query(
      `INSERT INTO collaborations (
         user_id, collaboration_type, title, description, skills, 
         location, date, budget, min_budget, max_budget
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        collaborationType,
        title.trim(),
        description.trim(),
        JSON.stringify(parsedSkills || []),
        location || null,
        date || null,
        budget || null,
        minBudget || null,
        maxBudget || null
      ]
    );

    const collaboration = result[0];

    // Get poster info
    const userInfo = await query(
      `SELECT up.full_name, up.avatar_url, u.user_type
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    const poster = userInfo[0];

    const collaborationData = {
      collaboration: {
        collaborationId: collaboration.collaboration_id,
        userId: collaboration.user_id,
        posterName: poster.full_name,
        posterAvatar: poster.avatar_url,
        posterType: poster.user_type,
        collaborationType: collaboration.collaboration_type,
        title: collaboration.title,
        description: collaboration.description,
        skills: collaboration.skills,
        location: collaboration.location,
        date: collaboration.date,
        budget: collaboration.budget,
        minBudget: collaboration.min_budget ? parseFloat(collaboration.min_budget) : null,
        maxBudget: collaboration.max_budget ? parseFloat(collaboration.max_budget) : null,
        responsesCount: collaboration.responses_count,
        createdAt: collaboration.created_at
      }
    };

    // Emit real-time event for new collaboration
    try {
      emitToAll('new_collaboration', collaborationData);
      console.log(`📢 Real-time: New collaboration created: ${collaboration.collaboration_id}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Collaboration created successfully',
      data: collaborationData
    });
  } catch (error) {
    console.error('Create collaboration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create collaboration'
    });
  }
};

// Update collaboration
export const updateCollaboration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collaborationId } = req.params;
    const { title, description, skills, location, date, budget, minBudget, maxBudget, isActive } = req.body;

    // Check if collaboration exists and belongs to user
    const collaborations = await query(
      'SELECT * FROM collaborations WHERE collaboration_id = $1 AND user_id = $2',
      [collaborationId, userId]
    );

    if (collaborations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Collaboration not found or you do not have permission to edit it'
      });
    }

    // Update collaboration
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title.trim());
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description.trim());
    }
    if (skills !== undefined) {
      const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
      updateFields.push(`skills = $${paramIndex++}`);
      updateValues.push(JSON.stringify(parsedSkills));
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramIndex++}`);
      updateValues.push(location || null);
    }
    if (date !== undefined) {
      updateFields.push(`date = $${paramIndex++}`);
      updateValues.push(date || null);
    }
    if (budget !== undefined) {
      updateFields.push(`budget = $${paramIndex++}`);
      updateValues.push(budget || null);
    }
    if (minBudget !== undefined) {
      updateFields.push(`min_budget = $${paramIndex++}`);
      updateValues.push(minBudget || null);
    }
    if (maxBudget !== undefined) {
      updateFields.push(`max_budget = $${paramIndex++}`);
      updateValues.push(maxBudget || null);
    }
    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateValues.push(isActive);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    updateValues.push(collaborationId);
    const result = await query(
      `UPDATE collaborations 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE collaboration_id = $${paramIndex}
       RETURNING *`,
      updateValues
    );

    res.status(200).json({
      status: 'success',
      message: 'Collaboration updated successfully',
      data: { collaboration: result[0] }
    });
  } catch (error) {
    console.error('Update collaboration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update collaboration'
    });
  }
};

// Delete collaboration
export const deleteCollaboration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collaborationId } = req.params;

    // Check if collaboration exists and belongs to user
    const collaborations = await query(
      'SELECT * FROM collaborations WHERE collaboration_id = $1 AND user_id = $2',
      [collaborationId, userId]
    );

    if (collaborations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Collaboration not found or you do not have permission to delete it'
      });
    }

    // Delete collaboration (will cascade delete responses)
    await query('DELETE FROM collaborations WHERE collaboration_id = $1', [collaborationId]);

    res.status(200).json({
      status: 'success',
      message: 'Collaboration deleted successfully'
    });
  } catch (error) {
    console.error('Delete collaboration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete collaboration'
    });
  }
};

// Respond to collaboration
export const respondToCollaboration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collaborationId } = req.params;
    const { message } = req.body;

    // Check if collaboration exists
    const collaborations = await query(
      'SELECT * FROM collaborations WHERE collaboration_id = $1 AND is_active = true',
      [collaborationId]
    );

    if (collaborations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Collaboration not found'
      });
    }

    if (collaborations[0].user_id === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot respond to your own collaboration'
      });
    }

    // Check if already responded
    const existingResponse = await query(
      'SELECT * FROM collaboration_responses WHERE collaboration_id = $1 AND user_id = $2',
      [collaborationId, userId]
    );

    if (existingResponse.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already responded to this collaboration'
      });
    }

    // Create response (trigger will update responses_count)
    const result = await query(
      `INSERT INTO collaboration_responses (collaboration_id, user_id, message, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [collaborationId, userId, message?.trim() || null]
    );

    const response = result[0];

    // Get responder info
    const userInfo = await query(
      `SELECT up.full_name, up.avatar_url, u.user_type
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    const responder = userInfo[0];

    const responseData = {
      response: {
        responseId: response.response_id,
        collaborationId: response.collaboration_id,
        userId: response.user_id,
        responderName: responder.full_name,
        responderAvatar: responder.avatar_url,
        proposalText: response.message,
        status: response.status,
        createdAt: response.created_at
      }
    };

    // Emit real-time event for new collaboration response
    try {
      emitToUser(collaborations[0].user_id, 'collaboration_response', responseData);
      emitToAll('collaboration_updated', { collaborationId: parseInt(collaborationId) });
      console.log(`📢 Real-time: New response to collaboration ${collaborationId}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Response submitted successfully',
      data: {
        response: {
          responseId: response.response_id,
          collaborationId: response.collaboration_id,
          userId: response.user_id,
          responderName: responder.full_name,
          responderAvatar: responder.avatar_url,
          responderType: responder.user_type,
          message: response.message,
          status: response.status,
          createdAt: response.created_at
        }
      }
    });
  } catch (error) {
    console.error('Respond to collaboration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit response'
    });
  }
};

// Update response status (only collaboration owner)
export const updateResponseStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collaborationId, responseId } = req.params;
    const { status } = req.body;

    if (!['pending', 'accepted', 'declined', 'withdrawn'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    // Check if collaboration belongs to user
    const collaborations = await query(
      'SELECT * FROM collaborations WHERE collaboration_id = $1 AND user_id = $2',
      [collaborationId, userId]
    );

    if (collaborations.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Collaboration not found or you do not have permission'
      });
    }

    // Update response status
    await query(
      `UPDATE collaboration_responses 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE response_id = $2 AND collaboration_id = $3`,
      [status, responseId, collaborationId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Response status updated successfully'
    });
  } catch (error) {
    console.error('Update response status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update response status'
    });
  }
};

// Withdraw own response
export const withdrawResponse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collaborationId } = req.params;

    // Check if user has responded
    const responses = await query(
      'SELECT * FROM collaboration_responses WHERE collaboration_id = $1 AND user_id = $2',
      [collaborationId, userId]
    );

    if (responses.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'You have not responded to this collaboration'
      });
    }

    // Update status to withdrawn
    await query(
      `UPDATE collaboration_responses 
       SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP
       WHERE collaboration_id = $1 AND user_id = $2`,
      [collaborationId, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Response withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw response error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to withdraw response'
    });
  }
};


