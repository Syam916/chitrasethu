import { query } from '../config/database.js';

// Follow a photographer
export const followPhotographer = async (req, res) => {
  try {
    const followerId = req.user.userId; // Current authenticated user
    const { photographerId } = req.params;

    // Validate photographerId
    if (!photographerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Photographer ID is required'
      });
    }

    // Get photographer's user_id
    const photographerResult = await query(
      'SELECT user_id FROM photographers WHERE photographer_id = $1 AND is_active = true',
      [photographerId]
    );

    if (photographerResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }

    const followingId = photographerResult[0].user_id;

    // Check if trying to follow self
    if (followerId === followingId) {
      return res.status(400).json({
        status: 'error',
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    const existingFollow = await query(
      'SELECT follow_id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (existingFollow.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already following this photographer'
      });
    }

    // Create follow relationship
    await query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, followingId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Successfully followed photographer',
      data: {
        isFollowing: true
      }
    });
  } catch (error) {
    console.error('Follow photographer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to follow photographer'
    });
  }
};

// Unfollow a photographer
export const unfollowPhotographer = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { photographerId } = req.params;

    // Get photographer's user_id
    const photographerResult = await query(
      'SELECT user_id FROM photographers WHERE photographer_id = $1 AND is_active = true',
      [photographerId]
    );

    if (photographerResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }

    const followingId = photographerResult[0].user_id;

    // Check if following
    const existingFollow = await query(
      'SELECT follow_id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (existingFollow.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not following this photographer'
      });
    }

    // Remove follow relationship
    await query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Successfully unfollowed photographer',
      data: {
        isFollowing: false
      }
    });
  } catch (error) {
    console.error('Unfollow photographer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to unfollow photographer'
    });
  }
};

// Get follow status (check if current user follows a photographer)
export const getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user?.userId; // Optional auth
    const { photographerId } = req.params;

    if (!followerId) {
      return res.status(200).json({
        status: 'success',
        data: {
          isFollowing: false
        }
      });
    }

    // Get photographer's user_id
    const photographerResult = await query(
      'SELECT user_id FROM photographers WHERE photographer_id = $1 AND is_active = true',
      [photographerId]
    );

    if (photographerResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }

    const followingId = photographerResult[0].user_id;

    // Check if following
    const followResult = await query(
      'SELECT follow_id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        isFollowing: followResult.length > 0
      }
    });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get follow status'
    });
  }
};

// Get list of followers for a photographer
export const getFollowers = async (req, res) => {
  try {
    const { photographerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get photographer's user_id
    const photographerResult = await query(
      'SELECT user_id FROM photographers WHERE photographer_id = $1 AND is_active = true',
      [photographerId]
    );

    if (photographerResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }

    const followingId = photographerResult[0].user_id;

    // Get followers with user info
    const followers = await query(
      `SELECT 
         f.follow_id,
         f.created_at as followed_at,
         u.user_id,
         up.full_name,
         up.avatar_url,
         u.user_type
       FROM follows f
       JOIN users u ON f.follower_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE f.following_id = $1 AND u.is_active = true
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [followingId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM follows WHERE following_id = $1',
      [followingId]
    );
    const total = parseInt(countResult[0].total);

    res.status(200).json({
      status: 'success',
      data: {
        followers: followers.map(f => ({
          userId: f.user_id,
          fullName: f.full_name,
          avatarUrl: f.avatar_url,
          userType: f.user_type,
          followedAt: f.followed_at
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch followers'
    });
  }
};

// Get current user's following count and list
export const getMyFollowing = async (req, res) => {
  try {
    const followerId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    // Get following list with user info
    const following = await query(
      `SELECT 
         f.follow_id,
         f.created_at as followed_at,
         u.user_id,
         up.full_name,
         up.avatar_url,
         u.user_type,
         ph.photographer_id
       FROM follows f
       JOIN users u ON f.following_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       LEFT JOIN photographers ph ON u.user_id = ph.user_id
       WHERE f.follower_id = $1 AND u.is_active = true
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [followerId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM follows WHERE follower_id = $1',
      [followerId]
    );
    const total = parseInt(countResult[0].total);

    res.status(200).json({
      status: 'success',
      data: {
        following: following.map(f => ({
          userId: f.user_id,
          photographerId: f.photographer_id,
          fullName: f.full_name,
          avatarUrl: f.avatar_url,
          userType: f.user_type,
          followedAt: f.followed_at
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get my following error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch following list'
    });
  }
};

// Get list of who a photographer is following
export const getFollowing = async (req, res) => {
  try {
    const { photographerId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Get photographer's user_id
    const photographerResult = await query(
      'SELECT user_id FROM photographers WHERE photographer_id = $1 AND is_active = true',
      [photographerId]
    );

    if (photographerResult.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Photographer not found'
      });
    }

    const followerId = photographerResult[0].user_id;

    // Get following list with user info
    const following = await query(
      `SELECT 
         f.follow_id,
         f.created_at as followed_at,
         u.user_id,
         up.full_name,
         up.avatar_url,
         u.user_type,
         ph.photographer_id
       FROM follows f
       JOIN users u ON f.following_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       LEFT JOIN photographers ph ON u.user_id = ph.user_id
       WHERE f.follower_id = $1 AND u.is_active = true
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [followerId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM follows WHERE follower_id = $1',
      [followerId]
    );
    const total = parseInt(countResult[0].total);

    res.status(200).json({
      status: 'success',
      data: {
        following: following.map(f => ({
          userId: f.user_id,
          photographerId: f.photographer_id,
          fullName: f.full_name,
          avatarUrl: f.avatar_url,
          userType: f.user_type,
          followedAt: f.followed_at
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch following list'
    });
  }
};

