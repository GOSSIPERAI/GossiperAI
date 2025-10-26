import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...\n');
    console.log('Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
    
    const result = await pool.query(`
      SELECT 
        NOW() as current_time,
        current_database() as database_name,
        current_user as username,
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM sessions) as session_count
    `);
    
    const data = result.rows[0];
    
    console.log('✅ Database connected successfully!\n');
    console.log('📊 Database Info:');
    console.log('   Time:', data.current_time);
    console.log('   Database:', data.database_name);
    console.log('   User:', data.username);
    console.log('   Users table:', data.user_count, 'users');
    console.log('   Sessions table:', data.session_count, 'sessions');
    console.log('\n✨ Ready to test authentication!');
    
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();

