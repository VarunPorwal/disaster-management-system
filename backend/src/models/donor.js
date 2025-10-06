const pool = require('../config/database');

class DonorModel {
  // Get all donors
  static async getAllDonors() {
    try {
      const result = await pool.query(
        'SELECT * FROM Donor ORDER BY name ASC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching donors: ${error.message}`);
    }
  }

  // Get donor by ID
  static async getDonorById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM Donor WHERE donor_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching donor: ${error.message}`);
    }
  }

  // Create new donor
  static async createDonor(donorData) {
    const { name, contact, type, email } = donorData;
    try {
      const result = await pool.query(
        'INSERT INTO Donor (name, contact, type, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, contact, type, email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating donor: ${error.message}`);
    }
  }

  // Update donor
  static async updateDonor(id, donorData) {
    const { name, contact, type, email } = donorData;
    try {
      const result = await pool.query(
        'UPDATE Donor SET name = $1, contact = $2, type = $3, email = $4 WHERE donor_id = $5 RETURNING *',
        [name, contact, type, email, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating donor: ${error.message}`);
    }
  }

  // Delete donor
  static async deleteDonor(id) {
    try {
      const result = await pool.query(
        'DELETE FROM Donor WHERE donor_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting donor: ${error.message}`);
    }
  }

  // Get donors by type
  static async getDonorsByType(type) {
    try {
      const result = await pool.query(
        'SELECT * FROM Donor WHERE type ILIKE $1 ORDER BY name ASC',
        [`%${type}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching donors by type: ${error.message}`);
    }
  }

  // Get donors with donation statistics
  static async getDonorsWithStats() {
    try {
      const result = await pool.query(`
        SELECT 
          d.*,
          COUNT(don.donation_id) as total_donations,
          COALESCE(SUM(don.quantity), 0) as total_quantity_donated,
          MAX(don.date) as last_donation_date,
          MIN(don.date) as first_donation_date
        FROM Donor d
        LEFT JOIN Donation don ON d.donor_id = don.donor_id
        GROUP BY d.donor_id, d.name, d.contact, d.type, d.email
        ORDER BY total_donations DESC, d.name ASC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching donors with statistics: ${error.message}`);
    }
  }

  // Get donor statistics
  static async getDonorStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::int as total_donors,
          COUNT(CASE WHEN type = 'Individual' THEN 1 END)::int as individual_donors,
          COUNT(CASE WHEN type = 'Organization' THEN 1 END)::int as organization_donors,
          COUNT(CASE WHEN type = 'Government' THEN 1 END)::int as government_donors,
          COUNT(CASE WHEN type = 'Corporate' THEN 1 END)::int as corporate_donors,
          COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END)::int as donors_with_email,
          COUNT(CASE WHEN contact IS NOT NULL AND contact != '' THEN 1 END)::int as donors_with_contact
        FROM Donor
      `);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching donor statistics: ${error.message}`);
    }
  }
}

module.exports = DonorModel;
