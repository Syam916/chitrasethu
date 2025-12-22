import { query } from '../config/database.js';

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
    
    const photographer = photographerResult[0];
    
    if (!photographer) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }
    
    // Get portfolio with post data
    const portfolio = await query(
      `SELECT 
         pp.*,
         p.comments_count,
         p.likes_count as post_likes_count,
         p.caption as post_caption,
         p.location as post_location,
         p.created_at as post_created_at
       FROM photographer_portfolios pp
       LEFT JOIN posts p ON pp.post_id = p.post_id
       WHERE pp.photographer_id = $1 AND pp.is_active = true 
       ORDER BY pp.display_order, pp.created_at DESC`,
      [photographer.photographer_id]
    );

    // Get follower and following counts
    const followerCountResult = await query(
      'SELECT COUNT(*) as count FROM user_follows WHERE following_id = $1',
      [photographer.user_id]
    );
    const followerCount = parseInt(followerCountResult[0].count);

    const followingCountResult = await query(
      'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = $1',
      [photographer.user_id]
    );
    const followingCount = parseInt(followingCountResult[0].count);

    // Check if current user is following this photographer
    let isFollowing = false;
    if (req.user && req.user.userId) {
      const followStatusResult = await query(
        'SELECT follow_id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [req.user.userId, photographer.user_id]
      );
      isFollowing = followStatusResult.length > 0;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        photographer: {
          photographerId: photographer.photographer_id,
          userId: photographer.user_id,
          fullName: photographer.full_name,
          email: photographer.email,
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
          totalBookings: photographer.total_bookings,
          equipment: photographer.equipment,
          languages: photographer.languages,
          certifications: photographer.certifications,
          awards: photographer.awards,
          servicesOffered: photographer.services_offered,
          isVerified: photographer.is_verified,
          isPremium: photographer.is_premium,
          followerCount,
          followingCount,
          isFollowing,
          portfolio: portfolio.map(p => ({
            portfolioId: p.portfolio_id,
            imageUrl: p.image_url,
            thumbnailUrl: p.thumbnail_url,
            title: p.title || p.post_caption,
            description: p.description,
            category: p.category,
            likesCount: p.post_likes_count || p.likes_count || 0,
            commentsCount: p.comments_count || 0,
            postId: p.post_id,
            location: p.post_location,
            createdAt: p.post_created_at || p.created_at
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Get photographer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch photographer details'
    });
  }
};

// Get current authenticated photographer profile
export const getMyPhotographerProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Only allow photographers to access this endpoint
    if (userType !== 'photographer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can access this endpoint'
      });
    }

    // Ensure photographer row exists
    const existingResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    let photographerId;

    if (existingResult.length === 0) {
      const insertResult = await query(
        `INSERT INTO photographers (user_id, specialties)
         VALUES ($1, $2)
         RETURNING photographer_id`,
        [userId, JSON.stringify([])]
      );
      photographerId = insertResult[0].photographer_id;
    } else {
      photographerId = existingResult[0].photographer_id;
    }

    const photographerResult = await query(
      `SELECT p.*, u.email, up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
       FROM photographers p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE p.photographer_id = $1 AND p.is_active = true`,
      [photographerId]
    );

    const photographer = photographerResult[0];

    const portfolio = await query(
      `SELECT 
         pp.*,
         p.comments_count,
         p.likes_count as post_likes_count,
         p.caption as post_caption,
         p.location as post_location,
         p.created_at as post_created_at
       FROM photographer_portfolios pp
       LEFT JOIN posts p ON pp.post_id = p.post_id
       WHERE pp.photographer_id = $1 AND pp.is_active = true 
       ORDER BY pp.display_order, pp.created_at DESC`,
      [photographerId]
    );

    // Get follower and following counts
    const followerCountResult = await query(
      'SELECT COUNT(*) as count FROM user_follows WHERE following_id = $1',
      [userId]
    );
    const followerCount = parseInt(followerCountResult[0].count);

    const followingCountResult = await query(
      'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = $1',
      [userId]
    );
    const followingCount = parseInt(followingCountResult[0].count);

    res.status(200).json({
      status: 'success',
      data: {
        photographer: {
          photographerId: photographer.photographer_id,
          userId: photographer.user_id,
          fullName: photographer.full_name,
          email: photographer.email,
          businessName: photographer.business_name,
          avatarUrl: photographer.avatar_url,
          bio: photographer.bio,
          phone: photographer.phone,
          location: photographer.location,
          city: photographer.city,
          state: photographer.state,
          specialties: photographer.specialties,
          experienceYears: parseFloat(photographer.experience_years),
          basePrice: parseFloat(photographer.base_price),
          rating: parseFloat(photographer.rating),
          totalReviews: photographer.total_reviews,
          totalBookings: photographer.total_bookings,
          equipment: photographer.equipment,
          languages: photographer.languages,
          certifications: photographer.certifications,
          awards: photographer.awards,
          servicesOffered: photographer.services_offered,
          isVerified: photographer.is_verified,
          isPremium: photographer.is_premium,
          followerCount,
          followingCount,
          isFollowing: false, // Always false for own profile
          portfolio: portfolio.map(p => ({
            portfolioId: p.portfolio_id,
            imageUrl: p.image_url,
            thumbnailUrl: p.thumbnail_url,
            title: p.title || p.post_caption,
            description: p.description,
            category: p.category,
            likesCount: p.post_likes_count || p.likes_count || 0,
            commentsCount: p.comments_count || 0,
            postId: p.post_id,
            location: p.post_location,
            createdAt: p.post_created_at || p.created_at
          })),
        },
      },
    });
  } catch (error) {
    console.error('Get my photographer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get photographer profile',
    });
  }
};

