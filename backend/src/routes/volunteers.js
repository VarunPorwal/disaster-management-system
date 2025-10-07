const express = require('express');
const router = express.Router();
const VolunteerModel = require('../models/volunteer');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');

// GET volunteers with assignments - Fixed for your schema
router.get('/with-assignments', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const pool = require('../config/database');
    const result = await pool.query(`
      SELECT 
        v.volunteer_id,
        v.name,
        v.email,
        v.contact,
        v.skills,
        
        
        -- Area assignment info from AssignedTo junction table
        at.area_id as assigned_area_id,
        at.assign_date,
        aa.name as area_name,
        aa.district as area_district,
        aa.state as area_state,
        
        -- Camp work info from WorksAt junction table
        wa.camp_id as works_at_camp_id,
        wa.role as work_role,
        rc.name as camp_name,
        rc.location as camp_location,
        rc.status as camp_status
        
      FROM Volunteers v
      LEFT JOIN AssignedTo at ON v.volunteer_id = at.volunteer_id
      LEFT JOIN AffectedAreas aa ON at.area_id = aa.area_id
      LEFT JOIN WorksAt wa ON v.volunteer_id = wa.volunteer_id  
      LEFT JOIN ReliefCamps rc ON wa.camp_id = rc.camp_id
      ORDER BY v.volunteer_id, at.area_id, wa.camp_id
    `);
    
    console.log(`Found ${result.rows.length} volunteer assignment records`);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      message: 'Volunteers with assignments retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /volunteers/with-assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving volunteers with assignments',
      error: error.message
    });
  }
});


// ADD assignment endpoints HERE too - BEFORE /:id route
router.post('/assign-area', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { volunteer_id, area_id } = req.body;
    const assign_date = new Date().toISOString().split('T')[0];
    
    const AssignedToModel = require('../models/assignedTo');
    const newAssignment = await AssignedToModel.createAreaAssignment({
      volunteer_id,
      area_id, 
      assign_date
    });
    
    res.status(201).json({
      success: true,
      data: newAssignment,
      message: 'Volunteer assigned to area successfully'
    });
  } catch (error) {
    console.error('Error in POST /volunteers/assign-area:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning volunteer to area',
      error: error.message
    });
  }
});

router.post('/assign-camp', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const { volunteer_id, camp_id, role } = req.body;
    
    const WorksAtModel = require('../models/worksAt');
    const newAssignment = await WorksAtModel.createWorkAssignment({
      volunteer_id,
      camp_id,
      role: role || 'General Worker'
    });
    
    res.status(201).json({
      success: true,
      data: newAssignment,
      message: 'Volunteer assigned to camp successfully'
    });
  } catch (error) {
    console.error('Error in POST /volunteers/assign-camp:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning volunteer to camp',
      error: error.message
    });
  }
});

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
