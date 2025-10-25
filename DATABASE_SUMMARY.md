# Chitrasethu Database Summary

## 📊 Complete Database Overview

This document provides a quick reference for all database tables, their purposes, and relationships.

---

## 🗂️ 18 Tables Organized by Category

### 1️⃣ USER MANAGEMENT (4 Tables)

#### `users` - Core User Data
**Purpose**: Authentication and basic user information  
**Key Fields**: user_id, email, password_hash, user_type, is_verified  
**Used In**: Login, Registration, Authentication  
**Relationships**: → user_profiles (1:1), → photographers (1:1), → bookings (1:N), → posts (1:N)

#### `user_profiles` - Extended Profile Information
**Purpose**: Detailed user profile data  
**Key Fields**: profile_id, user_id, full_name, avatar_url, bio, phone, location  
**Used In**: Profile pages, User cards, Social features  
**Relationships**: ← users (1:1)

#### `user_roles` - Role Definitions
**Purpose**: Role-based access control  
**Key Fields**: role_id, role_name, permissions (JSON)  
**Used In**: Authorization, Permission checks  
**Roles**: customer, photographer, admin, moderator

#### `user_sessions` - Active Sessions
**Purpose**: Session management and tracking  
**Key Fields**: session_id, user_id, token, device_info, ip_address, expires_at  
**Used In**: Login/Logout, Token refresh, Security monitoring  
**Relationships**: ← users (N:1)

---

### 2️⃣ PHOTOGRAPHER MANAGEMENT (3 Tables)

#### `photographers` - Photographer Profiles
**Purpose**: Professional photographer business information  
**Key Fields**: photographer_id, user_id, business_name, specialties (JSON), experience_years, base_price, rating  
**Used In**: Explore page, Search, Booking flow, Profile pages  
**Relationships**: ← users (1:1), → photographer_portfolios (1:N), → bookings (1:N)

#### `photographer_portfolios` - Portfolio Items
**Purpose**: Showcase photographer work  
**Key Fields**: portfolio_id, photographer_id, image_url, title, category, display_order  
**Used In**: Photographer profiles, Portfolio galleries, Moodboards  
**Relationships**: ← photographers (N:1)

#### `photographer_availability` - Calendar Availability
**Purpose**: Manage booking calendar  
**Key Fields**: availability_id, photographer_id, date, time_slot, is_available, booking_id  
**Used In**: Booking calendar, Availability checks, Schedule management  
**Relationships**: ← photographers (N:1), ← bookings (N:1)

---

### 3️⃣ EVENT & BOOKING MANAGEMENT (5 Tables)

#### `event_categories` - Event Types
**Purpose**: Define and categorize event types  
**Key Fields**: category_id, category_name, slug, icon, color_code  
**Used In**: Event creation, Filtering, Category navigation  
**Categories**: Wedding, Pre-Wedding, Birthday, Corporate, Fashion, Events, Portrait, Family

#### `events` - Event Listings
**Purpose**: Store event details and requirements  
**Key Fields**: event_id, creator_id, category_id, title, event_date, location, budget_range, status  
**Used In**: Home feed, Event Photos page, Event details, Booking flow  
**Relationships**: ← users (N:1), ← event_categories (N:1), → bookings (1:N)

#### `bookings` - Booking Records
**Purpose**: Manage booking requests and confirmations  
**Key Fields**: booking_id, customer_id, photographer_id, event_id, booking_date, total_amount, status  
**Used In**: Requests page, Booking flow, Dashboards  
**Status**: pending, confirmed, in_progress, completed, cancelled, refunded  
**Relationships**: ← users (N:1), ← photographers (N:1), ← events (N:1), → booking_payments (1:N)

#### `booking_payments` - Payment Transactions
**Purpose**: Track all payment transactions  
**Key Fields**: payment_id, booking_id, amount, payment_method, payment_status, transaction_id  
**Used In**: Payment processing, Transaction history, Financial records  
**Relationships**: ← bookings (N:1)

#### `booking_reviews` - Reviews & Ratings
**Purpose**: Store customer reviews and ratings  
**Key Fields**: review_id, booking_id, photographer_id, rating (1-5), review_text, response_text  
**Used In**: After booking completion, Review displays, Rating calculations  
**Relationships**: ← bookings (1:1), ← photographers (N:1)

---

### 4️⃣ SOCIAL FEATURES (4 Tables)

