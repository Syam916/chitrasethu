# Community Buzz Page - Testing Guide for Photographers & Customers

## 📋 Overview

The Community Buzz feature has **TWO different pages** with different UIs and features:

1. **General Community Buzz** (`/community-buzz`) - Used by customers and general users
2. **Photographer Community Buzz** (`/photographer/community-buzz`) - Photographer-specific page

Both pages now fetch data from the database instead of using static data.

---

## 🎯 Testing Setup

### Prerequisites:
1. ✅ Run the SQL seed file: `backend/database/seed_community_buzz_data.sql`
2. ✅ Backend server running on `http://localhost:5000`
3. ✅ Frontend server running on `http://localhost:5173`
4. ✅ Database has users, photographers, and sample data

---

## 📸 Testing for PHOTOGRAPHERS

### Route: `/photographer/community-buzz`

### UI Differences:
- Uses **PhotographerNavbar** (different navigation)
- Has **3 tabs**: My Groups, Collaborations, Live Events
- **No Feed tab** (photographers have separate feed)
- **No Discussions tab** (separate discussions page)
- Focus on **professional collaboration** features

### Test Checklist:

#### ✅ **1. Page Load & Navigation**
- [ ] Navigate to `/photographer/community-buzz`
- [ ] Verify PhotographerNavbar is displayed
- [ ] Check hero section shows "Photographer Community" badge
- [ ] Verify "Start New Community" button is visible
- [ ] Verify "Open Active Chats" button is visible

#### ✅ **2. My Groups Tab** (Default Tab)
- [ ] **My Groups Sub-tab:**
  - [ ] Verify groups load from API (check Network tab)
  - [ ] Verify loading spinner appears initially
  - [ ] Check group cards display: name, type, description, member count
  - [ ] Verify "Last active" timestamp displays correctly
  - [ ] Check role badge (Admin/Member) displays
  - [ ] Click "View Details" → navigates to group detail page
  - [ ] If no groups: verify empty state message
  
- [ ] **Browse All Groups Sub-tab:**
  - [ ] Switch to "Browse All Groups"
  - [ ] Verify search bar appears
  - [ ] Test search functionality
  - [ ] Verify "Join" button appears for non-member groups
  - [ ] Click "Join" → verify group is added to "My Groups"
  - [ ] Verify "Public Group" badge for non-members

#### ✅ **3. Collaborations Tab**
- [ ] Click "Collaborations" tab
- [ ] Verify collaborations load from API
- [ ] Check "Post Collaboration" button is visible
- [ ] Verify collaboration cards show:
  - [ ] Title, poster name, avatar
  - [ ] Collaboration type badge (seeking/offering)
  - [ ] Location, date, budget
  - [ ] Skills/tags
  - [ ] Response count
- [ ] Click "View Details" → navigates to collaboration detail
- [ ] Click "Respond" → verify response submission
- [ ] Test creating new collaboration (opens dialog)

#### ✅ **4. Live Events Tab**
- [ ] Click "Live Events" tab
- [ ] **Verify events load from API** (not static data!)
- [ ] Check Network tab → should see `/api/events` call
- [ ] Verify loading state appears
- [ ] Check event cards display:
  - [ ] Event image (or placeholder)
  - [ ] Category badge
  - [ ] Title, description
  - [ ] Date and time formatted correctly
  - [ ] Location
  - [ ] Expected attendees count
  - [ ] Budget range
- [ ] Click "Join Chat" → verify action (may show toast)
- [ ] Click "View Details" → verify action
- [ ] If no events: verify empty state
- [ ] Verify "Collaboration Tips" card appears at bottom

#### ✅ **5. Real-time Features**
- [ ] Create a new group → verify it appears in "My Groups"
- [ ] Create a new collaboration → verify it appears in list
- [ ] Join a group → verify it moves to "My Groups"

#### ✅ **6. Error Handling**
- [ ] Stop backend server → verify error messages display
- [ ] Check error states show retry options
- [ ] Verify graceful degradation

---

## 👤 Testing for CUSTOMERS

### Route: `/community-buzz`

### UI Differences:
- Uses **NavbarIntegrated** (general navigation)
- Has **5 tabs**: Community Feed, Discussions, My Groups, Collaborations, Events
- Includes **Feed tab** with posts and highlights
- Includes **Discussions tab** for community discussions
- More **social/community-focused** features

