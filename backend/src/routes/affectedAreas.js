const express = require('express');
const router = express.Router();
const AffectedAreaModel = require('../models/affectedArea');

// GET all affected areas
router.get('/', async (req, res) => {
  try {
    const areas = await AffectedAreaModel.getAllAffectedAreas();
    res.json({
      success: true,
      data: areas,
      count: areas.length,
      message: 'Affected areas retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /areas:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving affected areas',
      error: error.message
    });
  }
});

// GET affected area by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const area = await AffectedAreaModel.getAffectedAreaById(id);
    
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Affected area not found'
      });
    }
    
    res.json({
      success: true,
      data: area,
      message: 'Affected area retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /areas/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving affected area',
      error: error.message
    });
  }
});

// POST create new affected area
router.post('/', async (req, res) => {
  try {
    const { disaster_id, name, state, district } = req.body;
    
    // Basic validation
    if (!disaster_id || !name || !state || !district) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: disaster_id, name, state, district'
      });
    }
    
    const newArea = await AffectedAreaModel.createAffectedArea(req.body);
    
    res.status(201).json({
      success: true,
      data: newArea,
      message: 'Affected area created successfully'
    });
  } catch (error) {
    console.error('Error in POST /areas:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating affected area',
      error: error.message
    });
  }
});

// PUT update affected area
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { disaster_id, name, state, district } = req.body;
    
    // Basic validation
    if (!disaster_id || !name || !state || !district) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: disaster_id, name, state, district'
      });
    }
    
    const updatedArea = await AffectedAreaModel.updateAffectedArea(id, req.body);
    
    if (!updatedArea) {
      return res.status(404).json({
        success: false,
        message: 'Affected area not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedArea,
      message: 'Affected area updated successfully'
    });
  } catch (error) {
    console.error('Error in PUT /areas/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating affected area',
      error: error.message
    });
  }
});

// DELETE affected area
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArea = await AffectedAreaModel.deleteAffectedArea(id);
    
    if (!deletedArea) {
      return res.status(404).json({
        success: false,
        message: 'Affected area not found'
      });
    }
    
    res.json({
      success: true,
      data: deletedArea,
      message: 'Affected area deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /areas/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting affected area',
      error: error.message
    });
  }
});

// GET areas by disaster
router.get('/disaster/:disaster_id', async (req, res) => {
  try {
    const { disaster_id } = req.params;
    const areas = await AffectedAreaModel.getAffectedAreasByDisaster(disaster_id);
    
    res.json({
      success: true,
      data: areas,
      count: areas.length,
      message: 'Affected areas by disaster retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /areas/disaster/:disaster_id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving areas by disaster',
      error: error.message
    });
  }
});

// GET areas with disaster info
router.get('/with-disaster/info', async (req, res) => {
  try {
    const areasWithDisaster = await AffectedAreaModel.getAffectedAreasWithDisaster();
    res.json({
      success: true,
      data: areasWithDisaster,
      count: areasWithDisaster.length,
      message: 'Areas with disaster info retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /areas/with-disaster/info:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving areas with disaster info',
      error: error.message
    });
  }
});

// GET area statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await AffectedAreaModel.getAreaStats();
    res.json({
      success: true,
      data: stats,
      message: 'Area statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /areas/stats/overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving area statistics',
      error: error.message
    });
  }
});

module.exports = router;
