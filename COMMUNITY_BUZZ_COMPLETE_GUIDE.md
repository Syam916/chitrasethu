# 🌟 Community Buzz - Complete Feature Guide

## 📋 Overview

Community Buzz is a comprehensive social platform integrated into Chitrasethu, allowing photographers and customers to connect, discuss, collaborate, and share knowledge. This guide covers all features, how to use them, and how to set up real-time data.

---

## 🎯 Features Overview

### 1. **Discussions** 💬
- Create and participate in discussion topics
- Categories: Equipment, Business, Post-Processing, Client Relations, Techniques, Inspiration
- Reply to discussions
- Real-time updates when new topics or replies are added

### 2. **Community Groups** 👥
- Create and join photography groups
- Group types: Regional, Project, Network, Equipment, Other
- Public and private groups
- Member management (admin, moderator, member roles)

### 3. **Collaborations** 🤝
- Post collaboration opportunities (seeking or offering)
- Skills-based matching
- Location-based filtering
- Budget and deadline information
- Response system for collaboration proposals

### 4. **Real-time Updates** ⚡
- Live notifications for new discussions, replies, groups, and collaborations
- Socket.io integration for instant updates
- No page refresh needed

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

First, ensure you've run the Community Buzz migration:

```bash
# Navigate to backend directory
cd backend

# Run the migration SQL file
psql -U your_username -d chitrasethu -f database/migrations/add_community_buzz_tables.sql
```

Or if using a database client, open and execute `backend/database/migrations/add_community_buzz_tables.sql`

### Step 2: Seed Sample Data

Run the Community Buzz seed script to populate sample data:

```bash
# Option 1: Using psql
psql -U your_username -d chitrasethu -f database/seed_community_buzz.sql

# Option 2: Using Node.js script (if you create one)
# node src/database/seed_community_buzz.js
```

**Important:** The seed script requires existing users. Make sure you've run `seed_postgres.sql` first to create users.

### Step 3: Start Backend Server

```bash
cd backend
npm install  # If not already installed
npm run serve
```

The server should show:
```
🔌 Socket.io Server Initialized
🔌 Real-time messaging enabled
🚀 Server running on: http://localhost:5000
```

### Step 4: Start Frontend Server

```bash
cd frontend
npm install  # If not already installed
npm run dev
```

Frontend should be running on `http://localhost:5173`

---

## 📊 Database Seed Data

The seed script (`seed_community_buzz.sql`) creates:

- **14 Discussion Topics** across all categories
- **16 Discussion Replies** with realistic conversations
- **5 Community Groups** with different types
- **15 Group Members** across the groups
- **7 Collaborations** (seeking and offering)
- **11 Collaboration Responses**

### Sample Users Used

The seed data uses these existing users:
- **User 4**: Arjun Kapoor (Photographer)
- **User 5**: Priya Sharma (Photographer)
- **User 6**: Vikram Singh (Photographer)
- **User 7**: Ananya Mehta (Photographer)
- **User 1**: Rajesh Kumar (Customer)
- **User 2**: Sneha Patel (Customer)
- **User 3**: Amit Verma (Customer)

---

## 🎨 How to Use Features

### 📝 Discussions

#### For Customers (Community Buzz Page)

1. **View Discussions**
   - Navigate to `/community-buzz`
   - Click on "Discussions" tab
   - Browse topics by category using the sidebar

2. **Create a Discussion**
   - Click "New Discussion" button
   - Select category (Equipment, Business, etc.)
   - Enter title (required)
   - Add description (optional)
   - Click "Create Discussion"
   - Discussion appears immediately with real-time update

3. **View Discussion Detail**
   - Click on any discussion topic
   - View all replies
   - See author information and timestamps

4. **Reply to Discussion**
   - Open a discussion detail page
   - Scroll to reply form
   - Enter your reply
   - Click "Post Reply"
   - Reply appears immediately for all viewers (real-time)

