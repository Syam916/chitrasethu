# Chitrasethu Database Documentation

## 📊 Database Overview

This document provides comprehensive information about the Chitrasethu database schema, including all tables, their relationships, usage patterns, and implementation details.

**Database Name:** `chitrasethu`  
**Database Type:** MySQL 8.0+  
**Character Set:** utf8mb4  
**Collation:** utf8mb4_unicode_ci

---

## 🗂️ Table Structure Overview

The database consists of **18 core tables** organized into the following categories:

### 1. **User Management (4 tables)**
- `users` - Core user information
- `user_profiles` - Extended user profile data
- `user_roles` - Role definitions
- `user_sessions` - Active user sessions

### 2. **Photographer Management (3 tables)**
- `photographers` - Photographer professional profiles
- `photographer_portfolios` - Portfolio items
- `photographer_availability` - Calendar availability

### 3. **Event & Booking Management (5 tables)**
- `event_categories` - Event type definitions
- `events` - Event listings
- `bookings` - Booking records
- `booking_payments` - Payment transactions
- `booking_reviews` - Reviews and ratings

### 4. **Social Features (4 tables)**
- `posts` - Social media posts
- `post_likes` - Post likes
- `post_comments` - Post comments
- `collections` - Curated photo collections

### 5. **Communication (2 tables)**
- `messages` - Direct messages
- `notifications` - User notifications

---

## 📋 Detailed Table Documentation

### 1. USERS Table
**Purpose:** Stores core user authentication and basic information

**Usage:**
- User registration and login
- Authentication and authorization
- User type identification (customer/photographer/admin)

**When Used:**
- Login/Register pages
- Authentication middleware
- User profile displays

**Relationships:**
- One-to-One with `user_profiles`
- One-to-Many with `bookings`, `posts`, `messages`
- One-to-One with `photographers` (if user_type = 'photographer')

**Key Fields:**
- `user_id` (PK) - Unique identifier
- `email` - Unique email for login
- `password_hash` - Bcrypt hashed password
- `user_type` - ENUM('customer', 'photographer', 'admin')
- `is_verified` - Email verification status
- `is_active` - Account active status

---

### 2. USER_PROFILES Table
**Purpose:** Extended user profile information

**Usage:**
- Display user profiles
- Search and filter users
- Social features

**When Used:**
- Profile pages
- User cards in search results
- Social interactions

**Relationships:**
- One-to-One with `users`

**Key Fields:**
- `profile_id` (PK)
- `user_id` (FK) - Links to users table
- `full_name` - Display name
- `avatar_url` - Profile picture
- `bio` - User description
- `location` - City, state, country
- `phone` - Contact number

---

### 3. USER_ROLES Table
**Purpose:** Define user roles and permissions

**Usage:**
- Role-based access control (RBAC)
- Permission management

**When Used:**
- Authorization middleware
- Admin panel
- Feature access control

**Key Fields:**
- `role_id` (PK)
- `role_name` - ENUM('customer', 'photographer', 'admin', 'moderator')
- `permissions` - JSON object with permission flags

---

### 4. USER_SESSIONS Table
**Purpose:** Track active user sessions

**Usage:**
- Session management
- Multi-device login tracking
- Security monitoring

**When Used:**
- Login/logout
- Token refresh
- Security audits

**Key Fields:**
- `session_id` (PK)
- `user_id` (FK)
- `token` - JWT token
- `device_info` - Browser/device details
- `ip_address` - Login IP
- `expires_at` - Session expiry

---

### 5. PHOTOGRAPHERS Table
**Purpose:** Professional photographer profiles and business information

**Usage:**
- Photographer discovery
- Service listings
- Professional details

**When Used:**
- Explore page
- Photographer search
- Booking flow
- Profile pages

**Relationships:**
- One-to-One with `users`
- One-to-Many with `photographer_portfolios`
- One-to-Many with `photographer_availability`
- One-to-Many with `bookings`

