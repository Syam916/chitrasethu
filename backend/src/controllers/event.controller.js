import { query } from '../config/database.js';

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const { limit = 50, offset = 0, category, status, city, search } = req.query;
    const userId = req.user?.userId || null;

    let whereClause = 'e.visibility = \'public\'';
    const params = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND ec.slug = $${paramIndex++}`;
      params.push(category);
    }

    if (status) {
      whereClause += ` AND e.status = $${paramIndex++}`;
      params.push(status);
    }

    if (city) {
      whereClause += ` AND e.city ILIKE $${paramIndex++}`;
      params.push(`%${city}%`);
    }

    if (search) {
      whereClause += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add limit and offset
    params.push(parseInt(limit), parseInt(offset));
    const limitParamIndex = paramIndex;
    const offsetParamIndex = paramIndex + 1;

    const events = await query(
      `SELECT 
         e.*,
         ec.category_name,
         ec.slug as category_slug,
         up.full_name as creator_name,
         up.avatar_url as creator_avatar,
         false AS is_interested
       FROM events e
       JOIN event_categories ec ON e.category_id = ec.category_id
       JOIN users u ON e.creator_id = u.user_id
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE ${whereClause}
       ORDER BY e.event_date ASC, e.event_time ASC
       LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
      params
    );

    // Get total count
    let countWhere = 'WHERE visibility = \'public\'';
    const countParams = [];
    let countIndex = 1;

    if (category) {
      countWhere += ` AND category_id = (SELECT category_id FROM event_categories WHERE slug = $${countIndex++})`;
      countParams.push(category);
    }

    if (status) {
      countWhere += ` AND status = $${countIndex++}`;
      countParams.push(status);
    }

    if (city) {
      countWhere += ` AND city ILIKE $${countIndex++}`;
      countParams.push(`%${city}%`);
    }

    if (search) {
      countWhere += ` AND (title ILIKE $${countIndex} OR description ILIKE $${countIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM events e ${countWhere}`,
      countParams
    );
    const total = parseInt(countResult[0]?.total || 0);

    res.status(200).json({
      status: 'success',
      data: {
        events: events.map(e => ({
          eventId: e.event_id,
          creatorId: e.creator_id,
          creatorName: e.creator_name,
          creatorAvatar: e.creator_avatar,
          categoryId: e.category_id,
          categoryName: e.category_name,
          categorySlug: e.category_slug,
          title: e.title,
          description: e.description,
          eventDate: e.event_date,
          eventTime: e.event_time,
          endDate: e.end_date,
          location: e.location,
          venueName: e.venue_name,
          city: e.city,
          state: e.state,
          expectedAttendees: e.expected_attendees,
          budgetRange: e.budget_range,
          minBudget: parseFloat(e.min_budget || 0),
          maxBudget: parseFloat(e.max_budget || 0),
          requirements: e.requirements,
          status: e.status,
          visibility: e.visibility,
          images: e.images ? (typeof e.images === 'string' ? JSON.parse(e.images) : e.images) : null,
          tags: e.tags ? (typeof e.tags === 'string' ? JSON.parse(e.tags) : e.tags) : null,
          viewsCount: e.views_count,
          interestedCount: e.interested_count,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
          isInterested: e.is_interested
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch events'
    });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId || null;

    const result = await query(
      `SELECT 
         e.*,
         ec.category_name,
         ec.slug as category_slug,
         up.full_name as creator_name,
         up.avatar_url as creator_avatar,
         u.email as creator_email,
         false AS is_interested
       FROM events e
       JOIN event_categories ec ON e.category_id = ec.category_id
       JOIN users u ON e.creator_id = u.user_id
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE e.event_id = $1 AND e.visibility = 'public'`,
      [parseInt(eventId)]
    );

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }

    const e = result[0];

    res.status(200).json({
      status: 'success',
      data: {
        event: {
          eventId: e.event_id,
          creatorId: e.creator_id,
          creatorName: e.creator_name,
          creatorAvatar: e.creator_avatar,
          creatorEmail: e.creator_email,
          categoryId: e.category_id,
          categoryName: e.category_name,
          categorySlug: e.category_slug,
          title: e.title,
          description: e.description,
          eventDate: e.event_date,
          eventTime: e.event_time,
          endDate: e.end_date,
          location: e.location,
          venueName: e.venue_name,
          city: e.city,
          state: e.state,
          expectedAttendees: e.expected_attendees,
          budgetRange: e.budget_range,
          minBudget: parseFloat(e.min_budget || 0),
          maxBudget: parseFloat(e.max_budget || 0),
          requirements: e.requirements,
          status: e.status,
          visibility: e.visibility,
          images: e.images ? (typeof e.images === 'string' ? JSON.parse(e.images) : e.images) : null,
          tags: e.tags ? (typeof e.tags === 'string' ? JSON.parse(e.tags) : e.tags) : null,
          viewsCount: e.views_count,
          interestedCount: e.interested_count,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
          isInterested: e.is_interested
        }
      }
    });

  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event'
    });
  }
};

