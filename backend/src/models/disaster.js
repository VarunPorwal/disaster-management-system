const pool = require('../config/database');

class DisasterModel {
  // Get all disasters
  static async getAllDisasters() {
    try {
      const result = await pool.query(
        'SELECT * FROM disaster ORDER BY date DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching disasters: ${error.message}`);
    }
  }

  // Get disaster by ID
  static async getDisasterById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM disaster WHERE disaster_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching disaster: ${error.message}`);
    }
  }

  // Create new disaster
  static async createDisaster(disasterData) {
    const { type, date, severity, status } = disasterData;
    try {
      const result = await pool.query(
        'INSERT INTO disaster (type, date, severity, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [type, date, severity, status]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating disaster: ${error.message}`);
    }
  }

  // Update disaster
  static async updateDisaster(id, disasterData) {
    const { type, date, severity, status } = disasterData;
    try {
      const result = await pool.query(
        'UPDATE disaster SET type = $1, date = $2, severity = $3, status = $4 WHERE disaster_id = $5 RETURNING *',
        [type, date, severity, status, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating disaster: ${error.message}`);
    }
  }

  // Delete disaster
  static async deleteDisaster(id) {
    try {
      const result = await pool.query(
        'DELETE FROM disaster WHERE disaster_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting disaster: ${error.message}`);
    }
  }

  // Get disasters with affected areas count
  static async getDisastersWithStats() {
    try {
      const result = await pool.query(`
        SELECT 
          d.*,
          COUNT(aa.area_id) as affected_areas_count
        FROM disaster d
        LEFT JOIN affectedareas aa ON d.disaster_id = aa.disaster_id
        GROUP BY d.disaster_id
        ORDER BY d.date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching disaster statistics: ${error.message}`);
    }
  }
}

module.exports = DisasterModel;
