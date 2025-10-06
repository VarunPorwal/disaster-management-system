const pool = require('../src/config/database');

async function insertRequestsTestData() {
  try {
    // Check existing victims and camps
    const victimsResult = await pool.query('SELECT victim_id, name, area_id FROM Victims ORDER BY victim_id');
    const campsResult = await pool.query('SELECT camp_id, name FROM ReliefCamps ORDER BY camp_id');
    
    console.log('📋 Available Victims:', victimsResult.rows);
    console.log('📋 Available Camps:', campsResult.rows);

    if (victimsResult.rows.length === 0) {
      console.log('❌ No victims found! Please run victim test data first.');
      return;
    }

    if (campsResult.rows.length === 0) {
      console.log('❌ No camps found! Please check camps data.');
      return;
    }

    // Use existing victim_id (1-8) and camp_id (1,2,3,4,6,7,8,9)
    const requests = [
      // High priority medical requests
      {
        victim_id: 1, // Aarav Sharma
        camp_id: 1,   // Puri Cyclone Relief Camp
        item_requested: 'Medicine',
        quantity_needed: 10,
        priority: 'High',
        status: 'Pending',
        request_date: '2025-10-01'
      },
      {
        victim_id: 2, // Diya Patel (has Diabetes)
        camp_id: 1,
        item_requested: 'Insulin',
        quantity_needed: 5,
        priority: 'High',
        status: 'Pending',
        request_date: '2025-10-01'
      },
      {
        victim_id: 4, // Ananya Gupta (has Hypertension)
        camp_id: 2,   // Sitamarhi Flood Relief Center
        item_requested: 'Blood Pressure Medicine',
        quantity_needed: 30,
        priority: 'High',
        status: 'Pending',
        request_date: '2025-09-30'
      },

      // Food requests
      {
        victim_id: 3, // Reyansh Kumar
        camp_id: 2,
        item_requested: 'Rice',
        quantity_needed: 5,
        priority: 'Medium',
        status: 'Pending',
        request_date: '2025-10-02'
      },
      {
        victim_id: 5, // Vihaan Singh
        camp_id: 3,   // Chamoli Emergency Camp
        item_requested: 'Ready-to-eat Meals',
        quantity_needed: 15,
        priority: 'Medium',
        status: 'Fulfilled',
        request_date: '2025-09-28',
        fulfilled_date: '2025-09-29'
      },
      {
        victim_id: 7, // Ishaan Joshi
        camp_id: 1,
        item_requested: 'Water Bottles',
        quantity_needed: 20,
        priority: 'High',
        status: 'Fulfilled',
        request_date: '2025-09-25',
        fulfilled_date: '2025-09-26'
      },

      // Clothing requests
      {
        victim_id: 6, // Saanvi Reddy (has Asthma)
        camp_id: 4,   // Aurangabad Drought Relief Camp
        item_requested: 'Blankets',
        quantity_needed: 2,
        priority: 'Medium',
        status: 'Pending',
        request_date: '2025-10-01'
      },
      {
        victim_id: 8, // Kavya Agarwal
        camp_id: 2,
        item_requested: 'Children Clothing',
        quantity_needed: 3,
        priority: 'Low',
        status: 'Pending',
        request_date: '2025-10-02'
      },

      // Medical supplies
      {
        victim_id: 1, // Aarav Sharma
        camp_id: 1,
        item_requested: 'First Aid Kit',
        quantity_needed: 1,
        priority: 'Low',
        status: 'Fulfilled',
        request_date: '2025-09-20',
        fulfilled_date: '2025-09-22'
      },
      {
        victim_id: 6, // Saanvi Reddy (Asthma)
        camp_id: 4,
        item_requested: 'Inhaler',
        quantity_needed: 2,
        priority: 'High',
        status: 'Pending',
        request_date: '2025-10-01'
      },

      // Hygiene requests
      {
        victim_id: 3, // Reyansh Kumar
        camp_id: 2,
        item_requested: 'Soap and Sanitizer',
        quantity_needed: 5,
        priority: 'Low',
        status: 'Fulfilled',
        request_date: '2025-09-15',
        fulfilled_date: '2025-09-18'
      },
      {
        victim_id: 4, // Ananya Gupta
        camp_id: 2,
        item_requested: 'Hygiene Kit',
        quantity_needed: 1,
        priority: 'Medium',
        status: 'Pending',
        request_date: '2025-10-02'
      }
    ];

    console.log('🔄 Inserting requests test data...');
    
    for (const request of requests) {
      // Verify victim and camp exist
      const victimExists = victimsResult.rows.find(v => v.victim_id === request.victim_id);
      const campExists = campsResult.rows.find(c => c.camp_id === request.camp_id);
      
      if (!victimExists) {
        console.log(`⚠️ Skipping request - victim_id ${request.victim_id} doesn't exist`);
        continue;
      }
      
      if (!campExists) {
        console.log(`⚠️ Skipping request - camp_id ${request.camp_id} doesn't exist`);
        continue;
      }
      
      const result = await pool.query(
        'INSERT INTO Request (victim_id, camp_id, item_requested, quantity_needed, priority, status, request_date, fulfilled_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
        [request.victim_id, request.camp_id, request.item_requested, request.quantity_needed, request.priority, request.status, request.request_date, request.fulfilled_date || null]
      );
      console.log('✅ Created request:', result.rows[0]);
    }
    
    console.log('🎉 Requests test data inserted successfully!');
    console.log('📊 Created various priority levels and status types');
    console.log('🚨 High priority medical requests created for victims with conditions');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertRequestsTestData();