// Get trending events (based on tags in posts)
export const getTrendingEvents = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get trending categories from post tags
    const trending = await query(
      `SELECT 
         jsonb_array_elements_text(p.tags) as tag_name,
         COUNT(*) as post_count
       FROM posts p
       WHERE p.tags IS NOT NULL 
         AND p.is_active = true
         AND p.created_at >= NOW() - INTERVAL '30 days'
       GROUP BY tag_name
       ORDER BY post_count DESC
       LIMIT $1`,
      [parseInt(limit)]
    );

    res.status(200).json({
      status: 'success',
      data: {
        trending: trending.map(t => ({
          name: t.tag_name,
          posts: parseFloat((parseInt(t.post_count) / 1000).toFixed(1)),
          trending: `+${Math.floor(Math.random() * 30) + 10}%` // Mock trending percentage
        }))
      }
    });

  } catch (error) {
    console.error('Get trending events error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trending events'
    });
  }
};

// Get event categories
export const getEventCategories = async (req, res) => {
  try {
    const categories = await query(
      `SELECT 
         category_id,
         category_name,
         slug,
         description,
         icon,
         color_code,
         display_order
       FROM event_categories
       WHERE is_active = true
       ORDER BY display_order ASC, category_name ASC`
    );

    res.status(200).json({
      status: 'success',
      data: {
        categories: categories.map(cat => ({
          categoryId: cat.category_id,
          categoryName: cat.category_name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          colorCode: cat.color_code,
          displayOrder: cat.display_order
        }))
      }
    });

  } catch (error) {
    console.error('Get event categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch event categories'
    });
  }
};

// Create event
export const createEvent = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const {
      categoryId,
      title,
      description,
      eventDate,
      eventTime,
      endDate,
      location,
      venueName,
      city,
      state,
      expectedAttendees,
      minBudget,
      maxBudget,
      budgetRange,
      requirements,
      visibility = 'public',
      images,
      tags
    } = req.body;

    // Validation
    if (!categoryId || !title || !eventDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: categoryId, title, and eventDate are required'
      });
    }

    // Verify category exists
    const categoryCheck = await query(
      'SELECT category_id FROM event_categories WHERE category_id = $1 AND is_active = true',
      [categoryId]
    );

    if (categoryCheck.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid category ID'
      });
    }

    // Prepare images and tags as JSONB
    const imagesJson = images && Array.isArray(images) ? JSON.stringify(images) : null;
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;

    // Calculate budget range if not provided
    let finalBudgetRange = budgetRange;
    if (!finalBudgetRange && minBudget && maxBudget) {
      finalBudgetRange = `₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}`;
    }

    // Insert event
    const result = await query(
      `INSERT INTO events (
        creator_id, category_id, title, description, event_date, event_time, end_date,
        location, venue_name, city, state, expected_attendees,
        budget_range, min_budget, max_budget, requirements,
        visibility, images, tags, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'open')
      RETURNING *`,
      [
        userId,
        categoryId,
        title,
        description || null,
        eventDate,
        eventTime || null,
        endDate || null,
        location || null,
        venueName || null,
        city || null,
        state || null,
        expectedAttendees || null,
        finalBudgetRange || null,
        minBudget ? parseFloat(minBudget) : null,
        maxBudget ? parseFloat(maxBudget) : null,
        requirements || null,
        visibility,
        imagesJson,
        tagsJson
      ]
    );

    const event = result[0];

    // Get full event details with category info
    const fullEvent = await query(
      `SELECT 
         e.*,
         ec.category_name,
         ec.slug as category_slug,
         up.full_name as creator_name,
         up.avatar_url as creator_avatar
       FROM events e
       JOIN event_categories ec ON e.category_id = ec.category_id
       LEFT JOIN user_profiles up ON e.creator_id = up.user_id
       WHERE e.event_id = $1`,
      [event.event_id]
    );

    const e = fullEvent[0];

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: {
        event: {
          eventId: e.event_id,
          creatorId: e.creator_id,
          creatorName: e.creator_name,
          creatorAvatar: e.creator_avatar,
          categoryId: e.category_id,
          categoryName: e.category_name,
          categorySlug: e.category_slug,
          title: e.title,
          description: e.description,
          eventDate: e.event_date,
          eventTime: e.event_time,
          endDate: e.end_date,
          location: e.location,
          venueName: e.venue_name,
          city: e.city,
          state: e.state,
          expectedAttendees: e.expected_attendees,
          budgetRange: e.budget_range,
          minBudget: parseFloat(e.min_budget || 0),
          maxBudget: parseFloat(e.max_budget || 0),
          requirements: e.requirements,
          status: e.status,
          visibility: e.visibility,
          images: e.images ? (typeof e.images === 'string' ? JSON.parse(e.images) : e.images) : null,
          tags: e.tags ? (typeof e.tags === 'string' ? JSON.parse(e.tags) : e.tags) : null,
          viewsCount: e.views_count,
          interestedCount: e.interested_count,
          createdAt: e.created_at,
          updatedAt: e.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create event'
    });
  }
};

