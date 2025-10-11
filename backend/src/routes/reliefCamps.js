const express = require('express');
const router = express.Router();
const ReliefCampModel = require('../models/reliefCamp');
const pool = require('../config/database'); // ADD THIS LINE

// GET all relief camps - KEEP EXACTLY THE SAME
router.get('/', async (req, res) => {
  try {
    const camps = await ReliefCampModel.getAllReliefCamps();
    res.json({
      success: true,
      data: camps,
      count: camps.length,
      message: 'Relief camps retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /camps:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving relief camps',
      error: error.message
    });
  }
});

// GET relief camp by ID - KEEP EXACTLY THE SAME
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const camp = await ReliefCampModel.getReliefCampById(id);
    
    if (!camp) {
      return res.status(404).json({
        success: false,
        message: 'Relief camp not found'
      });
    }
    
    res.json({
      success: true,
      data: camp,
      message: 'Relief camp retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /camps/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving relief camp',
      error: error.message
    });
  }
});

// POST create new relief camp - ADD ROLE MANAGEMENT ONLY
router.post('/', async (req, res) => {
  try {
    const { area_id, manager_id, name, capacity, location, date_established } = req.body;
    
    // Basic validation
    if (!area_id || !name || !capacity || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: area_id, name, capacity, location'
      });
    }
    
    const newCamp = await ReliefCampModel.createReliefCamp(req.body);
    
    // 🔥 ADD ONLY ROLE MANAGEMENT
    if (manager_id) {
      const volunteer = await pool.query('SELECT name FROM Volunteers WHERE volunteer_id = $1', [manager_id]);
      if (volunteer.rows.length > 0) {
        const volunteerName = volunteer.rows[0].name;
        await pool.query(`UPDATE users SET role = 'Camp Manager' WHERE full_name = $1 AND role = 'Volunteer'`, [volunteerName]);
      }
    }
    
    res.status(201).json({
      success: true,
      data: newCamp,
      message: 'Relief camp created successfully'
    });
  } catch (error) {
    console.error('Error in POST /camps:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating relief camp',
      error: error.message
    });
  }
});

// PUT update relief camp - ADD ROLE MANAGEMENT ONLY
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { area_id, manager_id, name, capacity, location, date_established } = req.body;
    
    // Basic validation
    if (!area_id || !name || !capacity || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: area_id, name, capacity, location'
      });
    }
    
    // 🔥 ADD ROLE MANAGEMENT - Get old manager
    const currentCamp = await pool.query('SELECT manager_id FROM ReliefCamps WHERE camp_id = $1', [id]);
    const oldManagerVolunteerId = currentCamp.rows[0]?.manager_id;
    
    const updatedCamp = await ReliefCampModel.updateReliefCamp(id, req.body);
    
    if (!updatedCamp) {
      return res.status(404).json({
        success: false,
        message: 'Relief camp not found'
      });
    }
    
    // 🔥 ADD ROLE MANAGEMENT
    // Promote new manager
    if (manager_id && manager_id !== oldManagerVolunteerId) {
      const newVolunteer = await pool.query('SELECT name FROM Volunteers WHERE volunteer_id = $1', [manager_id]);
      if (newVolunteer.rows.length > 0) {
        const newVolunteerName = newVolunteer.rows[0].name;
        await pool.query(`UPDATE users SET role = 'Camp Manager' WHERE full_name = $1 AND role = 'Volunteer'`, [newVolunteerName]);
      }
    }
    
    // Demote old manager if no other camps
    if (oldManagerVolunteerId && oldManagerVolunteerId !== manager_id) {
      const otherCamps = await pool.query('SELECT camp_id FROM ReliefCamps WHERE manager_id = $1 AND camp_id != $2', [oldManagerVolunteerId, id]);
      if (otherCamps.rows.length === 0) {
        const oldVolunteer = await pool.query('SELECT name FROM Volunteers WHERE volunteer_id = $1', [oldManagerVolunteerId]);
        if (oldVolunteer.rows.length > 0) {
          const oldVolunteerName = oldVolunteer.rows[0].name;
          await pool.query(`UPDATE users SET role = 'Volunteer' WHERE full_name = $1 AND role = 'Camp Manager'`, [oldVolunteerName]);
        }
      }
    }
    
    res.json({
      success: true,
      data: updatedCamp,
      message: 'Relief camp updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /camps/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating relief camp',
      error: error.message
    });
  }
});

