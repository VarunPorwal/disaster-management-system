const express = require('express');
const router = express.Router();
const ReliefCampModel = require('../models/reliefCamp');

// GET all relief camps
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

// GET relief camp by ID
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

// POST create new relief camp
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

// PUT update relief camp
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
    
    const updatedCamp = await ReliefCampModel.updateReliefCamp(id, req.body);
    
    if (!updatedCamp) {
      return res.status(404).json({
        success: false,
        message: 'Relief camp not found'
      });
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

// DELETE relief camp
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCamp = await ReliefCampModel.deleteReliefCamp(id);
    
    if (!deletedCamp) {
      return res.status(404).json({
        success: false,
        message: 'Relief camp not found'
      });
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

// GET camps by area
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

// GET camps by manager
router.get('/manager/:manager_id', async (req, res) => {
  try {
    const { manager_id } = req.params;
    const camps = await ReliefCampModel.getCampsByManager(manager_id);
    
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

// GET camps with detailed info
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

// GET camp statistics
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
