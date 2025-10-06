const pool = require('../config/database');

class ReliefCampModel {
  // Get all relief camps
  static async getAllReliefCamps() {
    try {
      const result = await pool.query(
        'SELECT * FROM ReliefCamps ORDER BY date_established DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching relief camps: ${error.message}`);
    }
  }

  // Get relief camp by ID
  static async getReliefCampById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM ReliefCamps WHERE camp_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching relief camp: ${error.message}`);
    }
  }

  // Create new relief camp
  static async createReliefCamp(campData) {
    const { area_id, manager_id, name, capacity, current_occupancy, location, date_established, status, latitude, longitude } = campData;
    try {
      const result = await pool.query(
        `INSERT INTO ReliefCamps 
         (area_id, manager_id, name, capacity, current_occupancy, location, date_established, status, latitude, longitude, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [area_id, manager_id, name, capacity, current_occupancy, location, date_established, status, latitude, longitude]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating relief camp: ${error.message}`);
    }
  }

  // Update relief camp
  static async updateReliefCamp(id, campData) {
    const { area_id, manager_id, name, capacity, current_occupancy, location, date_established, status, latitude, longitude } = campData;
    try {
      const result = await pool.query(
        `UPDATE ReliefCamps 
         SET area_id = $1, manager_id = $2, name = $3, capacity = $4, current_occupancy = $5, 
             location = $6, date_established = $7, status = $8, latitude = $9, longitude = $10
         WHERE camp_id = $11 
         RETURNING *`,
        [area_id, manager_id, name, capacity, current_occupancy, location, date_established, status, latitude, longitude, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating relief camp: ${error.message}`);
    }
  }

  // Delete relief camp
  static async deleteReliefCamp(id) {
    try {
      const result = await pool.query(
        'DELETE FROM ReliefCamps WHERE camp_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting relief camp: ${error.message}`);
    }
  }

  // Get camps by area
  static async getCampsByArea(area_id) {
    try {
      const result = await pool.query(
        'SELECT * FROM ReliefCamps WHERE area_id = $1 ORDER BY date_established DESC',
        [area_id]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching camps by area: ${error.message}`);
    }
  }

  // Get camps by manager
  static async getCampsByManager(manager_id) {
    try {
      const result = await pool.query(
        'SELECT * FROM ReliefCamps WHERE manager_id = $1 ORDER BY date_established DESC',
        [manager_id]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching camps by manager: ${error.message}`);
    }
  }

  // Get camps with area and manager details
  static async getCampsWithDetails() {
    try {
      const result = await pool.query(`
        SELECT 
          rc.*,
          aa.name as area_name,
          aa.state as area_state,
          aa.district as area_district,
          v.name as manager_name,
          v.contact as manager_contact,
          v.email as manager_email,
          v.skills as manager_skills,
          d.type as disaster_type,
          d.severity as disaster_severity,
          d.status as disaster_status
        FROM ReliefCamps rc
        LEFT JOIN AffectedAreas aa ON rc.area_id = aa.area_id
        LEFT JOIN Volunteers v ON rc.manager_id = v.volunteer_id
        LEFT JOIN Disaster d ON aa.disaster_id = d.disaster_id
        ORDER BY rc.date_established DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching camps with details: ${error.message}`);
    }
  }

  // Get camp statistics
  static async getCampStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_camps,
          COALESCE(SUM(capacity), 0)::int as total_capacity,
          COALESCE(SUM(current_occupancy), 0)::int as total_occupancy,
          CASE 
            WHEN SUM(capacity) > 0 THEN ROUND((SUM(current_occupancy)::decimal / SUM(capacity)) * 100, 2)
            ELSE 0
          END as occupancy_rate,
          COUNT(CASE WHEN status = 'Active' THEN 1 END)::int as active_camps,
          COUNT(CASE WHEN status = 'Full' THEN 1 END)::int as full_camps,
          COUNT(CASE WHEN status = 'Closed' THEN 1 END)::int as closed_camps,
          COUNT(DISTINCT manager_id)::int as total_managers
        FROM ReliefCamps
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching camp statistics: ${error.message}`);
    }
  }
}

module.exports = ReliefCampModel;