// DELETE relief camp - ADD ROLE MANAGEMENT ONLY
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 🔥 ADD ROLE MANAGEMENT - Get manager before delete
    const campToDelete = await pool.query('SELECT manager_id FROM ReliefCamps WHERE camp_id = $1', [id]);
    const managerVolunteerId = campToDelete.rows[0]?.manager_id;
    
    const deletedCamp = await ReliefCampModel.deleteReliefCamp(id);
    
    if (!deletedCamp) {
      return res.status(404).json({
        success: false,
        message: 'Relief camp not found'
      });
    }
    
    // 🔥 ADD ROLE MANAGEMENT - Demote if no other camps
    if (managerVolunteerId) {
      const remainingCamps = await pool.query('SELECT camp_id FROM ReliefCamps WHERE manager_id = $1', [managerVolunteerId]);
      if (remainingCamps.rows.length === 0) {
        const volunteer = await pool.query('SELECT name FROM Volunteers WHERE volunteer_id = $1', [managerVolunteerId]);
        if (volunteer.rows.length > 0) {
          const volunteerName = volunteer.rows[0].name;
          await pool.query(`UPDATE users SET role = 'Volunteer' WHERE full_name = $1 AND role = 'Camp Manager'`, [volunteerName]);
        }
      }
    }
    
    res.json({
      success: true,
      data: deletedCamp,
      message: 'Relief camp deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /camps/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting relief camp',
      error: error.message
    });
  }
});

// GET camps by area - KEEP EXACTLY THE SAME
router.get('/area/:area_id', async (req, res) => {
  try {
    const { area_id } = req.params;
    const camps = await ReliefCampModel.getCampsByArea(area_id);
    
    res.json({
      success: true,
      data: camps,
      count: camps.length,
      message: 'Camps by area retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /camps/area/:area_id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving camps by area',
      error: error.message
    });
  }
});

// GET camps by manager - FIX TO HANDLE user_id to volunteer_id
router.get('/manager/:manager_id', async (req, res) => {
  try {
    const { manager_id } = req.params;
    
    // Check if manager_id is user_id (from frontend) or volunteer_id (direct)
    let volunteerId = manager_id;
    
    // If manager_id is a user_id, convert it to volunteer_id
    const userCheck = await pool.query('SELECT full_name FROM users WHERE user_id = $1', [manager_id]);
    if (userCheck.rows.length > 0) {
      const userFullName = userCheck.rows[0].full_name;
      const volunteerCheck = await pool.query('SELECT volunteer_id FROM Volunteers WHERE name = $1', [userFullName]);
      if (volunteerCheck.rows.length > 0) {
        volunteerId = volunteerCheck.rows[0].volunteer_id;
      }
    }
    
    const camps = await ReliefCampModel.getCampsByManager(volunteerId);
    
    res.json({
      success: true,
      data: camps,
      count: camps.length,
      message: 'Camps by manager retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /camps/manager/:manager_id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving camps by manager',
      error: error.message
    });
  }
});

// GET camps with detailed info - KEEP EXACTLY THE SAME
router.get('/with-details/info', async (req, res) => {
  try {
    const campsWithDetails = await ReliefCampModel.getCampsWithDetails();
    res.json({
      success: true,
      data: campsWithDetails,
      count: campsWithDetails.length,
      message: 'Camps with details retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /camps/with-details/info:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving camps with details',
      error: error.message
    });
  }
});

// GET camp statistics - KEEP EXACTLY THE SAME
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await ReliefCampModel.getCampStats();
    res.json({
      success: true,
      data: stats,
      message: 'Camp statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /camps/stats/overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving camp statistics',
      error: error.message
    });
  }
});

module.exports = router;
