const pool = require('../src/config/database');

async function insertReliefCampsTestData() {
  try {
    // First, let's check what areas and volunteers exist
    const areasResult = await pool.query('SELECT area_id, name FROM AffectedAreas ORDER BY area_id');
    const volunteersResult = await pool.query('SELECT volunteer_id, name FROM Volunteers ORDER BY volunteer_id');
    
    console.log('📋 Available Areas:', areasResult.rows);
    console.log('📋 Available Volunteers:', volunteersResult.rows);
    
    // Use only the areas that actually exist (probably 1-4, not 5)
    const reliefCamps = [
      {
        area_id: 1, // Coastal Odisha
        manager_id: 1, // Dr. Aditi Sharma
        name: 'Puri Cyclone Relief Camp',
        capacity: 500,
        current_occupancy: 380,
        location: 'Government School Ground, Puri',
        date_established: '2025-09-16',
        status: 'Active',
        latitude: 19.8135,
        longitude: 85.8312
      },
      {
        area_id: 2, // North Bihar
        manager_id: 2, // Rohan Malhotra
        name: 'Sitamarhi Flood Relief Center',
        capacity: 800,
        current_occupancy: 750,
        location: 'Community Hall, Sitamarhi',
        date_established: '2025-08-21',
        status: 'Active',
        latitude: 26.5933,
        longitude: 85.4881
      },
      {
        area_id: 3, // Uttarakhand Hills
        manager_id: 3, // Kavya Iyer
        name: 'Chamoli Emergency Camp',
        capacity: 200,
        current_occupancy: 45,
        location: 'District Collector Office, Chamoli',
        date_established: '2025-07-11',
        status: 'Active',
        latitude: 30.4017,
        longitude: 79.3206
      },
      {
        area_id: 4, // Marathwada Region  
        manager_id: 4, // Arjun Kapoor
        name: 'Aurangabad Drought Relief Camp',
        capacity: 1000,
        current_occupancy: 850,
        location: 'Sports Complex, Aurangabad',
        date_established: '2025-06-02',
        status: 'Active',
        latitude: 19.8762,
        longitude: 75.3433
      }
      // Removed area_id: 5 since it doesn't exist
    ];

    console.log('🔄 Inserting Indian relief camps test data...');
    
    for (const camp of reliefCamps) {
      // Check if area_id and manager_id exist before inserting
      const areaExists = areasResult.rows.find(a => a.area_id === camp.area_id);
      const managerExists = volunteersResult.rows.find(v => v.volunteer_id === camp.manager_id);
      
      if (!areaExists) {
        console.log(`⚠️  Skipping camp ${camp.name} - area_id ${camp.area_id} doesn't exist`);
        continue;
      }
      
      if (!managerExists) {
        console.log(`⚠️  Skipping camp ${camp.name} - manager_id ${camp.manager_id} doesn't exist`);
        continue;
      }
      
      const result = await pool.query(
        `INSERT INTO ReliefCamps 
         (area_id, manager_id, name, capacity, current_occupancy, location, date_established, status, latitude, longitude, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [camp.area_id, camp.manager_id, camp.name, camp.capacity, camp.current_occupancy, camp.location, camp.date_established, camp.status, camp.latitude, camp.longitude]
      );
      console.log('✅ Created relief camp:', result.rows[0]);
    }
    
    console.log('🎉 Indian relief camps test data inserted successfully!');
    console.log('🌐 Test your API at: http://localhost:5000/api/camps');
    
  } catch (error) {
    console.error('❌ Error inserting relief camps test data:', error.message);
  } finally {
    await pool.end();
  }
}

insertReliefCampsTestData();
