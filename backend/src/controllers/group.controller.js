import { query } from '../config/database.js';
import { emitToAll } from '../config/socket.js';

// Get all community groups (public groups or user's groups)
export const getAllGroups = async (req, res) => {
  try {
    const { limit = 50, offset = 0, groupType, search } = req.query;
    const userId = req.user?.userId || null;

    let whereClause = 'cg.is_active = true';
    const params = [];
    let paramIndex = 1;

    if (groupType) {
      whereClause += ` AND cg.group_type = $${paramIndex++}`;
      params.push(groupType);
    }

    if (search) {
      whereClause += ` AND (cg.group_name ILIKE $${paramIndex} OR cg.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    params.push(parseInt(limit), parseInt(offset));

    const groups = await query(
      `SELECT 
         cg.*,
         up.full_name as creator_name,
         up.avatar_url as creator_avatar,
         CASE 
           WHEN $${paramIndex}::int IS NULL THEN NULL
           ELSE (
             SELECT role FROM group_members 
             WHERE group_id = cg.group_id AND user_id = $${paramIndex}
           )
         END AS user_role
       FROM community_groups cg
       JOIN users u ON cg.creator_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE ${whereClause}
       ORDER BY cg.last_activity_at DESC
       LIMIT $${paramIndex - 1} OFFSET $${paramIndex}`,
      [...params, userId]
    );

    // Get total count
    let countWhere = 'WHERE is_active = true';
    const countParams = [];
    let countIndex = 1;

    if (groupType) {
      countWhere += ` AND group_type = $${countIndex++}`;
      countParams.push(groupType);
    }

    if (search) {
      countWhere += ` AND (group_name ILIKE $${countIndex} OR description ILIKE $${countIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM community_groups ${countWhere}`,
      countParams
    );
    const total = parseInt(countResult[0].total);

    res.status(200).json({
      status: 'success',
      data: {
        groups: groups.map(g => ({
          groupId: g.group_id,
          creatorId: g.creator_id,
          creatorName: g.creator_name,
          creatorAvatar: g.creator_avatar,
          groupName: g.group_name,
          groupType: g.group_type,
          description: g.description,
          groupIconUrl: g.group_icon_url,
          memberCount: g.member_count,
          isPublic: g.is_public,
          isActive: g.is_active,
          lastActivityAt: g.last_activity_at,
          createdAt: g.created_at,
          updatedAt: g.updated_at,
          userRole: g.user_role
        })),
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch community groups'
    });
  }
};

// Get user's groups (groups where user is a member)
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0 } = req.query;

    const groups = await query(
      `SELECT 
         cg.*,
         gm.role,
         gm.unread_count,
         up.full_name as creator_name,
         up.avatar_url as creator_avatar
       FROM group_members gm
       JOIN community_groups cg ON gm.group_id = cg.group_id
       JOIN users u ON cg.creator_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE gm.user_id = $1 AND cg.is_active = true
       ORDER BY cg.last_activity_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.status(200).json({
      status: 'success',
      data: {
        groups: groups.map(g => ({
          groupId: g.group_id,
          creatorId: g.creator_id,
          creatorName: g.creator_name,
          creatorAvatar: g.creator_avatar,
          groupName: g.group_name,
          groupType: g.group_type,
          description: g.description,
          groupIconUrl: g.group_icon_url,
          memberCount: g.member_count,
          isPublic: g.is_public,
          lastActivityAt: g.last_activity_at,
          createdAt: g.created_at,
          role: g.role,
          unreadCount: g.unread_count
        })),
        total: groups.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your groups'
    });
  }
};

// Get single group with members
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.userId || null;

    const groups = await query(
      `SELECT 
         cg.*,
         up.full_name as creator_name,
         up.avatar_url as creator_avatar,
         CASE 
           WHEN $2::int IS NULL THEN NULL
           ELSE (
             SELECT role FROM group_members 
             WHERE group_id = cg.group_id AND user_id = $2
           )
         END AS user_role
       FROM community_groups cg
       JOIN users u ON cg.creator_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE cg.group_id = $1 AND cg.is_active = true`,
      [groupId, userId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community group not found'
      });
    }

    const group = groups[0];

    // Get members
    const members = await query(
      `SELECT 
         gm.*,
         up.full_name,
         up.avatar_url,
         u.user_type
       FROM group_members gm
       JOIN users u ON gm.user_id = u.user_id
       JOIN user_profiles up ON u.user_id = up.user_id
       WHERE gm.group_id = $1
       ORDER BY 
         CASE gm.role
           WHEN 'admin' THEN 1
           WHEN 'moderator' THEN 2
           ELSE 3
         END,
         gm.joined_at ASC`,
      [groupId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        group: {
          groupId: group.group_id,
          creatorId: group.creator_id,
          creatorName: group.creator_name,
          creatorAvatar: group.creator_avatar,
          groupName: group.group_name,
          groupType: group.group_type,
          description: group.description,
          groupIconUrl: group.group_icon_url,
          memberCount: group.member_count,
          isPublic: group.is_public,
          lastActivityAt: group.last_activity_at,
          createdAt: group.created_at,
          updatedAt: group.updated_at,
          userRole: group.user_role
        },
        members: members.map(m => ({
          memberId: m.member_id,
          userId: m.user_id,
          fullName: m.full_name,
          avatarUrl: m.avatar_url,
          userType: m.user_type,
          role: m.role,
          joinedAt: m.joined_at,
          unreadCount: m.unread_count
        }))
      }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch community group'
    });
  }
};

