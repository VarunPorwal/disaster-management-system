const pool = require('../config/database');

class DonationModel {
  static async getAllDonations() {
    try {
      const result = await pool.query('SELECT * FROM Donation ORDER BY date DESC');
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching donations: ${error.message}`);
    }
  }

  static async getDonationById(id) {
    try {
      const result = await pool.query('SELECT * FROM Donation WHERE donation_id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching donation: ${error.message}`);
    }
  }

  static async createDonation(donationData) {
    const { donor_id, type, date, amount, quantity, unit, description, estimated_value } = donationData;
    try {
      const result = await pool.query(
        'INSERT INTO Donation (donor_id, type, date, amount, quantity, unit, description, estimated_value, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
        [donor_id, type, date, amount, quantity, unit, description, estimated_value]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating donation: ${error.message}`);
    }
  }

  static async updateDonation(id, donationData) {
    const { donor_id, type, date, amount, quantity, unit, description, estimated_value } = donationData;
    try {
      const result = await pool.query(
        'UPDATE Donation SET donor_id = $1, type = $2, date = $3, amount = $4, quantity = $5, unit = $6, description = $7, estimated_value = $8 WHERE donation_id = $9 RETURNING *',
        [donor_id, type, date, amount, quantity, unit, description, estimated_value, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating donation: ${error.message}`);
    }
  }

  static async deleteDonation(id) {
    try {
      const result = await pool.query('DELETE FROM Donation WHERE donation_id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting donation: ${error.message}`);
    }
  }

  static async getDonationsByDonor(donor_id) {
    try {
      const result = await pool.query('SELECT * FROM Donation WHERE donor_id = $1 ORDER BY date DESC', [donor_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching donations by donor: ${error.message}`);
    }
  }

  static async getDonationsWithDonorInfo() {
    try {
      const result = await pool.query(`
        SELECT d.*, don.name as donor_name, don.type as donor_type, don.contact as donor_contact, don.email as donor_email
        FROM Donation d
        LEFT JOIN Donor don ON d.donor_id = don.donor_id
        ORDER BY d.date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching donations with donor info: ${error.message}`);
    }
  }

  static async getDonationStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_donations,
          COALESCE(SUM(amount), 0) as total_cash_amount,
          COALESCE(SUM(estimated_value), 0) as total_estimated_value,
          COUNT(CASE WHEN type = 'Cash' THEN 1 END)::int as cash_donations,
          COUNT(CASE WHEN type = 'Food' THEN 1 END)::int as food_donations,
          COUNT(CASE WHEN type = 'Medicine' THEN 1 END)::int as medicine_donations,
          COUNT(CASE WHEN type = 'Clothing' THEN 1 END)::int as clothing_donations,
          COUNT(CASE WHEN type = 'Medical Supplies' THEN 1 END)::int as medical_supplies_donations,
          COUNT(DISTINCT donor_id)::int as unique_donors,
          ROUND(AVG(amount)) as avg_cash_donation,
          ROUND(AVG(estimated_value)) as avg_estimated_value
        FROM Donation
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching donation statistics: ${error.message}`);
    }
  }

  // Get cash donations only
  static async getCashDonations() {
    try {
      const result = await pool.query(`
        SELECT d.*, don.name as donor_name, don.type as donor_type
        FROM Donation d
        LEFT JOIN Donor don ON d.donor_id = don.donor_id
        WHERE d.type = 'Cash' AND d.amount IS NOT NULL
        ORDER BY d.amount DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching cash donations: ${error.message}`);
    }
  }

  // Get in-kind donations only
  static async getInKindDonations() {
    try {
      const result = await pool.query(`
        SELECT d.*, don.name as donor_name, don.type as donor_type
        FROM Donation d
        LEFT JOIN Donor don ON d.donor_id = don.donor_id
        WHERE d.type != 'Cash' AND d.quantity IS NOT NULL
        ORDER BY d.estimated_value DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching in-kind donations: ${error.message}`);
    }
  }
}

module.exports = DonationModel;
