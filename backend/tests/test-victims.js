const pool = require('../src/config/database');

async function insertVictimsTestData() {
  try {
    // Check existing areas and camps
    const areasResult = await pool.query('SELECT area_id, name FROM AffectedAreas ORDER BY area_id');
    const campsResult = await pool.query('SELECT camp_id, name FROM ReliefCamps ORDER BY camp_id');
    
    console.log('📋 Available Areas:', areasResult.rows);
    console.log('📋 Available Camps:', campsResult.rows);
    
    // Victims data with Indian names
    const victims = [
      {
        area_id: 1, // Coastal Odisha
        camp_id: 1, // Puri Cyclone Relief Camp
        name: 'Aarav Sharma',
        age: 34,
        gender: 'Male',
        contact: '+91-9876543210',
        address: 'Village Jagannathpur, Puri District',
        medical_condition: null
      },
      {
        area_id: 1,
        camp_id: 1,
        name: 'Diya Patel',
        age: 28,
        gender: 'Female',
        contact: '+91-8765432109',
        address: 'Seaside Colony, Puri',
        medical_condition: 'Diabetes'
      },
      {
        area_id: 2, // North Bihar
        camp_id: 2, // Sitamarhi Flood Relief Center
        name: 'Reyansh Kumar',
        age: 42,
        gender: 'Male',
        contact: '+91-7654321098',
        address: 'Ward 5, Sitamarhi Town',
        medical_condition: null
      },
      {
        area_id: 2,
        camp_id: 2,
        name: 'Ananya Gupta',
        age: 36,
        gender: 'Female',
        contact: '+91-9988776655',
        address: 'Flood affected area, Sitamarhi',
        medical_condition: 'Hypertension'
      },
      {
        area_id: 3, // Uttarakhand Hills
        camp_id: 3, // Chamoli Emergency Camp
        name: 'Vihaan Singh',
        age: 29,
        gender: 'Male',
        contact: '+91-8877665544',
        address: 'Mountain Village, Chamoli',
        medical_condition: null
      },
      {
        area_id: 4, // Marathwada Region
        camp_id: 4, // Aurangabad Drought Relief Camp
        name: 'Saanvi Reddy',
        age: 31,
        gender: 'Female',
        contact: '+91-7766554433',
        address: 'Drought affected village, Aurangabad',
        medical_condition: 'Asthma'
      },
      {
        area_id: 1,
        camp_id: null, // Not in any camp yet
        name: 'Ishaan Joshi',
        age: 45,
        gender: 'Male',
        contact: '+91-9876012345',
        address: 'Coastal Road, Puri',
        medical_condition: null
      },
      {
        area_id: 2,
        camp_id: null,
        name: 'Kavya Agarwal',
        age: 25,
        gender: 'Female',
        contact: '+91-8765012346',
        address: 'Rural Area, Bihar',
        medical_condition: null
      }
    ];

    console.log('🔄 Inserting Indian victims test data...');
    
    for (const victim of victims) {
      // Verify area exists
      const areaExists = areasResult.rows.find(a => a.area_id === victim.area_id);
      if (!areaExists) {
        console.log(`⚠️  Skipping victim ${victim.name} - area_id ${victim.area_id} doesn't exist`);
        continue;
      }
      
      // Verify camp exists (if specified)
      if (victim.camp_id) {
        const campExists = campsResult.rows.find(c => c.camp_id === victim.camp_id);
        if (!campExists) {
          console.log(`⚠️  Skipping victim ${victim.name} - camp_id ${victim.camp_id} doesn't exist`);
          continue;
        }
      }
      
      const result = await pool.query(
        `INSERT INTO Victims 
         (area_id, camp_id, name, age, gender, contact, address, medical_condition, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [victim.area_id, victim.camp_id, victim.name, victim.age, victim.gender, victim.contact, victim.address, victim.medical_condition]
      );
      console.log('✅ Created victim:', result.rows[0]);
    }
    
    console.log('🎉 Indian victims test data inserted successfully!');
    console.log('🌐 Test your API at: http://localhost:5000/api/victims');
    
  } catch (error) {
    console.error('❌ Error inserting victims test data:', error.message);
  } finally {
    await pool.end();
  }
}

insertVictimsTestData();
