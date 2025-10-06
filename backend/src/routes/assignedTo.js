const express = require('express');
const router = express.Router();
const AssignedToModel = require('../models/assignedTo');

// GET all area assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await AssignedToModel.getAllAreaAssignments();
    res.json({ 
      success: true, 
      data: assignments, 
      count: assignments.length, 
      message: 'Area assignments retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /assigned-to:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving area assignments', 
      error: error.message 
    });
  }
});

// GET area assignment by volunteer and area
router.get('/:volunteer_id/:area_id', async (req, res) => {
  try {
    const assignment = await AssignedToModel.getAreaAssignment(req.params.volunteer_id, req.params.area_id);
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Area assignment not found' 
      });
    }
    res.json({ 
      success: true, 
      data: assignment, 
      message: 'Area assignment retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /assigned-to/:volunteer_id/:area_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving area assignment', 
      error: error.message 
    });
  }
});

// POST create new area assignment
router.post('/', async (req, res) => {
  try {
    const { volunteer_id, area_id, assign_date } = req.body;
    
    // Basic validation
    if (!volunteer_id || !area_id || !assign_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: volunteer_id, area_id, assign_date' 
      });
    }
    
    const newAssignment = await AssignedToModel.createAreaAssignment(req.body);
    res.status(201).json({ 
      success: true, 
      data: newAssignment, 
      message: 'Area assignment created successfully' 
    });
  } catch (error) {
    console.error('Error in POST /assigned-to:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating area assignment', 
      error: error.message 
    });
  }
});

// PUT update area assignment
router.put('/:volunteer_id/:area_id', async (req, res) => {
  try {
    const { assign_date } = req.body;
    
    if (!assign_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: assign_date' 
      });
    }
    
    const updatedAssignment = await AssignedToModel.updateAreaAssignment(req.params.volunteer_id, req.params.area_id, req.body);
    if (!updatedAssignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Area assignment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedAssignment, 
      message: 'Area assignment updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /assigned-to/:volunteer_id/:area_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating area assignment', 
      error: error.message 
    });
  }
});

// DELETE area assignment
router.delete('/:volunteer_id/:area_id', async (req, res) => {
  try {
    const deletedAssignment = await AssignedToModel.deleteAreaAssignment(req.params.volunteer_id, req.params.area_id);
    if (!deletedAssignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Area assignment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: deletedAssignment, 
      message: 'Area assignment deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /assigned-to/:volunteer_id/:area_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting area assignment', 
      error: error.message 
    });
  }
});

// GET area assignments by volunteer
router.get('/volunteer/:volunteer_id', async (req, res) => {
  try {
    const assignments = await AssignedToModel.getAreaAssignmentsByVolunteer(req.params.volunteer_id);
    res.json({ 
      success: true, 
      data: assignments, 
      count: assignments.length, 
      message: 'Area assignments by volunteer retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /assigned-to/volunteer/:volunteer_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving area assignments by volunteer', 
      error: error.message 
    });
  }
});

// GET area assignments by area
router.get('/area/:area_id', async (req, res) => {
  try {
    const assignments = await AssignedToModel.getAreaAssignmentsByArea(req.params.area_id);
    res.json({ 
      success: true, 
      data: assignments, 
      count: assignments.length, 
      message: 'Area assignments by area retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /assigned-to/area/:area_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving area assignments by area', 
      error: error.message 
    });
  }
});

// GET area assignments with detailed info
router.get('/with-details/info', async (req, res) => {
  try {
    const assignmentsWithDetails = await AssignedToModel.getAreaAssignmentsWithDetails();
    res.json({ 
      success: true, 
      data: assignmentsWithDetails, 
      count: assignmentsWithDetails.length, 
      message: 'Area assignments with details retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /assigned-to/with-details/info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving area assignments with details', 
      error: error.message 
    });
  }
});

// GET area assignment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await AssignedToModel.getAreaAssignmentStats();
    res.json({ 
      success: true, 
      data: stats, 
      message: 'Area assignment statistics retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /assigned-to/stats/overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving area assignment statistics', 
      error: error.message 
    });
  }
});

module.exports = router;
