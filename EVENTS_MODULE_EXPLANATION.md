# Events Module - Complete Explanation

## 📋 Overview

The Events module in Chitrasethu allows users to create, discover, and connect with photographers for various types of events (weddings, corporate events, fashion shows, birthdays, etc.). Events serve as a discovery mechanism where customers can find photography opportunities and photographers can find potential clients.

---

## 🗄️ Database Structure

### 1. **event_categories** Table
Stores predefined event categories/types:
- `category_id` (Primary Key)
- `category_name` - e.g., "Wedding", "Corporate", "Fashion"
- `slug` - URL-friendly identifier (e.g., "wedding", "corporate")
- `description`, `icon`, `color_code`
- `display_order` - For sorting categories
- `is_active` - Enable/disable categories

**Example Categories:**
- Wedding
- Corporate
- Fashion
- Birthday
- Pre-Wedding
- Modelling

### 2. **events** Table
Main table storing all event information:

**Key Fields:**
- `event_id` (Primary Key)
- `creator_id` (FK → users) - Who created the event
- `category_id` (FK → event_categories) - Event type
- `title` - Event name
- `description` - Event details
- `event_date` & `event_time` - When the event happens
- `end_date` - Optional end date
- `location`, `venue_name`, `city`, `state` - Where
- `expected_attendees` - Guest count
- `min_budget` & `max_budget` - Budget range
- `requirements` - Special requirements
- `status` - Enum: `'open'`, `'in_progress'`, `'completed'`, `'cancelled'`
- `visibility` - Enum: `'public'` or `'private'`
- `images` (JSONB) - Array of image URLs
- `tags` (JSONB) - Array of tags
- `views_count` - How many times viewed
- `interested_count` - How many people interested

### 3. **bookings** Table (Related)
Bookings can be linked to events:
- `event_id` (FK → events, nullable) - Links booking to an event
- When a customer books a photographer for an event, the `event_id` is stored

---

## 🔌 API Endpoints

### Base Route: `/api/events`

#### 1. **GET `/api/events`** - Get All Events
**Purpose:** Fetch all public events with filtering

**Query Parameters:**
- `limit` (default: 50) - Number of events per page
- `offset` (default: 0) - Pagination offset
- `category` - Filter by category slug (e.g., "wedding")
- `status` - Filter by status (e.g., "open")
- `city` - Filter by city name
- `search` - Search in title/description

**Response:**
```json
{
  "status": "success",
  "data": {
    "events": [
      {
        "eventId": 1,
        "title": "Royal Wedding Ceremony",
        "categoryName": "Wedding",
        "eventDate": "2024-01-15",
        "minBudget": 50000,
        "maxBudget": 60000,
        "status": "open",
        ...
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

**Database Query:**
- Joins `events` with `event_categories`, `users`, and `user_profiles`
- Filters by `visibility = 'public'`
- Orders by `event_date ASC, event_time ASC`
- Supports pagination with LIMIT/OFFSET

#### 2. **GET `/api/events/:eventId`** - Get Single Event
**Purpose:** Get detailed information about a specific event

**Response:** Single event object with all details

#### 3. **GET `/api/events/trending`** - Get Trending Events
**Purpose:** Get trending event categories based on post tags

**Logic:**
- Analyzes `posts` table tags from last 30 days
- Counts occurrences of each tag
- Returns top trending categories

---

## 🎨 Frontend Implementation

### 1. **EventPhotos Page** (`/event-photos`)
**Location:** `frontend/src/pages/EventPhotos.tsx`

**Features:**
- **Display Events:** Grid or List view
- **Search:** Real-time search with 500ms debounce
- **Filtering:** By category, status, city
- **Event Details Modal:** Click event to see full details
- **Book Photographer:** Navigate to booking page with event context

**Data Flow:**
1. Component mounts → Calls `eventService.getAll()`
2. API request → Backend queries database
3. Response → Events displayed in UI
4. User interactions → Filter/search updates → New API call

**Key Functions:**
- `fetchEvents()` - Fetches events from API with filters
- `handleBookPhotographer()` - Navigates to `/requests?eventId=X`
- `handleViewDetails()` - Opens event details modal
- `formatPrice()`, `formatDate()`, `formatTime()` - Display helpers

### 2. **CommunityBuzz Page**
**Location:** `frontend/src/pages/CommunityBuzz.tsx`

**Usage:**
- Displays events in the community feed
- Shows trending events
- Limited to 6 events for preview

### 3. **Event Service**
**Location:** `frontend/src/services/event.service.ts`

**Methods:**
- `getAll(filters)` - Get all events with optional filters
- `getById(id)` - Get single event by ID
- `getTrending(limit)` - Get trending event categories

---

## 🔄 Complete User Flow

### Scenario: Customer Discovers and Books for an Event

1. **Discovery:**
   - Customer visits `/event-photos`
   - Sees list of public events
   - Filters by category (e.g., "Wedding")
   - Searches for specific events

2. **Viewing Details:**
   - Clicks on an event card
   - Modal opens with full event details:
     - Event image
     - Date, time, location
     - Budget range
     - Requirements
     - Creator information

3. **Booking:**
   - Clicks "Book Photographer" button
   - Navigates to `/requests?eventId=123&eventTitle=Royal+Wedding`
   - Creates booking request
   - Booking is linked to the event via `event_id` in bookings table

4. **Photographer Response:**
   - Photographer sees booking request
   - Can accept/decline
   - Booking status updates
   - Event status can change to `'in_progress'` or `'completed'`

---

## 📊 Data Relationships

```
users (creator)
  ↓
