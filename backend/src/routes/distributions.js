const express = require('express');
const router = express.Router();
const DistributionModel = require('../models/distribution');

// GET all distributions
router.get('/', async (req, res) => {
  try {
    const distributions = await DistributionModel.getAllDistributions();
    res.json({ 
      success: true, 
      data: distributions, 
      count: distributions.length, 
      message: 'Distributions retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /distributions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving distributions', 
      error: error.message 
    });
  }
});

// GET distribution by ID
router.get('/:id', async (req, res) => {
  try {
    const distribution = await DistributionModel.getDistributionById(req.params.id);
    if (!distribution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Distribution not found' 
      });
    }
    res.json({ 
      success: true, 
      data: distribution, 
      message: 'Distribution retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /distributions/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving distribution', 
      error: error.message 
    });
  }
});

// POST create new distribution
router.post('/', async (req, res) => {
  try {
    const { victim_id, supply_id, quantity_given, date_distributed } = req.body;
    
    // Basic validation
    if (!victim_id || !supply_id || !quantity_given || !date_distributed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: victim_id, supply_id, quantity_given, date_distributed' 
      });
    }
    
    const newDistribution = await DistributionModel.createDistribution(req.body);
    res.status(201).json({ 
      success: true, 
      data: newDistribution, 
      message: 'Distribution created successfully' 
    });
  } catch (error) {
    console.error('Error in POST /distributions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating distribution', 
      error: error.message 
    });
  }
});

// PUT update distribution
router.put('/:id', async (req, res) => {
  try {
    const { victim_id, supply_id, quantity_given, date_distributed } = req.body;
    
    // Basic validation
    if (!victim_id || !supply_id || !quantity_given || !date_distributed) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: victim_id, supply_id, quantity_given, date_distributed' 
      });
    }
    
    const updatedDistribution = await DistributionModel.updateDistribution(req.params.id, req.body);
    if (!updatedDistribution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Distribution not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedDistribution, 
      message: 'Distribution updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /distributions/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating distribution', 
      error: error.message 
    });
  }
});

// DELETE distribution
router.delete('/:id', async (req, res) => {
  try {
    const deletedDistribution = await DistributionModel.deleteDistribution(req.params.id);
    if (!deletedDistribution) {
      return res.status(404).json({ 
        success: false, 
        message: 'Distribution not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: deletedDistribution, 
      message: 'Distribution deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /distributions/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting distribution', 
      error: error.message 
    });
  }
});

// GET distributions by victim
router.get('/victim/:victim_id', async (req, res) => {
  try {
    const distributions = await DistributionModel.getDistributionsByVictim(req.params.victim_id);
    res.json({ 
      success: true, 
      data: distributions, 
      count: distributions.length, 
      message: 'Distributions by victim retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /distributions/victim/:victim_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving distributions by victim', 
      error: error.message 
    });
  }
});

// GET distributions by supply
router.get('/supply/:supply_id', async (req, res) => {
  try {
    const distributions = await DistributionModel.getDistributionsBySupply(req.params.supply_id);
    res.json({ 
      success: true, 
      data: distributions, 
      count: distributions.length, 
      message: 'Distributions by supply retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /distributions/supply/:supply_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving distributions by supply', 
      error: error.message 
    });
  }
});

// GET distributions with detailed info
router.get('/with-details/info', async (req, res) => {
  try {
    const distributionsWithDetails = await DistributionModel.getDistributionsWithDetails();
    res.json({ 
      success: true, 
      data: distributionsWithDetails, 
      count: distributionsWithDetails.length, 
      message: 'Distributions with details retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /distributions/with-details/info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving distributions with details', 
      error: error.message 
    });
  }
});

// GET distribution statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await DistributionModel.getDistributionStats();
    res.json({ 
      success: true, 
      data: stats, 
      message: 'Distribution statistics retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /distributions/stats/overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving distribution statistics', 
      error: error.message 
    });
  }
});

// GET recent distributions
router.get('/recent/week', async (req, res) => {
  try {
    const recentDistributions = await DistributionModel.getRecentDistributions();
    res.json({ 
      success: true, 
      data: recentDistributions, 
      count: recentDistributions.length, 
      message: 'Recent distributions retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /distributions/recent/week:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving recent distributions', 
      error: error.message 
    });
  }
});

module.exports = router;
