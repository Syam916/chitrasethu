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
      `SELECT p.*, up.full_name, up.avatar_url, up.bio, up.phone, up.location, up.city, up.state
       FROM photographers p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE p.photographer_id = $1 AND p.is_active = true`,
      [id]
    );
    
    const photographer = photographerResult[0];
    
    if (!photographer) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }
    
    // Get portfolio
    const portfolio = await query(
      `SELECT * FROM photographer_portfolios 
       WHERE photographer_id = $1 AND is_active = true 
       ORDER BY display_order, created_at DESC`,
      [id]
    );
    
    res.status(200).json({
      status: 'success',
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
          portfolio: portfolio.map(p => ({
            portfolioId: p.portfolio_id,
            imageUrl: p.image_url,
            thumbnailUrl: p.thumbnail_url,
            title: p.title,
            description: p.description,
            category: p.category,
            likesCount: p.likes_count
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

