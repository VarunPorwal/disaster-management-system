const pool = require('../src/config/database');

async function insertSuppliesTestData() {
  try {
    // Check existing camps and donations
    const campsResult = await pool.query('SELECT camp_id, name FROM ReliefCamps ORDER BY camp_id');
    const donationsResult = await pool.query('SELECT donation_id, type, description FROM Donation ORDER BY donation_id');
    
    console.log('📋 Available Camps:', campsResult.rows);
    console.log('📋 Available Donations:', donationsResult.rows);

    // Use the ACTUAL donation IDs that exist (9-20)
    const supplies = [
      // Food supplies from donations
      { camp_id: 1, donation_id: 12, type: 'Food', quantity: 100, current_quantity: 75, category: 'Grains', item_name: 'Rice Bags', expiry_date: '2026-03-15', status: 'Available' },
      { camp_id: 2, donation_id: 13, type: 'Food', quantity: 500, current_quantity: 350, category: 'Ready Meals', item_name: 'Ready-to-eat Packets', expiry_date: '2025-12-31', status: 'Available' },
      { camp_id: 4, donation_id: 20, type: 'Food', quantity: 50, current_quantity: 35, category: 'Grains', item_name: 'Wheat Flour Bags', expiry_date: '2026-01-15', status: 'Available' },
      
      // Medicine supplies
      { camp_id: 1, donation_id: 14, type: 'Medicine', quantity: 200, current_quantity: 180, category: 'Pain Relief', item_name: 'Paracetamol Tablets', expiry_date: '2027-06-30', status: 'Available' },
      { camp_id: 3, donation_id: 15, type: 'Medical Supplies', quantity: 100, current_quantity: 85, category: 'First Aid', item_name: 'First Aid Kits', expiry_date: null, status: 'Available' },
      
      // Clothing supplies
      { camp_id: 2, donation_id: 16, type: 'Clothing', quantity: 500, current_quantity: 400, category: 'Blankets', item_name: 'Winter Blankets', expiry_date: null, status: 'Available' },
      { camp_id: 4, donation_id: 17, type: 'Clothing', quantity: 300, current_quantity: 250, category: 'Children Wear', item_name: 'Children Clothing Sets', expiry_date: null, status: 'Available' },
      
      // Emergency supplies from cash conversion
      { camp_id: 1, donation_id: 9, type: 'Water', quantity: 200, current_quantity: 120, category: 'Drinking Water', item_name: 'Water Bottles 1L', expiry_date: '2026-01-15', status: 'Available' },
      { camp_id: 3, donation_id: 10, type: 'Sanitation', quantity: 100, current_quantity: 80, category: 'Hygiene', item_name: 'Soap and Sanitizer Kits', expiry_date: '2027-08-30', status: 'Available' },
      { camp_id: 2, donation_id: 11, type: 'Emergency Supplies', quantity: 75, current_quantity: 50, category: 'Survival Kits', item_name: 'Emergency Survival Kits', expiry_date: '2028-01-01', status: 'Available' },
      
      // Low stock items
      { camp_id: 1, donation_id: 14, type: 'Medicine', quantity: 100, current_quantity: 15, category: 'Antibiotics', item_name: 'Amoxicillin Tablets', expiry_date: '2027-02-28', status: 'Low Stock' },
      
      // Nearly expired items
      { camp_id: 2, donation_id: 13, type: 'Food', quantity: 50, current_quantity: 45, category: 'Dairy', item_name: 'Milk Powder Packets', expiry_date: '2025-11-30', status: 'Expiring Soon' }
    ];

    console.log('🔄 Inserting supplies test data with CORRECT donation IDs...');
    
    for (const supply of supplies) {
      // Verify camp and donation exist
      const campExists = campsResult.rows.find(c => c.camp_id === supply.camp_id);
      const donationExists = donationsResult.rows.find(d => d.donation_id === supply.donation_id);
      
      if (!campExists) {
        console.log(`⚠️ Skipping supply ${supply.item_name} - camp_id ${supply.camp_id} doesn't exist`);
        continue;
      }
      
      if (!donationExists) {
        console.log(`⚠️ Skipping supply ${supply.item_name} - donation_id ${supply.donation_id} doesn't exist`);
        continue;
      }
      
      const result = await pool.query(
        'INSERT INTO Supplies (camp_id, donation_id, type, quantity, current_quantity, category, item_name, expiry_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [supply.camp_id, supply.donation_id, supply.type, supply.quantity, supply.current_quantity, supply.category, supply.item_name, supply.expiry_date, supply.status]
      );
      console.log('✅ Created supply:', result.rows[0]);
    }
    
    console.log('🎉 ALL supplies test data inserted successfully!');
    console.log('📊 Total supplies created with various statuses and categories');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertSuppliesTestData();
