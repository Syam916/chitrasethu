import { query } from '../config/database.js';
import { emitToConversation } from '../config/socket.js';

// Get all conversations for the authenticated user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all unique conversations (both as sender and receiver)
    const conversations = await query(`
      WITH user_conversations AS (
        SELECT DISTINCT
          CASE 
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END AS other_user_id,
          MAX(created_at) as last_message_at
        FROM messages
        WHERE (sender_id = $1 OR receiver_id = $1)
          AND (
            (sender_id = $1 AND is_deleted_by_sender = false)
            OR (receiver_id = $1 AND is_deleted_by_receiver = false)
          )
        GROUP BY other_user_id
      ),
      last_messages AS (
        SELECT DISTINCT ON (uc.other_user_id)
          m.message_id,
          m.sender_id,
          m.receiver_id,
          m.message_text,
          m.message_type,
          m.attachment_url,
          m.is_read,
          m.created_at,
          uc.other_user_id
        FROM user_conversations uc
        JOIN messages m ON (
          (m.sender_id = $1 AND m.receiver_id = uc.other_user_id)
          OR (m.sender_id = uc.other_user_id AND m.receiver_id = $1)
        )
        WHERE (
          (m.sender_id = $1 AND m.is_deleted_by_sender = false)
          OR (m.receiver_id = $1 AND m.is_deleted_by_receiver = false)
        )
        ORDER BY uc.other_user_id, m.created_at DESC
      ),
      unread_counts AS (
        SELECT 
          CASE 
            WHEN sender_id = $1 THEN receiver_id
            ELSE sender_id
          END AS other_user_id,
          COUNT(*) as unread_count
        FROM messages
        WHERE receiver_id = $1 
          AND is_read = false
          AND is_deleted_by_receiver = false
        GROUP BY other_user_id
      )
      SELECT 
        lm.other_user_id as participant_id,
        up.full_name as participant_name,
        up.avatar_url as participant_avatar,
        lm.message_text as last_message,
        lm.message_type,
        lm.is_read,
        lm.created_at as timestamp,
        COALESCE(uc.unread_count, 0) as unread_count
      FROM last_messages lm
      JOIN user_profiles up ON up.user_id = lm.other_user_id
      LEFT JOIN unread_counts uc ON uc.other_user_id = lm.other_user_id
      ORDER BY lm.created_at DESC
    `, [userId]);

    // Format conversations
    const formattedConversations = conversations.map(conv => ({
      conversationId: `conv_${Math.min(userId, conv.participant_id)}_${Math.max(userId, conv.participant_id)}`,
      participantId: conv.participant_id,
      participantName: conv.participant_name,
      participantAvatar: conv.participant_avatar || null,
      lastMessage: conv.last_message,
      timestamp: conv.timestamp,
      unreadCount: parseInt(conv.unread_count) || 0,
      online: false // TODO: Implement online status tracking
    }));

    res.status(200).json({
      status: 'success',
      data: {
        conversations: formattedConversations
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch conversations'
    });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    // Extract user IDs from conversationId (format: conv_userId1_userId2)
    const parts = conversationId.replace('conv_', '').split('_');
    const userId1 = parseInt(parts[0]);
    const userId2 = parseInt(parts[1]);
    
    // Determine the other user ID
    const otherUserId = userId1 === userId ? userId2 : userId1;

    if (!otherUserId || isNaN(otherUserId) || otherUserId === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid conversation ID'
      });
    }

    // Get messages between current user and other user
    const messages = await query(`
      SELECT 
        m.message_id,
        m.sender_id,
        m.receiver_id,
        m.message_text,
        m.message_type,
        m.attachment_url,
        m.is_read,
        m.created_at,
        up_sender.full_name as sender_name,
        up_sender.avatar_url as sender_avatar,
        up_receiver.full_name as receiver_name,
        up_receiver.avatar_url as receiver_avatar
      FROM messages m
      JOIN user_profiles up_sender ON m.sender_id = up_sender.user_id
      JOIN user_profiles up_receiver ON m.receiver_id = up_receiver.user_id
      WHERE (
        (m.sender_id = $1 AND m.receiver_id = $2)
        OR (m.sender_id = $2 AND m.receiver_id = $1)
      )
      AND (
        (m.sender_id = $1 AND m.is_deleted_by_sender = false)
        OR (m.receiver_id = $1 AND m.is_deleted_by_receiver = false)
      )
      ORDER BY m.created_at ASC
    `, [userId, otherUserId]);

    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg.message_id,
      sender: msg.sender_id === userId ? 'photographer' : 'customer',
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      text: msg.message_text,
      messageType: msg.message_type,
      attachmentUrl: msg.attachment_url,
      isRead: msg.is_read,
      timestamp: new Date(msg.created_at).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      createdAt: msg.created_at
    }));

    res.status(200).json({
      status: 'success',
      data: {
        messages: formattedMessages,
        participantId: otherUserId
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch messages'
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId, messageText, messageType = 'text', attachmentUrl } = req.body;

    if (!messageText && !attachmentUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Message text or attachment is required'
      });
    }

    // Extract user IDs from conversationId
    const parts = conversationId.replace('conv_', '').split('_');
    const userId1 = parseInt(parts[0]);
    const userId2 = parseInt(parts[1]);
    const receiverId = userId1 === userId ? userId2 : userId1;

    if (!receiverId || isNaN(receiverId) || receiverId === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid conversation ID'
      });
    }

    // Insert message
    const result = await query(`
      INSERT INTO messages (sender_id, receiver_id, message_text, message_type, attachment_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, receiverId, messageText || '', messageType, attachmentUrl || null]);

    const newMessage = result[0];

    // Get sender profile
    const senderProfile = await query(`
      SELECT full_name, avatar_url
      FROM user_profiles
      WHERE user_id = $1
    `, [userId]);

    const formattedMessage = {
      id: newMessage.message_id,
      senderId: newMessage.sender_id,
      receiverId: newMessage.receiver_id,
      text: newMessage.message_text,
      messageType: newMessage.message_type,
      attachmentUrl: newMessage.attachment_url,
      isRead: newMessage.is_read,
      timestamp: new Date(newMessage.created_at).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      createdAt: newMessage.created_at
    };

    // Emit real-time event to conversation room
    try {
      emitToConversation(conversationId, 'new_message', {
        message: formattedMessage,
        conversationId
      });
      console.log(`📨 Real-time message emitted to ${conversationId}`);
    } catch (socketError) {
      // Don't fail the request if socket emission fails
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json({
      status: 'success',
      data: {
        message: formattedMessage
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message'
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    // Extract user IDs from conversationId
    const parts = conversationId.replace('conv_', '').split('_');
    const userId1 = parseInt(parts[0]);
    const userId2 = parseInt(parts[1]);
    const otherUserId = userId1 === userId ? userId2 : userId1;

    if (!otherUserId || isNaN(otherUserId) || otherUserId === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid conversation ID'
      });
    }

    // Mark all unread messages from other user as read
    await query(`
      UPDATE messages
      SET is_read = true, read_at = NOW()
      WHERE sender_id = $1 
        AND receiver_id = $2
        AND is_read = false
    `, [otherUserId, userId]);

    // Emit real-time event
    try {
      emitToConversation(conversationId, 'message_read', {
        conversationId,
        userId
      });
      console.log(`✅ Read receipt emitted to ${conversationId}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark messages as read'
    });
  }
};

