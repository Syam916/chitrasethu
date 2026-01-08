import { query } from '../config/database.js';
import cloudinaryService from '../services/cloudinary.service.js';

// Get all mood boards (with filters)
export const getAllMoodBoards = async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      category, 
      privacy, 
      search,
      photographerId 
    } = req.query;

    const userId = req.user?.userId || null;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Filter by photographer if specified
    if (photographerId) {
      whereConditions.push(`c.user_id = $${paramIndex}`);
      queryParams.push(parseInt(photographerId));
      paramIndex++;
    } else if (userId) {
      // If authenticated, show user's boards + public boards + boards where user is collaborator
      whereConditions.push(`(
        c.user_id = $${paramIndex} 
        OR c.is_public = true 
        OR EXISTS (
          SELECT 1 FROM board_collaborators bc 
          WHERE bc.collection_id = c.collection_id 
          AND bc.user_id = $${paramIndex} 
          AND bc.status = 'active'
        )
      )`);
      queryParams.push(userId);
      paramIndex++;
    } else {
      // If not authenticated, only show public boards
      whereConditions.push(`c.is_public = true`);
    }

    // Filter by category
    if (category && category !== 'all' && category !== 'All') {
      whereConditions.push(`LOWER(c.category) = LOWER($${paramIndex})`);
      queryParams.push(category);
      paramIndex++;
    }

    // Filter by privacy
    if (privacy && privacy !== 'all' && privacy !== 'All') {
      if (privacy === 'public') {
        whereConditions.push(`c.is_public = true`);
      } else if (privacy === 'private') {
        whereConditions.push(`c.is_public = false`);
        // Show private boards if user owns them OR is a collaborator
        if (userId) {
          whereConditions.push(`(
            c.user_id = $${paramIndex} 
            OR EXISTS (
              SELECT 1 FROM board_collaborators bc 
              WHERE bc.collection_id = c.collection_id 
              AND bc.user_id = $${paramIndex} 
              AND bc.status = 'active'
            )
          )`);
          queryParams.push(userId);
          paramIndex++;
        }
      }
    }

    // Search by title or description
    if (search) {
      whereConditions.push(`(
        LOWER(c.title) LIKE LOWER($${paramIndex}) OR 
        LOWER(c.description) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const boards = await query(
      `SELECT 
         c.*,
         up.full_name,
         up.avatar_url,
         u.user_type,
         ph.photographer_id,
         CASE 
           WHEN $${paramIndex}::int IS NULL THEN false
           ELSE c.user_id = $${paramIndex}
         END AS is_owner,
         CASE 
           WHEN $${paramIndex}::int IS NULL THEN false
           ELSE EXISTS (
             SELECT 1 FROM board_collaborators bc 
             WHERE bc.collection_id = c.collection_id 
             AND bc.user_id = $${paramIndex} 
             AND bc.status = 'active'
           )
         END AS is_collaborator,
         CASE 
           WHEN $${paramIndex}::int IS NULL THEN false
           ELSE EXISTS (
             SELECT 1 FROM collection_likes cl 
             WHERE cl.collection_id = c.collection_id 
             AND cl.user_id = $${paramIndex}
           )
         END AS is_liked_by_current_user
       FROM collections c
       JOIN users u ON c.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       LEFT JOIN photographers ph ON ph.user_id = u.user_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      [...queryParams, userId, parseInt(limit), parseInt(offset)]
    );

    // Format response
    const formattedBoards = boards.map(board => ({
      boardId: board.collection_id,
      userId: board.user_id,
      boardName: board.title,
      description: board.description,
      coverImage: board.thumbnail_url,
      images: board.images || [],
      imageCount: Array.isArray(board.images) ? board.images.length : 0,
      category: board.category,
      tags: board.tags || [],
      privacy: board.is_public ? 'public' : 'private',
      views: board.views_count || 0,
      saves: board.saves_count || 0,
      likes: board.likes_count || 0,
      createdAt: board.created_at,
      updatedAt: board.updated_at,
      isOwner: board.is_owner,
      isCollaborator: board.is_collaborator && !board.is_owner,
      isLikedByCurrentUser: board.is_liked_by_current_user || false,
      creator: {
        fullName: board.full_name,
        avatarUrl: board.avatar_url,
        userType: board.user_type,
        photographerId: board.photographer_id
      }
    }));

    res.status(200).json({
      status: 'success',
      data: {
        boards: formattedBoards,
        total: formattedBoards.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get mood boards error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mood boards'
    });
  }
};