**Key Fields:**
- `photographer_id` (PK)
- `user_id` (FK) - Links to users
- `business_name` - Studio/business name
- `specialties` - JSON array of specialties
- `experience_years` - Years of experience
- `base_price` - Starting price
- `rating` - Average rating (0-5)
- `total_reviews` - Review count
- `is_verified` - Verification badge
- `is_premium` - Premium membership

---

### 6. PHOTOGRAPHER_PORTFOLIOS Table
**Purpose:** Store photographer portfolio items

**Usage:**
- Display photographer work
- Portfolio galleries
- Work samples

**When Used:**
- Photographer profile pages
- Portfolio galleries
- Moodboard collections

**Relationships:**
- Many-to-One with `photographers`

**Key Fields:**
- `portfolio_id` (PK)
- `photographer_id` (FK)
- `image_url` - Portfolio image
- `title` - Image title
- `description` - Image description
- `category` - Event type
- `display_order` - Sort order

---

### 7. PHOTOGRAPHER_AVAILABILITY Table
**Purpose:** Manage photographer calendar availability

**Usage:**
- Booking calendar
- Availability checking
- Schedule management

**When Used:**
- Booking flow
- Calendar displays
- Availability checks

**Relationships:**
- Many-to-One with `photographers`

**Key Fields:**
- `availability_id` (PK)
- `photographer_id` (FK)
- `date` - Available date
- `time_slot` - Time range
- `is_available` - Availability status
- `booking_id` (FK, nullable) - If booked

---

### 8. EVENT_CATEGORIES Table
**Purpose:** Define event types and categories

**Usage:**
- Event classification
- Filtering and search
- Category-based displays

**When Used:**
- Event creation
- Search filters
- Category navigation

**Key Fields:**
- `category_id` (PK)
- `category_name` - Wedding, Birthday, Fashion, etc.
- `description` - Category description
- `icon` - Icon identifier
- `color_code` - UI color

---

### 9. EVENTS Table
**Purpose:** Store event listings and details

**Usage:**
- Event discovery
- Event management
- Booking source

**When Used:**
- Home page feed
- Event Photos page
- Event details
- Booking flow

**Relationships:**
- Many-to-One with `event_categories`
- Many-to-One with `users` (creator)
- One-to-Many with `bookings`

**Key Fields:**
- `event_id` (PK)
- `creator_id` (FK) - User who created
- `category_id` (FK) - Event category
- `title` - Event name
- `description` - Event details
- `event_date` - Scheduled date
- `event_time` - Scheduled time
- `location` - Venue
- `expected_attendees` - Guest count
- `budget_range` - Price range
- `status` - ENUM('open', 'in_progress', 'completed', 'cancelled')

---

### 10. BOOKINGS Table
**Purpose:** Manage booking requests and confirmations

**Usage:**
- Booking management
- Request tracking
- Service delivery

**When Used:**
- Requests page
- Booking flow
- Photographer dashboard
- Customer bookings

**Relationships:**
- Many-to-One with `users` (customer)
- Many-to-One with `photographers`
- Many-to-One with `events`
- One-to-Many with `booking_payments`
- One-to-One with `booking_reviews`

**Key Fields:**
- `booking_id` (PK)
- `customer_id` (FK) - User making booking
- `photographer_id` (FK) - Photographer booked
- `event_id` (FK, nullable) - Related event
- `booking_date` - Service date
- `booking_time` - Service time
- `duration_hours` - Service duration
- `total_amount` - Total price
- `advance_amount` - Advance payment
- `status` - ENUM('pending', 'confirmed', 'completed', 'cancelled', 'refunded')
- `special_requirements` - Customer notes

---

### 11. BOOKING_PAYMENTS Table
**Purpose:** Track payment transactions

**Usage:**
- Payment processing
- Transaction history
- Financial records

**When Used:**
- Payment gateway integration
- Payment status updates
- Transaction history

**Relationships:**
- Many-to-One with `bookings`

**Key Fields:**
- `payment_id` (PK)
- `booking_id` (FK)
- `amount` - Payment amount
- `payment_method` - Card, UPI, etc.
- `payment_status` - ENUM('pending', 'completed', 'failed', 'refunded')
- `transaction_id` - Gateway transaction ID
- `payment_gateway` - Razorpay, Stripe, etc.

