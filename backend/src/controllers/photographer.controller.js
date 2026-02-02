import { query } from '../config/database.js';

// Get photographer dashboard stats
export const getPhotographerStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get photographer_id from user_id
    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not a photographer'
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    // Get current month start date (format for PostgreSQL)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const currentMonthStartISO = currentMonthStart.toISOString();

    // Get stats from bookings
    const statsResult = await query(
      `SELECT 
        -- Total bookings
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'in_progress', 'completed')) as total_bookings,
        
        -- Current month bookings
        COUNT(*) FILTER (
          WHERE status IN ('confirmed', 'in_progress', 'completed') 
          AND created_at >= $1::timestamp
        ) as current_month_bookings,
        
        -- Current month revenue
        COALESCE(SUM(total_amount) FILTER (
          WHERE status IN ('confirmed', 'in_progress', 'completed') 
          AND created_at >= $1::timestamp
        ), 0) as current_month_revenue,
        
        -- Pending requests
        COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
        
        -- Active conversations (bookings with messages)
        COUNT(DISTINCT booking_id) FILTER (
          WHERE status IN ('pending', 'confirmed', 'in_progress')
        ) as active_conversations
      FROM bookings
      WHERE photographer_id = $2`,
      [currentMonthStartISO, photographerId]
    );

    const stats = statsResult[0];

    // Get photographer profile stats
    const photographerProfile = await query(
      `SELECT 
        rating,
        total_reviews
      FROM photographers
      WHERE photographer_id = $1`,
      [photographerId]
    );

    const profile = photographerProfile[0] || {};

    // Calculate completion rate (completed bookings / total confirmed bookings)
    const completionStats = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status IN ('confirmed', 'in_progress', 'completed')) as total_confirmed
      FROM bookings
      WHERE photographer_id = $1`,
      [photographerId]
    );

    const completion = completionStats[0];
    const completionRate = completion.total_confirmed > 0
      ? Math.round((completion.completed / completion.total_confirmed) * 100)
      : 100;

    // Calculate average response time (mock for now - can be enhanced with message timestamps)
    const responseTime = '2 hours'; // This can be calculated from message response times

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalBookings: parseInt(stats.total_bookings) || 0,
          currentMonthBookings: parseInt(stats.current_month_bookings) || 0,
          currentMonthRevenue: parseFloat(stats.current_month_revenue) || 0,
          pendingRequests: parseInt(stats.pending_requests) || 0,
          activeConversations: parseInt(stats.active_conversations) || 0,
          portfolioViews: 0, // Portfolio views not tracked in database yet
          profileRating: parseFloat(profile.rating) || 0,
          totalReviews: parseInt(profile.total_reviews) || 0,
          completionRate: completionRate,
          responseTime: responseTime
        }
      }
    });

  } catch (error) {
    console.error('Get photographer stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch photographer stats'
    });
  }
};

// Get all photographers
export const getAllPhotographers = async (req, res) => {
  try {
    const { category, city, minRating, maxPrice, search } = req.query;
    
    let sql = `
      SELECT p.*, up.full_name, up.avatar_url, up.location, up.city, up.state
      FROM photographers p
      JOIN users u ON p.user_id = u.user_id
      JOIN user_profiles up ON u.user_id = up.user_id
      WHERE p.is_active = true AND u.is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add filters (PostgreSQL uses $1, $2, etc.)
    if (category) {
      sql += ` AND p.specialties @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify([category]));
      paramIndex++;
    }
    
    if (city) {
      sql += ` AND up.city ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }
    
    if (minRating) {
      sql += ` AND p.rating >= $${paramIndex}`;
      params.push(parseFloat(minRating));
      paramIndex++;
    }
    
    if (maxPrice) {
      sql += ` AND p.base_price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }
    
    if (search) {
      sql += ` AND (up.full_name ILIKE $${paramIndex} OR p.business_name ILIKE $${paramIndex + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      paramIndex += 2;
    }
    
    sql += ` ORDER BY p.rating DESC, p.total_reviews DESC LIMIT 50`;
    
    const photographers = await query(sql, params);
    
    res.status(200).json({
      status: 'success',
      data: {
        photographers: photographers.map(p => ({
          photographerId: p.photographer_id,
          userId: p.user_id,
          fullName: p.full_name,
          businessName: p.business_name,
          avatarUrl: p.avatar_url,
          location: p.location,
          city: p.city,
          state: p.state,
          specialties: p.specialties,
          experienceYears: p.experience_years,
          basePrice: parseFloat(p.base_price),
          rating: parseFloat(p.rating),
          totalReviews: p.total_reviews,
          isVerified: p.is_verified,
          isPremium: p.is_premium
        }))
      }
    });
    
  } catch (error) {
    console.error('Get photographers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch photographers'
    });
  }
};

