const pool = require('../config/database');

class AffectedAreaModel {
  // Get all affected areas
  static async getAllAffectedAreas() {
    try {
      const result = await pool.query(
        'SELECT * FROM AffectedAreas ORDER BY name ASC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching affected areas: ${error.message}`);
    }
  }

  // Get affected area by ID
  static async getAffectedAreaById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM AffectedAreas WHERE area_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching affected area: ${error.message}`);
    }
  }

  // Create new affected area
  static async createAffectedArea(areaData) {
    const { disaster_id, name, state, district, pop_affected, pincode, status, latitude, longitude } = areaData;
    try {
      const result = await pool.query(
        `INSERT INTO AffectedAreas 
         (disaster_id, name, state, district, pop_affected, pincode, status, latitude, longitude, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [disaster_id, name, state, district, pop_affected, pincode, status, latitude, longitude]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating affected area: ${error.message}`);
    }
  }

  // Update affected area
  static async updateAffectedArea(id, areaData) {
    const { disaster_id, name, state, district, pop_affected, pincode, status, latitude, longitude } = areaData;
    try {
      const result = await pool.query(
        `UPDATE AffectedAreas 
         SET disaster_id = $1, name = $2, state = $3, district = $4, 
             pop_affected = $5, pincode = $6, status = $7, latitude = $8, longitude = $9
         WHERE area_id = $10 
         RETURNING *`,
        [disaster_id, name, state, district, pop_affected, pincode, status, latitude, longitude, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating affected area: ${error.message}`);
    }
  }

  // Delete affected area
  static async deleteAffectedArea(id) {
    try {
      const result = await pool.query(
        'DELETE FROM AffectedAreas WHERE area_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting affected area: ${error.message}`);
    }
  }

  // Get affected areas by disaster
  static async getAffectedAreasByDisaster(disaster_id) {
    try {
      const result = await pool.query(
        `SELECT aa.*, d.type as disaster_type, d.date as disaster_date, d.severity as disaster_severity, d.status as disaster_status
         FROM AffectedAreas aa
         LEFT JOIN Disaster d ON aa.disaster_id = d.disaster_id
         WHERE aa.disaster_id = $1
         ORDER BY aa.name ASC`,
        [disaster_id]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching affected areas by disaster: ${error.message}`);
    }
  }

  // Get area statistics
  static async getAreaStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_areas,
          COALESCE(SUM(pop_affected), 0)::bigint as total_affected_population,
          CASE 
            WHEN COUNT(*) > 0 THEN ROUND(AVG(pop_affected))::int
            ELSE 0
          END as avg_population_per_area,
          COUNT(CASE WHEN status = 'Critical' THEN 1 END)::int as critical_areas,
          COUNT(CASE WHEN status = 'Active' THEN 1 END)::int as active_areas,
          COUNT(CASE WHEN status = 'Recovering' THEN 1 END)::int as recovering_areas
        FROM AffectedAreas
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching area statistics: ${error.message}`);
    }
  }

  // Get affected areas with disaster info
  static async getAffectedAreasWithDisaster() {
    try {
      const result = await pool.query(`
        SELECT 
          aa.*,
          d.type as disaster_type,
          d.date as disaster_date,
          d.severity as disaster_severity,
          d.status as disaster_status
        FROM AffectedAreas aa
        LEFT JOIN Disaster d ON aa.disaster_id = d.disaster_id
        ORDER BY aa.name ASC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching affected areas with disaster info: ${error.message}`);
    }
  }
}

module.exports = AffectedAreaModel;
