const pool = require('./src/config/database');

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic Connection');
    const timeResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected at:', timeResult.rows[0].current_time);
    
    // Test 2: Check database name
    console.log('\nTest 2: Database Info');
    const dbResult = await pool.query('SELECT current_database() as db_name');
    console.log('✅ Connected to database:', dbResult.rows[0].db_name);
    
    // Test 3: List all tables
    console.log('\nTest 3: Available Tables');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log('   -', row.table_name);
      });
    } else {
      console.log('⚠️  No tables found. Did you create your tables?');
    }
    
    // Test 4: Test one table (if exists)
    const checkDisaster = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'disaster'
      ) as table_exists
    `);
    
    if (checkDisaster.rows[0].table_exists) {
      console.log('\nTest 4: Sample Data Query');
      const disasterData = await pool.query('SELECT COUNT(*) as count FROM disaster');
      console.log('✅ Disaster table has', disasterData.rows[0].count, 'records');
    }
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    // Common error suggestions
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Suggestion: Check your PostgreSQL password in .env file');
    }
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 Suggestion: Create the "disaster_management" database first');
    }
    if (error.message.includes('connection refused')) {
      console.error('\n💡 Suggestion: Make sure PostgreSQL service is running');
    }
  } finally {
    await pool.end();
    console.log('\n🔒 Database connection closed');
  }
}

testDatabase();
