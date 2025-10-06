const pool = require('../config/database');

class WorksAtModel {
  // Get all work assignments
  static async getAllWorkAssignments() {
    try {
      const result = await pool.query('SELECT * FROM WorksAt ORDER BY volunteer_id');
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching work assignments: ${error.message}`);
    }
  }

  // Get work assignment by volunteer and camp
  static async getWorkAssignment(volunteer_id, camp_id) {
    try {
      const result = await pool.query('SELECT * FROM WorksAt WHERE volunteer_id = $1 AND camp_id = $2', [volunteer_id, camp_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching work assignment: ${error.message}`);
    }
  }

  // Create new work assignment
  static async createWorkAssignment(workData) {
    const { volunteer_id, camp_id, role } = workData;
    try {
      const result = await pool.query(
        'INSERT INTO WorksAt (volunteer_id, camp_id, role) VALUES ($1, $2, $3) RETURNING *',
        [volunteer_id, camp_id, role]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating work assignment: ${error.message}`);
    }
  }

  // Update work assignment
  static async updateWorkAssignment(volunteer_id, camp_id, workData) {
    const { role } = workData;
    try {
      const result = await pool.query(
        'UPDATE WorksAt SET role = $1 WHERE volunteer_id = $2 AND camp_id = $3 RETURNING *',
        [role, volunteer_id, camp_id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating work assignment: ${error.message}`);
    }
  }

  // Delete work assignment
  static async deleteWorkAssignment(volunteer_id, camp_id) {
    try {
      const result = await pool.query('DELETE FROM WorksAt WHERE volunteer_id = $1 AND camp_id = $2 RETURNING *', [volunteer_id, camp_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting work assignment: ${error.message}`);
    }
  }

  // Get work assignments by volunteer
  static async getWorkAssignmentsByVolunteer(volunteer_id) {
    try {
      const result = await pool.query('SELECT * FROM WorksAt WHERE volunteer_id = $1', [volunteer_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching work assignments by volunteer: ${error.message}`);
    }
  }

  // Get work assignments by camp
  static async getWorkAssignmentsByCamp(camp_id) {
    try {
      const result = await pool.query('SELECT * FROM WorksAt WHERE camp_id = $1', [camp_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching work assignments by camp: ${error.message}`);
    }
  }

  // Get work assignments with details
  static async getWorkAssignmentsWithDetails() {
    try {
      const result = await pool.query(`
        SELECT 
          wa.*,
          v.name as volunteer_name,
          v.skills as volunteer_skills,
          v.contact as volunteer_contact,
          rc.name as camp_name,
          rc.location as camp_location,
          rc.capacity as camp_capacity,
          aa.name as area_name,
          aa.state as area_state
        FROM WorksAt wa
        LEFT JOIN Volunteers v ON wa.volunteer_id = v.volunteer_id
        LEFT JOIN ReliefCamps rc ON wa.camp_id = rc.camp_id
        LEFT JOIN AffectedAreas aa ON rc.area_id = aa.area_id
        ORDER BY wa.volunteer_id, wa.camp_id
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching work assignments with details: ${error.message}`);
    }
  }

  // Get work assignment statistics
  static async getWorkAssignmentStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_assignments,
          COUNT(DISTINCT volunteer_id)::int as volunteers_working,
          COUNT(DISTINCT camp_id)::int as camps_with_volunteers,
          ROUND(AVG(assignments_per_volunteer), 2) as avg_assignments_per_volunteer,
          ROUND(AVG(volunteers_per_camp), 2) as avg_volunteers_per_camp
        FROM (
          SELECT 
            volunteer_id,
            COUNT(*) as assignments_per_volunteer
          FROM WorksAt
          GROUP BY volunteer_id
        ) volunteer_stats,
        (
          SELECT 
            camp_id,
            COUNT(*) as volunteers_per_camp
          FROM WorksAt
          GROUP BY camp_id
        ) camp_stats
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching work assignment statistics: ${error.message}`);
    }
  }
}

module.exports = WorksAtModel;
