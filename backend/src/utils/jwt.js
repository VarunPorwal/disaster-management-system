const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'disaster_management_secret_2025';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

class JWTUtils {
  // Generate JWT token
  static generateToken(payload) {
    try {
      return jwt.sign(payload, JWT_SECRET, { 
        expiresIn: JWT_EXPIRE,
        issuer: 'disaster-management-system'
      });
    } catch (error) {
      throw new Error(`Error generating token: ${error.message}`);
    }
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

module.exports = JWTUtils;
