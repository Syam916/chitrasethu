import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Community Buzz seed script
const seedCommunityBuzz = async () => {
    
  let client;
  
  try {
    console.log('🌱 Starting Community Buzz data seeding...\n');
    
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
    
    // Check if users exist
    const userCheck = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.error('❌ No users found in database!');
      console.error('   Please run the main seed script first: npm run seed');
      process.exit(1);
    }
    console.log(`✅ Found ${userCheck.rows[0].count} users in database`);
    
    // Check if photographers exist
    const photographerCheck = await client.query('SELECT COUNT(*) as count FROM photographers');
    if (parseInt(photographerCheck.rows[0].count) === 0) {
      console.warn('⚠️  No photographers found. Some seed data may fail if user IDs don\'t match.');
    } else {
      console.log(`✅ Found ${photographerCheck.rows[0].count} photographers`);
    }
    
    // Read seed file
    const seedPath = path.join(__dirname, '../../../database/seed_community_buzz.sql');
    
    if (!fs.existsSync(seedPath)) {
      console.error(`❌ Seed file not found: ${seedPath}`);
      process.exit(1);
    }
    
    const seedData = fs.readFileSync(seedPath, 'utf8');
    
    console.log('📄 Reading Community Buzz seed data file...');
    
    // Execute seed data
    console.log('⚙️  Inserting Community Buzz data...');
    
    // Split by semicolons and execute each statement
    const statements = seedData
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let executed = 0;
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          executed++;
        } catch (error) {
          // Ignore duplicate key errors (data already exists)
          if (error.code !== '23505' && !error.message.includes('already exists')) {
            console.warn(`⚠️  Warning executing statement: ${error.message}`);
            // Continue with other statements
          }
        }
      }
    }
    
    console.log(`✅ Executed ${executed} statements\n`);
    
    // Verify data
    const result = await client.query(`
      SELECT 'Discussion Topics' as table_name, COUNT(*) as record_count FROM discussion_topics
      UNION ALL SELECT 'Discussion Replies', COUNT(*) FROM discussion_replies
      UNION ALL SELECT 'Community Groups', COUNT(*) FROM community_groups
      UNION ALL SELECT 'Group Members', COUNT(*) FROM group_members
      UNION ALL SELECT 'Collaborations', COUNT(*) FROM collaborations
      UNION ALL SELECT 'Collaboration Responses', COUNT(*) FROM collaboration_responses
    `);
    
    console.log('📊 Community Buzz Data Summary:');
    result.rows.forEach(row => {
      console.log(`   ${row.table_name}: ${row.record_count} records`);
    });
    
    // Check which users are in groups
    const groupMembers = await client.query(`
      SELECT DISTINCT gm.user_id, up.full_name, COUNT(gm.group_id) as group_count
      FROM group_members gm
      JOIN user_profiles up ON gm.user_id = up.user_id
      GROUP BY gm.user_id, up.full_name
      ORDER BY group_count DESC
    `);
    
    if (groupMembers.rows.length > 0) {
      console.log('\n👥 Users in Groups:');
      groupMembers.rows.forEach(row => {
        console.log(`   ${row.full_name} (ID: ${row.user_id}): ${row.group_count} groups`);
      });
    }
    
    console.log('\n✅ Community Buzz seeding completed successfully!');
    console.log('💡 You can now test the Community Buzz page in your app\n');
    
    console.log('📝 Next Steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Login as a photographer user');
    console.log('   3. Navigate to /photographer/community-buzz');
    console.log('   4. You should see groups and collaborations!\n');
    
  } catch (error) {
    console.error('❌ Community Buzz seeding failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
};

// Run seed
seedCommunityBuzz();













