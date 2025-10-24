import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jzB07dxYqOnv@ep-still-snowflake-a4hy02a6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  },
  max: 1,
  connectionTimeoutMillis: 10000,
});

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...\n');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'auth-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('📄 Executing schema file...\n');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Database schema created successfully!\n');
    
    // Verify tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    console.log('\n✨ Database initialization complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Add JWT_SECRET to your .env.local file');
    console.log('   2. Start the development server: pnpm dev');
    console.log('   3. Test signup at http://localhost:3000/signup\n');
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:');
    console.error('   Error:', error.message);
    if (error.stack) {
      console.error('\n   Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDatabase();

