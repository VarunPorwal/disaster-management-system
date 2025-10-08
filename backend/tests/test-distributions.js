const pool = require('../src/config/database');

async function insertDistributionsTestData() {
  try {
    console.log('🔄 Preparing distribution test data...');
    
    // Get existing data to work with
    const requestsResult = await pool.query('SELECT request_id, victim_id, item_requested, quantity_needed FROM Request WHERE status = $1', ['Fulfilled']);
    const suppliesResult = await pool.query('SELECT supply_id, item_name, current_quantity FROM Supplies WHERE current_quantity > 0');
    const victimsResult = await pool.query('SELECT victim_id, name FROM Victims ORDER BY victim_id');
    
    console.log('📋 Fulfilled Requests:', requestsResult.rows.length);
    console.log('📋 Available Supplies:', suppliesResult.rows.length);
    console.log('📋 Available Victims:', victimsResult.rows.length);
    
    if (suppliesResult.rows.length === 0) {
      console.log('❌ No supplies found! Please run supply test data first.');
      return;
    }
    
    if (victimsResult.rows.length === 0) {
      console.log('❌ No victims found! Please run victim test data first.');
      return;
    }
    
    // Use ACTUAL existing supply_ids and victim_ids
    const actualSupplies = suppliesResult.rows;
    const actualVictims = victimsResult.rows;
    const actualRequests = requestsResult.rows;
    
    console.log('🔍 First few supplies:', actualSupplies.slice(0, 5));
    console.log('🔍 First few victims:', actualVictims.slice(0, 5));
    
    // Create distributions using REAL data
    const distributions = [];
    
    // If we have fulfilled requests, link distributions to them
    if (actualRequests.length > 0) {
      console.log('✅ Creating distributions linked to fulfilled requests...');
      actualRequests.forEach((req, index) => {
        if (index < actualSupplies.length) {
          distributions.push({
            request_id: req.request_id,
            victim_id: req.victim_id,
            supply_id: actualSupplies[index].supply_id,
            quantity_distributed: Math.min(req.quantity_needed, actualSupplies[index].current_quantity)
          });
        }
      });
    }
    
    // Add direct distributions (no request_id) using remaining supplies
    console.log('✅ Creating direct distributions...');
    for (let i = 0; i < Math.min(5, actualSupplies.length, actualVictims.length); i++) {
      const supply = actualSupplies[i];
      const victim = actualVictims[i];
      
      if (supply.current_quantity > 0) {
        distributions.push({
          request_id: null,  // Direct distribution
          victim_id: victim.victim_id,
          supply_id: supply.supply_id,
          quantity_distributed: Math.min(supply.current_quantity, 5) // Distribute max 5 units
        });
      }
    }
    
    console.log(`🔄 Inserting ${distributions.length} distributions...`);
    
    let successCount = 0;
    for (const distribution of distributions) {
      try {
        const result = await pool.query(
          'INSERT INTO Distribution (request_id, victim_id, supply_id, quantity_distributed, distribution_date) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *',
          [distribution.request_id, distribution.victim_id, distribution.supply_id, distribution.quantity_distributed]
        );
        
        console.log(`✅ Distribution ${successCount + 1}:`, {
          id: result.rows[0].distribution_id,
          request_id: distribution.request_id,
          victim_id: distribution.victim_id,
          supply_id: distribution.supply_id,
          quantity: distribution.quantity_distributed
        });
        
        // Update supply stock
        await pool.query(
          'UPDATE Supplies SET current_quantity = current_quantity - $1 WHERE supply_id = $2',
          [distribution.quantity_distributed, distribution.supply_id]
        );
        
        successCount++;
      } catch (error) {
        console.log(`⚠️ Failed distribution ${distribution.victim_id} -> ${distribution.supply_id}:`, error.message);
      }
    }
    
    // Final statistics
    const stats = await pool.query(`
      SELECT 
        COUNT(*)::int as total_distributions,
        COUNT(DISTINCT victim_id)::int as victims_served,
        COUNT(DISTINCT supply_id)::int as supplies_used,
        COUNT(CASE WHEN request_id IS NOT NULL THEN 1 END)::int as request_linked,
        COUNT(CASE WHEN request_id IS NULL THEN 1 END)::int as direct_distributions,
        SUM(quantity_distributed)::int as total_items_distributed
      FROM Distribution
    `);
    
    console.log('\n🎉 Distribution Test Data Inserted Successfully!');
    console.log('📊 Final Statistics:', stats.rows[0]);
    console.log(`✅ Created ${successCount} distributions successfully`);
    console.log('🔗 Some linked to requests, some direct distributions');
    console.log('📉 Supply stock automatically updated');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertDistributionsTestData();
