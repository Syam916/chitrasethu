import { query } from '../config/database.js';
import { emitToAll, emitToRoom } from '../config/socket.js';

// Get all discussion topics
export const getAllTopics = async (req, res) => {
  try {
    const { limit = 50, offset = 0, category, sort = 'latest' } = req.query;
    const userId = req.user?.userId || null;

    let orderBy = 'dt.created_at DESC';
    if (sort === 'activity') {
      orderBy = 'dt.last_activity_at DESC';
    } else if (sort === 'hot') {
      orderBy = 'dt.replies_count DESC, dt.last_activity_at DESC';
    }

    let categoryFilter = '';
    let params = [];
    
    if (category) {
      categoryFilter = 'AND dt.category = $3';
      params = [parseInt(limit), parseInt(offset), category];
    } else {
      params = [parseInt(limit), parseInt(offset)];
    }

    const topics = await query(
      `SELECT 
         dt.*,
         up.full_name as author_name,
         up.avatar_url as author_avatar,
         u.user_type as author_type
       FROM discussion_topics dt
       JOIN users u ON dt.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE dt.is_locked = false ${categoryFilter}
       ORDER BY ${orderBy}
       LIMIT $1 OFFSET $2`,
      params
    );

    // Get total count
    const countSql = category
      ? 'SELECT COUNT(*) as total FROM discussion_topics WHERE is_locked = false AND category = $1'
      : 'SELECT COUNT(*) as total FROM discussion_topics WHERE is_locked = false';
    const countParams = category ? [category] : [];
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult[0].total);

    res.status(200).json({
      status: 'success',
      data: {
        topics: topics.map(t => ({
          topicId: t.topic_id,
          userId: t.user_id,
          authorName: t.author_name,
          authorAvatar: t.author_avatar,
          authorType: t.author_type,
          title: t.title,
          description: t.description,
          category: t.category,
          repliesCount: t.replies_count,
          viewsCount: t.views_count,
          isHot: t.is_hot,
          isPinned: t.is_pinned,
          isLocked: t.is_locked,
          lastActivityAt: t.last_activity_at,
          createdAt: t.created_at,
          updatedAt: t.updated_at
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch discussion topics'
    });
  }
};

// Get single discussion topic with replies
export const getTopicById = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user?.userId || null;

    // Get topic
    const topics = await query(
      `SELECT 
         dt.*,
         up.full_name as author_name,
         up.avatar_url as author_avatar,
         u.user_type as author_type
       FROM discussion_topics dt
       JOIN users u ON dt.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE dt.topic_id = $1`,
      [topicId]
    );

    if (topics.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Discussion topic not found'
      });
    }

    const topic = topics[0];

    // Increment view count (if not viewing own topic)
    if (userId && userId !== topic.user_id) {
      await query(
        'UPDATE discussion_topics SET views_count = views_count + 1 WHERE topic_id = $1',
        [topicId]
      );
      topic.views_count = topic.views_count + 1;
    }

    // Get replies
    const replies = await query(
      `SELECT 
         dr.*,
         up.full_name as author_name,
         up.avatar_url as author_avatar,
         u.user_type as author_type
       FROM discussion_replies dr
       JOIN users u ON dr.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE dr.topic_id = $1 AND dr.is_active = true
       ORDER BY dr.created_at ASC`,
      [topicId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        topic: {
          topicId: topic.topic_id,
          userId: topic.user_id,
          authorName: topic.author_name,
          authorAvatar: topic.author_avatar,
          authorType: topic.author_type,
          title: topic.title,
          description: topic.description,
          category: topic.category,
          repliesCount: topic.replies_count,
          viewsCount: topic.views_count,
          isHot: topic.is_hot,
          isPinned: topic.is_pinned,
          isLocked: topic.is_locked,
          lastActivityAt: topic.last_activity_at,
          createdAt: topic.created_at,
          updatedAt: topic.updated_at
        },
        replies: replies.map(r => ({
          replyId: r.reply_id,
          topicId: r.topic_id,
          userId: r.user_id,
          authorName: r.author_name,
          authorAvatar: r.author_avatar,
          authorType: r.author_type,
          replyText: r.reply_text,
          parentReplyId: r.parent_reply_id,
          likesCount: r.likes_count,
          isEdited: r.is_edited,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }))
      }
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch discussion topic'
    });
  }
};

