const express = require('express');
const router = express.Router();
const WorksAtModel = require('../models/worksAt');

// GET all work assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await WorksAtModel.getAllWorkAssignments();
    res.json({ 
      success: true, 
      data: assignments, 
      count: assignments.length, 
      message: 'Work assignments retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /works-at:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving work assignments', 
      error: error.message 
    });
  }
});

// GET work assignment by volunteer and camp
router.get('/:volunteer_id/:camp_id', async (req, res) => {
  try {
    const assignment = await WorksAtModel.getWorkAssignment(req.params.volunteer_id, req.params.camp_id);
    if (!assignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work assignment not found' 
      });
    }
    res.json({ 
      success: true, 
      data: assignment, 
      message: 'Work assignment retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /works-at/:volunteer_id/:camp_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving work assignment', 
      error: error.message 
    });
  }
});

// POST create new work assignment
router.post('/', async (req, res) => {
  try {
    const { volunteer_id, camp_id, role } = req.body;
    
    // Basic validation
    if (!volunteer_id || !camp_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: volunteer_id, camp_id' 
      });
    }
    
    const newAssignment = await WorksAtModel.createWorkAssignment(req.body);
    res.status(201).json({ 
      success: true, 
      data: newAssignment, 
      message: 'Work assignment created successfully' 
    });
  } catch (error) {
    console.error('Error in POST /works-at:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating work assignment', 
      error: error.message 
    });
  }
});

// PUT update work assignment
router.put('/:volunteer_id/:camp_id', async (req, res) => {
  try {
    const { role } = req.body;
    
    const updatedAssignment = await WorksAtModel.updateWorkAssignment(req.params.volunteer_id, req.params.camp_id, req.body);
    if (!updatedAssignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work assignment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedAssignment, 
      message: 'Work assignment updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /works-at/:volunteer_id/:camp_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating work assignment', 
      error: error.message 
    });
  }
});

// DELETE work assignment
router.delete('/:volunteer_id/:camp_id', async (req, res) => {
  try {
    const deletedAssignment = await WorksAtModel.deleteWorkAssignment(req.params.volunteer_id, req.params.camp_id);
    if (!deletedAssignment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work assignment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: deletedAssignment, 
      message: 'Work assignment deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /works-at/:volunteer_id/:camp_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting work assignment', 
      error: error.message 
    });
  }
});

// GET work assignments by volunteer
router.get('/volunteer/:volunteer_id', async (req, res) => {
  try {
    const assignments = await WorksAtModel.getWorkAssignmentsByVolunteer(req.params.volunteer_id);
    res.json({ 
      success: true, 
      data: assignments, 
      count: assignments.length, 
      message: 'Work assignments by volunteer retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /works-at/volunteer/:volunteer_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving work assignments by volunteer', 
      error: error.message 
    });
  }
});

// GET work assignments by camp
router.get('/camp/:camp_id', async (req, res) => {
  try {
    const assignments = await WorksAtModel.getWorkAssignmentsByCamp(req.params.camp_id);
    res.json({ 
      success: true, 
      data: assignments, 
      count: assignments.length, 
      message: 'Work assignments by camp retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /works-at/camp/:camp_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving work assignments by camp', 
      error: error.message 
    });
  }
});

// GET work assignments with detailed info
router.get('/with-details/info', async (req, res) => {
  try {
    const assignmentsWithDetails = await WorksAtModel.getWorkAssignmentsWithDetails();
    res.json({ 
      success: true, 
      data: assignmentsWithDetails, 
      count: assignmentsWithDetails.length, 
      message: 'Work assignments with details retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /works-at/with-details/info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving work assignments with details', 
      error: error.message 
    });
  }
});

// GET work assignment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await WorksAtModel.getWorkAssignmentStats();
    res.json({ 
      success: true, 
      data: stats, 
      message: 'Work assignment statistics retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /works-at/stats/overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving work assignment statistics', 
      error: error.message 
    });
  }
});

module.exports = router;
