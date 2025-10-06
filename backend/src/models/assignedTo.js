const pool = require('../config/database');

class AssignedToModel {
  // Get all area assignments
  static async getAllAreaAssignments() {
    try {
      const result = await pool.query('SELECT * FROM AssignedTo ORDER BY assign_date DESC');
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching area assignments: ${error.message}`);
    }
  }

  // Get area assignment by volunteer and area
  static async getAreaAssignment(volunteer_id, area_id) {
    try {
      const result = await pool.query('SELECT * FROM AssignedTo WHERE volunteer_id = $1 AND area_id = $2', [volunteer_id, area_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching area assignment: ${error.message}`);
    }
  }

  // Create new area assignment
  static async createAreaAssignment(assignData) {
    const { volunteer_id, area_id, assign_date } = assignData;
    try {
      const result = await pool.query(
        'INSERT INTO AssignedTo (volunteer_id, area_id, assign_date) VALUES ($1, $2, $3) RETURNING *',
        [volunteer_id, area_id, assign_date]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating area assignment: ${error.message}`);
    }
  }

  // Update area assignment
  static async updateAreaAssignment(volunteer_id, area_id, assignData) {
    const { assign_date } = assignData;
    try {
      const result = await pool.query(
        'UPDATE AssignedTo SET assign_date = $1 WHERE volunteer_id = $2 AND area_id = $3 RETURNING *',
        [assign_date, volunteer_id, area_id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating area assignment: ${error.message}`);
    }
  }

  // Delete area assignment
  static async deleteAreaAssignment(volunteer_id, area_id) {
    try {
      const result = await pool.query('DELETE FROM AssignedTo WHERE volunteer_id = $1 AND area_id = $2 RETURNING *', [volunteer_id, area_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting area assignment: ${error.message}`);
    }
  }

  // Get area assignments by volunteer
  static async getAreaAssignmentsByVolunteer(volunteer_id) {
    try {
      const result = await pool.query('SELECT * FROM AssignedTo WHERE volunteer_id = $1 ORDER BY assign_date DESC', [volunteer_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching area assignments by volunteer: ${error.message}`);
    }
  }

  // Get area assignments by area
  static async getAreaAssignmentsByArea(area_id) {
    try {
      const result = await pool.query('SELECT * FROM AssignedTo WHERE area_id = $1 ORDER BY assign_date DESC', [area_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching area assignments by area: ${error.message}`);
    }
  }

  // Get area assignments with details
  static async getAreaAssignmentsWithDetails() {
    try {
      const result = await pool.query(`
        SELECT 
          at.*,
          v.name as volunteer_name,
          v.skills as volunteer_skills,
          v.contact as volunteer_contact,
          aa.name as area_name,
          aa.state as area_state,
          aa.district as area_district,
          aa.pop_affected as area_population,
          d.type as disaster_type,
          d.severity as disaster_severity,
          d.status as disaster_status
        FROM AssignedTo at
        LEFT JOIN Volunteers v ON at.volunteer_id = v.volunteer_id
        LEFT JOIN AffectedAreas aa ON at.area_id = aa.area_id
        LEFT JOIN Disaster d ON aa.disaster_id = d.disaster_id
        ORDER BY at.assign_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching area assignments with details: ${error.message}`);
    }
  }

  // Get area assignment statistics
  static async getAreaAssignmentStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_assignments,
          COUNT(DISTINCT volunteer_id)::int as volunteers_assigned,
          COUNT(DISTINCT area_id)::int as areas_covered,
          COUNT(CASE WHEN assign_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::int as recent_assignments
        FROM AssignedTo
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching area assignment statistics: ${error.message}`);
    }
  }
}

module.exports = AssignedToModel;