events (creator_id)
  ↓
event_categories (category_id)
  ↓
bookings (event_id) ← Links bookings to events
  ↓
photographers (photographer_id)
```

**Key Relationships:**
- One user can create many events (`creator_id`)
- One event belongs to one category (`category_id`)
- One event can have many bookings (`event_id` in bookings)
- One booking links one customer to one photographer for one event

---

## 🔍 Filtering & Search Logic

### Backend Filtering (Database Level)
```sql
WHERE e.visibility = 'public'
  AND ec.slug = 'wedding'        -- Category filter
  AND e.status = 'open'          -- Status filter
  AND e.city ILIKE '%Mumbai%'    -- City filter
  AND (e.title ILIKE '%wedding%' OR e.description ILIKE '%wedding%')  -- Search
```

### Frontend Filtering
- **Client-side:** Category buttons, view mode toggle
- **Server-side:** Search query, category, status, city
- **Debounced Search:** 500ms delay to reduce API calls

---

## 🎯 Event Status Lifecycle

1. **open** - Event is available, accepting bookings
2. **in_progress** - Event is happening or being prepared
3. **completed** - Event has finished
4. **cancelled** - Event was cancelled

---

## 🔐 Visibility & Access Control

- **Public Events:** Visible to everyone, shown in `/event-photos`
- **Private Events:** Only visible to creator (not implemented in current API)
- **Authentication:** Optional (`optionalAuth` middleware)
  - Logged-in users can see additional info
  - Logged-out users can still browse public events

---

## 📈 Statistics & Analytics

**Tracked Metrics:**
- `views_count` - How many times event was viewed
- `interested_count` - How many people showed interest
- **Note:** Currently not updated automatically (would need triggers or API calls)

---

## 🚀 Current Limitations & Future Enhancements

### Current State:
✅ Events can be created (via database/seeds)
✅ Events can be viewed and filtered
✅ Events link to bookings
✅ Search and filtering works
✅ Event details modal

### Missing Features:
❌ Create event API endpoint (only read operations)
❌ Update event API endpoint
❌ Delete event API endpoint
❌ Mark event as interested
❌ Update views_count automatically
❌ Event creation UI for users
❌ Event management dashboard

### Potential Enhancements:
- Event creation form for users
- Event editing/deletion
- RSVP/Interest tracking
- Event notifications
- Event calendar view
- Event sharing
- Event reviews after completion
- Photographer recommendations based on event type

---

## 🛠️ Technical Stack

**Backend:**
- **Database:** PostgreSQL
- **ORM/Query:** Raw SQL with parameterized queries
- **Framework:** Express.js
- **Authentication:** JWT (optional for events)

**Frontend:**
- **Framework:** React + TypeScript
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** React Router
- **UI Components:** Custom components (Card, Dialog, Button, etc.)
- **API Client:** Fetch API with service layer

---

## 📝 Summary

The Events module is a **read-only discovery system** that:
1. Stores event information in PostgreSQL
2. Provides RESTful API endpoints for fetching events
3. Displays events in a user-friendly interface
4. Allows filtering, searching, and viewing details
5. Links to the booking system for photographer hiring

It serves as a **marketplace** where customers can discover photography opportunities and connect with photographers through the booking system.