// Get single mood board by ID
export const getMoodBoardById = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.userId || null;

    const result = await query(
      `SELECT 
         c.*,
         up.full_name,
         up.avatar_url,
         u.user_type,
         ph.photographer_id,
         CASE 
           WHEN $2::int IS NULL THEN false
           ELSE EXISTS (
             SELECT 1 FROM collection_likes cl 
             WHERE cl.collection_id = c.collection_id AND cl.user_id = $2
           )
         END AS is_liked_by_current_user
       FROM collections c
       JOIN users u ON c.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       LEFT JOIN photographers ph ON ph.user_id = u.user_id
       WHERE c.collection_id = $1`,
      [parseInt(boardId), userId]
    );

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = result[0];

    // Check if user can access private board and get collaborator permission
    let collaboratorPermission = null;
    if (!board.is_public && board.user_id !== userId) {
      // Check if user is a collaborator
      if (userId) {
        const collaboratorCheck = await query(
          `SELECT permission_level FROM board_collaborators 
           WHERE collection_id = $1 AND user_id = $2 AND status = 'active'`,
          [parseInt(boardId), userId]
        );
        
        if (collaboratorCheck.length === 0) {
          return res.status(403).json({
            status: 'error',
            message: 'You do not have permission to view this mood board'
          });
        }
        collaboratorPermission = collaboratorCheck[0].permission_level;
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view this mood board'
        });
      }
    }

    // Increment view count
    if (userId && userId !== board.user_id) {
      await query(
        `UPDATE collections 
         SET views_count = views_count + 1 
         WHERE collection_id = $1`,
        [parseInt(boardId)]
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        board: {
          boardId: board.collection_id,
          userId: board.user_id,
          boardName: board.title,
          description: board.description,
          coverImage: board.thumbnail_url,
          images: board.images || [],
          imageCount: Array.isArray(board.images) ? board.images.length : 0,
          category: board.category,
          tags: board.tags || [],
          privacy: board.is_public ? 'public' : 'private',
          views: board.views_count || 0,
          saves: board.saves_count || 0,
          likes: board.likes_count || 0,
          createdAt: board.created_at,
          updatedAt: board.updated_at,
          isOwner: board.user_id === userId,
          isCollaborator: !!collaboratorPermission,
          collaboratorPermission: collaboratorPermission || null,
          isLikedByCurrentUser: board.is_liked_by_current_user || false,
          creator: {
            fullName: board.full_name,
            avatarUrl: board.avatar_url,
            userType: board.user_type,
            photographerId: board.photographer_id
          }
        }
      }
    });

  } catch (error) {
    console.error('Get mood board error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mood board'
    });
  }
};

