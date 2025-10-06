const pool = require('../src/config/database');

async function insertDistributionsTestData() {
  try {
    // Check existing victims and supplies
    const victimsResult = await pool.query('SELECT victim_id, name FROM Victims ORDER BY victim_id');
    const suppliesResult = await pool.query('SELECT supply_id, item_name, current_quantity FROM Supplies ORDER BY supply_id');
    
    console.log('📋 Available Victims:', victimsResult.rows);
    console.log('📋 Available Supplies:', suppliesResult.rows);

    if (victimsResult.rows.length === 0) {
      console.log('❌ No victims found! Please run victim test data first.');
      return;
    }

    if (suppliesResult.rows.length === 0) {
      console.log('❌ No supplies found! Please run supply test data first.');
      return;
    }

    // Use existing victim_id and supply_id
    const distributions = [
      // Medical distributions
      {
        victim_id: 2, // Diya Patel (Diabetes) 
        supply_id: 1, // First available supply
        quantity_given: 5,
        date_distributed: '2025-09-29'
      },
      {
        victim_id: 4, // Ananya Gupta (Hypertension)
        supply_id: 2, // Second supply
        quantity_given: 3,
        date_distributed: '2025-09-30'
      },
      {
        victim_id: 6, // Saanvi Reddy (Asthma)
        supply_id: 1,
        quantity_given: 2,
        date_distributed: '2025-10-01'
      },

      // Food distributions
      {
        victim_id: 1, // Aarav Sharma
        supply_id: 2,
        quantity_given: 10,
        date_distributed: '2025-09-28'
      },
      {
        victim_id: 3, // Reyansh Kumar
        supply_id: 1,
        quantity_given: 15,
        date_distributed: '2025-09-27'
      },
      {
        victim_id: 5, // Vihaan Singh
        supply_id: 2,
        quantity_given: 8,
        date_distributed: '2025-09-25'
      },

      // Clothing distributions
      {
        victim_id: 7, // Ishaan Joshi
        supply_id: 1,
        quantity_given: 2,
        date_distributed: '2025-09-26'
      },
      {
        victim_id: 8, // Kavya Agarwal
        supply_id: 2,
        quantity_given: 3,
        date_distributed: '2025-09-24'
      },

      // Emergency distributions
      {
        victim_id: 1, // Aarav Sharma
        supply_id: 1,
        quantity_given: 1,
        date_distributed: '2025-09-23'
      },
      {
        victim_id: 2, // Diya Patel
        supply_id: 2,
        quantity_given: 1,
        date_distributed: '2025-09-22'
      },

      // Recent distributions
      {
        victim_id: 3, // Reyansh Kumar
        supply_id: 1,
        quantity_given: 5,
        date_distributed: '2025-10-02'
      },
      {
        victim_id: 4, // Ananya Gupta
        supply_id: 2,
        quantity_given: 7,
        date_distributed: '2025-10-02'
      }
    ];

    console.log('🔄 Inserting distributions test data...');
    
    for (const distribution of distributions) {
      // Verify victim and supply exist
      const victimExists = victimsResult.rows.find(v => v.victim_id === distribution.victim_id);
      const supplyExists = suppliesResult.rows.find(s => s.supply_id === distribution.supply_id);
      
      if (!victimExists) {
        console.log(`⚠️ Skipping distribution - victim_id ${distribution.victim_id} doesn't exist`);
        continue;
      }
      
      if (!supplyExists) {
        console.log(`⚠️ Skipping distribution - supply_id ${distribution.supply_id} doesn't exist`);
        continue;
      }
      
      const result = await pool.query(
        'INSERT INTO Distribution (victim_id, supply_id, quantity_given, date_distributed) VALUES ($1, $2, $3, $4) RETURNING *',
        [distribution.victim_id, distribution.supply_id, distribution.quantity_given, distribution.date_distributed]
      );
      console.log('✅ Created distribution:', result.rows[0]);
    }
    
    console.log('🎉 Distributions test data inserted successfully!');
    console.log('📊 Complete supply chain: Donor → Donation → Supply → Distribution → Victim');
    console.log('🔄 Medical distributions prioritized for victims with conditions');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertDistributionsTestData();
