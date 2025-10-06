const pool = require('../config/database');

class DistributionModel {
  // Get all distributions
  static async getAllDistributions() {
    try {
      const result = await pool.query('SELECT * FROM Distribution ORDER BY date_distributed DESC');
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions: ${error.message}`);
    }
  }

  // Get distribution by ID
  static async getDistributionById(id) {
    try {
      const result = await pool.query('SELECT * FROM Distribution WHERE distribution_id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching distribution: ${error.message}`);
    }
  }

  // Create new distribution
  static async createDistribution(distributionData) {
    const { victim_id, supply_id, quantity_given, date_distributed } = distributionData;
    try {
      const result = await pool.query(
        'INSERT INTO Distribution (victim_id, supply_id, quantity_given, date_distributed) VALUES ($1, $2, $3, $4) RETURNING *',
        [victim_id, supply_id, quantity_given, date_distributed]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating distribution: ${error.message}`);
    }
  }

  // Update distribution
  static async updateDistribution(id, distributionData) {
    const { victim_id, supply_id, quantity_given, date_distributed } = distributionData;
    try {
      const result = await pool.query(
        'UPDATE Distribution SET victim_id = $1, supply_id = $2, quantity_given = $3, date_distributed = $4 WHERE distribution_id = $5 RETURNING *',
        [victim_id, supply_id, quantity_given, date_distributed, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating distribution: ${error.message}`);
    }
  }

  // Delete distribution
  static async deleteDistribution(id) {
    try {
      const result = await pool.query('DELETE FROM Distribution WHERE distribution_id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting distribution: ${error.message}`);
    }
  }

  // Get distributions by victim
  static async getDistributionsByVictim(victim_id) {
    try {
      const result = await pool.query('SELECT * FROM Distribution WHERE victim_id = $1 ORDER BY date_distributed DESC', [victim_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions by victim: ${error.message}`);
    }
  }

  // Get distributions by supply
  static async getDistributionsBySupply(supply_id) {
    try {
      const result = await pool.query('SELECT * FROM Distribution WHERE supply_id = $1 ORDER BY date_distributed DESC', [supply_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions by supply: ${error.message}`);
    }
  }

  // Get distributions with full details
  static async getDistributionsWithDetails() {
    try {
      const result = await pool.query(`
        SELECT 
          d.*,
          v.name as victim_name,
          v.age as victim_age,
          v.medical_condition as victim_medical_condition,
          s.item_name as supply_item_name,
          s.category as supply_category,
          s.type as supply_type,
          rc.name as camp_name,
          rc.location as camp_location,
          aa.name as area_name,
          aa.state as area_state,
          don.type as donation_type,
          donor.name as donor_name
        FROM Distribution d
        LEFT JOIN Victims v ON d.victim_id = v.victim_id
        LEFT JOIN Supplies s ON d.supply_id = s.supply_id
        LEFT JOIN ReliefCamps rc ON s.camp_id = rc.camp_id
        LEFT JOIN AffectedAreas aa ON v.area_id = aa.area_id
        LEFT JOIN Donation don ON s.donation_id = don.donation_id
        LEFT JOIN Donor donor ON don.donor_id = donor.donor_id
        ORDER BY d.date_distributed DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions with details: ${error.message}`);
    }
  }

  // Get distribution statistics
  static async getDistributionStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_distributions,
          COALESCE(SUM(quantity_given), 0) as total_quantity_distributed,
          COUNT(DISTINCT victim_id)::int as unique_victims_served,
          COUNT(DISTINCT supply_id)::int as unique_supplies_distributed,
          ROUND(AVG(quantity_given), 2) as avg_quantity_per_distribution,
          COUNT(CASE WHEN date_distributed >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END)::int as distributions_last_week,
          COUNT(CASE WHEN date_distributed >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::int as distributions_last_month
        FROM Distribution
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching distribution statistics: ${error.message}`);
    }
  }

  // Get recent distributions (last 7 days)
  static async getRecentDistributions() {
    try {
      const result = await pool.query(`
        SELECT 
          d.*,
          v.name as victim_name,
          s.item_name as supply_item_name,
          rc.name as camp_name
        FROM Distribution d
        LEFT JOIN Victims v ON d.victim_id = v.victim_id
        LEFT JOIN Supplies s ON d.supply_id = s.supply_id
        LEFT JOIN ReliefCamps rc ON s.camp_id = rc.camp_id
        WHERE d.date_distributed >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY d.date_distributed DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching recent distributions: ${error.message}`);
    }
  }
}

module.exports = DistributionModel;
