const pool = require('../config/database');

class VolunteerModel {
  // Get all volunteers
  static async getAllVolunteers() {
    try {
      const result = await pool.query(
        'SELECT * FROM Volunteers ORDER BY name ASC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching volunteers: ${error.message}`);
    }
  }

  // Get volunteer by ID
  static async getVolunteerById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM Volunteers WHERE volunteer_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching volunteer: ${error.message}`);
    }
  }

  // Create new volunteer
  static async createVolunteer(volunteerData) {
    const { name, skills, contact, email } = volunteerData;
    try {
      const result = await pool.query(
        'INSERT INTO Volunteers (name, skills, contact, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, skills, contact, email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating volunteer: ${error.message}`);
    }
  }

  // Update volunteer
  static async updateVolunteer(id, volunteerData) {
    const { name, skills, contact, email } = volunteerData;
    try {
      const result = await pool.query(
        'UPDATE Volunteers SET name = $1, skills = $2, contact = $3, email = $4 WHERE volunteer_id = $5 RETURNING *',
        [name, skills, contact, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating volunteer: ${error.message}`);
    }
  }

  // Delete volunteer
  static async deleteVolunteer(id) {
    try {
      const result = await pool.query(
        'DELETE FROM Volunteers WHERE volunteer_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting volunteer: ${error.message}`);
    }
  }

  // Get volunteers by skill
  static async getVolunteersBySkill(skill) {
    try {
      const result = await pool.query(
        'SELECT * FROM Volunteers WHERE skills ILIKE $1 ORDER BY name ASC',
        [`%${skill}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching volunteers by skill: ${error.message}`);
    }
  }

  // Get volunteer statistics
  static async getVolunteerStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_volunteers,
          COUNT(CASE WHEN skills IS NOT NULL AND skills != '' THEN 1 END) as skilled_volunteers,
          COUNT(CASE WHEN contact IS NOT NULL AND contact != '' THEN 1 END) as contactable_volunteers,
          COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as volunteers_with_email
        FROM Volunteers
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching volunteer statistics: ${error.message}`);
    }
  }
}

module.exports = VolunteerModel;
