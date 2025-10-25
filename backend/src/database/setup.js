import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup script
const setupDatabase = async () => {
  let connection;
  
  try {
    console.log('🔧 Starting database setup...\n');
    
    // Connect to MySQL without database selection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Reading schema file...');
    
    // Execute schema
    console.log('⚙️  Creating database and tables...');
    await connection.query(schema);
    
    console.log('✅ Database schema created successfully\n');
    
    // Verify tables
    await connection.query(`USE ${process.env.DB_NAME || 'chitrasethu'}`);
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('📊 Created tables:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`   ${index + 1}. ${tableName}`);
    });
    
    console.log('\n✅ Database setup completed successfully!');
    console.log('💡 Run "npm run db:seed" to populate with sample data\n');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run setup
setupDatabase();