// Get photographer by ID
export const getPhotographerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const photographerResult = await query(
      `SELECT p.*, u.email, up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
       FROM photographers p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE (p.photographer_id = $1 OR p.user_id = $1) AND p.is_active = true`,
      [id]
    );
    
    if (photographerResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }
    
    const photographer = photographerResult[0];
    
    res.status(200).json({
      status: 'success',
      data: {
        photographer: {
          photographerId: photographer.photographer_id,
          userId: photographer.user_id,
          email: photographer.email,
          fullName: photographer.full_name,
          businessName: photographer.business_name,
          avatarUrl: photographer.avatar_url,
          bio: photographer.bio,
          phone: photographer.phone,
          location: photographer.location,
          city: photographer.city,
          state: photographer.state,
          specialties: photographer.specialties,
          experienceYears: photographer.experience_years,
          basePrice: parseFloat(photographer.base_price),
          rating: parseFloat(photographer.rating),
          totalReviews: photographer.total_reviews,
          isVerified: photographer.is_verified,
          isPremium: photographer.is_premium
        }
      }
    });
    
  } catch (error) {
    console.error('Get photographer by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch photographer'
    });
  }
};

// Get my photographer profile
export const getMyPhotographerProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    // Check if user is actually a photographer
    const userCheck = await query(
      `SELECT user_type FROM users WHERE user_id = $1`,
      [userId]
    );
    
    if (userCheck.length === 0 || userCheck[0].user_type !== 'photographer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can access this endpoint'
      });
    }
    
    let result = await query(
      `SELECT p.*, u.email, up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
       FROM photographers p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE p.user_id = $1`,
      [userId]
    );
    
    // If photographer profile doesn't exist, create it automatically
    if (result.length === 0) {
      console.log(`Photographer profile not found for user_id: ${userId}, creating one...`);
      try {
        const newPhotographerResult = await query(
          `INSERT INTO photographers (user_id, specialties, is_active) 
           VALUES ($1, $2, $3)
           RETURNING photographer_id`,
          [userId, JSON.stringify([]), true]
        );
        
        if (newPhotographerResult.length > 0) {
          // Fetch the newly created profile
          result = await query(
            `SELECT p.*, u.email, up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
             FROM photographers p
             JOIN users u ON p.user_id = u.user_id
             JOIN user_profiles up ON u.user_id = up.user_id
             WHERE p.user_id = $1`,
            [userId]
          );
          console.log(`Successfully created photographer profile with photographer_id: ${newPhotographerResult[0].photographer_id}`);
        }
      } catch (createError) {
        console.error('Error auto-creating photographer profile:', createError);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create photographer profile. Please contact support.'
        });
      }
    }
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer profile not found'
      });
    }
    
    const photographer = result[0];
    
    res.status(200).json({
      status: 'success',
      data: {
        photographer: {
          photographerId: photographer.photographer_id,
          userId: photographer.user_id,
          email: photographer.email,
          fullName: photographer.full_name,
          businessName: photographer.business_name,
          avatarUrl: photographer.avatar_url,
          bio: photographer.bio,
          phone: photographer.phone,
          location: photographer.location,
          city: photographer.city,
          state: photographer.state,
          specialties: photographer.specialties,
          experienceYears: photographer.experience_years,
          basePrice: parseFloat(photographer.base_price),
          rating: parseFloat(photographer.rating),
          totalReviews: photographer.total_reviews,
          isVerified: photographer.is_verified,
          isPremium: photographer.is_premium
        }
      }
    });
    
  } catch (error) {
    console.error('Get my photographer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch photographer profile'
    });
  }
};

// Update my photographer profile
export const updateMyPhotographerProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const updateData = req.body;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (updateData.businessName !== undefined) {
      updates.push(`business_name = $${paramIndex++}`);
      params.push(updateData.businessName);
    }
    if (updateData.specialties !== undefined) {
      updates.push(`specialties = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(updateData.specialties));
    }
    if (updateData.basePrice !== undefined) {
      updates.push(`base_price = $${paramIndex++}`);
      params.push(updateData.basePrice);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(userId);
    
    await query(
      `UPDATE photographers SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`,
      params
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Update photographer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

// Add portfolio items
export const addMyPortfolioItems = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { items } = req.body;
    
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
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }
    
    const photographerId = photographerResult[0].photographer_id;
    
    // Insert portfolio items
    for (const item of items) {
      await query(
        `INSERT INTO photographer_portfolios (photographer_id, image_url, title, description, category, display_order, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [photographerId, item.imageUrl, item.title || null, item.description || null, item.category || null, item.displayOrder || 0]
      );
    }
    
    res.status(201).json({
      status: 'success',
      message: 'Portfolio items added successfully'
    });
    
  } catch (error) {
    console.error('Add portfolio items error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add portfolio items'
    });
  }
};

// Delete portfolio item
export const deleteMyPortfolioItem = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }
    
    // Get photographer_id and verify ownership
    const result = await query(
      `DELETE FROM photographer_portfolios pp
       USING photographers p
       WHERE pp.portfolio_id = $1 AND pp.photographer_id = p.photographer_id AND p.user_id = $2
       RETURNING pp.portfolio_id`,
      [id, userId]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Portfolio item not found or unauthorized'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Portfolio item deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete portfolio item'
    });
  }
};
