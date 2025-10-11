const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Find user by username - FIXED to use 'password' instead of 'password_hash'
  static async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND is_active = true',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  // Find user by email - FIXED to use 'password' instead of 'password_hash'  
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Verify password - FIXED to work with plain text passwords for now
  static async verifyPassword(plainPassword, storedPassword) {
    try {
      // Since you're using plain text passwords (admin123, etc.), just compare directly
      return plainPassword === storedPassword;
      
      // If you want to use hashed passwords later, uncomment this:
      // return await bcrypt.compare(plainPassword, storedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  // Update last login - FIXED table name
  static async updateLastLogin(user_id) {
    try {
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user_id]
      );
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  // Get all users - FIXED to match your table structure
  static async getAllUsers() {
    try {
      const result = await pool.query(
        `SELECT user_id, username, email, role, full_name, phone, 
                is_active, created_at, last_login, volunteer_name, donor_name
         FROM users 
         ORDER BY user_id ASC`
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all users: ${error.message}`);
    }
  }

  // Find user by ID - SIMPLIFIED for your table structure
  static async findById(user_id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE user_id = $1 AND is_active = true',
        [user_id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }
}

module.exports = UserModel;
