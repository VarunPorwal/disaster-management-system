const pool = require('../config/database');

class RequestModel {
  // Get all requests
  static async getAllRequests() {
    try {
      const result = await pool.query('SELECT * FROM Request ORDER BY request_date DESC');
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching requests: ${error.message}`);
    }
  }

  // Get request by ID
  static async getRequestById(id) {
    try {
      const result = await pool.query('SELECT * FROM Request WHERE request_id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching request: ${error.message}`);
    }
  }

  // Create new request
  static async createRequest(requestData) {
    const { victim_id, camp_id, item_requested, quantity_needed, priority, status, request_date } = requestData;
    try {
      const result = await pool.query(
        'INSERT INTO Request (victim_id, camp_id, item_requested, quantity_needed, priority, status, request_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *',
        [victim_id, camp_id, item_requested, quantity_needed, priority || 'Medium', status || 'Pending', request_date]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating request: ${error.message}`);
    }
  }

  // Update request
  static async updateRequest(id, requestData) {
    const { victim_id, camp_id, item_requested, quantity_needed, priority, status, request_date, fulfilled_date } = requestData;
    try {
      const result = await pool.query(
        'UPDATE Request SET victim_id = $1, camp_id = $2, item_requested = $3, quantity_needed = $4, priority = $5, status = $6, request_date = $7, fulfilled_date = $8 WHERE request_id = $9 RETURNING *',
        [victim_id, camp_id, item_requested, quantity_needed, priority, status, request_date, fulfilled_date, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating request: ${error.message}`);
    }
  }

  // Delete request
  static async deleteRequest(id) {
    try {
      const result = await pool.query('DELETE FROM Request WHERE request_id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting request: ${error.message}`);
    }
  }

  // Get requests by victim
  static async getRequestsByVictim(victim_id) {
    try {
      const result = await pool.query('SELECT * FROM Request WHERE victim_id = $1 ORDER BY request_date DESC', [victim_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching requests by victim: ${error.message}`);
    }
  }

  // Get requests by camp
  static async getRequestsByCamp(camp_id) {
    try {
      const result = await pool.query('SELECT * FROM Request WHERE camp_id = $1 ORDER BY priority DESC, request_date ASC', [camp_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching requests by camp: ${error.message}`);
    }
  }

  // Get requests with victim and camp details
  static async getRequestsWithDetails() {
    try {
      const result = await pool.query(`
        SELECT 
          r.*,
          v.name as victim_name,
          v.age as victim_age,
          v.medical_condition as victim_medical_condition,
          rc.name as camp_name,
          rc.location as camp_location,
          aa.name as area_name,
          aa.state as area_state
        FROM Request r
        LEFT JOIN Victims v ON r.victim_id = v.victim_id
        LEFT JOIN ReliefCamps rc ON r.camp_id = rc.camp_id
        LEFT JOIN AffectedAreas aa ON v.area_id = aa.area_id
        ORDER BY r.request_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching requests with details: ${error.message}`);
    }
  }

  // Get request statistics
  static async getRequestStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_requests,
          COUNT(CASE WHEN status = 'Pending' THEN 1 END)::int as pending_requests,
          COUNT(CASE WHEN status = 'Fulfilled' THEN 1 END)::int as fulfilled_requests,
          COUNT(CASE WHEN status = 'Rejected' THEN 1 END)::int as rejected_requests,
          COUNT(CASE WHEN priority = 'High' THEN 1 END)::int as high_priority_requests,
          COUNT(CASE WHEN priority = 'Medium' THEN 1 END)::int as medium_priority_requests,
          COUNT(CASE WHEN priority = 'Low' THEN 1 END)::int as low_priority_requests,
          COUNT(DISTINCT victim_id)::int as unique_victims_requesting,
          COUNT(DISTINCT camp_id)::int as camps_receiving_requests
        FROM Request
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching request statistics: ${error.message}`);
    }
  }

  // Get urgent requests (High priority and pending)
  static async getUrgentRequests() {
    try {
      const result = await pool.query(`
        SELECT 
          r.*,
          v.name as victim_name,
          v.medical_condition as victim_medical_condition,
          rc.name as camp_name
        FROM Request r
        LEFT JOIN Victims v ON r.victim_id = v.victim_id
        LEFT JOIN ReliefCamps rc ON r.camp_id = rc.camp_id
        WHERE r.priority = 'High' AND r.status = 'Pending'
        ORDER BY r.request_date ASC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching urgent requests: ${error.message}`);
    }
  }
}

module.exports = RequestModel;
