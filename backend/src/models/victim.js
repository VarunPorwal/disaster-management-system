const pool = require('../config/database');

class VictimModel {
  // Get all victims
  static async getAllVictims() {
    try {
      const result = await pool.query(
        'SELECT * FROM Victims ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching victims: ${error.message}`);
    }
  }

  // Get victim by ID
  static async getVictimById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM Victims WHERE victim_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching victim: ${error.message}`);
    }
  }

  // Create new victim
  static async createVictim(victimData) {
    const { area_id, camp_id, name, age, gender, contact, address, medical_condition } = victimData;
    try {
      const result = await pool.query(
        `INSERT INTO Victims 
         (area_id, camp_id, name, age, gender, contact, address, medical_condition, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [area_id, camp_id, name, age, gender, contact, address, medical_condition]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating victim: ${error.message}`);
    }
  }

  // Update victim
  static async updateVictim(id, victimData) {
    const { area_id, camp_id, name, age, gender, contact, address, medical_condition } = victimData;
    try {
      const result = await pool.query(
        `UPDATE Victims 
         SET area_id = $1, camp_id = $2, name = $3, age = $4, gender = $5, 
             contact = $6, address = $7, medical_condition = $8
         WHERE victim_id = $9 
         RETURNING *`,
        [area_id, camp_id, name, age, gender, contact, address, medical_condition, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating victim: ${error.message}`);
    }
  }

  // Delete victim
  static async deleteVictim(id) {
    try {
      const result = await pool.query(
        'DELETE FROM Victims WHERE victim_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting victim: ${error.message}`);
    }
  }

  // Get victims by area
  static async getVictimsByArea(area_id) {
    try {
      const result = await pool.query(
        'SELECT * FROM Victims WHERE area_id = $1 ORDER BY created_at DESC',
        [area_id]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching victims by area: ${error.message}`);
    }
  }

  // Get victims by camp
  static async getVictimsByCamp(camp_id) {
    try {
      const result = await pool.query(
        'SELECT * FROM Victims WHERE camp_id = $1 ORDER BY created_at DESC',
        [camp_id]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching victims by camp: ${error.message}`);
    }
  }

  // Get victims with area and camp details
  static async getVictimsWithDetails() {
    try {
      const result = await pool.query(`
        SELECT 
          v.*,
          aa.name as area_name,
          aa.state as area_state,
          aa.district as area_district,
          rc.name as camp_name,
          rc.location as camp_location,
          rc.status as camp_status,
          d.type as disaster_type,
          d.severity as disaster_severity
        FROM Victims v
        LEFT JOIN AffectedAreas aa ON v.area_id = aa.area_id
        LEFT JOIN ReliefCamps rc ON v.camp_id = rc.camp_id
        LEFT JOIN Disaster d ON aa.disaster_id = d.disaster_id
        ORDER BY v.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching victims with details: ${error.message}`);
    }
  }

  // Get victim statistics
  static async getVictimStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_victims,
          COUNT(CASE WHEN gender = 'Male' THEN 1 END)::int as male_victims,
          COUNT(CASE WHEN gender = 'Female' THEN 1 END)::int as female_victims,
          COUNT(CASE WHEN age < 18 THEN 1 END)::int as children,
          COUNT(CASE WHEN age >= 60 THEN 1 END)::int as elderly,
          COUNT(CASE WHEN camp_id IS NOT NULL THEN 1 END)::int as victims_in_camps,
          COUNT(CASE WHEN medical_condition IS NOT NULL AND medical_condition != '' THEN 1 END)::int as victims_with_medical_conditions,
          ROUND(AVG(age), 1) as average_age
        FROM Victims
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching victim statistics: ${error.message}`);
    }
  }
}

module.exports = VictimModel;
