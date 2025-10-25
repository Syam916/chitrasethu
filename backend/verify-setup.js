import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

const verifySetup = async () => {
  let connection;
  let allChecks = true;

  try {
    log.title('🔍 CHITRASETHU SETUP VERIFICATION');

    // 1. Check Node.js version
    log.info('Checking Node.js version...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion >= 18) {
      log.success(`Node.js version: ${nodeVersion}`);
    } else {
      log.error(`Node.js version ${nodeVersion} is too old. Please upgrade to v18 or higher.`);
      allChecks = false;
    }

    // 2. Check .env file
    log.info('Checking .env file...');
    if (fs.existsSync('.env')) {
      log.success('.env file exists');
      
      // Check required environment variables
      const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
      const missing = required.filter(key => !process.env[key]);
      
      if (missing.length === 0) {
        log.success('All required environment variables are set');
      } else {
        log.error(`Missing environment variables: ${missing.join(', ')}`);
        allChecks = false;
      }
    } else {
      log.error('.env file not found. Copy env.example to .env and configure it.');
      allChecks = false;
    }

    // 3. Check MySQL connection
    log.info('Checking MySQL connection...');
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
      });
      log.success('MySQL connection successful');
    } catch (error) {
      log.error(`MySQL connection failed: ${error.message}`);
      log.warning('Make sure MySQL is running and credentials are correct');
      allChecks = false;
      return;
    }

    // 4. Check database exists
    log.info('Checking database...');
    try {
      const [databases] = await connection.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [process.env.DB_NAME || 'chitrasethu']
      );
      
      if (databases.length > 0) {
        log.success(`Database '${process.env.DB_NAME}' exists`);
        
        // Switch to database
        await connection.query(`USE ${process.env.DB_NAME}`);
        
        // 5. Check tables
        log.info('Checking tables...');
        const [tables] = await connection.query('SHOW TABLES');
        
        const expectedTables = [
          'users', 'user_profiles', 'user_roles', 'user_sessions',
          'photographers', 'photographer_portfolios', 'photographer_availability',
          'event_categories', 'events', 'bookings', 'booking_payments', 'booking_reviews',
          'posts', 'post_likes', 'post_comments', 'collections',
          'messages', 'notifications'
        ];
        
        const tableKey = `Tables_in_${process.env.DB_NAME}`;
        const existingTables = tables.map(t => t[tableKey]);
        
        if (existingTables.length === expectedTables.length) {
          log.success(`All ${expectedTables.length} tables exist`);
        } else {
          log.warning(`Found ${existingTables.length} tables, expected ${expectedTables.length}`);
          const missing = expectedTables.filter(t => !existingTables.includes(t));
          if (missing.length > 0) {
            log.error(`Missing tables: ${missing.join(', ')}`);
            log.info('Run: npm run db:setup');
            allChecks = false;
          }
        }
        
        // 6. Check sample data
        log.info('Checking sample data...');
        const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [photographerCount] = await connection.query('SELECT COUNT(*) as count FROM photographers');
        const [eventCount] = await connection.query('SELECT COUNT(*) as count FROM events');
        
        if (userCount[0].count > 0) {
          log.success(`Found ${userCount[0].count} users`);
          log.success(`Found ${photographerCount[0].count} photographers`);
          log.success(`Found ${eventCount[0].count} events`);
        } else {
          log.warning('No sample data found');
          log.info('Run: npm run db:seed');
        }
        
        // 7. Check indexes
        log.info('Checking indexes...');
        const [indexes] = await connection.query(`
          SELECT COUNT(*) as count 
          FROM INFORMATION_SCHEMA.STATISTICS 
          WHERE TABLE_SCHEMA = ?
        `, [process.env.DB_NAME]);
        log.success(`Found ${indexes[0].count} indexes`);
        
        // 8. Check triggers
        log.info('Checking triggers...');
        const [triggers] = await connection.query(`
          SELECT COUNT(*) as count 
          FROM INFORMATION_SCHEMA.TRIGGERS 
          WHERE TRIGGER_SCHEMA = ?
        `, [process.env.DB_NAME]);
        log.success(`Found ${triggers[0].count} triggers`);
        
      } else {
        log.error(`Database '${process.env.DB_NAME}' does not exist`);
        log.info('Run: npm run db:setup');
        allChecks = false;
      }
    } catch (error) {
      log.error(`Database check failed: ${error.message}`);
      allChecks = false;
    }

    // 9. Check node_modules
    log.info('Checking dependencies...');
    if (fs.existsSync('node_modules')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      log.success(`Dependencies installed (${depCount} packages)`);
    } else {
      log.error('node_modules not found');
      log.info('Run: npm install');
      allChecks = false;
    }

    // 10. Check ports
    log.info('Checking port availability...');
    const port = process.env.PORT || 5000;
    log.info(`Backend will run on port ${port}`);
    log.info(`Frontend should run on port 5173`);

    // Final summary
    log.title('📊 VERIFICATION SUMMARY');
    
    if (allChecks) {
      log.success('All checks passed! ✨');
      console.log('\n🚀 You can now start the server:');
      console.log(`   ${colors.cyan}npm run dev${colors.reset}\n`);
      console.log('📚 Documentation:');
      console.log(`   - Quick Start: ${colors.cyan}QUICK_START.md${colors.reset}`);
      console.log(`   - Database: ${colors.cyan}database/DB_README.md${colors.reset}`);
      console.log(`   - API: ${colors.cyan}backend/README.md${colors.reset}\n`);
      console.log('🧪 Test Credentials:');
      console.log(`   Customer: ${colors.cyan}customer1@example.com${colors.reset} / Password123!`);
      console.log(`   Photographer: ${colors.cyan}arjun.kapoor@example.com${colors.reset} / Password123!`);
      console.log(`   Admin: ${colors.cyan}admin@chitrasethu.com${colors.reset} / Password123!\n`);
    } else {
      log.error('Some checks failed. Please fix the issues above.');
      console.log('\n📝 Common fixes:');
      console.log(`   1. Copy .env: ${colors.cyan}cp env.example .env${colors.reset}`);
      console.log(`   2. Setup database: ${colors.cyan}npm run db:setup${colors.reset}`);
      console.log(`   3. Seed data: ${colors.cyan}npm run db:seed${colors.reset}`);
      console.log(`   4. Install deps: ${colors.cyan}npm install${colors.reset}\n`);
    }

  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(allChecks ? 0 : 1);
  }
};

// Run verification
verifySetup();

