import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup script for board_collaborators table
const createCollaboratorsTable = async () => {
  let client;
  
  try {
    console.log('🔧 Creating board_collaborators table...\n');
    
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
    const sqlPath = path.join(__dirname, '../../database/moodboard_collaborators_simple.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Reading SQL file...');
    
    // Execute SQL
    console.log('⚙️  Creating table and indexes...');
    await client.query(sql);
    
    console.log('✅ Table created successfully\n');
    
    // Verify table exists
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'board_collaborators'
    `);
    
    if (tableResult.rows.length > 0) {
      console.log('✅ board_collaborators table exists');
      
      // Check columns
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'board_collaborators'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📊 Table columns:');
      columnsResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.column_name} (${row.data_type})`);
      });
    } else {
      console.log('❌ Table was not created');
    }
    
    console.log('\n✅ Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.code === '42P01') {
      console.error('   Error: A referenced table does not exist. Make sure the collections and users tables exist first.');
    } else if (error.code === '23503') {
      console.error('   Error: Foreign key constraint violation. Make sure referenced tables exist.');
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
createCollaboratorsTable();

