# Customer Community Buzz - Quick Testing Checklist

## 🚀 Quick Start

1. **Login as Customer** → Navigate to `/community-buzz`
2. **Open DevTools** (F12) → Network tab
3. **Test each tab** → Verify API calls appear

---

## ✅ Tab-by-Tab Checklist

### 📰 TAB 1: Community Feed (Default)

**What to Test:**
- [ ] **Community Highlights** (3 cards at top)
  - Cards display with images
  - Click cards → Navigate correctly
  
- [ ] **Posts Feed** (main content)
  - Posts load from API (`GET /api/posts`)
  - Each post shows: avatar, name, image, caption, likes, comments
  - Click Like → Heart fills, count increases
  - Posts sorted by newest first

- [ ] **Trending Sidebar** (right side)
  - Shows 6 trending categories (`GET /api/events/trending`)
  - Each shows: name, post count, trending %
  
- [ ] **Top Contributors** (right side, below trending)
  - Shows 4 photographers (`GET /api/photographers`)
  - Sorted by engagement (rating × reviews)
  - Click → Navigate to profile

**✅ Pass Criteria:**
- All data loads from API (check Network tab)
- No static data visible
- Interactions work (like, click, navigate)

---

### 💬 TAB 2: Discussions

**What to Test:**
- [ ] **Discussions List**
  - Loads from API (`GET /api/discussions`)
  - Shows: title, author, category, reply count, last activity
  - Click discussion → Navigate to detail page
  
- [ ] **Create Discussion**
  - "New Discussion" button visible (if logged in)
  - Click → Dialog opens
  - Fill form → Submit → Discussion appears
  
- [ ] **Category Filter** (right sidebar)
  - Shows categories with counts (`GET /api/discussions/categories`)
  - Click category → Filters discussions
  - Click "All" → Shows all

**✅ Pass Criteria:**
- Discussions load from database
- Create discussion works
- Category filter works
- Navigation works

---

### 👥 TAB 3: My Groups

**What to Test:**
- [ ] **My Groups Sub-tab**
  - Loads from API (`GET /api/groups/my`)
  - Shows: name, type, description, members, role badge
  - Click group → Navigate to detail
  
- [ ] **Browse All Groups Sub-tab**
  - Search bar appears
  - Loads from API (`GET /api/groups`)
  - Shows "Join" button for non-members
  - Click Join → Group joins, moves to "My Groups"

**✅ Pass Criteria:**
- Groups load from database
- Join functionality works
- Search works
- Navigation works

---

### 🤝 TAB 4: Collaborations

**What to Test:**
- [ ] **Collaborations List**
  - Loads from API (`GET /api/collaborations`)
  - Shows: title, poster, type, location, budget, skills
  - Click collaboration → Navigate to detail
  
- [ ] **Respond to Collaboration**
  - Click "Respond" button → Shows alert/confirmation
  - Response count updates

- [ ] **Create Collaboration**
  - "Post Collaboration" button visible
  - Click → Dialog opens
  - Fill form → Submit → Collaboration appears

**✅ Pass Criteria:**
- Collaborations load from database
- Respond works
- Create works
- Navigation works

---

### 📅 TAB 5: Events

**What to Test:**
- [ ] **Events Grid**
  - **CRITICAL:** Loads from API (`GET /api/events`)
  - **VERIFY:** Check Network tab → Should see API call
  - Shows: image, category badge, title, date, time, location, budget
  - Events sorted by date (upcoming first)
  
- [ ] **Event Details**
  - Click "View Details" → Shows toast or navigates
  - All event info displays correctly

- [ ] **Empty State**
  - If no events: Shows helpful message

**✅ Pass Criteria:**
- **Events MUST load from API** (not static data!)
- All event details display
- Images load (or placeholder shows)
- Navigation works

---

## 🔍 Critical Verification Steps

### Step 1: Check Network Tab
1. Open DevTools (F12) → Network tab
2. Refresh page
3. Filter by "Fetch/XHR"
4. **Verify these API calls:**
   - ✅ `GET /api/posts` (Feed tab)
   - ✅ `GET /api/events/trending` (Trending sidebar)
   - ✅ `GET /api/photographers` (Top contributors)
   - ✅ `GET /api/discussions` (Discussions tab)
   - ✅ `GET /api/groups/my` or `/api/groups` (Groups tab)
   - ✅ `GET /api/collaborations` (Collaborations tab)
   - ✅ `GET /api/events` (Events tab) ⚠️ **CRITICAL**

### Step 2: Verify No Static Data
1. Open `frontend/src/pages/CommunityBuzz.tsx`
2. Search for `dummyData`
3. **Should NOT find:** `import { socialPosts, photographers, upcomingEvents, trendingEvents } from '../data/dummyData';`

### Step 3: Check Console
1. Open DevTools → Console tab
2. Refresh page
3. **Should see:**
   - ✅ No red errors
   - ✅ API calls logged (if logging enabled)
   - ✅ No warnings about missing data

---

## 🐛 Quick Troubleshooting

| Issue | Check | Solution |
|-------|-------|----------|
| No events show | Database has events? | Run SQL seed file |
| No posts show | Database has posts? | Check `is_active = true` |
| No trending | Posts have tags? | Check post tags in database |
| No contributors | Photographers exist? | Check photographers table |
| API errors | Backend running? | Check `http://localhost:5000/health` |
| Images broken | URLs valid? | Check image URLs in database |

---

## 📝 Test Results

**Date:** ___________  
**Tester:** ___________

### Feed Tab:
- Highlights: ✅ / ❌
- Posts: ✅ / ❌
- Trending: ✅ / ❌
- Contributors: ✅ / ❌

### Discussions Tab:
- Discussions: ✅ / ❌
- Categories: ✅ / ❌
- Create: ✅ / ❌

### My Groups Tab:
- My Groups: ✅ / ❌
- Browse: ✅ / ❌
- Join: ✅ / ❌

### Collaborations Tab:
- Collaborations: ✅ / ❌
- Respond: ✅ / ❌

### Events Tab:
- **Events from API:** ✅ / ❌ ⚠️ **CRITICAL**
- Event details: ✅ / ❌

### Overall:
- All data from DB: ✅ / ❌
- No static data: ✅ / ❌
- No errors: ✅ / ❌

**Issues Found:** ________________

---

## ✅ Ready to Proceed?

Mark as **COMPLETE** when:
- ✅ All 5 tabs tested
- ✅ All data loads from API (verified in Network tab)
- ✅ No static data in code
- ✅ All interactions work
- ✅ No console errors

**Then proceed to next feature!** 🚀




