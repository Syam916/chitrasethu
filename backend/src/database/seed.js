import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database seed script
const seedDatabase = async () => {
  let connection;
  
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'chitrasethu_db',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });
    
    console.log('✅ Connected to database');
    
    // Read seed file
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');
    
    console.log('📄 Reading seed data file...');
    
    // Execute seed data
    console.log('⚙️  Inserting seed data...');
    await connection.query(seedData);
    
    console.log('✅ Seed data inserted successfully\n');
    
    // Verify data
    const [result] = await connection.query(`
      SELECT 'Users' as Table_Name, COUNT(*) as Record_Count FROM users
      UNION ALL SELECT 'Photographers', COUNT(*) FROM photographers
      UNION ALL SELECT 'Events', COUNT(*) FROM events
      UNION ALL SELECT 'Bookings', COUNT(*) FROM bookings
      UNION ALL SELECT 'Posts', COUNT(*) FROM posts
    `);
    
    console.log('📊 Data Summary:');
    result.forEach(row => {
      console.log(`   ${row.Table_Name}: ${row.Record_Count} records`);
    });
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('💡 You can now start the server with "npm run dev"\n');
    
    console.log('📝 Test Credentials:');
    console.log('   Customer: customer1@example.com / Password123!');
    console.log('   Photographer: arjun.kapoor@example.com / Password123!');
    console.log('   Admin: admin@chitrasethu.com / Password123!\n');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run seed
seedDatabase();

