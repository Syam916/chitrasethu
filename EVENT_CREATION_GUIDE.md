# Event Creation Guide - Who Can Create Events & Where

## 📋 Current State Summary

**IMPORTANT:** There are **TWO different types of "events"** in your system:

1. **Event Sessions** (Photo Booth Galleries) - For photographers to manage their own event photography
2. **Public Events** (Events Table) - Public events that customers can discover and book photographers for

---

## 🎯 Type 1: Public Events (Events Table)

### ❌ **Currently: NO ONE can create these through the UI**

**Who CAN create them:**
- **Database Administrators** - Via direct SQL INSERT statements
- **Backend Developers** - Via database seed scripts
- **Anyone with database access** - Through SQL queries

**Where they are created:**
- **Database directly** - Using SQL INSERT statements
- **Seed scripts** - `backend/database/seed_postgres.sql` or `seed.sql`
- **NOT through the application UI** - No API endpoint or form exists

### 📍 Current Creation Methods:

#### Method 1: Database Seed Scripts
**Location:** `backend/database/seed_postgres.sql`

```sql
INSERT INTO events (
    creator_id, 
    category_id, 
    title, 
    description, 
    event_date, 
    event_time, 
    location, 
    city, 
    state, 
    expected_attendees, 
    min_budget, 
    max_budget, 
    status
) VALUES
    (1, 1, 'Royal Wedding Ceremony', 'Description...', '2024-12-15', '10:00:00', 'Grand Palace Hotel', 'Mumbai', 'Maharashtra', 250, 40000, 60000, 'open');
```

#### Method 2: Direct SQL Insert
**Location:** Any PostgreSQL client (pgAdmin, psql, etc.)

```sql
INSERT INTO events (
    creator_id,
    category_id,
    title,
    description,
    event_date,
    event_time,
    location,
    city,
    state,
    expected_attendees,
    min_budget,
    max_budget,
    status,
    visibility
) VALUES (
    1,  -- creator_id (must be valid user_id)
    1,  -- category_id (must be valid category_id from event_categories)
    'My Event Title',
    'Event description',
    '2025-02-15',
    '10:00:00',
    'Venue Name',
    'Mumbai',
    'Maharashtra',
    100,
    50000,
    80000,
    'open',
    'public'
);
```

### 🚫 What's Missing:

1. **No API Endpoint:**
   - ❌ `POST /api/events` - Does NOT exist
   - ✅ Only `GET /api/events` exists (read-only)

2. **No UI Form:**
   - ❌ No event creation page for customers
   - ❌ No event creation page for photographers
   - ❌ No event creation page for admins

3. **No Controller Function:**
   - ❌ No `createEvent` function in `event.controller.js`
   - ✅ Only `getAllEvents`, `getEventById`, `getTrendingEvents` exist

---

## 🎯 Type 2: Event Sessions (Photo Booth Galleries)

### ✅ **Photographers CAN create these through the UI**

**Who can create:**
- **Photographers only** - Must be logged in as photographer
- **Requires authentication** - Protected route

**Where they are created:**
- **UI Location:** `/photographer/event-photos/create`
- **Component:** `PhotographerCreateEventSessionPage`
- **Route:** Defined in `App.tsx`

### 📍 How to Access:

1. **Navigate to:** `/photographer/event-photos/create`
2. **Or click:** "Create New Session" button on `/photographer/event-photos` page
3. **Or from sidebar:** "Create Session" link in photographer navigation

### 📝 What This Creates:

**IMPORTANT:** This does NOT create entries in the `events` table!

This creates:
- **Photo Booth Galleries** - For managing event photography sessions
- **QR Code Galleries** - For sharing photos with clients
- **Event Sessions** - Photographer's own event management

**Related Tables:**
- `photo_booth_galleries`
- `photo_booth_gallery_photos`
- `photo_booth_access_logs`

**API Endpoint:**
- `POST /api/photographer/photo-booth/generate` - Creates photo booth gallery

---

## 🔍 Detailed Breakdown

### Public Events (Events Table) - Current Limitations

#### Database Structure:
```sql
CREATE TABLE events (
    event_id INT PRIMARY KEY,
    creator_id INT NOT NULL,  -- FK to users
    category_id INT NOT NULL,  -- FK to event_categories
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    expected_attendees INT,
    min_budget DECIMAL(10, 2),
    max_budget DECIMAL(10, 2),
    status event_status_enum DEFAULT 'open',
    visibility event_visibility_enum DEFAULT 'public',
    ...
);
```

#### Required Fields for Creation:
- `creator_id` - Must be a valid `user_id` from `users` table
- `category_id` - Must be a valid `category_id` from `event_categories` table
- `title` - Event name
- `event_date` - When the event happens
- `status` - One of: 'open', 'in_progress', 'completed', 'cancelled'
- `visibility` - One of: 'public', 'private'

#### Available Categories:
Check `event_categories` table for available categories:
```sql
SELECT category_id, category_name, slug FROM event_categories WHERE is_active = true;
```

Common categories:
- Wedding
- Corporate
- Fashion
- Birthday
- Pre-Wedding
- Modelling

---

## 🛠️ How to Add Event Creation Functionality

