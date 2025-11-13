import pg from 'pg';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const { Client } = pg;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Database reset script
const resetDatabase = async () => {
  let client;
  
  try {
    console.log('⚠️  WARNING: This will delete all data and drop all tables in the database!\n');
    
    rl.question('Are you sure you want to reset the database? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Database reset cancelled');
        rl.close();
        process.exit(0);
      }
      
      try {
        console.log('\n🔄 Resetting database...\n');
        
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
        
        const dbName = process.env.DB_NAME || 'chitrasethu';
        console.log(`🗑️  Dropping all objects in database: ${dbName}`);
        
        // Drop all tables (CASCADE will drop dependent objects)
        await client.query('DROP SCHEMA public CASCADE');
        await client.query('CREATE SCHEMA public');
        await client.query('GRANT ALL ON SCHEMA public TO postgres');
        await client.query('GRANT ALL ON SCHEMA public TO public');
        
        console.log('✅ Database reset successfully\n');
        console.log('💡 Run "npm run db:setup" to recreate the database schema');
        console.log('💡 Then run "npm run db:seed" to populate with sample data\n');
        
      } catch (error) {
        console.error('❌ Database reset failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
      } finally {
        if (client) {
          await client.end();
        }
        rl.close();
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Run reset
resetDatabase();

