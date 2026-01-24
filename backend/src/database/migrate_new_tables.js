import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database migration script for new tables
const runMigration = async () => {
  let client;
  
  try {
    console.log('🔧 Starting database migration for new tables...\n');
    
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
    console.log(`📊 Database: ${process.env.DB_NAME || 'chitrasethu'}\n`);
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../../database/migrations/add_new_tables_migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Reading migration file...');
    
    // Execute migration
    console.log('⚙️  Running migration...\n');
    await client.query(migrationSQL);
    
    console.log('\n✅ Migration completed successfully!\n');
    
    // Verify new tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name IN (
          'photo_booth_galleries',
          'photo_booth_gallery_photos',
          'photo_booth_access_logs',
          'collection_likes',
          'collection_comments',
          'board_collaborators',
          'job_posts',
          'job_applications'
        )
      ORDER BY table_name
    `);
    
    console.log('📊 Verified new tables:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    // Check if collections table has comments_count column
    const collectionsCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'collections'
        AND column_name = 'comments_count'
    `);
    
    if (collectionsCheck.rows.length > 0) {
      console.log('\n✅ collections.comments_count column added');
    }
    
    // Check if enum was created
    const enumCheck = await client.query(`
      SELECT typname
      FROM pg_type
      WHERE typname = 'gallery_privacy_enum'
    `);
    
    if (enumCheck.rows.length > 0) {
      console.log('✅ gallery_privacy_enum type created');
    }
    
    console.log('\n🎉 All migrations applied successfully!');
    console.log('💡 Your database is now up to date.\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code === '42P01') {
      console.error('   Error: Table does not exist. Make sure you have run the base schema first.');
    } else if (error.code === '42P07') {
      console.error('   Warning: Some objects already exist (this is okay)');
    } else {
      console.error('   Error details:', error);
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

// Run migration
runMigration();




