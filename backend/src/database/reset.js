import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Database reset script
const resetDatabase = async () => {
  let connection;
  
  try {
    console.log('⚠️  WARNING: This will delete all data in the database!\n');
    
    rl.question('Are you sure you want to reset the database? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Database reset cancelled');
        rl.close();
        process.exit(0);
      }
      
      try {
        console.log('\n🔄 Resetting database...\n');
        
        // Connect to MySQL
        connection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          port: process.env.DB_PORT || 3306,
          multipleStatements: true
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Drop database
        const dbName = process.env.DB_NAME || 'chitrasethu';
        console.log(`🗑️  Dropping database: ${dbName}`);
        await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
        
        console.log('✅ Database dropped successfully\n');
        console.log('💡 Run "npm run db:setup" to recreate the database');
        console.log('💡 Then run "npm run db:seed" to populate with sample data\n');
        
      } catch (error) {
        console.error('❌ Database reset failed:', error.message);
        process.exit(1);
      } finally {
        if (connection) {
          await connection.end();
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

