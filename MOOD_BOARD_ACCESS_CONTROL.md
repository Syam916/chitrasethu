# Mood Board Access Control - Who Can See What?

## Overview

After a photographer creates a mood board, **who can see it** depends on the **Privacy Setting** chosen during creation:

- **Public Board** → Visible to everyone
- **Private Board** → Only visible to the photographer who created it

---

## Access Control Rules

### 🔓 **PUBLIC BOARDS** (`privacy: "public"`)

**Who Can See:**
- ✅ **Everyone** (authenticated and non-authenticated users)
- ✅ **All photographers** on the platform
- ✅ **All customers/clients** browsing the site
- ✅ **Anyone with the shareable link**
- ✅ **Search engines** (if indexed)

**Where They Appear:**
- Public mood board gallery (`/mood-board`)
- Photographer's public profile
- Search results
- Category browsing
- Shared links

**Use Case:**
- Showcase your work and style
- Share with clients before booking
- Build your portfolio visibility
- Inspire other photographers

---

### 🔒 **PRIVATE BOARDS** (`privacy: "private"`)

**Who Can See:**
- ✅ **Only the photographer who created it** (the owner)
- ❌ **NOT visible to other users**
- ❌ **NOT visible in public galleries**
- ❌ **NOT accessible via shared links** (unless owner shares directly)

**Where They Appear:**
- Only in the photographer's own dashboard (`/photographer/mood-boards`)
- Only when filtering by "Private" boards
- Only when logged in as the owner

**Use Case:**
- Personal inspiration boards
- Work-in-progress concepts
- Client-specific boards (before sharing)
- Internal team references

---

## Current Implementation Logic

### Backend Access Control (`moodboard.controller.js`)

#### 1. **List All Boards** (`getAllMoodBoards`)

```javascript
// If user is authenticated:
- Shows: User's own boards (public + private) + All public boards from others

// If user is NOT authenticated:
- Shows: Only public boards from all photographers
```

**Code Logic:**
```javascript
if (userId) {
  // Authenticated: own boards + public boards
  WHERE (c.user_id = userId OR c.is_public = true)
} else {
  // Not authenticated: only public boards
  WHERE c.is_public = true
}
```

#### 2. **View Single Board** (`getMoodBoardById`)

```javascript
// Public Board:
- ✅ Anyone can view (authenticated or not)

// Private Board:
- ✅ Only owner can view
- ❌ Others get 403 Forbidden error
```

**Code Logic:**
```javascript
if (!board.is_public && board.user_id !== userId) {
  return 403; // Forbidden - not owner
}
```

#### 3. **Filter by Privacy**

When filtering boards:
- **"All"** → Shows user's boards + public boards (if authenticated)
- **"Public"** → Shows only public boards
- **"Private"** → Shows only user's own private boards

---

## Visual Access Matrix

| User Type | Public Board | Private Board (Own) | Private Board (Others) |
|-----------|--------------|---------------------|------------------------|
| **Owner (Photographer)** | ✅ View & Edit | ✅ View & Edit | ❌ Cannot see |
| **Other Photographers** | ✅ View Only | ❌ Cannot see | ❌ Cannot see |
| **Customers/Clients** | ✅ View Only | ❌ Cannot see | ❌ Cannot see |
| **Not Logged In** | ✅ View Only | ❌ Cannot see | ❌ Cannot see |

---

## Example Scenarios

### Scenario 1: Public Board for Client Sharing

**Photographer Action:**
1. Creates mood board: "Wedding Inspiration 2024"
2. Sets privacy: **Public**
3. Shares link with client

**Who Can See:**
- ✅ Client (via link or browsing)
- ✅ Other photographers (for inspiration)
- ✅ Anyone browsing public gallery
- ✅ Search results

### Scenario 2: Private Board for Personal Use

**Photographer Action:**
1. Creates mood board: "Personal Style Experiments"
2. Sets privacy: **Private**

**Who Can See:**
- ✅ Only the photographer (when logged in)
- ❌ No one else can see it

### Scenario 3: Mixed Boards

**Photographer has:**
- 3 Public boards
- 2 Private boards

**When viewing `/photographer/mood-boards`:**
- **As Owner:** Sees all 5 boards (3 public + 2 private)
- **As Other User:** Sees only 3 public boards
- **As Guest (not logged in):** Sees only 3 public boards

---

## Frontend Display Logic

### Photographer Dashboard (`/photographer/mood-boards`)

**What Photographers See:**
- All their own boards (public + private)
- Can filter by:
  - "All" → Shows all their boards
  - "Public" → Shows only their public boards
  - "Private" → Shows only their private boards

**Privacy Badge Display:**
- Each board shows a badge: "Public" or "Private"
- Helps photographers identify board visibility

### Public Gallery (`/mood-board`)

**What Everyone Sees:**
- Only public boards from all photographers
- Can browse by category
- Can search public boards
- Cannot see any private boards

---

## Sharing Features

### Public Boards
- ✅ **Shareable Link**: Can generate and share with anyone
- ✅ **Embeddable**: Can embed in proposals/websites
- ✅ **Searchable**: Appears in search results
- ✅ **Social Sharing**: Can share on social media

### Private Boards
- ❌ **No Public Link**: Cannot generate shareable link
- ❌ **Not Embeddable**: Cannot embed publicly
- ❌ **Not Searchable**: Won't appear in search
- ⚠️ **Direct Access Only**: Owner must be logged in to view

---

## Future Enhancement: Collaborator Access

**Planned Feature** (not yet implemented):
- Add specific collaborators to private boards
- Grant access to:
  - Clients (view only)
  - Team members (view + comment)
  - Other photographers (view + edit)

**Implementation Would Require:**
- New table: `board_collaborators`
- Fields: `board_id`, `user_id`, `permission_level` (view/edit)
- Update access control logic

---

## Summary

| Privacy Setting | Visibility | Use Case |
|----------------|------------|----------|
| **Public** | Everyone can see | Client sharing, portfolio showcase, inspiration |
| **Private** | Only owner can see | Personal use, work-in-progress, internal references |

**Key Points:**
1. ✅ Public boards = Maximum visibility and sharing
2. 🔒 Private boards = Complete privacy, owner-only access
3. 📊 Photographers see all their boards in dashboard
4. 🌐 Public gallery shows only public boards
5. 🔍 Search only finds public boards

---

## Code References

- **Backend Controller**: `backend/src/controllers/moodboard.controller.js`
  - `getAllMoodBoards()` - Lines 5-141
  - `getMoodBoardById()` - Lines 144-228
  
- **Frontend Pages**:
  - `PhotographerMoodBoardsPage.tsx` - Photographer dashboard
  - `MoodBoard.tsx` - Public gallery

- **Database Field**: `collections.is_public` (BOOLEAN)
  - `true` = Public board
  - `false` = Private board

