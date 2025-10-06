const express = require('express');
const router = express.Router();
const DisasterModel = require('../models/disaster');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');

// Public endpoint - anyone can view disasters (with optional user context)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const disasters = await DisasterModel.getAllDisasters();
    res.json({
      success: true,
      data: disasters,
      count: disasters.length,
      message: 'Disasters retrieved successfully',
      user_context: req.user ? { role: req.user.role, username: req.user.username } : null
    });
  } catch (error) {
    console.error('Error in GET /disasters:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving disasters',
      error: error.message
    });
  }
});

// Public endpoint - view single disaster
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const disaster = await DisasterModel.getDisasterById(req.params.id);
    if (!disaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    res.json({
      success: true,
      data: disaster,
      message: 'Disaster retrieved successfully',
      user_context: req.user ? { role: req.user.role, username: req.user.username } : null
    });
  } catch (error) {
    console.error('Error in GET /disasters/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving disaster',
      error: error.message
    });
  }
});

// PROTECTED: Create disaster - Admin only
router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { type, date, severity, status } = req.body;
    if (!type || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, date'
      });
    }
    const newDisaster = await DisasterModel.createDisaster(req.body);
    res.status(201).json({
      success: true,
      data: newDisaster,
      message: 'Disaster created successfully',
      created_by: req.user.username
    });
  } catch (error) {
    console.error('Error in POST /disasters:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating disaster',
      error: error.message
    });
  }
});

// PROTECTED: Update disaster - Admin only
router.put('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { type, date } = req.body;
    if (!type || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, date'
      });
    }
    const updatedDisaster = await DisasterModel.updateDisaster(req.params.id, req.body);
    if (!updatedDisaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    res.json({
      success: true,
      data: updatedDisaster,
      message: 'Disaster updated successfully',
      updated_by: req.user.username
    });
  } catch (error) {
    console.error('Error in PUT /disasters/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating disaster',
      error: error.message
    });
  }
});

// PROTECTED: Delete disaster - Admin only
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const deletedDisaster = await DisasterModel.deleteDisaster(req.params.id);
    if (!deletedDisaster) {
      return res.status(404).json({
        success: false,
        message: 'Disaster not found'
      });
    }
    res.json({
      success: true,
      data: deletedDisaster,
      message: 'Disaster deleted successfully',
      deleted_by: req.user.username
    });
  } catch (error) {
    console.error('Error in DELETE /disasters/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting disaster',
      error: error.message
    });
  }
});

// Public endpoint - disaster statistics
router.get('/stats/overview', optionalAuth, async (req, res) => {
  try {
    const stats = await DisasterModel.getDisasterStats();
    res.json({
      success: true,
      data: stats,
      message: 'Disaster statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /disasters/stats/overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving disaster statistics',
      error: error.message
    });
  }
});

module.exports = router;
