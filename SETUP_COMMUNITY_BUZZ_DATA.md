# 🚀 Setup Community Buzz Data - Step by Step Guide

## ✅ Prerequisites
- You have 10 users in your database
- Backend server is running
- Database is connected

---

## 📋 Step-by-Step Instructions

### Step 1: Check Your Database Connection

Make sure your database is accessible. Check your `.env` file in the `backend` folder:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=chitrasethu
DB_PORT=5432
```

---

### Step 2: Run Community Buzz Seed Data

You need to run the seed SQL file to populate groups and collaborations. Choose one method:

#### **Method A: Using psql (Command Line)**

```bash
# Navigate to backend directory
cd backend

# Run the seed file (replace with your database credentials)
psql -U postgres -d chitrasethu -f database/seed_community_buzz.sql
```

**Windows PowerShell:**
```powershell
cd backend
psql -U postgres -d chitrasethu -f database\seed_community_buzz.sql
```

#### **Method B: Using pgAdmin or Database Client**

1. Open pgAdmin or your database client
2. Connect to your `chitrasethu` database
3. Open the file: `backend/database/seed_community_buzz.sql`
4. Execute the entire script

#### **Method C: Using Node.js Script (Recommended)**

I'll create a script for you to run this easily.

---

### Step 3: Verify Data Was Inserted

After running the seed, verify the data:

```sql
-- Check groups
SELECT COUNT(*) as group_count FROM community_groups;
-- Should return 5

-- Check collaborations
SELECT COUNT(*) as collaboration_count FROM collaborations;
-- Should return 7

-- Check group members
SELECT COUNT(*) as member_count FROM group_members;
-- Should return 12+
```

---

### Step 4: Restart Backend Server

**IMPORTANT:** After seeding data, restart your backend server to apply the SQL fix:

1. Stop the backend server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   npm run dev
   ```

---

### Step 5: Login as Photographer

The seed data uses specific user IDs. Make sure you're logged in as one of these photographers:

- **User ID 4** - Arjun Kapoor (arjun.kapoor@example.com)
- **User ID 5** - Priya Sharma (priya.sharma@example.com)
- **User ID 6** - Rajesh Kumar (rajesh.kumar@example.com)
- **User ID 7** - Sneha Patel (sneha.patel@example.com)

**Or check which users are photographers:**
```sql
SELECT u.user_id, up.full_name, u.email 
FROM users u 
JOIN user_profiles up ON u.user_id = up.user_id 
JOIN photographers p ON u.user_id = p.user_id;
```

---

### Step 6: Test Community Buzz Page

1. Open your browser
2. Navigate to: `http://localhost:8080/photographer/community-buzz`
3. You should see:
   - **Groups Tab:** 5 groups (if you're a member)
   - **Collaborations Tab:** 7 collaborations
   - **Events Tab:** Sample events

---

## 🔧 Troubleshooting

### Issue: "No groups yet" or "No collaborations yet"

**Solution 1:** Check if you're logged in as a photographer
```sql
-- Check your current user
SELECT user_id, email FROM users WHERE email = 'your_email@example.com';

-- Check if user is a photographer
SELECT * FROM photographers WHERE user_id = YOUR_USER_ID;
```

**Solution 2:** Check if data exists
```sql
SELECT COUNT(*) FROM community_groups;
SELECT COUNT(*) FROM collaborations;
```

**Solution 3:** Check group memberships
```sql
-- See which groups you're a member of
SELECT g.group_name, gm.role 
FROM group_members gm
JOIN community_groups g ON gm.group_id = g.group_id
WHERE gm.user_id = YOUR_USER_ID;
```

### Issue: Still getting 500 error on collaborations

1. **Restart backend server** (the SQL fix needs server restart)
2. **Check backend console** for errors
3. **Verify database connection** is working

### Issue: Seed script fails with foreign key errors

The seed script expects users with IDs 1-7. If your users have different IDs:

**Option 1:** Update the seed script to use your actual user IDs

**Option 2:** Create groups/collaborations manually:
```sql
-- Create a group (replace USER_ID with your photographer user_id)
INSERT INTO community_groups (creator_id, group_name, description, group_type, is_public, is_active)
VALUES (YOUR_USER_ID, 'My Test Group', 'Test description', 'regional', TRUE, TRUE);

-- Add yourself as admin
INSERT INTO group_members (group_id, user_id, role, joined_at)
VALUES (
  (SELECT group_id FROM community_groups WHERE group_name = 'My Test Group'),
  YOUR_USER_ID,
  'admin',
  NOW()
);

-- Create a collaboration
INSERT INTO collaborations (user_id, title, description, collaboration_type, skills, is_active)
VALUES (
  YOUR_USER_ID,
  'Test Collaboration',
  'This is a test collaboration',
  'seeking',
  '["Wedding Photography"]'::jsonb,
  TRUE
);
```

---

## 📊 What Data Gets Created

After running the seed script, you'll have:

- **5 Community Groups:**
  - Mumbai Wedding Photographers
  - Fashion Photography Network
  - Corporate Event Photographers
  - Portrait & Family Photography
  - Wedding Photography Business

- **7 Collaborations:**
  - 4 "seeking" collaborations
  - 3 "offering" collaborations

- **12+ Group Memberships:**
  - Various users added to different groups

- **10+ Collaboration Responses:**
  - Responses to various collaborations

---

## 🎯 Quick Test Checklist

After setup, verify:

- [ ] Backend server is running
- [ ] Database has groups (SELECT COUNT(*) FROM community_groups)
- [ ] Database has collaborations (SELECT COUNT(*) FROM collaborations)
- [ ] You're logged in as a photographer
- [ ] Groups tab shows groups
- [ ] Collaborations tab shows collaborations
- [ ] No 500 errors in browser console
- [ ] No errors in backend console

---

## 💡 Next Steps

Once data is loaded:

1. **Create your own group** - Click "Start New Community"
2. **Post a collaboration** - Click "Post Collaboration"
3. **Join existing groups** - Browse and join groups
4. **Respond to collaborations** - Click "Respond" on any collaboration

---

**Need Help?** Check the console logs for specific error messages!