### Test Checklist:

#### ✅ **1. Page Load & Navigation**
- [ ] Navigate to `/community-buzz`
- [ ] Verify NavbarIntegrated is displayed
- [ ] Check hero section shows community stats
- [ ] Verify tabs: Feed, Discussions, My Groups, Collaborations, Events

#### ✅ **2. Community Feed Tab** (Default Tab)
- [ ] **Community Highlights Section:**
  - [ ] Verify 3 highlight cards display
  - [ ] Check "Photographer of the Month" card
  - [ ] Check "Trending Technique" card
  - [ ] Check "Community Challenge" card
  - [ ] Verify images load (from featured posts)
  - [ ] Click highlight → verify navigation

- [ ] **Posts Feed:**
  - [ ] Verify posts load from API (check Network tab)
  - [ ] Check loading spinner appears
  - [ ] Verify post cards show:
    - [ ] User avatar, name, user type badge
    - [ ] Post media/images
    - [ ] Caption, location, timestamp
    - [ ] Like, comment, share counts
    - [ ] Tags/hashtags
  - [ ] Click like button → verify like toggles
  - [ ] Verify posts are sorted by newest first

- [ ] **Trending Sidebar:**
  - [ ] Verify trending events load from API
  - [ ] Check trending categories display
  - [ ] Verify post counts and trending percentages
  - [ ] Should show categories from post tags

- [ ] **Top Contributors Sidebar:**
  - [ ] Verify top photographers load from API
  - [ ] Check sorted by engagement (rating × reviews)
  - [ ] Verify avatars, names, contribution counts
  - [ ] Click photographer → navigate to profile

#### ✅ **3. Discussions Tab**
- [ ] Click "Discussions" tab
- [ ] Verify discussions load from API
- [ ] Check "New Discussion" button (if authenticated)
- [ ] Verify discussion cards show:
  - [ ] Title, author, category
  - [ ] Hot/Pinned badges
  - [ ] Reply count, last activity
- [ ] Click discussion → navigate to detail page
- [ ] Test category filtering
- [ ] Verify category counts update

#### ✅ **4. My Groups Tab**
- [ ] Click "My Groups" tab
- [ ] Verify groups load from API
- [ ] Test "My Groups" vs "Browse All Groups" sub-tabs
- [ ] Verify search functionality
- [ ] Test joining groups
- [ ] Verify group navigation

#### ✅ **5. Collaborations Tab**
- [ ] Click "Collaborations" tab
- [ ] Verify collaborations load from API
- [ ] Check "Post Collaboration" button (if authenticated)
- [ ] Verify collaboration cards display correctly
- [ ] Test viewing collaboration details
- [ ] Test responding to collaborations

#### ✅ **6. Events Tab**
- [ ] Click "Events" tab
- [ ] **Verify events load from API** (not static data!)
- [ ] Check Network tab → should see `/api/events` call
- [ ] Verify loading state
- [ ] Check event cards display:
  - [ ] Event image
  - [ ] Category badge
  - [ ] Title, description
  - [ ] Date, time, location
  - [ ] Budget range
  - [ ] Expected attendees
- [ ] Click "View Details" → verify action
- [ ] If no events: verify empty state

#### ✅ **7. Real-time Features**
- [ ] Create a post → verify it appears in feed
- [ ] Like a post → verify count updates
- [ ] Create a discussion → verify it appears
- [ ] Join a group → verify it appears in "My Groups"

#### ✅ **8. Error Handling**
- [ ] Stop backend server → verify error messages
- [ ] Check all tabs show appropriate error states
- [ ] Verify retry functionality

---

## 🔍 Key Differences Summary

| Feature | Photographer Page | Customer Page |
|---------|------------------|---------------|
| **Route** | `/photographer/community-buzz` | `/community-buzz` |
| **Navbar** | PhotographerNavbar | NavbarIntegrated |
| **Tabs** | 3 tabs (Groups, Collaborations, Events) | 5 tabs (Feed, Discussions, Groups, Collaborations, Events) |
| **Feed Tab** | ❌ Not available | ✅ Available with posts |
| **Discussions Tab** | ❌ Not available | ✅ Available |
| **Events Tab** | ✅ "Live Events" | ✅ "Events" |
| **Focus** | Professional collaboration | Social community |