// Create new discussion topic
export const createTopic = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        status: 'error',
        message: 'Category is required'
      });
    }

    const result = await query(
      `INSERT INTO discussion_topics (user_id, title, description, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title.trim(), description?.trim() || null, category]
    );

    const topic = result[0];

    // Get author info
    const userInfo = await query(
      `SELECT up.full_name, up.avatar_url, u.user_type
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    const author = userInfo[0];

    const topicData = {
      topic: {
        topicId: topic.topic_id,
        userId: topic.user_id,
        authorName: author.full_name,
        authorAvatar: author.avatar_url,
        authorType: author.user_type,
        title: topic.title,
        description: topic.description,
        category: topic.category,
        repliesCount: topic.replies_count,
        viewsCount: topic.views_count,
        isHot: topic.is_hot,
        isPinned: topic.is_pinned,
        isLocked: topic.is_locked,
        lastActivityAt: topic.last_activity_at,
        createdAt: topic.created_at,
        updatedAt: topic.updated_at
      }
    };

    // Emit real-time event for new discussion topic
    try {
      emitToAll('new_discussion_topic', topicData);
      console.log(`📢 Real-time: New discussion topic created: ${topic.topic_id}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Discussion topic created successfully',
      data: topicData
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create discussion topic'
    });
  }
};

// Update discussion topic
export const updateTopic = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { topicId } = req.params;
    const { title, description, category } = req.body;

    // Check if topic exists and belongs to user
    const topics = await query(
      'SELECT * FROM discussion_topics WHERE topic_id = $1 AND user_id = $2',
      [topicId, userId]
    );

    if (topics.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Discussion topic not found or you do not have permission to edit it'
      });
    }

    // Update topic
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title.trim());
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description?.trim() || null);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      updateValues.push(category);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    updateValues.push(topicId);
    const result = await query(
      `UPDATE discussion_topics 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE topic_id = $${paramIndex}
       RETURNING *`,
      updateValues
    );

    const topic = result[0];

    res.status(200).json({
      status: 'success',
      message: 'Discussion topic updated successfully',
      data: { topic }
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update discussion topic'
    });
  }
};

// Delete discussion topic (soft delete)
export const deleteTopic = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { topicId } = req.params;

    // Check if topic exists and belongs to user
    const topics = await query(
      'SELECT * FROM discussion_topics WHERE topic_id = $1 AND user_id = $2',
      [topicId, userId]
    );

    if (topics.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Discussion topic not found or you do not have permission to delete it'
      });
    }

    // Delete topic (will cascade delete replies)
    await query('DELETE FROM discussion_topics WHERE topic_id = $1', [topicId]);

    res.status(200).json({
      status: 'success',
      message: 'Discussion topic deleted successfully'
    });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete discussion topic'
    });
  }
};

// Add reply to discussion topic
export const addReply = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { topicId } = req.params;
    const { replyText, parentReplyId } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Reply text is required'
      });
    }

    // Check if topic exists
    const topics = await query(
      'SELECT * FROM discussion_topics WHERE topic_id = $1',
      [topicId]
    );

    if (topics.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Discussion topic not found'
      });
    }

    if (topics[0].is_locked) {
      return res.status(403).json({
        status: 'error',
        message: 'This discussion is locked'
      });
    }

    // Create reply
    const result = await query(
      `INSERT INTO discussion_replies (topic_id, user_id, reply_text, parent_reply_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [topicId, userId, replyText.trim(), parentReplyId || null]
    );

    const reply = result[0];

    // Get author info
    const userInfo = await query(
      `SELECT up.full_name, up.avatar_url, u.user_type
       FROM users u
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    const author = userInfo[0];

    const replyData = {
      reply: {
        replyId: reply.reply_id,
        topicId: reply.topic_id,
        userId: reply.user_id,
        authorName: author.full_name,
        authorAvatar: author.avatar_url,
        authorType: author.user_type,
        replyText: reply.reply_text,
        parentReplyId: reply.parent_reply_id,
        likesCount: reply.likes_count,
        isEdited: reply.is_edited,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at
      }
    };

    // Emit real-time event for new reply
    try {
      emitToRoom(`discussion_${topicId}`, 'new_discussion_reply', replyData);
      emitToAll('discussion_updated', { topicId: parseInt(topicId) }); // Notify all users topic was updated
      console.log(`📢 Real-time: New reply added to discussion ${topicId}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Reply added successfully',
      data: replyData
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add reply'
    });
  }
};

// Update reply
export const updateReply = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { replyId } = req.params;
    const { replyText } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Reply text is required'
      });
    }

    // Check if reply exists and belongs to user
    const replies = await query(
      'SELECT * FROM discussion_replies WHERE reply_id = $1 AND user_id = $2',
      [replyId, userId]
    );

    if (replies.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Reply not found or you do not have permission to edit it'
      });
    }

    // Update reply
    const result = await query(
      `UPDATE discussion_replies 
       SET reply_text = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
       WHERE reply_id = $2
       RETURNING *`,
      [replyText.trim(), replyId]
    );

    const reply = result[0];

    res.status(200).json({
      status: 'success',
      message: 'Reply updated successfully',
      data: { reply }
    });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update reply'
    });
  }
};

// Delete reply (soft delete)
export const deleteReply = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { replyId } = req.params;

    // Check if reply exists and belongs to user
    const replies = await query(
      'SELECT * FROM discussion_replies WHERE reply_id = $1 AND user_id = $2',
      [replyId, userId]
    );

    if (replies.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Reply not found or you do not have permission to delete it'
      });
    }

    // Soft delete reply
    await query(
      'UPDATE discussion_replies SET is_active = false WHERE reply_id = $1',
      [replyId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete reply'
    });
  }
};

// Get categories list
export const getCategories = async (req, res) => {
  try {
    const categories = await query(
      `SELECT 
         category,
         COUNT(*) as topic_count
       FROM discussion_topics
       WHERE is_locked = false
       GROUP BY category
       ORDER BY topic_count DESC`
    );

    res.status(200).json({
      status: 'success',
      data: {
        categories: categories.map(c => ({
          name: c.category,
          topicCount: parseInt(c.topic_count)
        }))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories'
    });
  }
};