// Create new mood board
export const createMoodBoard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      boardName, 
      description, 
      category, 
      tags, 
      privacy,
      coverImage,
      images 
    } = req.body;

    // Validate required fields
    if (!boardName || !boardName.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Board name is required'
      });
    }

    // Parse tags if it's a string
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = Array.isArray(tags) ? tags : [];
      }
    }
    if (!Array.isArray(parsedTags)) {
      parsedTags = [];
    }

    // Parse images if it's a string
    let parsedImages = images;
    if (typeof images === 'string') {
      try {
        parsedImages = JSON.parse(images);
      } catch (e) {
        parsedImages = Array.isArray(images) ? images : [];
      }
    }
    if (!Array.isArray(parsedImages)) {
      parsedImages = [];
    }

    // Set thumbnail from cover image or first image
    const thumbnailUrl = coverImage || (parsedImages.length > 0 ? parsedImages[0] : null);

    // Determine privacy
    const isPublic = privacy !== 'private';

    // Insert mood board into database
    const result = await query(
      `INSERT INTO collections (
         user_id, 
         title, 
         description, 
         thumbnail_url, 
         images, 
         category, 
         tags, 
         is_public
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        boardName.trim(),
        description || null,
        thumbnailUrl,
        JSON.stringify(parsedImages),
        category || null,
        JSON.stringify(parsedTags),
        isPublic
      ]
    );

    const newBoard = result[0];

    res.status(201).json({
      status: 'success',
      message: 'Mood board created successfully',
      data: {
        board: {
          boardId: newBoard.collection_id,
          userId: newBoard.user_id,
          boardName: newBoard.title,
          description: newBoard.description,
          coverImage: newBoard.thumbnail_url,
          images: parsedImages,
          imageCount: parsedImages.length,
          category: newBoard.category,
          tags: parsedTags,
          privacy: newBoard.is_public ? 'public' : 'private',
          views: newBoard.views_count || 0,
          saves: newBoard.saves_count || 0,
          likes: newBoard.likes_count || 0,
          createdAt: newBoard.created_at,
          updatedAt: newBoard.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Create mood board error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create mood board'
    });
  }
};

// Update mood board
export const updateMoodBoard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { boardId } = req.params;
    const { 
      boardName, 
      description, 
      category, 
      tags, 
      privacy,
      coverImage,
      images 
    } = req.body;

    // Check if board exists and user owns it
    const existing = await query(
      `SELECT * FROM collections WHERE collection_id = $1`,
      [parseInt(boardId)]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this mood board'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (boardName !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(boardName.trim());
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (tags !== undefined) {
      let parsedTags = tags;
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = Array.isArray(tags) ? tags : [];
        }
      }
      updates.push(`tags = $${paramIndex}`);
      values.push(JSON.stringify(parsedTags));
      paramIndex++;
    }

    if (privacy !== undefined) {
      updates.push(`is_public = $${paramIndex}`);
      values.push(privacy !== 'private');
      paramIndex++;
    }

    if (coverImage !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex}`);
      values.push(coverImage);
      paramIndex++;
    }

    if (images !== undefined) {
      let parsedImages = images;
      if (typeof images === 'string') {
        try {
          parsedImages = JSON.parse(images);
        } catch (e) {
          parsedImages = Array.isArray(images) ? images : [];
        }
      }
      updates.push(`images = $${paramIndex}`);
      values.push(JSON.stringify(parsedImages));
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(parseInt(boardId));

    const result = await query(
      `UPDATE collections 
       SET ${updates.join(', ')}
       WHERE collection_id = $${paramIndex}
       RETURNING *`,
      values
    );

    const updatedBoard = result[0];

    res.status(200).json({
      status: 'success',
      message: 'Mood board updated successfully',
      data: {
        board: {
          boardId: updatedBoard.collection_id,
          userId: updatedBoard.user_id,
          boardName: updatedBoard.title,
          description: updatedBoard.description,
          coverImage: updatedBoard.thumbnail_url,
          images: updatedBoard.images ? JSON.parse(updatedBoard.images) : [],
          imageCount: updatedBoard.images ? JSON.parse(updatedBoard.images).length : 0,
          category: updatedBoard.category,
          tags: updatedBoard.tags ? JSON.parse(updatedBoard.tags) : [],
          privacy: updatedBoard.is_public ? 'public' : 'private',
          views: updatedBoard.views_count || 0,
          saves: updatedBoard.saves_count || 0,
          likes: updatedBoard.likes_count || 0,
          createdAt: updatedBoard.created_at,
          updatedAt: updatedBoard.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update mood board error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update mood board'
    });
  }
};

// Delete mood board
export const deleteMoodBoard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { boardId } = req.params;

    // Check if board exists and user owns it
    const existing = await query(
      `SELECT * FROM collections WHERE collection_id = $1`,
      [parseInt(boardId)]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this mood board'
      });
    }

    await query(
      `DELETE FROM collections WHERE collection_id = $1`,
      [parseInt(boardId)]
    );

    res.status(200).json({
      status: 'success',
      message: 'Mood board deleted successfully'
    });

  } catch (error) {
    console.error('Delete mood board error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete mood board'
    });
  }
};

