const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const JWTUtils = require('../utils/jwt');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// POST /register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, full_name, phone, volunteer_id, donor_id } = req.body;
    
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Valid roles
    const validRoles = ['Admin', 'Camp Manager', 'Volunteer', 'Donor'];
    const userRole = role || 'Volunteer';
    
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Check if user already exists
    const existingUserByEmail = await UserModel.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const existingUserByUsername = await UserModel.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Create user
    const userData = {
      username,
      email,
      password,
      role: userRole,
      full_name,
      phone,
      volunteer_id: volunteer_id || null,
      donor_id: donor_id || null
    };

    const newUser = await UserModel.createUser(userData);

    // Generate JWT token
    const token = JWTUtils.generateToken({
      user_id: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          user_id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          full_name: newUser.full_name,
          phone: newUser.phone,
          volunteer_id: newUser.volunteer_id,
          donor_id: newUser.donor_id,
          created_at: newUser.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Error in POST /register:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// POST /login - User login
// POST /login - FIXED for your table structure
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by username
    let user = await UserModel.findByUsername(username);
    if (!user) {
      // Try by email as fallback
      user = await UserModel.findByEmail(username);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password - FIXED to use 'password' field
    const isPasswordValid = await UserModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await UserModel.updateLastLogin(user.user_id);

    // Generate JWT token
    const token = JWTUtils.generateToken({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // FIXED response to match your frontend expectations
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          volunteer_name: user.volunteer_name,
          donor_name: user.donor_name,
          last_login: user.last_login
        },
        token
      }
    });

  } catch (error) {
    console.error('Error in POST /login:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});


// GET /profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.user_id);
    
    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        volunteer_id: user.volunteer_id,
        donor_id: user.donor_id,
        volunteer_name: user.volunteer_name,
        volunteer_skills: user.volunteer_skills,
        donor_name: user.donor_name,
        donor_type: user.donor_type,
        is_active: user.is_active,
        created_at: user.created_at,
        last_login: user.last_login
      }
    });

  } catch (error) {
    console.error('Error in GET /profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile',
      error: error.message
    });
  }
});

// POST /logout - User logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Please remove token from client.'
  });
});

// GET /users - Get all users (Admin only)
router.get('/users',  async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
});

// PUT /users/:id/deactivate - Deactivate user (Admin only)
router.put('/users/:id/deactivate', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const deactivatedUser = await UserModel.deactivateUser(id);
    
    if (!deactivatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: deactivatedUser
    });

  } catch (error) {
    console.error('Error in PUT /users/:id/deactivate:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
});

// GET /verify-token - Verify if token is valid
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user_id: req.user.user_id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

module.exports = router;
