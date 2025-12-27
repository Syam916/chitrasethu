# Community Buzz - Comprehensive Analysis

## 📋 Table of Contents
1. [What is Community Buzz?](#what-is-community-buzz)
2. [Why Community Buzz Exists](#why-community-buzz-exists)
3. [How Community Buzz is Helpful](#how-community-buzz-is-helpful)
4. [Complete Feature List](#complete-feature-list)
5. [Frontend Implementation](#frontend-implementation)
6. [Backend Implementation](#backend-implementation)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Real-time Features](#real-time-features)
10. [User Roles & Access](#user-roles--access)

---

## What is Community Buzz?

**Community Buzz** is a comprehensive social networking and community engagement feature within the Chitrasethu Photography Platform. It serves as the central hub where photographers, customers, and photography enthusiasts can:

- **Connect** with fellow photographers and photography enthusiasts
- **Share** their work, experiences, and insights
- **Discuss** photography techniques, equipment, business strategies, and more
- **Discover** trending topics, events, and community highlights
- **Collaborate** on projects and find opportunities
- **Participate** in live event discussions and networking

Community Buzz is available in two variants:
1. **Customer Community Buzz** (`/community-buzz`) - For general users and customers
2. **Photographer Community Buzz** (`/photographer/community-buzz`) - Specialized for professional photographers

---

## Why Community Buzz Exists

### 1. **Community Building**
Photography is inherently social. Community Buzz creates a space where photographers can:
- Learn from each other
- Share knowledge and techniques
- Build professional networks
- Get inspiration from others' work

### 2. **Knowledge Exchange**
The platform facilitates discussions about:
- Equipment recommendations
- Pricing strategies
- Post-processing techniques
- Client management
- Business growth tips

### 3. **Event Coordination**
For photographers working on events, Community Buzz provides:
- Event-specific chat rooms
- Real-time coordination
- Resource sharing (shot lists, timelines)
- Collaboration opportunities

### 4. **Engagement & Retention**
Community features increase platform engagement by:
- Encouraging regular visits
- Creating a sense of belonging
- Providing value beyond transactions
- Building a vibrant ecosystem

### 5. **Business Opportunities**
Photographers can:
- Find collaboration opportunities
- Discover project partnerships
- Network with peers
- Showcase their work to a wider audience

---

## How Community Buzz is Helpful

### For Photographers

1. **Professional Growth**
   - Learn new techniques from peers
   - Stay updated with industry trends
   - Get feedback on work
   - Access business advice

2. **Collaboration & Networking**
   - Find second shooters for events
   - Discover collaboration opportunities
   - Connect with vendors and industry professionals
   - Build a professional reputation

3. **Event Management**
   - Coordinate with team members during events
   - Share resources and shot lists
   - Real-time communication during shoots
   - Access event-specific discussion rooms

4. **Portfolio Visibility**
   - Share work with engaged audience
   - Get discovered by potential clients
   - Build social proof through likes and comments
   - Participate in community challenges

### For Customers

1. **Discovery & Inspiration**
   - Browse photographer portfolios
   - See real work from events
   - Get inspiration for their own events
   - Discover trending photography styles

2. **Community Engagement**
   - Connect with others planning similar events
   - Get tips and recommendations
   - Share experiences and reviews
   - Participate in discussions

3. **Informed Decisions**
   - See photographer's community presence
   - View engagement and popularity
   - Read discussions and recommendations
   - Make better booking decisions

---

## Complete Feature List

### 🎯 Customer Community Buzz Features (`/community-buzz`)

#### 1. **Hero Section**
- Welcome message and description
- Community statistics:
  - 2.5K+ Active Members
  - 150+ Daily Posts
  - 50+ Active Discussions

#### 2. **Four Main Tabs**

##### Tab 1: Community Feed
- **Community Highlights**
  - Photographer of the Month
  - Trending Techniques
  - Community Challenges
  
- **Social Posts Feed**
  - User avatar with verification badges
  - Username, location, timestamp
  - Post images (square format)
  - Like button (interactive, shows like count)
  - Comment button (shows comment count)
  - Share button (shows share count)
  - Caption with hashtags
  - Tags displayed as badges
  
- **Right Sidebar**
  - Trending Now section (topics with post counts)
  - Top Contributors (ranked photographer list)

##### Tab 2: Discussions
- **Active Discussions List**
  - Discussion title
  - "Hot" badge for popular topics
  - Author name
  - Category badge (Equipment, Business, Post-Processing, etc.)
  - Reply count
  - Last active time
  - "Join Discussion" button
  
- **Discussion Categories**
  - Equipment
  - Business
  - Post-Processing
  - Client Relations
  - Techniques
  - Inspiration

##### Tab 3: Events
- Grid layout of community events
- Event cards showing:
  - Event image
  - Category badge
  - Event title
  - Date and time
  - Location
  - Attendee count
  - "Join Event" button

##### Tab 4: Trending
- **Trending Hashtags**
  - Popular hashtags list
  - Post count for each hashtag
  
- **Popular Techniques**
  - Technique names
  - Tutorial count for each

---

### 🎯 Photographer Community Buzz Features (`/photographer/community-buzz`)

#### 1. **Hero Section**
- Badge: "Photographer Community"
- Title: "Community Buzz"
- Description: Connect with fellow photographers, collaborate, and stay in sync with live event discussions
- Action buttons:
  - "Start New Community" button
  - "Open Active Chats" button

#### 2. **Three Main Tabs**

##### Tab 1: My Groups
- **Community Groups Display**
  - Group icon/avatar
  - Group name and type badge
  - Group description
  - Member count
  - Last activity time
  - User role badge (admin/member)
  - Unread count badge (if applicable)
  - "Open Chat" button

##### Tab 2: Collaborations
- **Collaboration Opportunities**
  - Collaboration title
  - Poster avatar and name
  - Collaboration type badge (seeking/offering)
  - Location with icon
  - Date
  - Budget
  - Description
  - Required skills tags
  - Response count
  - Posted date
  - Action buttons:
    - "Respond" button
    - "Save" button

##### Tab 3: Live Events
- **Event Cards**
  - Event image
  - Category badge
  - Event title and price
  - Date and time
  - Location
  - Action buttons:
    - "Join Chat" button
    - "View Details" button
  
- **Collaboration Tips Section**
  - Share Resources tip
  - Pin Key Messages tip
  - Link Deliverables tip

#### 3. **Event Room Creation**
- Card promoting private workspace creation
- Description: Create dedicated chat rooms for events
- "Launch Event Room" button

---

## Frontend Implementation

### File Structure

```
frontend/src/
├── pages/
│   ├── CommunityBuzz.tsx                    # Customer Community Buzz page
│   └── photographer/
│       └── CommunityBuzz.tsx                # Photographer Community Buzz page
├── components/
│   ├── home/
│   │   ├── NavbarIntegrated.tsx            # Navigation with Community Buzz link
│   │   └── ...
│   └── photographer/
│       ├── PhotographerCommunityBuzzPage.tsx  # Main photographer component
│       └── PhotographerNavbar.tsx           # Photographer navigation
├── services/
│   └── post.service.ts                      # API service for posts
├── hooks/
│   └── useSocket.ts                         # Socket.io integration
└── data/
    ├── dummyData.ts                         # Mock data for development
    └── photographerDummyData.ts             # Photographer-specific mock data
```

### Key Components

#### 1. **CommunityBuzz.tsx** (Customer Version)
- **Location**: `frontend/src/pages/CommunityBuzz.tsx`
- **Features**:
  - Hero section with statistics
  - Tab-based navigation (Feed, Discussions, Events, Trending)
  - Interactive like functionality
  - Social posts feed
  - Community highlights
  - Trending topics sidebar
  - Top contributors list

#### 2. **PhotographerCommunityBuzzPage.tsx**
- **Location**: `frontend/src/components/photographer/PhotographerCommunityBuzzPage.tsx`
- **Features**:
  - Group management
  - Collaboration listings
  - Event chat rooms
  - Collaboration tips
  - Event room creation

### Technologies Used

- **React 18** with TypeScript
- **React Router** for navigation
- **Shadcn UI** components (Card, Button, Badge, Avatar, Tabs)
- **Lucide React** for icons
- **Socket.io Client** for real-time features
- **TanStack Query** (React Query) for data fetching
- **Tailwind CSS** for styling

### State Management

- Local state with `useState` for:
  - Liked posts tracking
  - Active tab selection
  - UI interactions
- API calls through service layer
- Socket.io for real-time updates (future implementation)

---

## Backend Implementation

### File Structure

```
backend/src/
├── controllers/
│   └── post.controller.js                   # Post CRUD operations
├── routes/
│   └── post.routes.js                       # Post API routes
├── config/
│   └── socket.js                            # Socket.io configuration
└── database/
    └── schema_postgres.sql                  # Database schema
```

### Key Controllers

#### **post.controller.js**

Handles all post-related operations:

1. **getAllPosts()**
   - Fetches all active posts
   - Includes user info (name, avatar, user type)
   - Checks if current user liked each post
   - Supports pagination (limit/offset)
   - Returns formatted post data

2. **createPost()**
   - Creates new post with media uploads
   - Supports multiple content types (image, video, text, gallery)
   - Handles Cloudinary media URLs
   - Auto-mirrors photographer posts to portfolio
   - Validates required fields

3. **getPostById()**
   - Fetches single post details
   - Includes author information

4. **toggleLikePost()**
   - Like/unlike functionality
   - Updates like count
   - Returns updated engagement metrics

5. **addCommentToPost()**
   - Adds comments to posts
   - Supports nested comments (parent_comment_id)
   - Updates comment count

6. **getCommentsForPost()**
   - Fetches all comments for a post
   - Includes commenter information
   - Supports pagination

7. **getLikesForPost()**
   - Gets list of users who liked a post
   - Includes user profiles

8. **deletePost()**
   - Soft delete (sets is_active = false)
   - Deletes associated Cloudinary images
   - Only owner can delete

---

## Database Schema

### Core Tables

#### 1. **posts** Table
Stores all social media posts and content shared in Community Buzz.

```sql
CREATE TABLE posts (
    post_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    content_type ENUM('image', 'video', 'text', 'gallery') DEFAULT 'image',
    caption TEXT,
    media_urls JSONB,
    thumbnail_url VARCHAR(500),
    location VARCHAR(255),
    tags JSONB,
    mentions JSONB,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    visibility ENUM('public', 'followers', 'private') DEFAULT 'public',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

**Key Fields:**
- `post_id`: Primary key
- `user_id`: Author of the post
- `content_type`: Type of content (image/video/text/gallery)
- `media_urls`: JSON array of Cloudinary URLs
- `tags`: JSON array of hashtags
- `likes_count`, `comments_count`, `shares_count`: Engagement metrics
- `visibility`: Post visibility settings

**Indexes:**
- `idx_posts_user_id`: Fast lookup by user
- `idx_posts_created_at`: Sorting by date
- `idx_posts_is_featured`: Featured posts
- Full-text index on `caption`: Search functionality

#### 2. **post_likes** Table
Tracks which users liked which posts.

```sql
CREATE TABLE post_likes (
    like_id INT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (post_id, user_id)  -- Prevents duplicate likes
);
```

**Key Features:**
- Unique constraint prevents duplicate likes
- Cascading delete when post/user is deleted

#### 3. **post_comments** Table
Stores comments on posts with support for nested replies.

```sql
CREATE TABLE post_comments (
    comment_id INT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_comment_id INT,  -- NULL for top-level comments
    comment_text TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES post_comments(comment_id) ON DELETE CASCADE
);
```

**Key Features:**
- Supports nested comments via `parent_comment_id`
- Soft delete capability with `is_active`
- Tracks edit status

### Related Tables

#### **users** Table
- Stores user authentication and basic info
- Links to `user_profiles` for extended information

#### **user_profiles** Table
- Full name, avatar URL, bio
- Used for displaying post authors

#### **photographers** Table
- Professional photographer profiles
- Posts from photographers can auto-sync to portfolio

---

## API Endpoints

### Post Endpoints

All endpoints are under `/api/posts`

#### 1. **GET /api/posts**
Get all posts (feed)

**Query Parameters:**
- `limit` (optional, default: 50): Number of posts to return
- `offset` (optional, default: 0): Pagination offset

**Authentication:** Optional (more data if authenticated)

**Response:**
```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "postId": 1,
        "userId": 1,
        "fullName": "John Doe",
        "avatarUrl": "https://...",
        "userType": "photographer",
        "photographerId": 1,
        "contentType": "image",
        "caption": "Beautiful sunset",
        "mediaUrls": [...],
        "thumbnailUrl": "https://...",
        "location": "Mumbai, India",
        "tags": ["sunset", "nature"],
        "likesCount": 42,
        "commentsCount": 5,
        "sharesCount": 2,
        "viewsCount": 150,
        "createdAt": "2024-01-15T10:00:00Z",
        "isLikedByCurrentUser": false
      }
    ]
  }
}
```

#### 2. **GET /api/posts/:postId**
Get single post details

**Authentication:** Optional

**Response:** Same format as above, single post object

#### 3. **POST /api/posts**
Create new post

**Authentication:** Required

**Request Body:**
```json
{
  "caption": "Post caption text",
  "location": "Mumbai, India",
  "tags": ["tag1", "tag2"],
  "visibility": "public",
  "contentType": "image",
  "media_urls": [
    {
      "url": "https://cloudinary.com/...",
      "thumbnailUrl": "https://cloudinary.com/...",
      "publicId": "image_id"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Post created successfully",
  "data": {
    "post": { /* post object */ }
  }
}
```

#### 4. **POST /api/posts/:postId/like**
Like/unlike a post (toggle)

**Authentication:** Required

**Response:**
```json
{
  "status": "success",
  "message": "Post liked",
  "data": {
    "postId": 1,
    "isLikedByCurrentUser": true,
    "likesCount": 43,
    "commentsCount": 5,
    "sharesCount": 2
  }
}
```

#### 5. **POST /api/posts/:postId/comment**
Add comment to post

**Authentication:** Required

**Request Body:**
```json
{
  "commentText": "Great shot!",
  "parentCommentId": null  // Optional, for nested comments
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Comment added",
  "data": {
    "comment": {
      "commentId": 1,
      "postId": 1,
      "userId": 2,
      "commentText": "Great shot!",
      "parentCommentId": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "fullName": "Jane Doe",
      "avatarUrl": "https://..."
    },
    "commentsCount": 6
  }
}
```

#### 6. **GET /api/posts/:postId/comments**
Get comments for a post

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Authentication:** Optional

**Response:**
```json
{
  "status": "success",
  "data": {
    "comments": [
      {
        "commentId": 1,
        "postId": 1,
        "userId": 2,
        "commentText": "Great shot!",
        "parentCommentId": null,
        "createdAt": "2024-01-15T10:30:00Z",
        "fullName": "Jane Doe",
        "avatarUrl": "https://..."
      }
    ]
  }
}
```

#### 7. **GET /api/posts/:postId/likes**
Get users who liked a post

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Authentication:** Optional

**Response:**
```json
{
  "status": "success",
  "data": {
    "likes": [
      {
        "likeId": 1,
        "postId": 1,
        "userId": 2,
        "fullName": "Jane Doe",
        "avatarUrl": "https://...",
        "userType": "customer"
      }
    ]
  }
}
```

#### 8. **DELETE /api/posts/:postId**
Delete a post

**Authentication:** Required (only post owner)

**Response:**
```json
{
  "status": "success",
  "message": "Post deleted successfully"
}
```

---

## Real-time Features

### Socket.io Integration

Community Buzz has Socket.io infrastructure for real-time features:

#### Backend Socket Configuration
**File:** `backend/src/config/socket.js`

**Features:**
- JWT-based authentication for socket connections
- User-specific rooms (`user_{userId}`)
- Conversation/room joining for event chats
- Real-time message broadcasting
- Typing indicators
- Online/offline status

**Socket Events:**
- `join_conversation` - Join event chat room
- `leave_conversation` - Leave event chat room
- `send_message` - Send real-time message
- `typing` - Typing indicator
- `stop_typing` - Stop typing indicator
- `mark_read` - Mark messages as read
- `user_online` - User came online
- `user_offline` - User went offline
- `new_message` - Receive new message

#### Frontend Socket Hook
**File:** `frontend/src/hooks/useSocket.ts`

**Features:**
- Automatic connection on mount
- Connection status tracking
- Error handling
- Authentication token integration

**Usage:**
```typescript
const { socket, connected, error } = useSocket();
```

#### Current Implementation Status

**✅ Implemented:**
- Socket.io server setup
- Authentication middleware
- Connection handling
- Room management
- Message broadcasting

**🔄 Future Enhancements:**
- Real-time post updates
- Live like/comment notifications
- Real-time trending updates
- Live event chat rooms integration

---

## User Roles & Access

### Customer Access (`/community-buzz`)

**Permissions:**
- ✅ View all public posts
- ✅ Like posts
- ✅ Comment on posts
- ✅ Share posts
- ✅ Browse discussions
- ✅ View events
- ✅ View trending topics
- ✅ Create posts
- ✅ Delete own posts

**Features Available:**
- Community Feed tab
- Discussions tab
- Events tab
- Trending tab

### Photographer Access (`/photographer/community-buzz`)

**Permissions:**
- ✅ All customer permissions
- ✅ Create/manage groups
- ✅ Post collaborations
- ✅ Respond to collaborations
- ✅ Join event chat rooms
- ✅ Create event rooms
- ✅ Access collaboration tools

**Features Available:**
- My Groups tab
- Collaborations tab
- Live Events tab
- Event room creation

### Admin Access

**Permissions:**
- ✅ All photographer permissions
- ✅ Feature/unfeature posts
- ✅ Moderate content
- ✅ Manage discussions
- ✅ Manage events

---

## Data Flow

### Post Creation Flow

1. User uploads images via `upload.service.ts`
2. Images uploaded to Cloudinary
3. Cloudinary URLs returned
4. User submits post form
5. `post.service.create()` called
6. POST request to `/api/posts`
7. Backend validates and creates post
8. If photographer, auto-syncs to portfolio
9. Post appears in feed

### Like Flow

1. User clicks like button
2. `post.service.toggleLike()` called
3. POST request to `/api/posts/:id/like`
4. Backend checks if already liked
5. If not liked → insert like, increment count
6. If liked → remove like, decrement count
7. Updated counts returned
8. UI updates immediately

### Comment Flow

1. User types comment and submits
2. `post.service.addComment()` called
3. POST request to `/api/posts/:id/comment`
4. Backend creates comment record
5. Comment count incremented
6. New comment returned with user info
7. Comment displayed in UI

---

## Integration Points

### 1. **Authentication**
- Uses JWT tokens for API authentication
- Socket.io uses same JWT for real-time connections
- Protected routes require authentication

### 2. **File Upload**
- Integrated with Cloudinary service
- Images stored in cloud
- Thumbnails generated automatically
- Media URLs stored in database

### 3. **Photographer Portfolio**
- Photographer posts automatically sync to portfolio
- Portfolio items linked via `post_id`
- Two-way relationship maintained

### 4. **User Profiles**
- Posts display author information from `user_profiles`
- Avatar, name, verification badges
- Links to photographer profiles

### 5. **Events System**
- Events can have associated discussion rooms
- Event chat functionality (future implementation)
- Event listings in Community Buzz

---

## Future Enhancements

### Planned Features

1. **Real-time Notifications**
   - Like notifications
   - Comment notifications
   - Follow notifications
   - Mention notifications

2. **Enhanced Discussions**
   - Threaded discussions
   - Rich text editor
   - Code blocks for technical discussions
   - Image attachments in comments

3. **Event Chat Rooms**
   - Dedicated chat rooms per event
   - File sharing in chat
   - Photo sharing from event
   - Real-time coordination

4. **Advanced Search**
   - Search posts by hashtags
   - Search by location
   - Filter by content type
   - Date range filtering

5. **Analytics**
   - Post performance metrics
   - Engagement statistics
   - Trending algorithm improvements
   - Personal analytics dashboard

6. **Content Moderation**
   - Report inappropriate content
   - Auto-moderation with AI
   - Community guidelines enforcement
   - Admin moderation tools

7. **Collections & Albums**
   - Create photo collections
   - Share curated albums
   - Follow collections
   - Collection discovery

---

## Technical Stack Summary

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **UI Library:** Shadcn UI + Radix UI
- **Styling:** Tailwind CSS
- **State Management:** React Query + Local State
- **Real-time:** Socket.io Client
- **Build Tool:** Vite
- **HTTP Client:** Fetch API

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 15+
- **Authentication:** JWT (jsonwebtoken)
- **File Storage:** Cloudinary
- **Real-time:** Socket.io
- **Validation:** express-validator
- **Security:** Helmet, CORS, bcryptjs

---

## Key Metrics Tracked

1. **Engagement Metrics**
   - Likes count
   - Comments count
   - Shares count
   - Views count

2. **Community Metrics**
   - Active members count
   - Daily posts count
   - Active discussions count
   - Trending topics

3. **User Metrics**
   - Posts per user
   - Engagement rate
   - Top contributors
   - Followers count

---

## Security Considerations

1. **Authentication**
   - JWT-based authentication
   - Token expiration
   - Protected routes

2. **Authorization**
   - Users can only delete own posts
   - Owner verification on sensitive operations
   - Role-based access control

3. **Input Validation**
   - Request validation with express-validator
   - SQL injection prevention (parameterized queries)
   - XSS prevention (data sanitization)

4. **File Upload Security**
   - File type validation
   - Size limits
   - Cloudinary secure URLs

5. **Rate Limiting**
   - API rate limiting (via express-rate-limit)
   - Prevents abuse and spam

---

## Performance Optimizations

1. **Database**
   - Indexes on frequently queried columns
   - Pagination for large datasets
   - Efficient JOIN queries

2. **Frontend**
   - Lazy loading of images
   - Pagination for posts feed
   - Optimistic UI updates
   - Code splitting

3. **API**
   - Caching strategies (future)
   - Compression (gzip)
   - Efficient data serialization

---

## Conclusion

Community Buzz is a comprehensive social networking feature that serves as the heart of the Chitrasethu Photography Platform. It enables:

- **Community Building** - Bringing photographers and enthusiasts together
- **Knowledge Sharing** - Facilitating discussions and learning
- **Professional Growth** - Providing opportunities for collaboration and networking
- **Event Coordination** - Supporting real-time collaboration during events
- **Content Discovery** - Helping users discover trending content and photographers

The feature is built with modern web technologies, follows best practices for security and performance, and provides a solid foundation for future enhancements. It seamlessly integrates with the platform's authentication, file upload, and photographer portfolio systems, creating a cohesive user experience.