// Add images to mood board
export const addImagesToMoodBoard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { boardId } = req.params;
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Images array is required'
      });
    }

    // Check if board exists and user owns it
    const existing = await query(
      `SELECT * FROM collections WHERE collection_id = $1`,
      [parseInt(boardId)]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to modify this mood board'
      });
    }

    // Get existing images
    const existingImages = existing[0].images 
      ? (typeof existing[0].images === 'string' 
          ? JSON.parse(existing[0].images) 
          : existing[0].images)
      : [];

    // Merge with new images
    const updatedImages = [...existingImages, ...images];

    // Update thumbnail if not set
    const thumbnailUrl = existing[0].thumbnail_url || images[0] || null;

    const result = await query(
      `UPDATE collections 
       SET images = $1, 
           thumbnail_url = COALESCE(thumbnail_url, $2),
           updated_at = CURRENT_TIMESTAMP
       WHERE collection_id = $3
       RETURNING *`,
      [JSON.stringify(updatedImages), thumbnailUrl, parseInt(boardId)]
    );

    const updatedBoard = result[0];

    res.status(200).json({
      status: 'success',
      message: 'Images added successfully',
      data: {
        board: {
          boardId: updatedBoard.collection_id,
          images: updatedImages,
          imageCount: updatedImages.length
        }
      }
    });

  } catch (error) {
    console.error('Add images error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add images to mood board'
    });
  }
};

// Remove image from mood board
export const removeImageFromMoodBoard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { boardId, imageIndex } = req.params;

    // Check if board exists and user owns it
    const existing = await query(
      `SELECT * FROM collections WHERE collection_id = $1`,
      [parseInt(boardId)]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    if (existing[0].user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to modify this mood board'
      });
    }

    // Get existing images
    const existingImages = existing[0].images 
      ? (typeof existing[0].images === 'string' 
          ? JSON.parse(existing[0].images) 
          : existing[0].images)
      : [];

    const index = parseInt(imageIndex);
    if (index < 0 || index >= existingImages.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid image index'
      });
    }

    // Remove image
    existingImages.splice(index, 1);

    // Update thumbnail if it was the first image
    const thumbnailUrl = existingImages.length > 0 ? existingImages[0] : null;

    const result = await query(
      `UPDATE collections 
       SET images = $1, 
           thumbnail_url = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE collection_id = $3
       RETURNING *`,
      [JSON.stringify(existingImages), thumbnailUrl, parseInt(boardId)]
    );

    res.status(200).json({
      status: 'success',
      message: 'Image removed successfully',
      data: {
        board: {
          boardId: result[0].collection_id,
          images: existingImages,
          imageCount: existingImages.length
        }
      }
    });

  } catch (error) {
    console.error('Remove image error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove image from mood board'
    });
  }
};

