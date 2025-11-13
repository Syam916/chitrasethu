import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database seed script
const seedDatabase = async () => {
  let client;
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    client = new Client({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chitrasethu',
      port: process.env.DB_PORT || 5432,
    });
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Read seed file
    const seedPath = path.join(__dirname, '../../database/seed_postgres.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');
    
    console.log('📄 Reading PostgreSQL seed data file...');
    
    // Execute seed data
    console.log('⚙️  Inserting seed data...');
    await client.query(seedData);
    
    console.log('✅ Seed data inserted successfully\n');
    
    // Verify data
    const result = await client.query(`
      SELECT 'Users' as table_name, COUNT(*) as record_count FROM users
      UNION ALL SELECT 'Photographers', COUNT(*) FROM photographers
      UNION ALL SELECT 'Events', COUNT(*) FROM events
      UNION ALL SELECT 'Bookings', COUNT(*) FROM bookings
      UNION ALL SELECT 'Posts', COUNT(*) FROM posts
    `);
    
    console.log('📊 Data Summary:');
    result.rows.forEach(row => {
      console.log(`   ${row.table_name}: ${row.record_count} records`);
    });
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('💡 You can now start the server with "npm run serve"\n');
    
    console.log('📝 Test Credentials:');
    console.log('   Customer: customer1@example.com / Password123!');
    console.log('   Photographer: arjun.kapoor@example.com / Password123!');
    console.log('   Admin: admin@chitrasethu.com / Password123!\n');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

// Run seed
seedDatabase();

