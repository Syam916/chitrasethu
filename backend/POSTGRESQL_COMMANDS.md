# PostgreSQL Quick Commands Reference

## 🚀 Server Management

### Start PostgreSQL
```bash
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Stop PostgreSQL
```bash
# Windows
net stop postgresql-x64-15

# macOS
brew services stop postgresql@15

# Linux
sudo systemctl stop postgresql
```

### Check Status
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

---

## 🗄️ Database Commands

### Connect to PostgreSQL
```bash
# Connect as postgres user
psql -U postgres

# Connect to specific database
psql -U postgres -d chitrasethu

# Connect with password prompt
psql -U postgres -W
```

### Database Operations
```sql
-- List all databases
\l

-- Create database
CREATE DATABASE chitrasethu;

-- Drop database (CAREFUL!)
DROP DATABASE chitrasethu;

-- Connect to database
\c chitrasethu

-- List all tables
\dt

-- Describe table
\d table_name

-- List all users
\du

-- Quit
\q
```

---

## 📊 Common SQL Queries

### Table Information
```sql
-- Show table structure
\d+ users

-- List all tables with sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count records in all tables
SELECT 
    schemaname,
    tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### User Management
```sql
-- Create user
CREATE USER myuser WITH PASSWORD 'mypassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE chitrasethu TO myuser;
GRANT ALL ON SCHEMA public TO myuser;

-- Change password
ALTER USER postgres WITH PASSWORD 'newpassword';

-- List users
SELECT usename FROM pg_user;
```

### Backup & Restore
```bash
# Backup database
pg_dump -U postgres -d chitrasethu > backup.sql

# Backup with data only
pg_dump -U postgres -d chitrasethu --data-only > data.sql

# Backup schema only
pg_dump -U postgres -d chitrasethu --schema-only > schema.sql

# Restore database
psql -U postgres -d chitrasethu < backup.sql
```

---

## 🔧 Development Commands

### Node.js Scripts
```bash
# Setup database (create tables)
npm run db:setup

# Seed sample data
npm run db:seed

# Reset database (clear all)
npm run db:reset

# Verify setup
npm run verify

# Start server
npm run serve
npm start

# Development mode (with nodemon)
npm run dev
```

### Direct SQL Execution
```bash
# Run SQL file
psql -U postgres -d chitrasethu -f schema_postgres.sql

# Run SQL command
psql -U postgres -d chitrasethu -c "SELECT COUNT(*) FROM users;"
```

---

## 🔍 Monitoring & Debugging

### Check Active Connections
```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = 'chitrasethu';
```

### Kill Connection
```sql
-- Kill specific connection
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'chitrasethu' AND pid <> pg_backend_pid();
```

### Check Database Size
```sql
SELECT 
    pg_size_pretty(pg_database_size('chitrasethu')) AS database_size;
```

### View Slow Queries
```sql
-- Enable logging (in postgresql.conf)
-- log_min_duration_statement = 1000  # milliseconds

-- View recent queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

---

## 🛠️ Maintenance

### Vacuum Database
```sql
-- Analyze tables
ANALYZE;

-- Vacuum (clean up)
VACUUM;

-- Full vacuum (more thorough)
VACUUM FULL;

-- Vacuum specific table
VACUUM ANALYZE users;
```

### Reindex
```sql
-- Reindex database
REINDEX DATABASE chitrasethu;

-- Reindex table
REINDEX TABLE users;

-- Reindex index
REINDEX INDEX idx_email;
```

---

## 🔐 Security

### Check Permissions
```sql
-- Check table permissions
\dp table_name

-- Check database permissions
\l+ chitrasethu

-- Grant select on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO myuser;

-- Revoke permissions
REVOKE ALL ON DATABASE chitrasethu FROM myuser;
```

### Enable SSL
```sql
-- In postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

---

## 📝 Data Operations

### Export Data
```sql
-- Export to CSV
COPY users TO '/path/to/users.csv' CSV HEADER;

-- Export query result
COPY (SELECT * FROM users WHERE user_type = 'photographer') 
TO '/path/to/photographers.csv' CSV HEADER;
```

### Import Data
```sql
-- Import from CSV
COPY users FROM '/path/to/users.csv' CSV HEADER;
```

---

## 🐛 Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is listening
netstat -an | grep 5432

# Check PostgreSQL logs
# Windows: C:\Program Files\PostgreSQL\15\data\log\
# macOS: /usr/local/var/log/postgres.log
# Linux: /var/log/postgresql/
```

### Reset Password
```bash
# Edit pg_hba.conf to trust local connections temporarily
# Then restart PostgreSQL and run:
psql -U postgres
ALTER USER postgres WITH PASSWORD 'newpassword';
# Change pg_hba.conf back to md5
```

### Fix Permission Issues
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
ALTER DATABASE chitrasethu OWNER TO postgres;
```

---

## 🎯 Useful Queries

### Check ENUM Types
```sql
SELECT 
    t.typname,
    array_agg(e.enumlabel ORDER BY e.enumsortorder)
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
GROUP BY t.typname;
```

### Check JSONB Structure
```sql
-- Get all keys in a JSONB column
SELECT DISTINCT jsonb_object_keys(specialties)
FROM photographers;

-- Query JSONB
SELECT * FROM photographers
WHERE specialties @> '["Wedding"]'::jsonb;
```

### Check Triggers
```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## 📚 Environment Variables

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=chitrasethu
DB_PORT=5432
```

---

## 🔗 Quick Links

- PostgreSQL Docs: https://www.postgresql.org/docs/
- psql Commands: https://www.postgresql.org/docs/current/app-psql.html
- pg (node-postgres): https://node-postgres.com/

---

**Pro Tip:** Use `\?` in psql for help with psql commands, and `\h` for help with SQL commands!

