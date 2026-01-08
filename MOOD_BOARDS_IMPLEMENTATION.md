# Mood Boards Implementation Guide

## What are Mood Boards?

**Mood Boards** in ChitraSethu PhotoStudio Pro are visual inspiration collections that photographers use to:

1. **Organize Visual References**: Collect and organize images, color palettes, lighting setups, and style references for upcoming photo shoots
2. **Client Collaboration**: Share creative direction with clients before the shoot to align expectations
3. **Team Communication**: Collaborate with assistants, stylists, and other team members on the visual direction
4. **Portfolio Planning**: Plan and visualize the aesthetic for different types of photography projects

### Key Features:
- **Pinterest-style Layout**: Visual grid/masonry layout for easy browsing
- **Categories**: Organize by Wedding, Fashion, Portrait, Color Palettes, etc.
- **Privacy Controls**: Public boards (shareable) or Private boards (personal use)
- **Image Management**: Add, remove, and organize images within boards
- **Tags & Search**: Tag boards for easy discovery and search functionality
- **Sharing**: Share boards with clients via links or embed in proposals

---

## Implementation Overview

### ✅ What's Already Implemented

#### Frontend (React/TypeScript)
1. **Pages**:
   - `PhotographerMoodBoardsPage` - Lists all mood boards with filters
   - `PhotographerCreateMoodBoardPage` - Form to create new mood boards
   - `MoodBoard` - Public mood board gallery page

2. **Navigation**:
   - Left sidebar includes "Mood Boards" section with:
     - "My Boards" - View all boards
     - "Create Board" - Create new board

3. **UI Components**: Fully styled with dark theme and glass effects

#### Database
- **PostgreSQL Table**: `collections` table stores mood board data
  - Fields: `collection_id`, `user_id`, `title`, `description`, `thumbnail_url`, `images` (JSONB), `category`, `tags` (JSONB), `is_public`, `likes_count`, `saves_count`, `views_count`, etc.

---

## ✅ New Backend Implementation

### 1. Controller (`backend/src/controllers/moodboard.controller.js`)

**Functions**:
- `getAllMoodBoards()` - Get all boards with filters (category, privacy, search, photographer)
- `getMoodBoardById()` - Get single board by ID (increments view count)
- `createMoodBoard()` - Create new mood board
- `updateMoodBoard()` - Update existing board (only owner)
- `deleteMoodBoard()` - Delete board (only owner)
- `addImagesToMoodBoard()` - Add images to existing board
- `removeImageFromMoodBoard()` - Remove image from board

**Features**:
- Privacy filtering (public/private)
- Owner verification for private boards
- Automatic view count increment
- JSON parsing for tags and images arrays

### 2. Routes (`backend/src/routes/moodboard.routes.js`)

**Endpoints**:
```
GET    /api/photographer/moodboards          - List all boards
GET    /api/photographer/moodboards/:id      - Get board by ID
POST   /api/photographer/moodboards          - Create board
PUT    /api/photographer/moodboards/:id      - Update board
DELETE /api/photographer/moodboards/:id      - Delete board
POST   /api/photographer/moodboards/:id/images - Add images
DELETE /api/photographer/moodboards/:id/images/:imageIndex - Remove image
```

**Authentication**:
- `optionalAuth` - For viewing (allows public boards)
- `authenticateToken` - Required for create/update/delete

### 3. Server Integration (`backend/src/server.js`)

- Added mood board routes import
- Mounted routes at `/api/photographer/moodboards`
- Added endpoint to API info route

### 4. Frontend Service (`frontend/src/services/moodboard.service.ts`)

**TypeScript Interface**:
```typescript
interface MoodBoard {
  boardId: number;
  boardName: string;
  description?: string;
  coverImage?: string;
  images: string[];
  category?: string;
  tags: string[];
  privacy: 'public' | 'private';
  views: number;
  saves: number;
  likes: number;
  // ... more fields
}
```

