const express = require('express');
const router = express.Router();
const SupplyModel = require('../models/supply');

// GET all supplies
router.get('/', async (req, res) => {
  try {
    const supplies = await SupplyModel.getAllSupplies();
    res.json({ 
      success: true, 
      data: supplies, 
      count: supplies.length, 
      message: 'Supplies retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /supplies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving supplies', 
      error: error.message 
    });
  }
});

// GET supply by ID
router.get('/:id', async (req, res) => {
  try {
    const supply = await SupplyModel.getSupplyById(req.params.id);
    if (!supply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supply not found' 
      });
    }
    res.json({ 
      success: true, 
      data: supply, 
      message: 'Supply retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /supplies/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving supply', 
      error: error.message 
    });
  }
});

// POST create new supply
router.post('/', async (req, res) => {
  try {
    const { camp_id, donation_id, type, quantity, category, item_name } = req.body;
    
    // Basic validation
    if (!camp_id || !donation_id || !type || !quantity || !item_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: camp_id, donation_id, type, quantity, item_name' 
      });
    }
    
    const newSupply = await SupplyModel.createSupply(req.body);
    res.status(201).json({ 
      success: true, 
      data: newSupply, 
      message: 'Supply created successfully' 
    });
  } catch (error) {
    console.error('Error in POST /supplies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating supply', 
      error: error.message 
    });
  }
});

// PUT update supply
router.put('/:id', async (req, res) => {
  try {
    const { camp_id, donation_id, type, quantity, item_name } = req.body;
    
    // Basic validation
    if (!camp_id || !donation_id || !type || !quantity || !item_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: camp_id, donation_id, type, quantity, item_name' 
      });
    }
    
    const updatedSupply = await SupplyModel.updateSupply(req.params.id, req.body);
    if (!updatedSupply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supply not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedSupply, 
      message: 'Supply updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /supplies/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating supply', 
      error: error.message 
    });
  }
});

// DELETE supply
router.delete('/:id', async (req, res) => {
  try {
    const deletedSupply = await SupplyModel.deleteSupply(req.params.id);
    if (!deletedSupply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supply not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: deletedSupply, 
      message: 'Supply deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /supplies/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting supply', 
      error: error.message 
    });
  }
});

// GET supplies by camp
router.get('/camp/:camp_id', async (req, res) => {
  try {
    const supplies = await SupplyModel.getSuppliesByCamp(req.params.camp_id);
    res.json({ 
      success: true, 
      data: supplies, 
      count: supplies.length, 
      message: 'Supplies by camp retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /supplies/camp/:camp_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving supplies by camp', 
      error: error.message 
    });
  }
});

// GET supplies by category
router.get('/category/:category', async (req, res) => {
  try {
    const supplies = await SupplyModel.getSuppliesByCategory(req.params.category);
    res.json({ 
      success: true, 
      data: supplies, 
      count: supplies.length, 
      message: 'Supplies by category retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /supplies/category/:category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving supplies by category', 
      error: error.message 
    });
  }
});

// GET supplies with detailed info
router.get('/with-details/info', async (req, res) => {
  try {
    const suppliesWithDetails = await SupplyModel.getSuppliesWithDetails();
    res.json({ 
      success: true, 
      data: suppliesWithDetails, 
      count: suppliesWithDetails.length, 
      message: 'Supplies with details retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /supplies/with-details/info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving supplies with details', 
      error: error.message 
    });
  }
});

// GET supply statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await SupplyModel.getSupplyStats();
    res.json({ 
      success: true, 
      data: stats, 
      message: 'Supply statistics retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /supplies/stats/overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving supply statistics', 
      error: error.message 
    });
  }
});

// GET low stock supplies
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockSupplies = await SupplyModel.getLowStockSupplies();
    res.json({ 
      success: true, 
      data: lowStockSupplies, 
      count: lowStockSupplies.length, 
      message: 'Low stock supplies retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /supplies/alerts/low-stock:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving low stock supplies', 
      error: error.message 
    });
  }
});

module.exports = router;
