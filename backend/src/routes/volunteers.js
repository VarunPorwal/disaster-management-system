const express = require('express');
const router = express.Router();
const VolunteerModel = require('../models/volunteer');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');

// GET all volunteers - Protected with role-based filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const volunteers = await VolunteerModel.getAllVolunteers();
    
    // Filter sensitive information based on role
    let filteredData = volunteers;
    if (req.user.role === 'Volunteer' && req.user.volunteer_id) {
      // Volunteers can only see their own detailed info and basic info of others
      filteredData = volunteers.map(vol => {
        if (vol.volunteer_id === req.user.volunteer_id) {
          return vol; // Full access to own data
        } else {
          return { // Limited access to others
            volunteer_id: vol.volunteer_id,
            name: vol.name,
            skills: vol.skills
          };
        }
      });
    } else if (req.user.role === 'Donor') {
      // Donors can only see basic volunteer information
      filteredData = volunteers.map(vol => ({
        volunteer_id: vol.volunteer_id,
        name: vol.name,
        skills: vol.skills
      }));
    }
    
    res.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      message: 'Volunteers retrieved successfully',
      user_context: { role: req.user.role, access_level: req.user.role }
    });
  } catch (error) {
    console.error('Error in GET /volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving volunteers',
      error: error.message
    });
  }
});

// GET volunteer by ID - Role-based access
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const volunteer = await VolunteerModel.getVolunteerById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }
    
    // Check if volunteer can access this specific record
    if (req.user.role === 'Volunteer' && req.user.volunteer_id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }
    
    // Filter data for donors
    let responseData = volunteer;
    if (req.user.role === 'Donor') {
      responseData = {
        volunteer_id: volunteer.volunteer_id,
        name: volunteer.name,
        skills: volunteer.skills
      };
    }
    
    res.json({
      success: true,
      data: responseData,
      message: 'Volunteer retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /volunteers/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving volunteer',
      error: error.message
    });
  }
});

// CREATE volunteer - Admin only
router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { name, skills } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: name'
      });
    }
    const newVolunteer = await VolunteerModel.createVolunteer(req.body);
    res.status(201).json({
      success: true,
      data: newVolunteer,
      message: 'Volunteer created successfully',
      created_by: req.user.username
    });
  } catch (error) {
    console.error('Error in POST /volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating volunteer',
      error: error.message
    });
  }
});

// UPDATE volunteer - Admin or the volunteer themselves
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'Admin' && req.user.volunteer_id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }
    
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: name'
      });
    }
    
    const updatedVolunteer = await VolunteerModel.updateVolunteer(req.params.id, req.body);
    if (!updatedVolunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedVolunteer,
      message: 'Volunteer updated successfully',
      updated_by: req.user.username
    });
  } catch (error) {
    console.error('Error in PUT /volunteers/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating volunteer',
      error: error.message
    });
  }
});

// DELETE volunteer - Admin only
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const deletedVolunteer = await VolunteerModel.deleteVolunteer(req.params.id);
    if (!deletedVolunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }
    res.json({
      success: true,
      data: deletedVolunteer,
      message: 'Volunteer deleted successfully',
      deleted_by: req.user.username
    });
  } catch (error) {
    console.error('Error in DELETE /volunteers/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting volunteer',
      error: error.message
    });
  }
});

// GET volunteers by skills - Protected
router.get('/skills/:skill', authenticateToken, async (req, res) => {
  try {
    const volunteers = await VolunteerModel.getVolunteersBySkill(req.params.skill);
    
    // Apply same filtering as getAllVolunteers
    let filteredData = volunteers;
    if (req.user.role === 'Volunteer') {
      filteredData = volunteers.map(vol => ({
        volunteer_id: vol.volunteer_id,
        name: vol.name,
        skills: vol.skills
      }));
    } else if (req.user.role === 'Donor') {
      filteredData = volunteers.map(vol => ({
        volunteer_id: vol.volunteer_id,
        name: vol.name,
        skills: vol.skills
      }));
    }
    
    res.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      message: 'Volunteers by skill retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /volunteers/skills/:skill:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving volunteers by skill',
      error: error.message
    });
  }
});

// GET volunteer statistics - Admin and Camp Manager only
router.get('/stats/overview', authenticateToken, authorizeRoles('Admin', 'Camp Manager'), async (req, res) => {
  try {
    const stats = await VolunteerModel.getVolunteerStats();
    res.json({
      success: true,
      data: stats,
      message: 'Volunteer statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /volunteers/stats/overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving volunteer statistics',
      error: error.message
    });
  }
});

module.exports = router;
