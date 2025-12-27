# STEP 1: Database Analysis for Community Buzz Implementation

## 📊 Current Database Status

### ✅ **EXISTING TABLES - Good to Use (No Changes Needed)**

These tables are already in your database and support Community Buzz features:

1. **`posts`** ✅
   - Stores social media posts
   - Has all fields needed: caption, media_urls, tags, location, likes_count, comments_count
   - Status: **READY TO USE**

2. **`post_likes`** ✅
   - Tracks user likes on posts
   - Has unique constraint to prevent duplicate likes
   - Status: **READY TO USE**

3. **`post_comments`** ✅
   - Stores comments on posts
   - Supports nested comments (parent_comment_id)
   - Status: **READY TO USE**

4. **`events`** ✅
   - Stores event information
   - Has fields: title, description, event_date, location, category
   - Status: **READY TO USE** (for Events tab)

5. **`messages`** ✅
   - For direct messaging
   - Can be extended for group chats (needs modification)
   - Status: **PARTIALLY READY** (needs group chat support)

6. **`collections`** ✅
   - For curated photo collections
   - Status: **READY TO USE**

7. **`users`** & **`user_profiles`** ✅
   - User information for post authors
   - Status: **READY TO USE**

8. **`photographers`** ✅
   - Photographer profiles
   - Status: **READY TO USE**

---

## ❌ **MISSING TABLES - Need to Be Created**

Based on the frontend implementation, we need to add these tables:

### 1. **`discussion_topics`** - For Discussions Tab
**Purpose:** Store discussion topics/threads for the Discussions tab

**Required Fields:**
- `topic_id` (Primary Key)
- `user_id` (Foreign Key → users)
- `title` (Discussion title)
- `description` (Optional description)
- `category` (Equipment, Business, Post-Processing, etc.)
- `replies_count` (Counter)
- `views_count` (Counter)
- `is_hot` (Boolean - for trending topics)
- `is_pinned` (Boolean - for pinned topics)
- `is_locked` (Boolean - to lock discussions)
- `last_activity_at` (Timestamp - for sorting by activity)
- `created_at`, `updated_at`

### 2. **`discussion_replies`** - For Discussion Replies
**Purpose:** Store replies to discussion topics

**Required Fields:**
- `reply_id` (Primary Key)
- `topic_id` (Foreign Key → discussion_topics)
- `user_id` (Foreign Key → users)
- `reply_text` (The reply content)
- `parent_reply_id` (For nested replies)
- `likes_count` (Counter)
- `is_edited` (Boolean)
- `is_active` (Boolean - soft delete)
- `created_at`, `updated_at`

### 3. **`community_groups`** - For Photographer Groups
**Purpose:** Store community groups for photographers (My Groups tab)

**Required Fields:**
- `group_id` (Primary Key)
- `creator_id` (Foreign Key → users)
- `group_name` (Group name)
- `group_type` (ENUM: 'regional', 'project', 'network', 'equipment', 'other')
- `description` (Group description)
- `group_icon_url` (Avatar/icon URL)
- `member_count` (Counter)
- `is_public` (Boolean - public or private)
- `is_active` (Boolean)
- `last_activity_at` (Timestamp)
- `created_at`, `updated_at`

### 4. **`group_members`** - For Group Membership
**Purpose:** Track which users are members of which groups

**Required Fields:**
- `member_id` (Primary Key)
- `group_id` (Foreign Key → community_groups)
- `user_id` (Foreign Key → users)
- `role` (ENUM: 'admin', 'moderator', 'member')
- `joined_at` (Timestamp)
- `unread_count` (Counter - for unread messages)
- Unique constraint: (group_id, user_id)

### 5. **`collaborations`** - For Collaboration Listings
**Purpose:** Store collaboration opportunities (Collaborations tab)

**Required Fields:**
- `collaboration_id` (Primary Key)
- `user_id` (Foreign Key → users - the poster)
- `collaboration_type` (ENUM: 'seeking', 'offering')
- `title` (Collaboration title)
- `description` (Detailed description)
- `skills` (JSONB array - required skills)
- `location` (Location string)
- `date` (Date - when needed/available)
- `budget` (Budget range or amount)
- `min_budget` (Decimal - optional)
- `max_budget` (Decimal - optional)
- `responses_count` (Counter)
- `is_active` (Boolean)
- `created_at`, `updated_at`

### 6. **`collaboration_responses`** - For Collaboration Responses
**Purpose:** Track responses to collaboration posts

**Required Fields:**
- `response_id` (Primary Key)
- `collaboration_id` (Foreign Key → collaborations)
- `user_id` (Foreign Key → users)
- `message` (Response message)
- `status` (ENUM: 'pending', 'accepted', 'declined', 'withdrawn')
- `created_at`, `updated_at`
- Unique constraint: (collaboration_id, user_id) - one response per user

### 7. **`follows`** (OPTIONAL but Recommended) - For Follow/Following
**Purpose:** Track user follow relationships

**Required Fields:**
- `follow_id` (Primary Key)
- `follower_id` (Foreign Key → users)
- `following_id` (Foreign Key → users)
- `created_at`
- Unique constraint: (follower_id, following_id)
- Check constraint: follower_id != following_id (can't follow yourself)

### 8. **`post_shares`** (OPTIONAL) - For Post Sharing
**Purpose:** Track post shares (if you want to track who shared what)

**Required Fields:**
- `share_id` (Primary Key)
- `post_id` (Foreign Key → posts)
- `user_id` (Foreign Key → users)
- `shared_at` (Timestamp)
- Unique constraint: (post_id, user_id)

### 9. **`group_messages`** (EXTENSION) - For Group Chat
**Purpose:** Store messages in group chats (alternative: extend existing messages table)

**Note:** You can either:
- **Option A:** Create separate `group_messages` table
- **Option B:** Extend existing `messages` table with `group_id` field

**If Option B (Recommended):**
- Add `group_id` (Foreign Key → community_groups, nullable)
- Add `message_type` extension to support 'group' messages
- Keep existing structure for direct messages

---

## 📝 **RECOMMENDED APPROACH**

### **Phase 1: Essential Tables (Must Have)**
1. ✅ `discussion_topics`
2. ✅ `discussion_replies`
3. ✅ `community_groups`
4. ✅ `group_members`
5. ✅ `collaborations`
6. ✅ `collaboration_responses`

### **Phase 2: Enhanced Features (Nice to Have)**
7. ✅ `follows` - For follow/following functionality
8. ✅ Extend `messages` table - Add `group_id` for group chats
9. ✅ `post_shares` - For detailed share tracking

---

## 🎯 **NEXT STEPS**

1. **Review this analysis** ✅ (You are here)
2. **Confirm which tables to create** (Essential + Optional)
3. **Create SQL migration script** for new tables
4. **Test migration** on development database
5. **Proceed to Step 2:** Backend API implementation

---

## 📋 **DECISION CHECKLIST**

Please review and confirm:

- [ ] Create essential tables (1-6)?
- [ ] Add `follows` table?
- [ ] Extend `messages` table for group chats OR create separate `group_messages`?
- [ ] Add `post_shares` table?
- [ ] Any other tables you want to add?

**Once confirmed, I'll create the SQL migration script!**