---

### 12. BOOKING_REVIEWS Table
**Purpose:** Store booking reviews and ratings

**Usage:**
- Rating system
- Feedback collection
- Reputation management

**When Used:**
- After booking completion
- Review displays
- Rating calculations

**Relationships:**
- One-to-One with `bookings`
- Many-to-One with `photographers`

**Key Fields:**
- `review_id` (PK)
- `booking_id` (FK)
- `photographer_id` (FK)
- `customer_id` (FK)
- `rating` - 1-5 stars
- `review_text` - Written review
- `response_text` - Photographer response

---

### 13. POSTS Table
**Purpose:** Social media posts and content

**Usage:**
- Community Buzz feed
- Social interactions
- Content sharing

**When Used:**
- Community Buzz page
- Main Feed
- Profile pages

**Relationships:**
- Many-to-One with `users`
- One-to-Many with `post_likes`
- One-to-Many with `post_comments`

**Key Fields:**
- `post_id` (PK)
- `user_id` (FK) - Post author
- `content_type` - ENUM('image', 'video', 'text')
- `caption` - Post caption
- `media_urls` - JSON array of media
- `location` - Tagged location
- `tags` - JSON array of hashtags
- `likes_count` - Like counter
- `comments_count` - Comment counter
- `shares_count` - Share counter

---

### 14. POST_LIKES Table
**Purpose:** Track post likes

**Usage:**
- Like functionality
- Engagement metrics

**When Used:**
- Like button clicks
- Engagement displays

**Relationships:**
- Many-to-One with `posts`
- Many-to-One with `users`

**Key Fields:**
- `like_id` (PK)
- `post_id` (FK)
- `user_id` (FK)
- Unique constraint on (post_id, user_id)

---

### 15. POST_COMMENTS Table
**Purpose:** Store post comments

**Usage:**
- Comment functionality
- Discussions

**When Used:**
- Comment sections
- Social interactions

**Relationships:**
- Many-to-One with `posts`
- Many-to-One with `users`

**Key Fields:**
- `comment_id` (PK)
- `post_id` (FK)
- `user_id` (FK)
- `comment_text` - Comment content
- `parent_comment_id` (FK, nullable) - For replies

---

### 16. COLLECTIONS Table
**Purpose:** Curated photo collections and moodboards

**Usage:**
- Moodboard feature
- Curated galleries
- Inspiration boards

**When Used:**
- Moodboard page
- Collection browsing
- Saved items

**Relationships:**
- Many-to-One with `users` (curator)

**Key Fields:**
- `collection_id` (PK)
- `user_id` (FK) - Collection creator
- `title` - Collection name
- `description` - Collection description
- `thumbnail_url` - Cover image
- `images` - JSON array of image URLs
- `category` - Collection category
- `is_public` - Public/private flag

---

### 17. MESSAGES Table
**Purpose:** Direct messaging between users

**Usage:**
- Chat functionality
- Direct communication

**When Used:**
- Message/chat features
- Customer-photographer communication

**Relationships:**
- Many-to-One with `users` (sender)
- Many-to-One with `users` (receiver)

**Key Fields:**
- `message_id` (PK)
- `sender_id` (FK)
- `receiver_id` (FK)
- `message_text` - Message content
- `is_read` - Read status
- `read_at` - Read timestamp

---

### 18. NOTIFICATIONS Table
**Purpose:** User notifications and alerts

**Usage:**
- Notification system
- User alerts
- Activity updates

**When Used:**
- Notification bell
- Email notifications
- Push notifications

**Relationships:**
- Many-to-One with `users`

**Key Fields:**
- `notification_id` (PK)
- `user_id` (FK)
- `type` - ENUM('booking', 'message', 'like', 'comment', 'review', 'payment')
- `title` - Notification title
- `message` - Notification content
- `link` - Action URL
- `is_read` - Read status

---

## 🔗 Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│    USERS    │────1:1──│  USER_PROFILES   │         │   USER_ROLES    │
└──────┬──────┘         └──────────────────┘         └─────────────────┘
       │
       │1:1
       ├──────────┐
       │          │
       ▼          ▼
