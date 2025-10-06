const pool = require('../src/config/database');

async function insertDonationsTestData() {
  try {
    // Check existing donors
    const donorsResult = await pool.query('SELECT donor_id, name FROM Donor ORDER BY donor_id');
    console.log('📋 Available Donors:', donorsResult.rows);

    // Enhanced donations with proper fields
    const donations = [
      // Cash donations
      {
        donor_id: 1, 
        type: 'Cash', 
        date: '2025-09-15', 
        amount: 500000, 
        quantity: null, 
        unit: null, 
        description: 'Emergency relief fund for cyclone victims', 
        estimated_value: 500000
      },
      {
        donor_id: 5, 
        type: 'Cash', 
        date: '2025-09-19', 
        amount: 25000, 
        quantity: null, 
        unit: null, 
        description: 'Individual contribution for disaster relief', 
        estimated_value: 25000
      },
      {
        donor_id: 9, 
        type: 'Cash', 
        date: '2025-09-25', 
        amount: 1000000, 
        quantity: null, 
        unit: null, 
        description: 'Government disaster relief fund', 
        estimated_value: 1000000
      },

      // Food donations
      {
        donor_id: 2, 
        type: 'Food', 
        date: '2025-09-16', 
        amount: null, 
        quantity: 100, 
        unit: 'kg', 
        description: 'Rice bags 25kg each for relief camps', 
        estimated_value: 15000
      },
      {
        donor_id: 7, 
        type: 'Food', 
        date: '2025-09-21', 
        amount: null, 
        quantity: 500, 
        unit: 'packets', 
        description: 'Ready-to-eat meal packets', 
        estimated_value: 25000
      },

      // Medicine donations  
      {
        donor_id: 3, 
        type: 'Medicine', 
        date: '2025-09-17', 
        amount: null, 
        quantity: 200, 
        unit: 'boxes', 
        description: 'Paracetamol tablets 500mg, 10 tablets per box', 
        estimated_value: 8000
      },
      {
        donor_id: 6, 
        type: 'Medical Supplies', 
        date: '2025-09-20', 
        amount: null, 
        quantity: 100, 
        unit: 'units', 
        description: 'First aid kits with bandages and antiseptic', 
        estimated_value: 15000
      },

      // Clothing donations
      {
        donor_id: 4, 
        type: 'Clothing', 
        date: '2025-09-18', 
        amount: null, 
        quantity: 500, 
        unit: 'pieces', 
        description: 'Winter blankets and warm clothes', 
        estimated_value: 25000
      },
      {
        donor_id: 8, 
        type: 'Clothing', 
        date: '2025-09-22', 
        amount: null, 
        quantity: 300, 
        unit: 'sets', 
        description: 'Children clothing sets (shirt, pant, inner wear)', 
        estimated_value: 18000
      },

      // Mixed supplies
      {
        donor_id: 12, 
        type: 'Emergency Supplies', 
        date: '2025-09-23', 
        amount: null, 
        quantity: 50, 
        unit: 'kits', 
        description: 'Emergency survival kits with water, food, torch', 
        estimated_value: 30000
      }
    ];

    console.log('🔄 Inserting enhanced donation test data...');
    
    for (const donation of donations) {
      const donorExists = donorsResult.rows.find(d => d.donor_id === donation.donor_id);
      if (!donorExists) {
        console.log(`⚠️ Skipping - donor_id ${donation.donor_id} doesn't exist`);
        continue;
      }
      
      const result = await pool.query(
        'INSERT INTO Donation (donor_id, type, date, amount, quantity, unit, description, estimated_value, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
        [donation.donor_id, donation.type, donation.date, donation.amount, donation.quantity, donation.unit, donation.description, donation.estimated_value]
      );
      console.log('✅ Created donation:', result.rows[0]);
    }
    
    console.log('🎉 Enhanced donation test data inserted successfully!');
    console.log('💰 Total estimated value:', donations.reduce((sum, d) => sum + (d.estimated_value || 0), 0));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertDonationsTestData();
