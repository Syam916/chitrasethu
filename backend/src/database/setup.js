import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup script
const setupDatabase = async () => {
  let client;
  
  try {
    console.log('🔧 Starting database setup...\n');
    
    // Connect to PostgreSQL (connect to specific database)
    client = new Client({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chitrasethu',
      port: process.env.DB_PORT || 5432,
    });
    
    await client.connect();
    console.log('✅ Connected to PostgreSQL server');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../database/schema_postgres.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Reading PostgreSQL schema file...');
    
    // Execute schema
    console.log('⚙️  Creating tables, enums, triggers, and views...');
    await client.query(schema);
    
    console.log('✅ Database schema created successfully\n');
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('💡 Run "npm run db:seed" to populate with sample data\n');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

// Run setup
setupDatabase();

