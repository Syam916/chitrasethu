# Photo Booth Database Tables - PostgreSQL

## Overview

This migration creates 3 tables for the Photo Booth feature, which allows photographers to create QR code galleries for their event photos.

---

## Tables Created

### 1. `photo_booth_galleries`

**Purpose:** Stores gallery information and settings

**Key Fields:**
- `gallery_id` - Primary key
- `photographer_id` - Links to photographer who created the gallery
- `booking_id` - Optional link to a booking/event
- `event_name` - Name of the event (e.g., "Kavya & Karthik Wedding")
- `qr_code` - Unique QR code identifier (used in URL)
- `qr_code_url` - URL to the QR code image
- `gallery_url` - Public URL for accessing the gallery
- `privacy` - Gallery privacy: 'public', 'password', or 'private'
- `password_hash` - Hashed password if gallery is password-protected
- `expiry_date` - Optional date when gallery expires
- `download_enabled` - Whether downloads are allowed
- `watermark_enabled` - Whether to add watermark to photos
- `cover_photo_url` - Gallery cover image
- `description` - Gallery description
- `photo_count` - Total number of photos in gallery
- `access_count` - Total number of times gallery was accessed
- `download_count` - Total number of photo downloads
- `is_active` - Whether gallery is active

**Relationships:**
- `photographer_id` → `photographers(photographer_id)` (CASCADE DELETE)
- `booking_id` → `bookings(booking_id)` (SET NULL ON DELETE)

**Indexes:**
- `photographer_id` - Fast lookup by photographer
- `qr_code` - Fast lookup by QR code (for public access)
- `privacy` - Filter by privacy type
- `is_active` - Filter active galleries
- `booking_id` - Link to bookings
- `created_at` - Sort by creation date

---

### 2. `photo_booth_gallery_photos`

**Purpose:** Stores individual photos in each gallery

**Key Fields:**
- `photo_id` - Primary key
- `gallery_id` - Links to parent gallery
- `photo_url` - Full-size photo URL (Cloudinary)
- `thumbnail_url` - Thumbnail URL (for faster loading)
- `display_order` - Order for displaying photos
- `download_count` - Number of times this photo was downloaded
- `views_count` - Number of times this photo was viewed

**Relationships:**
- `gallery_id` → `photo_booth_galleries(gallery_id)` (CASCADE DELETE)

**Indexes:**
- `gallery_id` - Fast lookup of photos in a gallery
- `(gallery_id, display_order)` - Fast sorting of photos

---

### 3. `photo_booth_access_logs` (Optional - for analytics)

**Purpose:** Tracks when galleries are accessed for analytics

**Key Fields:**
- `log_id` - Primary key
- `gallery_id` - Links to gallery that was accessed
- `ip_address` - IP address of visitor
- `user_agent` - Browser/device information
- `accessed_at` - When gallery was accessed

**Relationships:**
- `gallery_id` → `photo_booth_galleries(gallery_id)` (CASCADE DELETE)

**Indexes:**
- `gallery_id` - Fast lookup of access logs for a gallery
- `accessed_at` - Sort by access time
- `(gallery_id, accessed_at)` - Combined lookup and sorting

---

## Table Relationships

```
photographers
    │
    ├─→ photo_booth_galleries (1 photographer → many galleries)
    │       │
    │       ├─→ photo_booth_gallery_photos (1 gallery → many photos)
    │       │
    │       └─→ photo_booth_access_logs (1 gallery → many access logs)
    │
    └─→ bookings
            │
            └─→ photo_booth_galleries (1 booking → many galleries, optional)
```

---

## How to Run the Migration

### Option 1: Using psql Command Line

```bash
# Connect to your PostgreSQL database
psql -U your_username -d chitrasethu

# Run the migration file
\i backend/database/migrations/create_photo_booth_tables.sql

# Or from command line:
psql -U your_username -d chitrasethu -f backend/database/migrations/create_photo_booth_tables.sql
```

### Option 2: Using pgAdmin

1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → Query Tool
4. Open the file: `backend/database/migrations/create_photo_booth_tables.sql`
5. Execute the query (F5)

### Option 3: Using Node.js Script

```javascript
// Run using your database connection script
const fs = require('fs');
const { Pool } = require('pg');
const pool = new Pool({
  // your database config
});

const sql = fs.readFileSync('./backend/database/migrations/create_photo_booth_tables.sql', 'utf8');
await pool.query(sql);
```

---

## Verification

After running the migration, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'photo_booth%';

-- Check table structure
\d photo_booth_galleries
\d photo_booth_gallery_photos
\d photo_booth_access_logs

-- Check enum type
SELECT typname, typtype 
FROM pg_type 
WHERE typname = 'gallery_privacy_enum';
```

Expected output:
- `photo_booth_galleries`
- `photo_booth_gallery_photos`
- `photo_booth_access_logs`
- `gallery_privacy_enum` (enum type)

---

## Example Data

### Insert a Gallery

```sql
INSERT INTO photo_booth_galleries (
    photographer_id,
    event_name,
    qr_code,
    gallery_url,
    privacy,
    download_enabled,
    photo_count
) VALUES (
    1,
    'Kavya & Karthik Wedding',
    'QRKAVYA2024',
    'https://chitrasethu.com/gallery/QRKAVYA2024',
    'public',
    TRUE,
    0
);
```

### Insert Photos

```sql
INSERT INTO photo_booth_gallery_photos (
    gallery_id,
    photo_url,
    thumbnail_url,
    display_order
) VALUES 
    (1, 'https://cloudinary.com/photo1.jpg', 'https://cloudinary.com/photo1_thumb.jpg', 1),
    (1, 'https://cloudinary.com/photo2.jpg', 'https://cloudinary.com/photo2_thumb.jpg', 2),
    (1, 'https://cloudinary.com/photo3.jpg', 'https://cloudinary.com/photo3_thumb.jpg', 3);
```

### Track Access

```sql
INSERT INTO photo_booth_access_logs (
    gallery_id,
    ip_address,
    user_agent
) VALUES (
    1,
    '192.168.1.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
);
```

---

## Important Notes

1. **QR Code Uniqueness**: The `qr_code` field must be unique. Generate unique codes when creating galleries.

2. **Password Hashing**: Always hash passwords using bcrypt before storing in `password_hash`.

3. **Cascade Deletes**: 
   - Deleting a gallery will delete all its photos and access logs
   - Deleting a photographer will delete all their galleries
   - Deleting a booking will set `booking_id` to NULL (galleries are preserved)

4. **Photo Count**: Update `photo_count` in `photo_booth_galleries` whenever photos are added/removed.

5. **Statistics**: Update `access_count` and `download_count` in real-time for accurate analytics.

---

## Next Steps

After running this migration:

1. ✅ Tables are created
2. ⏭️ Create backend API endpoints
3. ⏭️ Implement QR code generation
4. ⏭️ Build frontend components
5. ⏭️ Test the complete flow

See `PHOTO_BOOTH_IMPLEMENTATION_GUIDE.md` for detailed implementation steps.