#### `posts` - Social Media Posts
**Purpose**: Social content and photo sharing  
**Key Fields**: post_id, user_id, content_type, caption, media_urls (JSON), tags (JSON), likes_count  
**Used In**: Community Buzz, Main Feed, Profile pages  
**Relationships**: ← users (N:1), → post_likes (1:N), → post_comments (1:N)

#### `post_likes` - Post Likes
**Purpose**: Track post likes  
**Key Fields**: like_id, post_id, user_id  
**Used In**: Like button, Engagement metrics  
**Relationships**: ← posts (N:1), ← users (N:1)  
**Constraint**: Unique (post_id, user_id) - one like per user per post

#### `post_comments` - Post Comments
**Purpose**: Store post comments and replies  
**Key Fields**: comment_id, post_id, user_id, comment_text, parent_comment_id  
**Used In**: Comment sections, Discussions  
**Relationships**: ← posts (N:1), ← users (N:1), ← post_comments (N:1, self-referencing)

#### `collections` - Photo Collections/Moodboards
**Purpose**: Curated photo collections and inspiration boards  
**Key Fields**: collection_id, user_id, title, images (JSON), category, is_public  
**Used In**: Moodboard page, Collection browsing, Saved items  
**Relationships**: ← users (N:1)

---

### 5️⃣ COMMUNICATION (2 Tables)

#### `messages` - Direct Messages
**Purpose**: User-to-user messaging  
**Key Fields**: message_id, sender_id, receiver_id, message_text, is_read, read_at  
**Used In**: Chat features, Customer-photographer communication  
**Relationships**: ← users (N:1, sender), ← users (N:1, receiver)

#### `notifications` - User Notifications
**Purpose**: System notifications and alerts  
**Key Fields**: notification_id, user_id, type, title, message, link, is_read  
**Used In**: Notification bell, Email notifications, Push notifications  
**Types**: booking, message, like, comment, review, payment, system  
**Relationships**: ← users (N:1)

---

## 🔗 Key Relationships Diagram

```
USERS (Core)
  ├─→ user_profiles (1:1)
  ├─→ user_sessions (1:N)
  ├─→ photographers (1:1, if photographer)
  ├─→ events (1:N, as creator)
  ├─→ bookings (1:N, as customer)
  ├─→ posts (1:N)
  ├─→ collections (1:N)
  ├─→ messages (1:N, as sender/receiver)
  └─→ notifications (1:N)

PHOTOGRAPHERS
  ├─→ photographer_portfolios (1:N)
  ├─→ photographer_availability (1:N)
  ├─→ bookings (1:N)
  └─→ booking_reviews (1:N)

EVENTS
  ├─→ bookings (1:N)
  └─← event_categories (N:1)

BOOKINGS
  ├─→ booking_payments (1:N)
  └─→ booking_reviews (1:1)

POSTS
  ├─→ post_likes (1:N)
  └─→ post_comments (1:N)
```

---

## 📈 Table Sizes & Indexes

### Primary Indexes
- All tables have PRIMARY KEY on their ID field
- All foreign keys have indexes
- Email fields have UNIQUE indexes

### Performance Indexes
- `users`: idx_email, idx_user_type, idx_is_active
- `photographers`: idx_rating, idx_is_verified, idx_base_price
- `bookings`: idx_customer_id, idx_photographer_id, idx_booking_date, idx_status
- `posts`: idx_user_id, idx_created_at, idx_is_featured, FULLTEXT(caption)
- `events`: idx_event_date, idx_status, idx_city

### Composite Indexes
- `photographer_availability`: idx_photographer_date (photographer_id, date)
- `messages`: idx_conversation (sender_id, receiver_id, created_at)

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

### 2. Photographer Search
```sql
SELECT p.*, up.full_name, up.avatar_url, up.location
FROM photographers p
JOIN user_profiles up ON p.user_id = up.user_id
WHERE p.is_active = 1
AND JSON_CONTAINS(p.specialties, '"Wedding"')
AND p.rating >= 4.5
ORDER BY p.rating DESC, p.total_reviews DESC;
```

### 3. Social Feed
```sql
SELECT p.*, up.full_name, up.avatar_url,
       (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id) as likes,
       (SELECT COUNT(*) FROM post_comments WHERE post_id = p.post_id) as comments
FROM posts p
JOIN user_profiles up ON p.user_id = up.user_id
WHERE p.is_active = 1
ORDER BY p.created_at DESC
LIMIT 50;
```

