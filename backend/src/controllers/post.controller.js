import { query } from '../config/database.js';

// Get all posts (feed)
export const getAllPosts = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const posts = await query(
      `SELECT p.*, up.full_name, up.avatar_url, u.user_type
       FROM posts p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE p.is_active = 1
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        posts: posts.map(p => ({
          postId: p.post_id,
          userId: p.user_id,
          fullName: p.full_name,
          avatarUrl: p.avatar_url,
          userType: p.user_type,
          contentType: p.content_type,
          caption: p.caption,
          mediaUrls: JSON.parse(p.media_urls || '[]'),
          thumbnailUrl: p.thumbnail_url,
          location: p.location,
          tags: JSON.parse(p.tags || '[]'),
          likesCount: p.likes_count,
          commentsCount: p.comments_count,
          sharesCount: p.shares_count,
          viewsCount: p.views_count,
          createdAt: p.created_at
        }))
      }
    });
    
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch posts'
    });
  }
};