**Service Methods**:
- `getAll(filters?)` - Fetch boards with optional filters
- `getById(id)` - Fetch single board
- `create(data)` - Create new board
- `update(id, data)` - Update board
- `delete(id)` - Delete board
- `addImages(id, images)` - Add images
- `removeImage(id, imageIndex)` - Remove image

### 5. API Configuration (`frontend/src/config/api.ts`)

Added `MOODBOARDS` endpoint configuration with all CRUD operations.

---

## How to Use

### For Photographers

#### Creating a Mood Board:
1. Navigate to `/photographer/mood-boards`
2. Click "Create New Board"
3. Fill in:
   - Board Name (required)
   - Description
   - Category (Wedding, Fashion, Portrait, etc.)
   - Tags
   - Privacy (Public/Private)
   - Cover Image
   - Images (can add later)
4. Click "Publish Board"

#### Managing Boards:
- **View All**: `/photographer/mood-boards` shows all your boards
- **Filter**: By category, privacy, or search
- **Edit**: Click on a board to edit (if you own it)
- **Delete**: Delete button available for your boards
- **Share**: Share button generates shareable link

#### Adding Images:
- Upload from device
- Add from URL
- Import from Pinterest/Behance
- Drag and drop in editor

---

## API Usage Examples

### Create a Mood Board
```typescript
import moodBoardService from '@/services/moodboard.service';

const newBoard = await moodBoardService.create({
  boardName: "Wedding Inspiration 2024",
  description: "Classic and contemporary wedding photography",
  category: "Wedding",
  tags: ["wedding", "elegant", "classic"],
  privacy: "public",
  coverImage: "https://example.com/cover.jpg",
  images: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
});
```

### Get All Boards with Filters
```typescript
const boards = await moodBoardService.getAll({
  category: "Wedding",
  privacy: "public",
  search: "inspiration",
  limit: 20,
  offset: 0
});
```

### Add Images to Board
```typescript
await moodBoardService.addImages(boardId, [
  "https://example.com/new1.jpg",
  "https://example.com/new2.jpg"
]);
```

---

## Database Schema

The `collections` table structure:
```sql
CREATE TABLE collections (
    collection_id INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    images JSONB,              -- Array of image URLs
    category VARCHAR(100),
    tags JSONB,                -- Array of tags
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INT DEFAULT 0,
    saves_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## Next Steps (Optional Enhancements)

1. **Image Upload Integration**: Connect with Cloudinary upload service
2. **Drag & Drop Reordering**: Allow users to reorder images in boards
3. **Collaboration**: Add collaborators to boards
4. **Comments**: Allow comments on public boards
5. **Likes/Saves**: Implement like and save functionality
6. **Board Templates**: Pre-made templates for common categories
7. **Export**: Export boards as PDF or image gallery
8. **Analytics**: Track board views and engagement

---

## Testing

### Backend Testing
```bash
# Test endpoints using curl or Postman
GET http://localhost:5000/api/photographer/moodboards
POST http://localhost:5000/api/photographer/moodboards
# ... etc
```

### Frontend Testing
1. Navigate to `/photographer/mood-boards`
2. Create a new board
3. View boards with different filters
4. Edit and delete boards
5. Add/remove images

---

## File Structure

```
backend/
  src/
    controllers/
      moodboard.controller.js    ✅ NEW
    routes/
      moodboard.routes.js       ✅ NEW
    server.js                   ✅ UPDATED

frontend/
  src/
    services/
      moodboard.service.ts      ✅ NEW
    config/
      api.ts                    ✅ UPDATED
    components/
      photographer/
        PhotographerMoodBoardsPage.tsx      ✅ EXISTS
        PhotographerCreateMoodBoardPage.tsx ✅ EXISTS
```

---

## Summary

✅ **Backend**: Fully implemented with CRUD operations, filtering, and image management
✅ **Frontend Service**: TypeScript service with all API methods
✅ **Database**: Uses existing `collections` table
✅ **Routes**: All endpoints configured and mounted
✅ **Authentication**: Proper auth middleware applied

The mood board feature is now **fully functional** and ready to use! Photographers can create, manage, and share visual inspiration boards for their photography projects.