┌──────────────┐  ┌────────────────────┐
│ PHOTOGRAPHERS│  │   USER_SESSIONS    │
└──────┬───────┘  └────────────────────┘
       │
       │1:N
       ├─────────────┬──────────────────┐
       │             │                  │
       ▼             ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ PHOTOGRAPHER_   │ │  BOOKINGS    │ │ PHOTOGRAPHER_        │
│  PORTFOLIOS     │ └──────┬───────┘ │  AVAILABILITY        │
└─────────────────┘        │         └──────────────────────┘
                           │
                    ┌──────┴────────┬────────────┐
                    │               │            │
                    ▼               ▼            ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │   BOOKING_   │ │  EVENTS  │ │   BOOKING_   │
            │   PAYMENTS   │ └────┬─────┘ │   REVIEWS    │
            └──────────────┘      │       └──────────────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │EVENT_CATEGORIES│
                          └───────────────┘

┌─────────┐
│  POSTS  │──1:N──┌─────────────┐
└────┬────┘       │ POST_LIKES  │
     │            └─────────────┘
     │1:N
     └────────────┌──────────────┐
                  │POST_COMMENTS │
                  └──────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ COLLECTIONS  │    │   MESSAGES   │    │NOTIFICATIONS │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 🎯 Common Query Patterns

### 1. User Authentication
```sql
SELECT u.*, up.*, ur.permissions 
FROM users u
LEFT JOIN user_profiles up ON u.user_id = up.user_id
LEFT JOIN user_roles ur ON u.user_type = ur.role_name
WHERE u.email = ? AND u.is_active = 1;
```

### 2. Photographer Discovery
```sql
SELECT p.*, up.full_name, up.avatar_url, up.location
FROM photographers p
JOIN users u ON p.user_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
WHERE p.is_active = 1
AND JSON_CONTAINS(p.specialties, '"Wedding"')
ORDER BY p.rating DESC, p.total_reviews DESC
LIMIT 20;
```

### 3. Social Feed
```sql
SELECT p.*, up.full_name, up.avatar_url
FROM posts p
JOIN users u ON p.user_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
WHERE p.is_active = 1
ORDER BY p.created_at DESC
LIMIT 50;
```

### 4. Booking History
```sql
SELECT b.*, p.business_name, e.title as event_title
FROM bookings b
JOIN photographers p ON b.photographer_id = p.photographer_id
LEFT JOIN events e ON b.event_id = e.event_id
WHERE b.customer_id = ?
ORDER BY b.created_at DESC;
```

---

## 🔒 Security Considerations

1. **Password Storage**: Always use bcrypt with salt rounds ≥ 10
2. **SQL Injection**: Use parameterized queries/prepared statements
3. **Data Validation**: Validate all inputs before database operations
4. **Access Control**: Implement row-level security for sensitive data
5. **Audit Trail**: Track important operations with timestamps
6. **Encryption**: Encrypt sensitive data at rest (payment info, personal data)

---

## 📈 Performance Optimization

### Indexes Created
- Primary keys on all tables
- Foreign key indexes
- Composite indexes on frequently queried columns
- Full-text indexes on search fields

### Optimization Tips
1. Use connection pooling
2. Implement query caching
3. Use EXPLAIN to analyze slow queries
4. Regular database maintenance (OPTIMIZE TABLE)
5. Monitor slow query log

---

## 🔄 Backup & Maintenance

### Backup Strategy
```bash
# Daily backup
mysqldump -u root -p chitrasethu > backup_$(date +%Y%m%d).sql

# Restore
mysql -u root -p chitrasethu_db < backup_20241025.sql
```

### Maintenance Tasks
- Weekly: OPTIMIZE TABLE
- Monthly: ANALYZE TABLE
- Quarterly: Review and clean old sessions
- Yearly: Archive old data

---

## 📝 Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-10-25 | Initial database schema |

---

## 🆘 Support

For database-related issues:
1. Check this documentation
2. Review SQL error logs
3. Contact: dev@chitrasethu.com

