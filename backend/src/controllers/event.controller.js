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
          images: e.images,
          tags: e.tags,
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
          images: e.images,
          tags: e.tags,
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

