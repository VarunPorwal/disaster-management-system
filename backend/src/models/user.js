const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Create new user
  static async createUser(userData) {
    const { username, email, password, role, full_name, phone, volunteer_id, donor_id } = userData;
    
    try {
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      const result = await pool.query(
        `INSERT INTO Users (username, email, password_hash, role, full_name, phone, volunteer_id, donor_id, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
         RETURNING user_id, username, email, role, full_name, phone, volunteer_id, donor_id, is_active, created_at`,
        [username, email, password_hash, role, full_name, phone, volunteer_id, donor_id]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM Users WHERE email = $1 AND is_active = true',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM Users WHERE username = $1 AND is_active = true',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(user_id) {
    try {
      const result = await pool.query(
        `SELECT u.*, v.name as volunteer_name, v.skills as volunteer_skills, 
                d.name as donor_name, d.type as donor_type
         FROM Users u
         LEFT JOIN Volunteers v ON u.volunteer_id = v.volunteer_id
         LEFT JOIN Donor d ON u.donor_id = d.donor_id
         WHERE u.user_id = $1 AND u.is_active = true`,
        [user_id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  // Update last login
  static async updateLastLogin(user_id) {
    try {
      await pool.query(
        'UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user_id]
      );
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const result = await pool.query(
        `SELECT u.user_id, u.username, u.email, u.role, u.full_name, u.phone, 
                u.is_active, u.created_at, u.last_login,
                v.name as volunteer_name, d.name as donor_name
         FROM Users u
         LEFT JOIN Volunteers v ON u.volunteer_id = v.volunteer_id
         LEFT JOIN Donor d ON u.donor_id = d.donor_id
         ORDER BY u.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all users: ${error.message}`);
    }
  }

  // Deactivate user
  static async deactivateUser(user_id) {
    try {
      const result = await pool.query(
        'UPDATE Users SET is_active = false WHERE user_id = $1 RETURNING *',
        [user_id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deactivating user: ${error.message}`);
    }
  }
}

module.exports = UserModel;
