import { query } from '../config/database.js';
import cloudinaryService from '../services/cloudinary.service.js';

// Get all posts (feed)
export const getAllPosts = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const userId = req.user?.userId || null;

    const posts = await query(
      `SELECT 
         p.*, 
         up.full_name, 
         up.avatar_url, 
         u.user_type,
         ph.photographer_id,
         CASE 
           WHEN $3::int IS NULL THEN false
           ELSE EXISTS (
             SELECT 1 FROM post_likes pl 
             WHERE pl.post_id = p.post_id AND pl.user_id = $3
           )
         END AS is_liked_by_current_user
       FROM posts p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       LEFT JOIN photographers ph ON ph.user_id = u.user_id
       WHERE p.is_active = true
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset), userId]
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
          photographerId: p.photographer_id,
          contentType: p.content_type,
          caption: p.caption,
          mediaUrls: p.media_urls,
          thumbnailUrl: p.thumbnail_url,
          location: p.location,
          tags: p.tags,
          likesCount: p.likes_count,
          commentsCount: p.comments_count,
          sharesCount: p.shares_count,
          viewsCount: p.views_count,
          createdAt: p.created_at,
          isLikedByCurrentUser: p.is_liked_by_current_user
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

// Create new post
export const createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { caption, location, tags, visibility, contentType } = req.body;

    // Parse media_urls if it's a string
    let mediaUrls = req.body.media_urls;
    if (typeof mediaUrls === 'string') {
      mediaUrls = JSON.parse(mediaUrls);
    }

    // Validate that we have at least one media URL for image/video/gallery posts
    if (['image', 'video', 'gallery'].includes(contentType) && (!mediaUrls || mediaUrls.length === 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one media file is required for this post type'
      });
    }

    // Get thumbnail from first image
    const thumbnailUrl = mediaUrls && mediaUrls.length > 0 ? mediaUrls[0].thumbnailUrl : null;

    // Parse tags if it's a string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      parsedTags = JSON.parse(tags);
    }

    // Insert post into database
    const result = await query(
      `INSERT INTO posts 
        (user_id, content_type, caption, media_urls, thumbnail_url, location, tags, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        contentType || 'image',
        caption || null,
        JSON.stringify(mediaUrls || []),
        thumbnailUrl,
        location || null,
        JSON.stringify(parsedTags || []),
        visibility || 'public'
      ]
    );

    const post = result[0];

    // Get user info (including user_type) and photographer_id if applicable
    const userInfo = await query(
      `SELECT up.full_name, up.avatar_url, u.user_type, ph.photographer_id
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       LEFT JOIN photographers ph ON ph.user_id = u.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    const fullName = userInfo[0]?.full_name;
    const avatarUrl = userInfo[0]?.avatar_url;
    const userType = userInfo[0]?.user_type;
    const photographerId = userInfo[0]?.photographer_id;

    // If user is a photographer and post has media, mirror images into photographer_portfolios
    if (userType === 'photographer' && Array.isArray(mediaUrls) && mediaUrls.length > 0 && photographerId) {
      const photoValues = [];
      const photoParams = [];
      let idx = 1;

      mediaUrls.forEach((m) => {
        if (!m.url) return;
        photoValues.push(
          `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
        );
        photoParams.push(
          photographerId,
          m.url,
          m.thumbnailUrl || null,
          caption || null,
          null, // description
          null, // category
          post.post_id // post_id to link back to post
        );
      });

      if (photoValues.length > 0) {
        await query(
          `INSERT INTO photographer_portfolios
             (photographer_id, image_url, thumbnail_url, title, description, category, post_id)
           VALUES
             ${photoValues.join(', ')}`,
          photoParams
        );
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: {
        post: {
          postId: post.post_id,
          userId: post.user_id,
          fullName,
          avatarUrl,
          userType,
          contentType: post.content_type,
          caption: post.caption,
          mediaUrls: post.media_urls,
          thumbnailUrl: post.thumbnail_url,
          location: post.location,
          tags: post.tags,
          likesCount: post.likes_count,
          commentsCount: post.comments_count,
          sharesCount: post.shares_count,
          viewsCount: post.views_count,
          createdAt: post.created_at
        }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const posts = await query(
      `SELECT p.*, up.full_name, up.avatar_url, u.user_type
       FROM posts p
       JOIN users u ON p.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE p.post_id = $1 AND p.is_active = true`,
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const post = posts[0];

    res.status(200).json({
      status: 'success',
      data: {
        post: {
          postId: post.post_id,
          userId: post.user_id,
          fullName: post.full_name,
          avatarUrl: post.avatar_url,
          userType: post.user_type,
          contentType: post.content_type,
          caption: post.caption,
          mediaUrls: post.media_urls,
          thumbnailUrl: post.thumbnail_url,
          location: post.location,
          tags: post.tags,
          likesCount: post.likes_count,
          commentsCount: post.comments_count,
          sharesCount: post.shares_count,
          viewsCount: post.views_count,
          createdAt: post.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch post'
    });
  }
};

// Like/unlike post (toggle)
export const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if like already exists
    const existing = await query(
      'SELECT like_id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    let isLiked;

    if (existing.length > 0) {
      // Unlike: remove like row
      await query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [
        postId,
        userId
      ]);
      isLiked = false;
    } else {
      // Like: insert row
      await query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      );
      isLiked = true;
    }

    // Fetch updated counts from posts table
    const posts = await query(
      'SELECT likes_count, comments_count, shares_count FROM posts WHERE post_id = $1',
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const post = posts[0];

    res.status(200).json({
      status: 'success',
      message: isLiked ? 'Post liked' : 'Post unliked',
      data: {
        postId: Number(postId),
        isLikedByCurrentUser: isLiked,
        likesCount: post.likes_count,
        commentsCount: post.comments_count,
        sharesCount: post.shares_count
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update like status'
    });
  }
};

// Add comment to post
export const addCommentToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { commentText, parentCommentId } = req.body;

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment text is required'
      });
    }

    const result = await query(
      `INSERT INTO post_comments (post_id, user_id, comment_text, parent_comment_id)
       VALUES ($1, $2, $3, $4)
       RETURNING comment_id, post_id, user_id, comment_text, parent_comment_id, created_at`,
      [postId, userId, commentText.trim(), parentCommentId || null]
    );

    const comment = result[0];

    // Fetch commenter info
    const users = await query(
      `SELECT up.full_name, up.avatar_url 
       FROM users u 
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    const user = users[0];

    // Fetch updated comment count
    const posts = await query(
      'SELECT comments_count FROM posts WHERE post_id = $1',
      [postId]
    );

    res.status(201).json({
      status: 'success',
      message: 'Comment added',
      data: {
        comment: {
          commentId: comment.comment_id,
          postId: comment.post_id,
          userId: comment.user_id,
          commentText: comment.comment_text,
          parentCommentId: comment.parent_comment_id,
          createdAt: comment.created_at,
          fullName: user?.full_name,
          avatarUrl: user?.avatar_url
        },
        commentsCount: posts[0]?.comments_count
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add comment'
    });
  }
};

// Get comments for a post
export const getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const comments = await query(
      `SELECT 
         c.comment_id,
         c.post_id,
         c.user_id,
         c.comment_text,
         c.parent_comment_id,
         c.created_at,
         up.full_name,
         up.avatar_url
       FROM post_comments c
       JOIN users u ON c.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC
       LIMIT $2 OFFSET $3`,
      [postId, parseInt(limit), parseInt(offset)]
    );

    res.status(200).json({
      status: 'success',
      data: {
        comments: comments.map(c => ({
          commentId: c.comment_id,
          postId: c.post_id,
          userId: c.user_id,
          commentText: c.comment_text,
          parentCommentId: c.parent_comment_id,
          createdAt: c.created_at,
          fullName: c.full_name,
          avatarUrl: c.avatar_url
        }))
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch comments'
    });
  }
};

// Get users who liked a post
export const getLikesForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const likes = await query(
      `SELECT 
         pl.like_id,
         pl.post_id,
         pl.user_id,
         up.full_name,
         up.avatar_url,
         u.user_type
       FROM post_likes pl
       JOIN users u ON pl.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE pl.post_id = $1
       ORDER BY pl.like_id DESC
       LIMIT $2 OFFSET $3`,
      [postId, parseInt(limit), parseInt(offset)]
    );

    res.status(200).json({
      status: 'success',
      data: {
        likes: likes.map(like => ({
          likeId: like.like_id,
          postId: like.post_id,
          userId: like.user_id,
          fullName: like.full_name,
          avatarUrl: like.avatar_url,
          userType: like.user_type,
        })),
      },
    });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch likes',
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if post exists and belongs to user
    const posts = await query(
      'SELECT * FROM posts WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (posts.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or you do not have permission to delete it'
      });
    }

    const post = posts[0];

    // Delete images from Cloudinary
    if (post.media_urls && Array.isArray(post.media_urls)) {
      const publicIds = post.media_urls
        .filter(media => media.publicId)
        .map(media => media.publicId);
      
      if (publicIds.length > 0) {
        try {
          await cloudinaryService.deleteMultipleImages(publicIds);
        } catch (error) {
          console.error('Error deleting images from Cloudinary:', error);
          // Continue with post deletion even if Cloudinary deletion fails
        }
      }
    }

    // Soft delete post
    await query(
      'UPDATE posts SET is_active = false WHERE post_id = $1',
      [postId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

