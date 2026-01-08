import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Quick script to add comments_count column
const addCommentsCountColumn = async () => {
  let client;
  
  try {
    console.log('🔧 Adding comments_count column to collections table...\n');
    
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
    
    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'collections' 
      AND column_name = 'comments_count'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Column comments_count already exists');
    } else {
      // Add the column
      await client.query(`
        ALTER TABLE collections ADD COLUMN comments_count INT DEFAULT 0;
        UPDATE collections SET comments_count = 0 WHERE comments_count IS NULL;
      `);
      console.log('✅ Column comments_count added successfully');
    }
    
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

// Run
addCommentsCountColumn();