#### Categories Available

- **Equipment**: Camera, lens, lighting discussions
- **Business**: Pricing, contracts, marketing
- **Post-Processing**: Editing, software, techniques
- **Client Relations**: Communication, handling clients
- **Techniques**: Photography tips and tricks
- **Inspiration**: Creative projects, learning resources

---

### 👥 Community Groups (Photographer Only)

#### Create a Group

1. Navigate to `/photographer/community-buzz`
2. Click "Start New Community" button
3. Fill in the form:
   - **Group Name**: e.g., "Mumbai Wedding Photographers"
   - **Group Type**: Select from dropdown
   - **Description**: Optional details
   - **Public/Private**: Toggle visibility
4. Click "Create Group"
5. You automatically become the admin

#### Join a Group

1. Browse available groups in the "My Groups" tab
2. Click on a group to view details
3. Click "Join Group" button
4. You'll be added as a member

#### Group Types

- **Regional**: Location-based groups (e.g., "Delhi Photographers")
- **Project**: Project-specific groups (e.g., "Wedding Season 2024")
- **Network**: Professional networking groups
- **Equipment**: Gear and equipment focused
- **Other**: Miscellaneous groups

---

### 🤝 Collaborations (Photographer Only)

#### Post a Collaboration

1. Navigate to `/photographer/community-buzz`
2. Click "Collaborations" tab
3. Click "Post Collaboration" button
4. Fill in the form:
   - **Type**: Seeking or Offering
   - **Title**: Brief description
   - **Description**: Detailed information
   - **Skills**: Add required skills (tags)
   - **Location**: Optional location
   - **Date/Timeframe**: When needed
   - **Budget**: Optional budget range
5. Click "Post Collaboration"

#### Respond to Collaboration

1. Browse collaborations
2. Click on a collaboration of interest
3. Click "Respond" button
4. Submit your proposal
5. Collaboration owner will see your response

#### Collaboration Types

- **Seeking**: Looking for photographers/services
- **Offering**: Offering your services/expertise

---

## ⚡ Real-time Features

### Socket.io Integration

The platform uses Socket.io for real-time updates. All users automatically receive updates when:

1. **New Discussion Topic** is created
2. **New Reply** is added to any discussion
3. **New Group** is created
4. **New Collaboration** is posted
5. **New Group Member** joins
6. **New Collaboration Response** is submitted

### Frontend Socket Connection

The frontend automatically connects to Socket.io when:
- User is logged in
- Token is available in localStorage
- Socket.io server is running

### Real-time Events

#### Backend Events (Emitted)

- `new_discussion_topic` - New discussion created
- `new_discussion_reply` - New reply added
- `discussion_updated` - Discussion metadata updated
- `new_group` - New group created
- `new_collaboration` - New collaboration posted
- `collaboration_response` - New response to collaboration

#### Frontend Listeners (To be implemented)

```javascript
// Example frontend listener
socket.on('new_discussion_topic', (data) => {
  // Update discussions list
  // Show notification
  // Refresh data
});
```

---

## 🔧 Technical Implementation

### Backend Architecture

#### Controllers

- `discussion.controller.js` - Handles discussion topics and replies
- `group.controller.js` - Handles community groups
- `collaboration.controller.js` - Handles collaboration posts

#### Socket.io Setup

Location: `backend/src/config/socket.js`

Functions:
- `emitToAll(event, data)` - Broadcast to all users
- `emitToRoom(room, event, data)` - Broadcast to specific room
- `emitToUser(userId, event, data)` - Send to specific user

#### Database Tables

1. `discussion_topics` - Discussion topics
2. `discussion_replies` - Replies to topics
3. `community_groups` - Group information
4. `group_members` - Group membership
5. `collaborations` - Collaboration posts
6. `collaboration_responses` - Responses to collaborations
7. `follows` - User follow relationships

### Frontend Architecture

#### Services

