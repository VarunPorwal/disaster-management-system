const pool = require('../src/config/database');

async function insertTestData() {
  try {
    // Insert sample disasters
    const disasters = [
      { type: 'Flood', date: '2025-09-15', severity: 'High', status: 'Active' },
      { type: 'Earthquake', date: '2025-09-20', severity: 'Critical', status: 'Active' },
      { type: 'Cyclone', date: '2025-08-10', severity: 'Medium', status: 'Resolved' }
    ];

    console.log('🔄 Inserting test data...');
    
    for (const disaster of disasters) {
      const result = await pool.query(
        'INSERT INTO disaster (type, date, severity, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [disaster.type, disaster.date, disaster.severity, disaster.status]
      );
      console.log('✅ Created:', result.rows[0]);
    }
    
    console.log('🎉 Test data inserted successfully!');
    console.log('🌐 Test your API at: http://localhost:5000/api/disasters');
    
  } catch (error) {
    console.error('❌ Error inserting test data:', error.message);
  } finally {
    await pool.end();
  }
}

insertTestData();
