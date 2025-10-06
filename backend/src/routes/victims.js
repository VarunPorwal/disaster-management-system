const express = require('express');
const router = express.Router();
const VictimModel = require('../models/victim');

// GET all victims
router.get('/', async (req, res) => {
  try {
    const victims = await VictimModel.getAllVictims();
    res.json({
      success: true,
      data: victims,
      count: victims.length,
      message: 'Victims retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /victims:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving victims',
      error: error.message
    });
  }
});

// GET victim by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const victim = await VictimModel.getVictimById(id);
    
    if (!victim) {
      return res.status(404).json({
        success: false,
        message: 'Victim not found'
      });
    }
    
    res.json({
      success: true,
      data: victim,
      message: 'Victim retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /victims/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving victim',
      error: error.message
    });
  }
});

// POST create new victim
router.post('/', async (req, res) => {
  try {
    const { area_id, name, age, gender } = req.body;
    
    // Basic validation
    if (!area_id || !name || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: area_id, name, age, gender'
      });
    }
    
    const newVictim = await VictimModel.createVictim(req.body);
    
    res.status(201).json({
      success: true,
      data: newVictim,
      message: 'Victim registered successfully'
    });
  } catch (error) {
    console.error('Error in POST /victims:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering victim',
      error: error.message
    });
  }
});

// PUT update victim
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { area_id, name, age, gender } = req.body;
    
    // Basic validation
    if (!area_id || !name || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: area_id, name, age, gender'
      });
    }
    
    const updatedVictim = await VictimModel.updateVictim(id, req.body);
    
    if (!updatedVictim) {
      return res.status(404).json({
        success: false,
        message: 'Victim not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedVictim,
      message: 'Victim updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /victims/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating victim',
      error: error.message
    });
  }
});

// DELETE victim
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVictim = await VictimModel.deleteVictim(id);
    
    if (!deletedVictim) {
      return res.status(404).json({
        success: false,
        message: 'Victim not found'
      });
    }
    
    res.json({
      success: true,
      data: deletedVictim,
      message: 'Victim deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /victims/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting victim',
      error: error.message
    });
  }
});

// GET victims by area
router.get('/area/:area_id', async (req, res) => {
  try {
    const { area_id } = req.params;
    const victims = await VictimModel.getVictimsByArea(area_id);
    
    res.json({
      success: true,
      data: victims,
      count: victims.length,
      message: 'Victims by area retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /victims/area/:area_id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving victims by area',
      error: error.message
    });
  }
});

// GET victims by camp
router.get('/camp/:camp_id', async (req, res) => {
  try {
    const { camp_id } = req.params;
    const victims = await VictimModel.getVictimsByCamp(camp_id);
    
    res.json({
      success: true,
      data: victims,
      count: victims.length,
      message: 'Victims by camp retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /victims/camp/:camp_id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving victims by camp',
      error: error.message
    });
  }
});

// GET victims with detailed info
router.get('/with-details/info', async (req, res) => {
  try {
    const victimsWithDetails = await VictimModel.getVictimsWithDetails();
    res.json({
      success: true,
      data: victimsWithDetails,
      count: victimsWithDetails.length,
      message: 'Victims with details retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /victims/with-details/info:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving victims with details',
      error: error.message
    });
  }
});

// GET victim statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await VictimModel.getVictimStats();
    res.json({
      success: true,
      data: stats,
      message: 'Victim statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /victims/stats/overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving victim statistics',
      error: error.message
    });
  }
});

module.exports = router;
