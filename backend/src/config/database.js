import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration - Support both DATABASE_URL (Render) and individual params
let dbConfig;

if (process.env.DATABASE_URL) {
  // Render provides DATABASE_URL - use connection string
  console.log('📊 Using DATABASE_URL for connection');
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased for cloud connections
  };
} else {
  // Local development - use individual parameters
  console.log('📊 Using individual DB params for connection');
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME || 'chitrasethu',
    port: process.env.DB_PORT || 5433,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${process.env.DB_NAME || 'chitrasethu'}`);
    console.log(`⏰ Server time: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query helper (PostgreSQL uses $1, $2 instead of ?)
const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Helper to convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
const convertPlaceholders = (sql) => {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
};

export { pool, testConnection, query, transaction, convertPlaceholders };
export default pool;

