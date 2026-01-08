# Mood Board "Shots" Explanation

## What are "Shots"?

**"Shots"** in photography terminology refers to **individual photos or images**. 

In the context of mood boards:
- **"Shots"** = Number of images/photos in the mood board
- It's displayed as: **"X shots"** (e.g., "5 shots", "0 shots")
- This is a common photography term used to count photos

### Example:
- If your mood board has 10 images → Shows **"10 shots"**
- If your mood board has no images → Shows **"0 shots"**
- If your mood board has 1 image → Shows **"1 shot"**

---

## Why You See "0 Shots"

If you see **"0 shots"** on a mood board, it means:
- ✅ The mood board was created successfully
- ❌ But no images have been added to it yet

### How to Add Images:

1. **When Creating a New Board:**
   - Use the "Upload References" section
   - Click "Upload Photos"
   - Select images from your device
   - Images will be uploaded and added to the board

2. **For Existing Boards:**
   - Click "View" or "Open Board" on the board card
   - Click "Edit" button (if you're the owner)
   - Add more images using the upload feature

---

## About the Placeholder Data ("sssssssss")

If you see placeholder text like **"sssssssss"** in your mood board:
- This is **test data** that was entered when creating the board
- Someone likely typed "s" multiple times as a test
- This is **normal** during development/testing

### How to Fix:

1. **Edit the Board:**
   - Go to the mood board detail page
   - Click "Edit" button
   - Change the board name to something meaningful
   - Update the description
   - Add proper images

2. **Or Delete and Recreate:**
   - Delete the test board
   - Create a new one with proper information

---

## Viewing Mood Board Details

### How to View a Mood Board:

1. **From the List Page:**
   - Go to `/photographer/mood-boards`
   - Find your mood board card
   - Click the **"View"** button

2. **Direct URL:**
   - Navigate to: `/photographer/mood-boards/{boardId}`
   - Example: `/photographer/mood-boards/5`

### What You'll See:

- ✅ Board name and description
- ✅ Privacy badge (Public/Private)
- ✅ Category badge
- ✅ Statistics:
  - Views count
  - Saves count
  - Likes count
  - **Shots count** (number of images)
- ✅ All images in a grid layout
- ✅ Tags
- ✅ Creator information
- ✅ Action buttons (Edit, Delete, Share)

---

## Image Display

### If Board Has Images:
- Images displayed in a **grid layout**
- Click any image to view it in full size
- Hover over images to see "View" button
- Download individual images

### If Board Has No Images (0 shots):
- Shows an empty state message
- Displays: "No images in this mood board yet"
- If you're the owner, shows "Add Images" button

---

## Summary

| Term | Meaning |
|------|---------|
| **Shots** | Number of images/photos in the mood board |
| **0 shots** | No images added yet |
| **5 shots** | 5 images in the board |
| **"sssssssss"** | Placeholder/test data (can be edited) |

---

## Quick Actions

### To Add Images to a Board:
1. View the board → Click "Edit"
2. Upload images using the upload section
3. Save changes

### To Fix Placeholder Data:
1. View the board → Click "Edit"
2. Update board name and description
3. Save changes

### To See Board Details:
1. Click "View" button on any board card
2. Or navigate to `/photographer/mood-boards/{id}`

---

## Status

✅ **Detail Page Created** - You can now view mood board details
✅ **Route Added** - `/photographer/mood-boards/:boardId` works
✅ **"Shots" Display** - Shows image count clearly
✅ **Image Grid** - Displays all images in the board
✅ **Empty State** - Shows helpful message when no images

The 404 error should now be fixed! Try clicking "View" on a mood board card.