---

## 🐛 Common Issues to Check

### For Both User Types:

1. **Data Loading:**
   - [ ] Open Browser DevTools → Network tab
   - [ ] Verify API calls are made (not 404 errors)
   - [ ] Check response data structure matches frontend expectations

2. **Static Data Remnants:**
   - [ ] Search codebase for `dummyData` imports
   - [ ] Verify no static data is displayed
   - [ ] Check console for any errors

3. **Loading States:**
   - [ ] Verify spinners appear during data fetch
   - [ ] Check loading doesn't block UI unnecessarily

4. **Empty States:**
   - [ ] Test with empty database
   - [ ] Verify helpful empty state messages
   - [ ] Check call-to-action buttons in empty states

5. **Error States:**
   - [ ] Test with backend offline
   - [ ] Verify error messages are user-friendly
   - [ ] Check retry functionality works

---

## 📊 API Endpoints to Verify

### Events API:
- `GET /api/events` - Should return events array
- `GET /api/events/trending` - Should return trending categories

### Groups API:
- `GET /api/groups/my` - Photographer's groups
- `GET /api/groups` - All groups (with search)

### Collaborations API:
- `GET /api/collaborations` - All collaborations

### Posts API:
- `GET /api/posts` - Community feed posts

### Photographers API:
- `GET /api/photographers` - Top contributors

---

## ✅ Success Criteria

### Photographer Page:
- ✅ All events load from `/api/events`
- ✅ No static `upcomingEvents` data
- ✅ Groups load from API
- ✅ Collaborations load from API
- ✅ Loading/error/empty states work

### Customer Page:
- ✅ All events load from `/api/events`
- ✅ Trending events calculated from post tags
- ✅ Top contributors load from photographers API
- ✅ Featured posts load from posts API
- ✅ No static data (`socialPosts`, `photographers`, `upcomingEvents`, `trendingEvents`)
- ✅ All tabs fetch from database

---

## 🚀 Quick Test Commands

### Check if static data is still imported:
```bash
# Search for dummy data imports
grep -r "from.*dummyData" frontend/src/pages/CommunityBuzz.tsx
grep -r "from.*dummyData" frontend/src/components/photographer/PhotographerCommunityBuzzPage.tsx
```

### Verify API endpoints:
```bash
# Test events endpoint
curl http://localhost:5000/api/events

# Test trending endpoint
curl http://localhost:5000/api/events/trending
```

---

## 📝 Test Data Verification

After running the SQL seed file, verify data exists:

```sql
-- Check events
SELECT COUNT(*) FROM events;
SELECT title, event_date, category_id FROM events LIMIT 5;

-- Check posts with tags
SELECT post_id, caption, tags FROM posts WHERE tags IS NOT NULL LIMIT 5;

-- Check groups
SELECT COUNT(*) FROM community_groups;

-- Check collaborations
SELECT COUNT(*) FROM collaborations;
```

---

## 🎯 Testing Scenarios

### Scenario 1: First-time Photographer
1. Login as photographer
2. Navigate to `/photographer/community-buzz`
3. Should see empty "My Groups" with helpful message
4. Browse groups → join a group
5. Verify group appears in "My Groups"
6. Check "Live Events" tab → should show events from database

### Scenario 2: Active Customer
1. Login as customer
2. Navigate to `/community-buzz`
3. Check Feed tab → verify posts load
4. Check Trending sidebar → verify categories from tags
5. Check Top Contributors → verify photographers sorted correctly
6. Check Events tab → verify events from database

### Scenario 3: Data Refresh
1. Add new event in database
2. Refresh page → verify new event appears
3. Add new post with tags
4. Refresh → verify trending updates

---

## ⚠️ Known Issues / Notes

1. **Event Images**: Currently using placeholder URLs. Replace with actual image URLs in production.
2. **Trending Percentage**: Currently mocked. Can be enhanced with actual trend calculation.
3. **Event Chat**: "Join Chat" button shows toast - feature to be implemented.
4. **Event Details**: "View Details" button shows toast - detail page to be created.

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Verify database has data (run SQL seed file)
4. Check backend logs for errors
5. Verify API endpoints are registered in `server.js`