// Update current photographer profile (business/professional details)
export const updateMyPhotographerProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Only allow photographers to access this endpoint
    if (userType !== 'photographer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can access this endpoint'
      });
    }

    const {
      businessName,
      specialties,
      experienceYears,
      basePrice,
      equipment,
      languages,
      servicesOffered,
      workRadius,
      certifications,
      awards,
    } = req.body;

    // Ensure photographer row exists for this user
    const existingResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    let photographerId;

    if (existingResult.length === 0) {
      const insertResult = await query(
        `INSERT INTO photographers (user_id, specialties) 
         VALUES ($1, $2) 
         RETURNING photographer_id`,
        [userId, JSON.stringify([])]
      );
      photographerId = insertResult[0].photographer_id;
    } else {
      photographerId = existingResult[0].photographer_id;
    }

    await query(
      `UPDATE photographers
       SET
         business_name    = COALESCE($1, business_name),
         specialties      = COALESCE($2, specialties),
         experience_years = COALESCE($3, experience_years),
         base_price       = COALESCE($4, base_price),
         equipment        = COALESCE($5, equipment),
         languages        = COALESCE($6, languages),
         services_offered = COALESCE($7, services_offered),
         work_radius      = COALESCE($8, work_radius),
         certifications   = COALESCE($9, certifications),
         awards           = COALESCE($10, awards),
         updated_at       = NOW()
       WHERE photographer_id = $11`,
      [
        businessName || null,
        specialties ? JSON.stringify(specialties) : null,
        experienceYears !== undefined ? experienceYears : null,
        basePrice !== undefined ? basePrice : null,
        equipment ? JSON.stringify(equipment) : null,
        languages ? JSON.stringify(languages) : null,
        servicesOffered ? JSON.stringify(servicesOffered) : null,
        workRadius !== undefined ? workRadius : null,
        certifications || null,
        awards || null,
        photographerId,
      ]
    );

    // Return updated photographer detail (reusing by-id logic)
    const photographerResult = await query(
      `SELECT p.*, up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
       FROM photographers p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE p.photographer_id = $1 AND p.is_active = true`,
      [photographerId]
    );

    const photographer = photographerResult[0];

    res.status(200).json({
      status: 'success',
      message: 'Photographer profile updated successfully',
      data: {
        photographer: {
          photographerId: photographer.photographer_id,
          userId: photographer.user_id,
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
          totalBookings: photographer.total_bookings,
          equipment: photographer.equipment,
          languages: photographer.languages,
          isVerified: photographer.is_verified,
          isPremium: photographer.is_premium,
          certifications: photographer.certifications,
          awards: photographer.awards,
        },
      },
    });
  } catch (error) {
    console.error('Update photographer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update photographer profile',
    });
  }
};

// Add portfolio items for current photographer
export const addMyPortfolioItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Only allow photographers to access this endpoint
    if (userType !== 'photographer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can access this endpoint'
      });
    }

    const { photos } = req.body;

    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No photos provided',
      });
    }

    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Photographer profile not found',
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    const values = [];
    const params = [];
    let paramIndex = 1;

    photos.forEach((photo) => {
      values.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      params.push(
        photographerId,
        photo.imageUrl,
        photo.thumbnailUrl || null,
        photo.title || null,
        photo.description || null,
        photo.category || null
      );
    });

    const sql = `
      INSERT INTO photographer_portfolios
        (photographer_id, image_url, thumbnail_url, title, description, category)
      VALUES
        ${values.join(', ')}
      RETURNING *
    `;

    const inserted = await query(sql, params);

    res.status(201).json({
      status: 'success',
      data: {
        portfolio: inserted.map((p) => ({
          portfolioId: p.portfolio_id,
          imageUrl: p.image_url,
          thumbnailUrl: p.thumbnail_url,
          title: p.title,
          description: p.description,
          category: p.category,
          likesCount: p.likes_count,
        })),
      },
    });
  } catch (error) {
    console.error('Add portfolio items error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add portfolio items',
    });
  }
};

// Delete a portfolio item for current photographer
export const deleteMyPortfolioItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userType = req.user.userType;

    // Only allow photographers to access this endpoint
    if (userType !== 'photographer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only photographers can access this endpoint'
      });
    }

    const { id } = req.params;

    const photographerResult = await query(
      'SELECT photographer_id FROM photographers WHERE user_id = $1',
      [userId]
    );

    if (photographerResult.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Photographer profile not found',
      });
    }

    const photographerId = photographerResult[0].photographer_id;

    const result = await query(
      `UPDATE photographer_portfolios
       SET is_active = false, updated_at = NOW()
       WHERE portfolio_id = $1 AND photographer_id = $2
       RETURNING *`,
      [id, photographerId]
    );

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Portfolio item not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    console.error('Delete portfolio item error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete portfolio item',
    });
  }
};
