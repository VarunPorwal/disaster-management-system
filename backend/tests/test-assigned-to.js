const pool = require('../src/config/database');

async function insertAssignedToTestData() {
  try {
    // Check existing volunteers and areas
    const volunteersResult = await pool.query('SELECT volunteer_id, name, skills FROM Volunteers ORDER BY volunteer_id');
    const areasResult = await pool.query('SELECT area_id, name, state FROM AffectedAreas ORDER BY area_id');
    
    console.log('📋 Available Volunteers:', volunteersResult.rows);
    console.log('📋 Available Areas:', areasResult.rows);

    // Area assignments based on volunteer expertise and location
    const areaAssignments = [
      // Dr. Aditi Sharma (Medical) - assigned to coastal areas
      { volunteer_id: 1, area_id: 1, assign_date: '2025-09-15' }, // Coastal Odisha
      
      // Rohan Malhotra (Engineering) - flood-affected infrastructure
      { volunteer_id: 2, area_id: 2, assign_date: '2025-08-20' }, // North Bihar
      
      // Kavya Iyer (Social Work) - mountain communities
      { volunteer_id: 3, area_id: 3, assign_date: '2025-07-10' }, // Uttarakhand Hills
      
      // Arjun Kapoor (Logistics) - drought management
      { volunteer_id: 4, area_id: 4, assign_date: '2025-06-01' }, // Marathwada Region
      
      // Riya Agarwal (Nursing) - coastal medical support
      { volunteer_id: 5, area_id: 1, assign_date: '2025-09-20' }, // Coastal Odisha
      
      // Karthik Reddy (Rescue) - mountain rescue operations
      { volunteer_id: 6, area_id: 3, assign_date: '2025-07-15' }, // Uttarakhand Hills
      
      // Cross assignments for better coverage
      { volunteer_id: 1, area_id: 2, assign_date: '2025-09-01' }, // Dr. Aditi to Bihar
      { volunteer_id: 3, area_id: 1, assign_date: '2025-09-10' }, // Kavya to Odisha
      { volunteer_id: 5, area_id: 4, assign_date: '2025-08-15' }, // Riya to Marathwada
      { volunteer_id: 6, area_id: 2, assign_date: '2025-08-25' }  // Karthik to Bihar
    ];

    console.log('🔄 Inserting area assignments test data...');
    
    for (const assignment of areaAssignments) {
      // Verify volunteer and area exist
      const volunteerExists = volunteersResult.rows.find(v => v.volunteer_id === assignment.volunteer_id);
      const areaExists = areasResult.rows.find(a => a.area_id === assignment.area_id);
      
      if (!volunteerExists) {
        console.log(`⚠️ Skipping assignment - volunteer_id ${assignment.volunteer_id} doesn't exist`);
        continue;
      }
      
      if (!areaExists) {
        console.log(`⚠️ Skipping assignment - area_id ${assignment.area_id} doesn't exist`);
        continue;
      }
      
      const result = await pool.query(
        'INSERT INTO AssignedTo (volunteer_id, area_id, assign_date) VALUES ($1, $2, $3) RETURNING *',
        [assignment.volunteer_id, assignment.area_id, assignment.assign_date]
      );
      console.log('✅ Created area assignment:', result.rows[0]);
    }
    
    console.log('🎉 Area assignments test data inserted successfully!');
    console.log('🗺️ Volunteers now assigned to multiple areas for comprehensive coverage');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertAssignedToTestData();
