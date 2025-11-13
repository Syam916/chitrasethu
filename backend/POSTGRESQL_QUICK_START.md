# PostgreSQL Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- PostgreSQL installed and running
- Node.js and npm installed

### Step 1: Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE chitrasethu;

# Exit
\q
```

### Step 2: Configure Environment
```bash
# Copy environment template
copy env.example .env   # Windows
cp env.example .env     # macOS/Linux

# Edit .env and update:
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
# DB_NAME=chitrasethu
# DB_PORT=5432
```

### Step 3: Install Dependencies
```bash
cd chitrasethu/backend
npm install
```

### Step 4: Setup Database Schema
```bash
npm run db:setup
```

### Step 5: Seed Sample Data
```bash
npm run db:seed
```

### Step 6: Start Server
```bash
npm run serve
```

## ✅ Verify Installation

Server should be running at: `http://localhost:5000`

Test API: `http://localhost:5000/api`

### Test Credentials
- **Customer:** customer1@example.com / Password123!
- **Photographer:** arjun.kapoor@example.com / Password123!
- **Admin:** admin@chitrasethu.com / Password123!

## 🔧 Database Commands

```bash
# Setup (create tables)
npm run db:setup

# Seed (insert data)
npm run db:seed

# Reset (clear all)
npm run db:reset

# Verify
npm run verify
```

## 📚 Full Documentation

See [POSTGRESQL_MIGRATION_GUIDE.md](./POSTGRESQL_MIGRATION_GUIDE.md) for complete details.

## 🐛 Troubleshooting

### PostgreSQL not running?
```bash
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Connection failed?
- Check `.env` has correct password
- Verify PostgreSQL is running on port 5432
- Ensure database `chitrasethu` exists

### Permission denied?
```sql
psql -U postgres
GRANT ALL ON SCHEMA public TO postgres;
```

---

**Need Help?** Check the full migration guide or PostgreSQL logs.

