# Chitrasethu - Quick Start Guide

Complete setup guide to get your Chitrasethu Photography Platform running in minutes!

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ Git installed
- ✅ A code editor (VS Code recommended)

## 🚀 Quick Setup (5 Minutes)

### Step 1: Clone & Install (1 min)

```bash
# Clone the repository
git clone https://github.com/yourusername/chitrasethu.git
cd chitrasethu

# Install backend dependencies
cd chitrasethu/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Setup (2 min)

```bash
# Go to backend directory
cd ../backend

# Create .env file
cp env.example .env

# Edit .env with your MySQL password
# Update: DB_PASSWORD=your_mysql_password

# Create database and tables
npm run db:setup

# Populate with sample data
npm run db:seed
```

### Step 3: Start Servers (1 min)

```bash
# Terminal 1: Start Backend
cd chitrasethu/backend
npm run dev

# Terminal 2: Start Frontend
cd chitrasethu/frontend
npm run dev
```

### Step 4: Access Application (1 min)

Open your browser:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 🔑 Test Credentials

Use these credentials to login:

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

## 📁 Project Structure

```
chitrasethu/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── database/       # DB setup scripts
│   │   └── server.js       # Main server file
│   ├── database/
│   │   ├── schema.sql      # Database schema
│   │   ├── seed.sql        # Sample data
│   │   └── DB_README.md    # Database documentation
│   ├── package.json
│   └── README.md
│
└── frontend/               # React + Vite frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── pages/          # Page components
    │   ├── data/           # Dummy data
    │   └── App.tsx         # Main app component
    ├── package.json
    └── README.md
```

## 🗄️ Database Overview

### Tables Created (18 total)

**User Management:**
- users, user_profiles, user_roles, user_sessions

**Photographer Management:**
- photographers, photographer_portfolios, photographer_availability

**Event & Booking:**
- event_categories, events, bookings, booking_payments, booking_reviews

**Social Features:**
- posts, post_likes, post_comments, collections

**Communication:**
- messages, notifications

### Sample Data Included

- 8 Users (3 customers, 4 photographers, 1 admin)
- 4 Photographer profiles with portfolios
- 8 Event categories
- 5 Sample events
- 4 Bookings with payments
- 5 Social posts with likes and comments
- 4 Collections (moodboards)
- Messages and notifications

## 🔧 Configuration

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chitrasethu_db
DB_PORT=3306

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (vite.config.ts)

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

## 🎯 Key Features Implemented

### Frontend ✅
- User authentication (Login/Register)
- Photographer discovery and filtering
- Event browsing
- Booking requests
- Community Buzz (social feed)
- Moodboard collections
- Responsive design with Tailwind CSS

### Backend ✅
- Complete database schema
- User authentication structure
- RESTful API setup
- Database connection pooling
- Error handling
- Security middleware (Helmet, CORS)

### Database ✅
- 18 normalized tables
- Foreign key relationships
- Indexes for performance
- Triggers for data consistency
- Sample seed data
- Comprehensive documentation

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
cd backend
node -e "import('./src/config/database.js').then(db => db.testConnection())"
```

### 2. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# API info
curl http://localhost:5000/api
```

### 3. Test Frontend

Open http://localhost:5173 in your browser and:
- Navigate through different pages
- Check the photographer listings
- View the community buzz feed
- Try the moodboard page

## 📊 Database Commands

```bash
# Setup database (create tables)
npm run db:setup

# Seed sample data
npm run db:seed

# Reset database (CAUTION: deletes all data)
npm run db:reset

# Manual MySQL access
mysql -u root -p chitrasethu_db
```

### Useful SQL Queries

```sql
-- Check all tables
SHOW TABLES;

-- Count records in each table
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL SELECT 'Photographers', COUNT(*) FROM photographers
UNION ALL SELECT 'Events', COUNT(*) FROM events
UNION ALL SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'Posts', COUNT(*) FROM posts;

-- View sample users
SELECT u.email, u.user_type, up.full_name 
FROM users u 
JOIN user_profiles up ON u.user_id = up.user_id;

-- View photographers with ratings
SELECT up.full_name, p.business_name, p.rating, p.total_reviews, p.base_price
FROM photographers p
JOIN user_profiles up ON p.user_id = up.user_id;
```

## 🐛 Common Issues & Solutions

### Issue: "Can't connect to MySQL"

**Solution:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Check MySQL port
netstat -an | grep 3306
```

### Issue: "Database already exists"

**Solution:**
```bash
# Reset and recreate
npm run db:reset
npm run db:setup
npm run db:seed
```

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Issue: "Module not found"

**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

### 1. Explore the Database

Read the comprehensive database documentation:
```bash
cat backend/database/DB_README.md
```

### 2. Review the Schema

Check the database structure:
```bash
cat backend/database/schema.sql
```

### 3. Understand the Seed Data

See what sample data is available:
```bash
cat backend/database/seed.sql
```

### 4. Start Building APIs

The backend structure is ready. Next steps:
- Create controller files
- Implement route handlers
- Add authentication middleware
- Connect frontend to backend

### 5. Connect Frontend to Backend

Update frontend to use real API:
- Replace dummy data with API calls
- Implement authentication
- Add loading states
- Handle errors

## 🎓 Learning Resources

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [SQL Tutorial](https://www.w3schools.com/sql/)
- Database normalization concepts

### Backend
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [JWT Authentication](https://jwt.io/introduction)

### Frontend
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📞 Support

Need help? Check these resources:

1. **Database Documentation**: `backend/database/DB_README.md`
2. **Backend README**: `backend/README.md`
3. **Frontend README**: `frontend/README.md`
4. **GitHub Issues**: Create an issue for bugs
5. **Email**: dev@chitrasethu.com

## ✅ Setup Checklist

- [ ] Node.js and MySQL installed
- [ ] Repository cloned
- [ ] Dependencies installed (backend & frontend)
- [ ] .env file configured
- [ ] Database created (`npm run db:setup`)
- [ ] Sample data loaded (`npm run db:seed`)
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Tested login with sample credentials
- [ ] Explored database tables
- [ ] Read documentation

## 🎉 You're All Set!

Your Chitrasethu platform is now running with:
- ✅ Complete database with 18 tables
- ✅ Sample data for testing
- ✅ Backend API server
- ✅ Frontend React application
- ✅ Test user accounts

**Start exploring and building amazing features! 📸✨**

---

For detailed information, refer to:
- Backend: `backend/README.md`
- Database: `backend/database/DB_README.md`
- Frontend: `frontend/README.md`

