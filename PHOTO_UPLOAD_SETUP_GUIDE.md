# 📸 Photo Upload Feature - Setup & Usage Guide

## ✅ Implementation Complete!

The photo upload feature has been successfully implemented for both **Customer** and **Photographer** users in your Chitrasethu platform.

---

## 🎯 What's Been Implemented

### Backend (Node.js/Express)

1. **Cloudinary Service** (`backend/src/services/cloudinary.service.js`)
   - Upload single/multiple images
   - Delete images from Cloudinary
   - Generate optimized URLs
   - Generate thumbnails
   - Responsive image URLs

2. **Upload Controller** (`backend/src/controllers/upload.controller.js`)
   - POST `/api/upload/photo` - Upload single photo
   - POST `/api/upload/photos` - Upload multiple photos (max 10)
   - DELETE `/api/upload/photo/:publicId` - Delete photo

3. **Post Controller** (`backend/src/controllers/post.controller.js`)
   - GET `/api/posts` - Get all posts
   - POST `/api/posts` - Create new post with images
   - GET `/api/posts/:postId` - Get single post
   - DELETE `/api/posts/:postId` - Delete post

4. **Routes** 
   - Upload routes registered at `/api/upload`
   - Post routes registered at `/api/posts`

### Frontend (React/TypeScript)

1. **Upload Service** (`frontend/src/services/upload.service.ts`)
   - Upload photos with progress tracking
   - Image validation
   - Optimized URL generation

2. **Upload Hook** (`frontend/src/hooks/useImageUpload.ts`)
   - File validation
   - Upload progress
   - Error handling

3. **UI Components**
   - `ImageUpload` - Drag & drop image uploader with preview
   - `CreatePostDialog` - Modal dialog for creating posts

4. **Updated Pages**
   - `HomePage` - Added "Create Post" button for customers
   - `PhotographerHomePage` - Added "Create Post" button for photographers
   - `MainFeed` - Displays posts from database with uploaded images

---

## 🚀 Setup Instructions

### Step 1: Configure Cloudinary

1. **Create Cloudinary Account**
   - Go to: https://cloudinary.com/users/register
   - Sign up for a free account

2. **Get Your Credentials**
   - After signing up, go to Dashboard
   - Copy your credentials:
     - Cloud Name
     - API Key
     - API Secret

3. **Add to Backend `.env` File**

Create or update `backend/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Existing configurations...
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=chitrasethu
DB_PORT=5433

JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Step 2: Run Database Migration

The database schema already supports JSONB for `media_urls`, but you can optionally run the migration for additional metadata columns:

```bash
cd backend
psql -U postgres -d chitrasethu -f database/migrations/add_cloudinary_metadata.sql
```

Or manually run:

```sql
-- Optional: Add metadata columns for portfolio and user avatars
ALTER TABLE photographer_portfolios 
ADD COLUMN IF NOT EXISTS public_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS width INT,
ADD COLUMN IF NOT EXISTS height INT,
ADD COLUMN IF NOT EXISTS format VARCHAR(10),
ADD COLUMN IF NOT EXISTS bytes BIGINT;

CREATE INDEX IF NOT EXISTS idx_portfolios_public_id ON photographer_portfolios(public_id);

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_public_id VARCHAR(255);

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachment_public_id VARCHAR(255);
```

### Step 3: Install Dependencies (if needed)

Both `cloudinary` and `multer` should already be installed based on your `package.json`.

Verify:

```bash
cd backend
npm list cloudinary multer
```

If missing:

```bash
npm install cloudinary multer
```

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📖 How to Use

### For Customers & Photographers

1. **Login** to your account (customer or photographer)

2. **Navigate to Home Page**
   - You'll see a large "Create New Post" button at the top of the feed

3. **Click "Create New Post"**
   - A dialog will open

4. **Upload Images**
   - **Drag & drop** images onto the upload area, OR
   - **Click** the upload area to select files from your computer
   - Supports: JPEG, PNG, WebP, HEIC
   - Max file size: 10MB per image
   - Max images: 10 per post

5. **Add Details** (all optional)
   - **Caption**: Describe your photos
   - **Location**: Add where the photo was taken
   - **Tags**: Add comma-separated tags (e.g., "nature, sunset, beach")

6. **Click "Create Post"**
   - Images will upload to Cloudinary
   - Progress bar shows upload status
   - Post will be created and appear in the feed

7. **View Your Post**
   - The feed will automatically refresh
   - Your post appears at the top with optimized images

### Delete Posts

- Click the three dots (⋮) on your post
- Select "Delete"
- Images will be deleted from Cloudinary and the post from the database

---

## 🏗️ Technical Architecture

### Image Upload Flow

```
User Selects Images
       ↓
Frontend Validation (type, size)
       ↓
Upload to Backend (/api/upload/photos)
       ↓
Multer (memory storage) receives files
       ↓
Cloudinary Service uploads buffers
       ↓
Cloudinary returns optimized URLs + metadata
       ↓
Frontend creates post (/api/posts)
       ↓
