const pool = require('../src/config/database');

async function insertWorksAtTestData() {
  try {
    // Check existing volunteers and camps
    const volunteersResult = await pool.query('SELECT volunteer_id, name, skills FROM Volunteers ORDER BY volunteer_id');
    const campsResult = await pool.query('SELECT camp_id, name FROM ReliefCamps ORDER BY camp_id');
    
    console.log('📋 Available Volunteers:', volunteersResult.rows);
    console.log('📋 Available Camps:', campsResult.rows);

    // Work assignments based on volunteer skills
    const workAssignments = [
      // Dr. Aditi Sharma (Medical) - works at multiple camps
      { volunteer_id: 1, camp_id: 1, role: 'Medical Officer' },
      { volunteer_id: 1, camp_id: 3, role: 'Emergency Medical Support' },
      
      // Rohan Malhotra (Engineering) - infrastructure support
      { volunteer_id: 2, camp_id: 2, role: 'Infrastructure Manager' },
      { volunteer_id: 2, camp_id: 4, role: 'Technical Consultant' },
      
      // Kavya Iyer (Social Work) - victim support
      { volunteer_id: 3, camp_id: 1, role: 'Social Worker' },
      { volunteer_id: 3, camp_id: 2, role: 'Counselor' },
      
      // Arjun Kapoor (Logistics) - supply management
      { volunteer_id: 4, camp_id: 3, role: 'Logistics Coordinator' },
      { volunteer_id: 4, camp_id: 4, role: 'Supply Chain Manager' },
      
      // Riya Agarwal (Nursing) - medical support
      { volunteer_id: 5, camp_id: 1, role: 'Head Nurse' },
      { volunteer_id: 5, camp_id: 2, role: 'Medical Assistant' },
      
      // Karthik Reddy (Rescue) - emergency response
      { volunteer_id: 6, camp_id: 3, role: 'Emergency Response Coordinator' },
      { volunteer_id: 6, camp_id: 1, role: 'Safety Officer' }
    ];

    console.log('🔄 Inserting work assignments test data...');
    
    for (const assignment of workAssignments) {
      // Verify volunteer and camp exist
      const volunteerExists = volunteersResult.rows.find(v => v.volunteer_id === assignment.volunteer_id);
      const campExists = campsResult.rows.find(c => c.camp_id === assignment.camp_id);
      
      if (!volunteerExists) {
        console.log(`⚠️ Skipping assignment - volunteer_id ${assignment.volunteer_id} doesn't exist`);
        continue;
      }
      
      if (!campExists) {
        console.log(`⚠️ Skipping assignment - camp_id ${assignment.camp_id} doesn't exist`);
        continue;
      }
      
      const result = await pool.query(
        'INSERT INTO WorksAt (volunteer_id, camp_id, role) VALUES ($1, $2, $3) RETURNING *',
        [assignment.volunteer_id, assignment.camp_id, assignment.role]
      );
      console.log('✅ Created work assignment:', result.rows[0]);
    }
    
    console.log('🎉 Work assignments test data inserted successfully!');
    console.log('👥 Volunteers now working at multiple camps with specific roles');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertWorksAtTestData();