- `discussion.service.ts` - API calls for discussions
- `group.service.ts` - API calls for groups
- `collaboration.service.ts` - API calls for collaborations

#### Pages

- `CommunityBuzz.tsx` - Customer-facing community page
- `PhotographerCommunityBuzzPage.tsx` - Photographer community page
- `DiscussionDetail.tsx` - Discussion detail page

#### Components

- `CreateDiscussionDialog.tsx` - Form to create discussions
- `CreateGroupDialog.tsx` - Form to create groups
- `CreateCollaborationDialog.tsx` - Form to create collaborations

---

## 📱 API Endpoints

### Discussions

```
GET    /api/discussions              - Get all topics
GET    /api/discussions/:id          - Get topic with replies
POST   /api/discussions              - Create new topic
PUT    /api/discussions/:id          - Update topic
DELETE /api/discussions/:id          - Delete topic
POST   /api/discussions/:id/reply    - Add reply
PUT    /api/discussions/:id/reply/:replyId - Update reply
DELETE /api/discussions/:id/reply/:replyId - Delete reply
GET    /api/discussions/categories   - Get categories
```

### Groups

```
GET    /api/groups                   - Get all groups
GET    /api/groups/my                - Get user's groups
GET    /api/groups/:id               - Get group details
POST   /api/groups                   - Create group
PUT    /api/groups/:id               - Update group
DELETE /api/groups/:id               - Delete group
POST   /api/groups/:id/join          - Join group
POST   /api/groups/:id/leave         - Leave group
GET    /api/groups/:id/members       - Get members
```

### Collaborations

```
GET    /api/collaborations           - Get all collaborations
GET    /api/collaborations/:id       - Get collaboration details
POST   /api/collaborations           - Create collaboration
PUT    /api/collaborations/:id       - Update collaboration
DELETE /api/collaborations/:id       - Delete collaboration
POST   /api/collaborations/:id/respond - Submit response
GET    /api/collaborations/:id/responses - Get responses
```

---

## 🧪 Testing the Features

### 1. Test Discussions

1. Login as any user (customer or photographer)
2. Go to `/community-buzz`
3. Click "Discussions" tab
4. Click "New Discussion"
5. Create a test discussion
6. Open the discussion
7. Add a reply
8. **Verify**: Updates appear in real-time for other users

### 2. Test Groups (Photographer Only)

1. Login as photographer (`arjun.kapoor@example.com` / `Password123!`)
2. Go to `/photographer/community-buzz`
3. Click "Start New Community"
4. Create a test group
5. **Verify**: Group appears immediately in list

### 3. Test Collaborations (Photographer Only)

1. Login as photographer
2. Go to `/photographer/community-buzz`
3. Click "Collaborations" tab
4. Click "Post Collaboration"
5. Fill form and submit
6. **Verify**: Collaboration appears in list

### 4. Test Real-time Updates

1. Open Community Buzz in two browser windows/tabs
2. Login as different users in each
3. Create a discussion in one window
4. **Verify**: Discussion appears immediately in the other window
5. Add a reply in one window
6. **Verify**: Reply appears immediately in the other window

---

## 🔐 Authentication

All Community Buzz endpoints require authentication:

- JWT token in Authorization header: `Bearer <token>`
- Token obtained from login endpoint
- Socket.io requires token in handshake: `socket.handshake.auth.token`

---

## 📊 Database Schema

### Discussion Topics

```sql
- topic_id (PK)
- user_id (FK to users)
- title
- content/description
- category (enum)
- tags (JSONB)
- replies_count
- views_count
- is_pinned
- is_locked
- is_active
- created_at
- updated_at
- last_activity_at
```

### Discussion Replies

```sql
- reply_id (PK)
- topic_id (FK to discussion_topics)
- user_id (FK to users)
- parent_reply_id (for nested replies)
- reply_text
- likes_count
- is_edited
- is_active
- created_at
- updated_at
```