### 4. Booking Details
```sql
SELECT b.*, 
       up_customer.full_name as customer_name,
       p.business_name,
       up_photographer.full_name as photographer_name,
       e.title as event_title
FROM bookings b
JOIN user_profiles up_customer ON b.customer_id = up_customer.user_id
JOIN photographers p ON b.photographer_id = p.photographer_id
JOIN user_profiles up_photographer ON p.user_id = up_photographer.user_id
LEFT JOIN events e ON b.event_id = e.event_id
WHERE b.booking_id = ?;
```

---

## 🔄 Automated Triggers

### 1. Update Photographer Rating
**Trigger**: After INSERT on `booking_reviews`  
**Action**: Recalculates average rating and total review count

### 2. Update Post Likes Count
**Triggers**: After INSERT/DELETE on `post_likes`  
**Action**: Increments/decrements likes_count in posts table

### 3. Update Post Comments Count
**Triggers**: After INSERT/DELETE on `post_comments`  
**Action**: Increments/decrements comments_count in posts table

---

## 📊 Sample Data Summary

After running `npm run db:seed`, you'll have:

| Table | Records | Description |
|-------|---------|-------------|
| users | 8 | 3 customers, 4 photographers, 1 admin |
| user_profiles | 8 | Complete profiles for all users |
| user_roles | 4 | customer, photographer, admin, moderator |
| photographers | 4 | Professional photographer profiles |
| photographer_portfolios | 12 | 3 items per photographer |
| event_categories | 8 | All event types |
| events | 5 | Sample event listings |
| bookings | 4 | Various booking statuses |
| booking_payments | 3 | Payment transactions |
| booking_reviews | 2 | Sample reviews |
| posts | 5 | Social media posts |
| post_likes | 11 | Post engagement |
| post_comments | 6 | User comments |
| collections | 4 | Moodboard collections |
| messages | 5 | Direct messages |
| notifications | 5 | User notifications |
| photographer_availability | 14 | Calendar slots |

---

## 🔒 Data Integrity

### Foreign Key Constraints
- All foreign keys have ON DELETE CASCADE or ON DELETE SET NULL
- Referential integrity is enforced at database level

### Unique Constraints
- users.email
- photographer_availability (photographer_id, date, time_slot)
- post_likes (post_id, user_id)
- booking_payments.transaction_id

### Check Constraints
- booking_reviews.rating (1-5)
- All ENUM fields have predefined values

---

## 💾 Backup & Maintenance

### Daily Backup
```bash
mysqldump -u root -p chitrasethu_db > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
mysql -u root -p chitrasethu_db < backup_20241025.sql
```

### Optimize Tables
```sql
OPTIMIZE TABLE users, photographers, bookings, posts;
```

### Analyze Tables
```sql
ANALYZE TABLE users, photographers, bookings, posts;
```

---

## 📝 Quick Reference

### Table Naming Convention
- Plural nouns (users, bookings, posts)
- Snake_case for multi-word tables
- Junction tables: table1_table2 (post_likes)

### Column Naming Convention
- Snake_case (user_id, full_name)
- Boolean fields: is_*, has_*
- Timestamps: *_at (created_at, updated_at)
- Foreign keys: table_id (user_id, photographer_id)

### JSON Fields
- `specialties`, `equipment`, `languages` - Arrays
- `permissions`, `social_links`, `preferences` - Objects
- `media_urls`, `images`, `tags` - Arrays

---

## 🎓 Best Practices

1. **Always use prepared statements** to prevent SQL injection
2. **Use transactions** for multi-table operations
3. **Index frequently queried columns**
4. **Normalize data** to reduce redundancy
5. **Use appropriate data types** (DECIMAL for money, DATE for dates)
6. **Set proper foreign key constraints**
7. **Use ENUM** for fixed value sets
8. **Add timestamps** to all tables
9. **Implement soft deletes** where needed (is_active flags)
10. **Regular backups** are essential

---

## 📞 Need Help?

- **Full Documentation**: `backend/database/DB_README.md`
- **Schema File**: `backend/database/schema.sql`
- **Seed Data**: `backend/database/seed.sql`
- **Quick Start**: `QUICK_START.md`
- **Backend README**: `backend/README.md`

---

**Database Version**: 1.0.0  
**Last Updated**: 2024-10-25  
**Total Tables**: 18  
**Total Relationships**: 25+  
**Indexes**: 50+  
**Triggers**: 5

🎉 **Your database is production-ready!**

