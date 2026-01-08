import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup script for mood board likes and comments
const createMoodBoardTables = async () => {
  let client;
  
  try {
    console.log('🔧 Creating mood board likes and comments tables...\n');
    
    // Connect to PostgreSQL
    client = new Client({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chitrasethu',
      port: process.env.DB_PORT || 5432,
    });
    
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../../database/moodboard_likes_comments_simple.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Reading SQL file...');
    
    // Execute SQL
    console.log('⚙️  Creating tables and indexes...');
    await client.query(sql);
    
    console.log('✅ Tables created successfully\n');
    
    // Verify tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('collection_likes', 'collection_comments')
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    // Check if comments_count column exists, add if missing
    const columnResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'collections' 
      AND column_name = 'comments_count'
    `);
    
    if (columnResult.rows.length === 0) {
      console.log('   ⚙️  Adding comments_count column to collections table...');
      await client.query(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'collections' 
                AND column_name = 'comments_count'
            ) THEN
                ALTER TABLE collections ADD COLUMN comments_count INT DEFAULT 0;
                UPDATE collections SET comments_count = 0 WHERE comments_count IS NULL;
            END IF;
        END $$;
      `);
      console.log('   ✅ comments_count column added to collections table');
    } else {
      console.log('   ✅ comments_count column already exists in collections table');
    }
    
    console.log('\n✅ Mood board tables setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.code === '42P01') {
      console.error('   Error: A referenced table does not exist. Make sure the collections table exists first.');
    }
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

// Run setup
createMoodBoardTables();