// Create new community group
export const createGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupName, groupType, description, groupIconUrl, isPublic = true } = req.body;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Group name is required'
      });
    }

    if (!groupType) {
      return res.status(400).json({
        status: 'error',
        message: 'Group type is required'
      });
    }

    // Create group
    const result = await query(
      `INSERT INTO community_groups (creator_id, group_name, group_type, description, group_icon_url, is_public)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, groupName.trim(), groupType, description?.trim() || null, groupIconUrl || null, isPublic]
    );

    const group = result[0];

    // Add creator as admin member
    await query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [group.group_id, userId]
    );

    // Get creator info
    const userInfo = await query(
      `SELECT up.full_name, up.avatar_url
       FROM user_profiles up
       WHERE up.user_id = $1`,
      [userId]
    );

    const creator = userInfo[0];

    const groupData = {
      group: {
        groupId: group.group_id,
        creatorId: group.creator_id,
        creatorName: creator.full_name,
        creatorAvatar: creator.avatar_url,
        groupName: group.group_name,
        groupType: group.group_type,
        description: group.description,
        groupIconUrl: group.group_icon_url,
        memberCount: group.member_count,
        isPublic: group.is_public,
        lastActivityAt: group.last_activity_at,
        createdAt: group.created_at,
        role: 'admin'
      }
    };

    // Emit real-time event for new group
    try {
      emitToAll('new_group', groupData);
      console.log(`📢 Real-time: New group created: ${group.group_id}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Community group created successfully',
      data: groupData
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create community group'
    });
  }
};

// Update community group (only creator or admin)
export const updateGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;
    const { groupName, description, groupIconUrl, isPublic } = req.body;

    // Check if user is creator or admin
    const groups = await query(
      `SELECT cg.*, gm.role
       FROM community_groups cg
       LEFT JOIN group_members gm ON cg.group_id = gm.group_id AND gm.user_id = $2
       WHERE cg.group_id = $1`,
      [groupId, userId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community group not found'
      });
    }

    const group = groups[0];
    const isCreator = group.creator_id === userId;
    const isAdmin = group.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this group'
      });
    }

    // Update group
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (groupName !== undefined) {
      updateFields.push(`group_name = $${paramIndex++}`);
      updateValues.push(groupName.trim());
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description?.trim() || null);
    }
    if (groupIconUrl !== undefined) {
      updateFields.push(`group_icon_url = $${paramIndex++}`);
      updateValues.push(groupIconUrl || null);
    }
    if (isPublic !== undefined) {
      updateFields.push(`is_public = $${paramIndex++}`);
      updateValues.push(isPublic);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No fields to update'
      });
    }

    updateValues.push(groupId);
    const result = await query(
      `UPDATE community_groups 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE group_id = $${paramIndex}
       RETURNING *`,
      updateValues
    );

    res.status(200).json({
      status: 'success',
      message: 'Community group updated successfully',
      data: { group: result[0] }
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update community group'
    });
  }
};