### Community Groups

```sql
- group_id (PK)
- creator_id (FK to users)
- group_name
- description
- group_type (enum)
- group_icon_url
- cover_image_url
- member_count
- post_count
- is_private
- is_active
- created_at
- updated_at
```

### Collaborations

```sql
- collaboration_id (PK)
- user_id (FK to users)
- title
- description
- collaboration_type (enum: seeking/offering)
- skills_required (JSONB array)
- location
- budget_range
- deadline
- status (enum)
- responses_count
- views_count
- is_featured
- created_at
- updated_at
```

---

## 🎯 Best Practices

### For Users

1. **Discussions**
   - Use clear, descriptive titles
   - Choose appropriate categories
   - Be respectful in replies
   - Search before creating duplicate topics

2. **Groups**
   - Create groups with clear purpose
   - Set appropriate privacy settings
   - Engage actively as admin/moderator

3. **Collaborations**
   - Provide detailed descriptions
   - Be clear about requirements
   - Respond promptly to proposals

### For Developers

1. **Error Handling**
   - Always handle Socket.io errors gracefully
   - Don't fail API requests if socket emission fails
   - Log errors for debugging

2. **Performance**
   - Use pagination for large lists
   - Index frequently queried columns
   - Cache category lists

3. **Security**
   - Validate all inputs
   - Check permissions before operations
   - Sanitize user-generated content

---

## 🐛 Troubleshooting

### Real-time Not Working

1. **Check Socket.io Connection**
   ```javascript
   // In browser console
   socket.connected  // Should be true
   ```

2. **Check Authentication**
   - Ensure token is valid
   - Check token in localStorage
   - Verify token format

3. **Check Server Logs**
   - Look for Socket.io connection messages
   - Check for authentication errors
   - Verify event emissions in logs

### Database Errors

1. **Missing Tables**
   - Run migration script
   - Check table names match schema

2. **Foreign Key Errors**
   - Ensure users exist before seeding
   - Check user_id references

3. **Data Not Showing**
   - Verify seed script ran successfully
   - Check is_active flags
   - Verify user permissions

---

## 📈 Future Enhancements

### Planned Features

1. **Notifications System**
   - Email notifications for replies
   - In-app notification center
   - Push notifications

2. **Advanced Search**
   - Full-text search
   - Filter by multiple criteria
   - Saved searches

3. **Rich Content**
   - Image uploads in discussions
   - Code blocks for technical discussions
   - Markdown support

4. **Social Features**
   - Like/favorite discussions
   - Follow users
   - User profiles with activity

5. **Moderation Tools**
   - Report inappropriate content
   - Admin moderation panel
   - Auto-moderation rules

---

## 📞 Support

### Getting Help

1. Check this guide first
2. Review API documentation
3. Check server logs for errors
4. Verify database schema matches migrations

### Common Issues

- **"No discussions found"**: Run seed script
- **"Socket connection failed"**: Check backend server is running
- **"Unauthorized"**: Verify JWT token is valid
- **"Group not found"**: Check user is member/admin

---

## ✅ Checklist for Setup

- [ ] Database migration executed
- [ ] Seed script executed (after user seed)
- [ ] Backend server running with Socket.io
- [ ] Frontend server running
- [ ] Test user accounts created
- [ ] Socket.io connection established
- [ ] Real-time events working
- [ ] Can create discussions
- [ ] Can create groups (photographer)
- [ ] Can create collaborations (photographer)
- [ ] Real-time updates visible

---

## 🎉 You're All Set!

Community Buzz is now fully set up with:
- ✅ Database tables created
- ✅ Sample data seeded
- ✅ Backend APIs working
- ✅ Frontend pages integrated
- ✅ Real-time updates enabled
- ✅ Forms and dialogs ready

**Start exploring and engaging with the community!** 🚀

---

*Last Updated: January 2025*
*Version: 1.0.0*