// Like/unlike mood board
export const toggleLikeMoodBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;

    // Check if like already exists
    const existing = await query(
      'SELECT like_id FROM collection_likes WHERE collection_id = $1 AND user_id = $2',
      [parseInt(boardId), userId]
    );

    let isLiked;

    if (existing.length > 0) {
      // Unlike: remove like row
      await query(
        'DELETE FROM collection_likes WHERE collection_id = $1 AND user_id = $2',
        [parseInt(boardId), userId]
      );
      isLiked = false;
      
      // Decrement likes_count
      await query(
        'UPDATE collections SET likes_count = GREATEST(likes_count - 1, 0) WHERE collection_id = $1',
        [parseInt(boardId)]
      );
    } else {
      // Like: insert row
      await query(
        'INSERT INTO collection_likes (collection_id, user_id) VALUES ($1, $2)',
        [parseInt(boardId), userId]
      );
      isLiked = true;
      
      // Increment likes_count
      await query(
        'UPDATE collections SET likes_count = likes_count + 1 WHERE collection_id = $1',
        [parseInt(boardId)]
      );
    }

    // Fetch updated counts
    const result = await query(
      'SELECT likes_count, saves_count, views_count FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    if (result.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = result[0];

    res.status(200).json({
      status: 'success',
      message: isLiked ? 'Mood board liked' : 'Mood board unliked',
      data: {
        boardId: parseInt(boardId),
        isLikedByCurrentUser: isLiked,
        likesCount: board.likes_count,
        savesCount: board.saves_count,
        viewsCount: board.views_count
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

// Add comment to mood board
export const addCommentToMoodBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;
    const { commentText, parentCommentId } = req.body;

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Comment text is required'
      });
    }

    // Check if board exists and is accessible
    const boardCheck = await query(
      'SELECT collection_id, is_public, user_id FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    if (boardCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = boardCheck[0];

    // Check if user can comment (public board, owner, or collaborator with comment/edit permission)
    if (!board.is_public && board.user_id !== userId) {
      const collaboratorCheck = await query(
        `SELECT permission_level FROM board_collaborators 
         WHERE collection_id = $1 AND user_id = $2 AND status = 'active'`,
        [parseInt(boardId), userId]
      );
      
      if (collaboratorCheck.length === 0) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to comment on this mood board'
        });
      }

      const permission = collaboratorCheck[0].permission_level;
      if (permission !== 'comment' && permission !== 'edit') {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to comment on this mood board'
        });
      }
    }

    // Insert comment
    const result = await query(
      `INSERT INTO collection_comments (collection_id, user_id, comment_text, parent_comment_id)
       VALUES ($1, $2, $3, $4)
       RETURNING comment_id, collection_id, user_id, comment_text, parent_comment_id, created_at`,
      [parseInt(boardId), userId, commentText.trim(), parentCommentId || null]
    );

    const comment = result[0];

    // Fetch commenter info
    const users = await query(
      `SELECT up.full_name, up.avatar_url, u.user_type
       FROM users u 
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    const user = users[0];

    // Increment comments_count (if column exists)
    try {
      await query(
        'UPDATE collections SET comments_count = COALESCE(comments_count, 0) + 1 WHERE collection_id = $1',
        [parseInt(boardId)]
      );
    } catch (error) {
      // If column doesn't exist, add it and then update
      if (error.code === '42703') {
        await query(
          'ALTER TABLE collections ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0'
        );
        await query(
          'UPDATE collections SET comments_count = COALESCE(comments_count, 0) + 1 WHERE collection_id = $1',
          [parseInt(boardId)]
        );
      } else {
        throw error;
      }
    }

    // Fetch updated comment count
    const boards = await query(
      'SELECT COALESCE(comments_count, 0) as comments_count FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    res.status(201).json({
      status: 'success',
      message: 'Comment added',
      data: {
        comment: {
          commentId: comment.comment_id,
          boardId: comment.collection_id,
          userId: comment.user_id,
          commentText: comment.comment_text,
          parentCommentId: comment.parent_comment_id,
          createdAt: comment.created_at,
          fullName: user?.full_name,
          avatarUrl: user?.avatar_url,
          userType: user?.user_type
        },
        commentsCount: boards[0]?.comments_count || 0
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

// Get comments for mood board
export const getCommentsForMoodBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.userId || null;

    // Check if board exists and is accessible
    const boardCheck = await query(
      'SELECT collection_id, is_public, user_id FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    if (boardCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = boardCheck[0];

    // Check if user can view comments (public board or owner)
    if (!board.is_public && board.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view comments on this mood board'
      });
    }

    // Get comments
    const comments = await query(
      `SELECT 
         cc.*,
         up.full_name,
         up.avatar_url,
         u.user_type
       FROM collection_comments cc
       JOIN users u ON cc.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE cc.collection_id = $1 AND cc.is_active = true
       ORDER BY cc.created_at ASC`,
      [parseInt(boardId)]
    );

    res.status(200).json({
      status: 'success',
      data: {
        comments: comments.map(c => ({
          commentId: c.comment_id,
          boardId: c.collection_id,
          userId: c.user_id,
          commentText: c.comment_text,
          parentCommentId: c.parent_comment_id,
          likesCount: c.likes_count || 0,
          isEdited: c.is_edited,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          fullName: c.full_name,
          avatarUrl: c.avatar_url,
          userType: c.user_type
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

// Search users to invite as collaborators
export const searchUsersForCollaboration = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.userId;

    if (!search || search.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search term must be at least 2 characters'
      });
    }

    const searchTerm = `%${search.trim()}%`;

    const users = await query(
      `SELECT 
         u.user_id,
         u.email,
         u.user_type,
         up.full_name,
         up.avatar_url
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.is_active = true 
         AND u.user_id != $1
         AND (up.full_name ILIKE $2 OR u.email ILIKE $2)
       ORDER BY up.full_name ASC
       LIMIT 20`,
      [userId, searchTerm]
    );

    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(u => ({
          userId: u.user_id,
          email: u.email,
          fullName: u.full_name,
          avatarUrl: u.avatar_url,
          userType: u.user_type
        }))
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search users'
    });
  }
};

// Add collaborator to mood board
export const addCollaborator = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { userId: collaboratorUserId, permissionLevel = 'view' } = req.body;
    const userId = req.user.userId;

    if (!collaboratorUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    if (!['view', 'comment', 'edit'].includes(permissionLevel)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid permission level. Must be: view, comment, or edit'
      });
    }

    // Check if board exists and user owns it
    const boardCheck = await query(
      'SELECT collection_id, user_id, is_public FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    if (boardCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = boardCheck[0];

    if (board.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the board owner can add collaborators'
      });
    }

    // Can't add collaborators to public boards (they're already accessible)
    if (board.is_public) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot add collaborators to public boards'
      });
    }

    // Check if collaborator already exists
    const existing = await query(
      'SELECT collaborator_id FROM board_collaborators WHERE collection_id = $1 AND user_id = $2',
      [parseInt(boardId), parseInt(collaboratorUserId)]
    );

    if (existing.length > 0) {
      // Update existing collaborator
      await query(
        `UPDATE board_collaborators 
         SET permission_level = $1, status = 'active', invited_by = $2, invited_at = NOW()
         WHERE collection_id = $3 AND user_id = $4`,
        [permissionLevel, userId, parseInt(boardId), parseInt(collaboratorUserId)]
      );
    } else {
      // Add new collaborator
      await query(
        `INSERT INTO board_collaborators (collection_id, user_id, permission_level, invited_by)
         VALUES ($1, $2, $3, $4)`,
        [parseInt(boardId), parseInt(collaboratorUserId), permissionLevel, userId]
      );
    }

    // Fetch collaborator info
    const collaboratorInfo = await query(
      `SELECT 
         bc.collaborator_id,
         bc.permission_level,
         bc.invited_at,
         u.user_id,
         u.email,
         u.user_type,
         up.full_name,
         up.avatar_url
       FROM board_collaborators bc
       JOIN users u ON bc.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE bc.collection_id = $1 AND bc.user_id = $2`,
      [parseInt(boardId), parseInt(collaboratorUserId)]
    );

    res.status(201).json({
      status: 'success',
      message: 'Collaborator added successfully',
      data: {
        collaborator: {
          collaboratorId: collaboratorInfo[0].collaborator_id,
          userId: collaboratorInfo[0].user_id,
          email: collaboratorInfo[0].email,
          fullName: collaboratorInfo[0].full_name,
          avatarUrl: collaboratorInfo[0].avatar_url,
          userType: collaboratorInfo[0].user_type,
          permissionLevel: collaboratorInfo[0].permission_level,
          invitedAt: collaboratorInfo[0].invited_at
        }
      }
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add collaborator'
    });
  }
};

// Get collaborators for a mood board
export const getCollaborators = async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.userId;

    // Check if board exists
    const boardCheck = await query(
      'SELECT collection_id, user_id, is_public FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    if (boardCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = boardCheck[0];

    // Only owner can see collaborators list
    if (!userId || board.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the board owner can view collaborators'
      });
    }

    const collaborators = await query(
      `SELECT 
         bc.collaborator_id,
         bc.permission_level,
         bc.invited_at,
         bc.status,
         u.user_id,
         u.email,
         u.user_type,
         up.full_name,
         up.avatar_url
       FROM board_collaborators bc
       JOIN users u ON bc.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE bc.collection_id = $1 AND bc.status = 'active'
       ORDER BY bc.invited_at DESC`,
      [parseInt(boardId)]
    );

    res.status(200).json({
      status: 'success',
      data: {
        collaborators: collaborators.map(c => ({
          collaboratorId: c.collaborator_id,
          userId: c.user_id,
          email: c.email,
          fullName: c.full_name,
          avatarUrl: c.avatar_url,
          userType: c.user_type,
          permissionLevel: c.permission_level,
          invitedAt: c.invited_at
        }))
      }
    });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get collaborators'
    });
  }
};

// Remove collaborator from mood board
export const removeCollaborator = async (req, res) => {
  try {
    const { boardId, collaboratorId } = req.params;
    const userId = req.user.userId;

    // Check if board exists and user owns it
    const boardCheck = await query(
      'SELECT collection_id, user_id FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    if (boardCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = boardCheck[0];

    if (board.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the board owner can remove collaborators'
      });
    }

    // Remove collaborator (soft delete by setting status to inactive)
    await query(
      `UPDATE board_collaborators 
       SET status = 'inactive' 
       WHERE collaborator_id = $1 AND collection_id = $2`,
      [parseInt(collaboratorId), parseInt(boardId)]
    );

    res.status(200).json({
      status: 'success',
      message: 'Collaborator removed successfully'
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove collaborator'
    });
  }
};

// Update collaborator permission
export const updateCollaboratorPermission = async (req, res) => {
  try {
    const { boardId, collaboratorId } = req.params;
    const { permissionLevel } = req.body;
    const userId = req.user.userId;

    if (!['view', 'comment', 'edit'].includes(permissionLevel)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid permission level. Must be: view, comment, or edit'
      });
    }

    // Check if board exists and user owns it
    const boardCheck = await query(
      'SELECT collection_id, user_id FROM collections WHERE collection_id = $1',
      [parseInt(boardId)]
    );

    if (boardCheck.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood board not found'
      });
    }

    const board = boardCheck[0];

    if (board.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the board owner can update collaborator permissions'
      });
    }

    // Update permission
    await query(
      `UPDATE board_collaborators 
       SET permission_level = $1 
       WHERE collaborator_id = $2 AND collection_id = $3 AND status = 'active'`,
      [permissionLevel, parseInt(collaboratorId), parseInt(boardId)]
    );

    res.status(200).json({
      status: 'success',
      message: 'Collaborator permission updated successfully'
    });
  } catch (error) {
    console.error('Update collaborator permission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update collaborator permission'
    });
  }
};