### Option 1: Add API Endpoint (Recommended)

**Backend Changes Needed:**

1. **Add to `event.controller.js`:**
```javascript
export const createEvent = async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const {
      categoryId,
      title,
      description,
      eventDate,
      eventTime,
      location,
      venueName,
      city,
      state,
      expectedAttendees,
      minBudget,
      maxBudget,
      requirements,
      visibility = 'public',
      images,
      tags
    } = req.body;

    // Validation
    if (!categoryId || !title || !eventDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: categoryId, title, eventDate'
      });
    }

    const result = await query(
      `INSERT INTO events (
        creator_id, category_id, title, description, event_date, event_time,
        location, venue_name, city, state, expected_attendees,
        min_budget, max_budget, requirements, visibility, images, tags, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'open')
      RETURNING *`,
      [
        userId, categoryId, title, description, eventDate, eventTime,
        location, venueName, city, state, expectedAttendees,
        minBudget, maxBudget, requirements, visibility, 
        images ? JSON.stringify(images) : null,
        tags ? JSON.stringify(tags) : null
      ]
    );

    res.status(201).json({
      status: 'success',
      data: { event: result[0] }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create event'
    });
  }
};
```

2. **Add to `event.routes.js`:**
```javascript
import { authenticateToken } from '../middleware/auth.middleware.js';
import { createEvent } from '../controllers/event.controller.js';

router.post('/', authenticateToken, createEvent);
```

3. **Add to frontend `event.service.ts`:**
```typescript
async create(eventData: {
  categoryId: number;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  // ... other fields
}): Promise<Event> {
  const response = await fetch(API_ENDPOINTS.EVENTS.LIST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(eventData),
  });
  // ... handle response
}
```

### Option 2: Create UI Form

**Frontend Changes Needed:**

1. **Create Event Creation Page:**
   - Location: `frontend/src/pages/CreateEvent.tsx` or `/events/create`
   - Form fields matching event table structure
   - Category dropdown (from event_categories)
   - Date/time pickers
   - Image upload
   - Budget range inputs

2. **Add Route:**
```typescript
<Route path="/events/create" element={<CreateEvent />} />
```

3. **Add Navigation:**
   - "Create Event" button in navbar or event photos page
   - Accessible to authenticated users (customers or photographers)

---

## 📊 Summary Table

| Event Type | Who Can Create | Where | Method | Status |
|------------|---------------|-------|--------|--------|
| **Public Events** (events table) | Database Admin | Database/Seeds | SQL INSERT | ❌ No UI/API |
| **Event Sessions** (photo booth) | Photographers | `/photographer/event-photos/create` | UI Form | ✅ Working |

---

## 🎯 Recommendations

### For Immediate Use:
1. **Use Database Seeds** - Add events via `seed_postgres.sql` for testing/demo
2. **Direct SQL** - For production, create events via SQL when needed

### For Full Functionality:
1. **Add Create API** - Implement `POST /api/events` endpoint
2. **Add Update API** - Implement `PUT /api/events/:eventId`
3. **Add Delete API** - Implement `DELETE /api/events/:eventId`
4. **Create UI Form** - Build event creation page
5. **Add Permissions** - Decide who can create (all users? customers only? admins only?)

---

## 🔐 Access Control Considerations

**Who SHOULD be able to create public events?**

**Option A: All Authenticated Users**
- Customers can create events they need photographers for
- Photographers can create events to find clients
- ✅ More events = more opportunities
- ❌ Risk of spam/low-quality events

**Option B: Customers Only**
- Only customers can create events (they need photographers)
- Photographers can only respond to events
- ✅ Clear separation of roles
- ❌ Photographers can't post their own events

**Option C: Admins Only**
- Only administrators can create events
- ✅ Quality control
- ❌ Less dynamic, requires admin intervention

**Option D: Photographers Only**
- Photographers create events to showcase opportunities
- Customers browse and book
- ✅ Photographers control their opportunities
- ❌ Customers can't post their needs

**Recommended:** Option A (All Authenticated Users) with moderation/validation

---

## 📝 Quick Reference

### To Create a Public Event Right Now:

1. **Connect to PostgreSQL database**
2. **Get a valid user_id:**
   ```sql
   SELECT user_id, email FROM users LIMIT 5;
   ```
3. **Get a valid category_id:**
   ```sql
   SELECT category_id, category_name FROM event_categories WHERE is_active = true;
   ```
4. **Insert event:**
   ```sql
   INSERT INTO events (creator_id, category_id, title, event_date, status, visibility)
   VALUES (1, 1, 'My Event', '2025-03-15', 'open', 'public');
   ```

### To Create an Event Session (Photo Booth):

1. **Login as photographer**
2. **Navigate to:** `/photographer/event-photos/create`
3. **Fill out the form**
4. **Click "Save Session"**
5. **Event session created!**

---

## ✅ Conclusion

**Current State:**
- ❌ **Public Events** - Cannot be created through UI/API (database only)
- ✅ **Event Sessions** - Can be created by photographers via UI

**To Enable Public Event Creation:**
- Need to add `POST /api/events` endpoint
- Need to create event creation UI form
- Need to decide access control (who can create)