Post Controller saves to PostgreSQL
       ↓
Feed refreshes and displays posts
```

### Database Schema

**Posts Table** (`media_urls` column):
```json
[
  {
    "url": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "chitrasethu/posts/user_123/abc123",
    "width": 1920,
    "height": 1080,
    "format": "webp",
    "bytes": 245678,
    "thumbnailUrl": "https://res.cloudinary.com/.../w_300,h_300/..."
  }
]
```

### Cloudinary Folder Structure

```
chitrasethu/
├── posts/
│   ├── user_1/
│   ├── user_2/
│   └── user_3/
├── avatars/
│   └── user_{userId}/
└── portfolios/
    └── photographer_{photographerId}/
```

---

## 🎨 Image Optimization

Images are automatically optimized by Cloudinary:

- **Format**: Auto-converted to WebP/AVIF when supported
- **Quality**: Auto-optimized based on content
- **Size**: Limited to 1920x1920 max dimension
- **CDN**: Delivered via Cloudinary's global CDN
- **Thumbnails**: 300x300 generated automatically

### Responsive Images

The `upload.service.ts` provides methods for generating different sizes:

```typescript
// Get optimized URL
uploadService.getOptimizedUrl(imageUrl, 800); // 800px width

// Get thumbnail
uploadService.getThumbnailUrl(imageUrl, 300); // 300x300

// Get responsive srcset
uploadService.getResponsiveSrcSet(imageUrl); // Multiple sizes
```

---

## 🔒 Security Features

1. **Authentication Required**: All upload/post routes require JWT token
2. **File Type Validation**: Only images allowed (JPEG, PNG, WebP, HEIC)
3. **File Size Limit**: 10MB per file
4. **User Ownership**: Users can only delete their own posts
5. **Cloudinary Signed URLs**: (Optional) Can be enabled for private content

---

## 📊 Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month
- **Images**: Unlimited

**Upgrade when needed:**
- Plus Plan: $99/month (100GB storage/bandwidth)
- Advanced Plan: $224/month (500GB storage/bandwidth)

---

## 🐛 Troubleshooting

### "Image upload service is not configured"

**Fix**: Verify your `.env` file has all three Cloudinary credentials:
```bash
cd backend
cat .env | grep CLOUDINARY
```

### "Failed to upload photo"

**Possible causes:**
1. Check file size (must be < 10MB)
2. Check file type (JPEG, PNG, WebP, HEIC only)
3. Verify Cloudinary credentials are correct
4. Check backend logs for detailed error

### Images not showing in feed

**Fix**:
1. Check browser console for errors
2. Verify posts are in database: `SELECT * FROM posts;`
3. Check if `media_urls` column contains valid JSON
4. Verify Cloudinary URLs are accessible

### Backend not starting

**Fix**:
```bash
cd backend
npm install
npm run dev
```

Check for:
- Database connection errors
- Missing environment variables
- Port conflicts (default: 5000)

---

## 🧪 Testing

### Test Upload Flow

1. Login as customer/photographer
2. Click "Create New Post"
3. Upload 1-3 test images
4. Add caption and tags
5. Click "Create Post"
6. Verify:
   - Upload progress shows
   - Post appears in feed
   - Images load correctly
   - Optimized URLs are used

### Test Delete Flow

1. Find your post
2. Click three dots menu
3. Click "Delete"
4. Verify:
   - Post removed from feed
   - Images deleted from Cloudinary

---

## 📱 Mobile Support

The upload feature is fully responsive:

- Drag & drop works on desktop
- File picker works on mobile
- Touch-optimized dialogs
- Optimized image sizes for mobile

---

## 🚀 Future Enhancements

Potential improvements you can add:

1. **Image Editing**
   - Crop, rotate, filters
   - Before uploading to Cloudinary

2. **Video Support**
   - Upload videos alongside images
   - Video thumbnails

3. **Stories/Reels**
   - Temporary posts (24hr)
   - Vertical video format

4. **Albums/Collections**
   - Group related posts
   - Create galleries

5. **Watermarking**
   - Automatic watermark for photographers
   - Customizable text/logo

6. **AI Features**
   - Auto-tagging with AI
   - Content moderation
   - Face detection

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review backend logs: `backend/` directory
3. Check Cloudinary dashboard for upload status
4. Verify database schema is up to date

---

## ✨ Summary

You now have a complete photo upload and post creation system!

**Features:**
- ✅ Drag & drop image upload
- ✅ Multiple image support (max 10)
- ✅ Progress tracking
- ✅ Image optimization
- ✅ CDN delivery
- ✅ Thumbnail generation
- ✅ Post creation with images
- ✅ Feed display
- ✅ Post deletion

**What users can do:**
- Upload photos from their device
- Create posts with captions, locations, and tags
- View optimized images in the feed
- Delete their posts

**Next steps:**
1. Configure Cloudinary credentials
2. Start the backend and frontend
3. Test the upload feature
4. Share with users!

Enjoy your new photo sharing platform! 📸✨


