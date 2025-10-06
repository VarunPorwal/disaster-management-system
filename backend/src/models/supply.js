const pool = require('../config/database');

class SupplyModel {
  // Get all supplies
  static async getAllSupplies() {
    try {
      const result = await pool.query('SELECT * FROM Supplies ORDER BY item_name ASC');
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching supplies: ${error.message}`);
    }
  }

  // Get supply by ID
  static async getSupplyById(id) {
    try {
      const result = await pool.query('SELECT * FROM Supplies WHERE supply_id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching supply: ${error.message}`);
    }
  }

  // Create new supply
  static async createSupply(supplyData) {
    const { camp_id, donation_id, type, quantity, current_quantity, category, item_name, expiry_date, status } = supplyData;
    try {
      const result = await pool.query(
        'INSERT INTO Supplies (camp_id, donation_id, type, quantity, current_quantity, category, item_name, expiry_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [camp_id, donation_id, type, quantity, current_quantity || quantity, category, item_name, expiry_date, status || 'Available']
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating supply: ${error.message}`);
    }
  }

  // Update supply
  static async updateSupply(id, supplyData) {
    const { camp_id, donation_id, type, quantity, current_quantity, category, item_name, expiry_date, status } = supplyData;
    try {
      const result = await pool.query(
        'UPDATE Supplies SET camp_id = $1, donation_id = $2, type = $3, quantity = $4, current_quantity = $5, category = $6, item_name = $7, expiry_date = $8, status = $9 WHERE supply_id = $10 RETURNING *',
        [camp_id, donation_id, type, quantity, current_quantity, category, item_name, expiry_date, status, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating supply: ${error.message}`);
    }
  }

  // Delete supply
  static async deleteSupply(id) {
    try {
      const result = await pool.query('DELETE FROM Supplies WHERE supply_id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting supply: ${error.message}`);
    }
  }

  // Get supplies by camp
  static async getSuppliesByCamp(camp_id) {
    try {
      const result = await pool.query('SELECT * FROM Supplies WHERE camp_id = $1 ORDER BY item_name ASC', [camp_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching supplies by camp: ${error.message}`);
    }
  }

  // Get supplies by category
  static async getSuppliesByCategory(category) {
    try {
      const result = await pool.query('SELECT * FROM Supplies WHERE category ILIKE $1 ORDER BY item_name ASC', [`%${category}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching supplies by category: ${error.message}`);
    }
  }

  // Get supplies with full details (camp, donation, donor info)
  static async getSuppliesWithDetails() {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          rc.name as camp_name,
          rc.location as camp_location,
          don.type as donation_type,
          don.description as donation_description,
          donor.name as donor_name,
          donor.type as donor_type
        FROM Supplies s
        LEFT JOIN ReliefCamps rc ON s.camp_id = rc.camp_id
        LEFT JOIN Donation don ON s.donation_id = don.donation_id
        LEFT JOIN Donor donor ON don.donor_id = donor.donor_id
        ORDER BY s.item_name ASC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching supplies with details: ${error.message}`);
    }
  }

  // Get supply statistics
  static async getSupplyStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_supplies,
          COALESCE(SUM(quantity), 0) as total_original_quantity,
          COALESCE(SUM(current_quantity), 0) as total_current_quantity,
          COUNT(CASE WHEN status = 'Available' THEN 1 END)::int as available_supplies,
          COUNT(CASE WHEN status = 'Expired' THEN 1 END)::int as expired_supplies,
          COUNT(CASE WHEN status = 'Expiring Soon' THEN 1 END)::int as expiring_soon_supplies,
          COUNT(CASE WHEN current_quantity = 0 THEN 1 END)::int as empty_supplies,
          COUNT(DISTINCT camp_id)::int as camps_with_supplies,
          COUNT(DISTINCT category)::int as supply_categories
        FROM Supplies
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching supply statistics: ${error.message}`);
    }
  }

  // Get low stock supplies (current_quantity < 20% of original)
  static async getLowStockSupplies() {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          rc.name as camp_name,
          ROUND((s.current_quantity::decimal / s.quantity) * 100, 2) as stock_percentage
        FROM Supplies s
        LEFT JOIN ReliefCamps rc ON s.camp_id = rc.camp_id
        WHERE s.current_quantity < (s.quantity * 0.2)
        ORDER BY stock_percentage ASC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching low stock supplies: ${error.message}`);
    }
  }
}

module.exports = SupplyModel;
