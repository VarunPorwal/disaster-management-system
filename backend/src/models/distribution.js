const pool = require('../config/database');

class DistributionModel {
  static async getAllDistributions() {
    try {
      const result = await pool.query('SELECT * FROM Distribution ORDER BY distribution_date DESC');
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions: ${error.message}`);
    }
  }

  static async getDistributionById(id) {
    try {
      const result = await pool.query('SELECT * FROM Distribution WHERE distribution_id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching distribution: ${error.message}`);
    }
  }

  static async createDistribution(distributionData) {
    const { request_id, victim_id, supply_id, quantity_distributed } = distributionData;
    
    if (!request_id) {
      throw new Error('Distributions must be linked to a request. Please create a request first.');
    }
    
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await client.query('INSERT INTO Distribution (request_id, victim_id, supply_id, quantity_distributed, distribution_date) VALUES ($1, $2, $3, $4, CURRENT_DATE) RETURNING *', [request_id, victim_id, supply_id, quantity_distributed]);
        if (supply_id) await client.query('UPDATE Supplies SET current_quantity = current_quantity - $1 WHERE supply_id = $2', [quantity_distributed, supply_id]);
        await client.query('UPDATE Request SET status = $1, fulfilled_date = CURRENT_DATE WHERE request_id = $2', ['Fulfilled', request_id]);
        await client.query('COMMIT');
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      throw new Error(`Error creating distribution: ${error.message}`);
    }
  }

  static async updateDistribution(id, distributionData) {
    const { request_id, victim_id, supply_id, quantity_distributed } = distributionData;
    if (!request_id) throw new Error('Distributions must be linked to a request.');
    try {
      const result = await pool.query('UPDATE Distribution SET request_id = $1, victim_id = $2, supply_id = $3, quantity_distributed = $4 WHERE distribution_id = $5 RETURNING *', [request_id, victim_id, supply_id, quantity_distributed, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating distribution: ${error.message}`);
    }
  }

  static async deleteDistribution(id) {
    try {
      const result = await pool.query('DELETE FROM Distribution WHERE distribution_id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting distribution: ${error.message}`);
    }
  }

  static async getDistributionsByVictim(victim_id) {
    try {
      const result = await pool.query('SELECT * FROM Distribution WHERE victim_id = $1 ORDER BY distribution_date DESC', [victim_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions by victim: ${error.message}`);
    }
  }

  static async getDistributionsByRequest(request_id) {
    try {
      const result = await pool.query('SELECT * FROM Distribution WHERE request_id = $1 ORDER BY distribution_date DESC', [request_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions by request: ${error.message}`);
    }
  }

  static async getDistributionsWithDetails() {
    try {
      const result = await pool.query(`
        SELECT d.*, v.name as victim_name, v.medical_condition as victim_medical_condition, s.item_name as supply_item_name, s.category as supply_category, r.item_requested, r.priority as request_priority, rc.name as camp_name, aa.name as area_name
        FROM Distribution d
        INNER JOIN Request r ON d.request_id = r.request_id
        LEFT JOIN Victims v ON d.victim_id = v.victim_id
        LEFT JOIN Supplies s ON d.supply_id = s.supply_id
        LEFT JOIN ReliefCamps rc ON r.camp_id = rc.camp_id
        LEFT JOIN AffectedAreas aa ON v.area_id = aa.area_id
        ORDER BY d.distribution_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching distributions with details: ${error.message}`);
    }
  }

  static async getDistributionStats() {
    try {
      const result = await pool.query(`
        SELECT COUNT(*)::int as total_distributions, COUNT(DISTINCT d.victim_id)::int as victims_served, COUNT(DISTINCT d.request_id)::int as requests_fulfilled, SUM(d.quantity_distributed)::int as total_items_distributed
        FROM Distribution d INNER JOIN Request r ON d.request_id = r.request_id
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching distribution statistics: ${error.message}`);
    }
  }


}

module.exports = DistributionModel;
