# 🚀 Quick Start Guide - Chitrasethu

## Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Git installed

---

## 🎯 Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd chitrasethu/backend

# Install dependencies
npm install

# Create .env file (if not exists)
cp env.example .env

# Edit .env with your MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=chitrasethu
# DB_PORT=3306

# Setup database
npm run db:setup

# Seed sample data
npm run db:seed

# Verify setup
node verify-setup.js

# Start backend server
npm run dev
```

**Backend should now be running on:** `http://localhost:5000`

---

### 2. Frontend Setup

```bash
# Open a NEW terminal
# Navigate to frontend
cd chitrasethu/frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

**Frontend should now be running on:** `http://localhost:5173`

---

## ✅ Test the Integration

### Option 1: Use Test Page
1. Open browser: `http://localhost:5173/test`
2. Check all status indicators are green ✅
3. Click "Go to Login" or "Go to Register"

### Option 2: Test Login
1. Open browser: `http://localhost:5173/login`
2. Use test credentials:
   ```
   Email: customer1@example.com
   Password: Password123!
   ```
3. Click "Sign In"
4. You should be redirected to `/home`

### Option 3: Test Registration
1. Open browser: `http://localhost:5173/register`
2. Fill in the form with your details
3. Click "Create Account"
4. You should be redirected to `/home`

---

## 📍 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React app |
| Backend | http://localhost:5000 | Express API |
| API Docs | http://localhost:5000/api | API endpoints |
| Health Check | http://localhost:5000/health | Server status |
| Test Page | http://localhost:5173/test | Connection test |
| Login | http://localhost:5173/login | Login page |
| Register | http://localhost:5173/register | Register page |
| Home | http://localhost:5173/home | Home page |

---

## 🧪 Test Credentials

After running `npm run db:seed`, use these accounts:

**Customer Account:**
```
Email: customer1@example.com
Password: Password123!
```

**Photographer Account:**
```
Email: arjun.kapoor@example.com
Password: Password123!
```

**Admin Account:**
```
Email: admin@chitrasethu.com
Password: Password123!
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MySQL is running
mysql -u root -p

# Check if database exists
SHOW DATABASES LIKE 'chitrasethu';

# If not, create it
npm run db:setup
```

### Frontend shows "Network error"
- Make sure backend is running on port 5000
- Check `.env` file in frontend has correct API URL
- Try: `curl http://localhost:5000/health`

### "Database connection failed"
- Verify MySQL credentials in `backend/.env`
- Check MySQL is running: `sudo systemctl status mysql`
- Test connection: `mysql -u root -p`

### Port already in use
```bash
# Find process on port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or use different port in backend/.env
PORT=5001
```

---

## 📁 Project Structure

```
chitrasethu/
├── backend/
│   ├── src/
│   │   ├── controllers/      # API logic
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation
│   │   ├── config/           # DB, config
│   │   └── server.js         # Main server
│   ├── database/
│   │   ├── schema.sql        # Database schema
│   │   └── seed.sql          # Sample data
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   ├── config/           # API config
    │   └── App.tsx           # Main app
    ├── .env                  # Environment variables
    └── package.json
```

---

## 🔄 Development Workflow

### Making Changes

**Backend Changes:**
1. Edit files in `backend/src/`
2. Server auto-restarts (nodemon)
3. Test with: `curl http://localhost:5000/api/...`

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Browser auto-refreshes (Vite HMR)
3. Check browser console for errors

### Database Changes

```bash
# Reset database (CAUTION: deletes all data)
cd backend
npm run db:reset

# Recreate schema
npm run db:setup

# Add sample data
npm run db:seed
```

---

## 📚 Documentation

- **Integration Guide**: `INTEGRATION_COMPLETE.md`
- **Backend API**: `backend/README.md`
- **Database Schema**: `backend/database/DB_README.md`
- **Frontend**: `frontend/README.md`

---

## 🎉 You're All Set!

If both servers are running and you can:
1. ✅ Access http://localhost:5173
2. ✅ See the login page
3. ✅ Login with test credentials
4. ✅ Get redirected to /home

**Your project is fully integrated and working!** 🚀

---

## 🆘 Need Help?

1. Check the test page: http://localhost:5173/test
2. Check backend logs in terminal
3. Check browser console (F12)
4. Read `INTEGRATION_COMPLETE.md` for detailed info

---

**Happy Coding!** 📸✨

