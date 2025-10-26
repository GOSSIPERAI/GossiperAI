import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jzB07dxYqOnv@ep-still-snowflake-a4hy02a6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  },
  max: 1,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...\n');
    
    // Test basic connection
    const timeResult = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connected successfully!');
    console.log('📅 Server Time:', timeResult.rows[0].current_time);
    console.log('📦 PostgreSQL Version:', timeResult.rows[0].version.split(',')[0]);
    console.log('');
    
    // Check existing tables
    console.log('🔍 Checking existing tables...\n');
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('📭 No tables found in the database (fresh database)');
    } else {
      console.log(`📊 Found ${tablesResult.rows.length} table(s):\n`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name} (${row.table_type})`);
      });
    }
    console.log('');
    
    // Check for any existing data in tables
    if (tablesResult.rows.length > 0) {
      console.log('📈 Checking row counts...\n');
      for (const table of tablesResult.rows) {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
          const count = parseInt(countResult.rows[0].count);
          console.log(`   ${table.table_name}: ${count} row(s)`);
        } catch (err: any) {
          console.log(`   ${table.table_name}: Error - ${err.message}`);
        }
      }
    }
    
    console.log('\n✨ Database check complete!');
    
  } catch (error: any) {
    console.error('❌ Database connection/check failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    if (error.stack) {
      console.error('\n   Stack trace:', error.stack);
    }
  } finally {
    await pool.end();
  }
}

testConnection();