// Delete community group (only creator)
export const deleteGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    // Check if user is creator
    const groups = await query(
      'SELECT * FROM community_groups WHERE group_id = $1 AND creator_id = $2',
      [groupId, userId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community group not found or you do not have permission to delete it'
      });
    }

    // Delete group (will cascade delete members)
    await query('DELETE FROM community_groups WHERE group_id = $1', [groupId]);

    res.status(200).json({
      status: 'success',
      message: 'Community group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete community group'
    });
  }
};

// Join community group
export const joinGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    // Check if group exists and is public
    const groups = await query(
      'SELECT * FROM community_groups WHERE group_id = $1 AND is_active = true',
      [groupId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community group not found'
      });
    }

    if (!groups[0].is_public) {
      return res.status(403).json({
        status: 'error',
        message: 'This is a private group. You need an invitation to join.'
      });
    }

    // Check if already a member
    const existingMember = await query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (existingMember.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already a member of this group'
      });
    }

    // Add member (trigger will update member_count)
    await query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [groupId, userId]
    );

    // Emit real-time event for new member
    try {
      emitToRoom(`group_${groupId}`, 'new_group_member', {
        groupId: parseInt(groupId),
        userId,
        role: 'member'
      });
      console.log(`📢 Real-time: User ${userId} joined group ${groupId}`);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Successfully joined the group',
      data: {
        groupId: parseInt(groupId),
        role: 'member'
      }
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to join group'
    });
  }
};

// Leave community group
export const leaveGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    // Check if member
    const member = await query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (member.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You are not a member of this group'
      });
    }

    // Check if creator (creators cannot leave, must delete group)
    const groups = await query(
      'SELECT creator_id FROM community_groups WHERE group_id = $1',
      [groupId]
    );

    if (groups[0].creator_id === userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Group creator cannot leave. Please delete the group instead.'
      });
    }

    // Remove member (trigger will update member_count)
    await query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Successfully left the group'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to leave group'
    });
  }
};

// Update member role (only creator/admin)
export const updateMemberRole = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, memberId } = req.params;
    const { role } = req.body;

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role'
      });
    }

    // Check if requester is creator or admin
    const groups = await query(
      `SELECT cg.*, gm.role as user_role
       FROM community_groups cg
       LEFT JOIN group_members gm ON cg.group_id = gm.group_id AND gm.user_id = $2
       WHERE cg.group_id = $1`,
      [groupId, userId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community group not found'
      });
    }

    const group = groups[0];
    const isCreator = group.creator_id === userId;
    const isAdmin = group.user_role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update member roles'
      });
    }

    // Update member role
    await query(
      'UPDATE group_members SET role = $1 WHERE member_id = $2 AND group_id = $3',
      [role, memberId, groupId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update member role'
    });
  }
};

// Remove member from group (only creator/admin)
export const removeMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, memberId } = req.params;

    // Check if requester is creator or admin
    const groups = await query(
      `SELECT cg.*, gm.role as user_role
       FROM community_groups cg
       LEFT JOIN group_members gm ON cg.group_id = gm.group_id AND gm.user_id = $2
       WHERE cg.group_id = $1`,
      [groupId, userId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Community group not found'
      });
    }

    const group = groups[0];
    const isCreator = group.creator_id === userId;
    const isAdmin = group.user_role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to remove members'
      });
    }

    // Get member to remove
    const member = await query(
      'SELECT * FROM group_members WHERE member_id = $1 AND group_id = $2',
      [memberId, groupId]
    );

    if (member.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }

    // Cannot remove creator
    if (member[0].user_id === group.creator_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot remove group creator'
      });
    }

    // Remove member
    await query(
      'DELETE FROM group_members WHERE member_id = $1 AND group_id = $2',
      [memberId, groupId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove member'
    });
  }
};

