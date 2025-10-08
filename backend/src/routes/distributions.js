const express = require('express');
const router = express.Router();
const DistributionModel = require('../models/distribution');
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const distributions = await DistributionModel.getAllDistributions();
    res.json({ success: true, data: distributions, count: distributions.length, message: 'Distributions retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving distributions', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { victim_id, quantity_distributed } = req.body;
    if (!victim_id || !quantity_distributed) {
      return res.status(400).json({ success: false, message: 'Missing required fields: victim_id, quantity_distributed' });
    }
    const newDistribution = await DistributionModel.createDistribution(req.body);
    res.status(201).json({ success: true, data: newDistribution, message: 'Distribution created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating distribution', error: error.message });
  }
});

router.post('/fulfill-request/:request_id', async (req, res) => {
  try {
    const { supply_id, quantity_distributed } = req.body;
    const request_id = parseInt(req.params.request_id);
    
    const requestResult = await pool.query('SELECT * FROM Request WHERE request_id = $1', [request_id]);
    if (!requestResult.rows[0]) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    const request = requestResult.rows[0];
    const distributionData = { request_id, victim_id: request.victim_id, supply_id, quantity_distributed };
    
    const newDistribution = await DistributionModel.createDistribution(distributionData);
    res.status(201).json({ success: true, data: newDistribution, message: 'Request fulfilled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fulfilling request', error: error.message });
  }
});

router.get('/with-details/info', async (req, res) => {
  try {
    const distributionsWithDetails = await DistributionModel.getDistributionsWithDetails();
    res.json({ success: true, data: distributionsWithDetails, count: distributionsWithDetails.length, message: 'Distributions with details retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving distributions with details', error: error.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await DistributionModel.getDistributionStats();
    res.json({ success: true, data: stats, message: 'Distribution statistics retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving distribution statistics', error: error.message });
  }
});

// New route for camp-specific supplies
router.get('/supplies/camp/:camp_id', async (req, res) => {
  try {
    const supplies = await DistributionModel.getSuppliesByCamp(req.params.camp_id);
    res.json({ success: true, data: supplies, count: supplies.length, message: 'Camp supplies retrieved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving camp supplies', error: error.message });
  }
});

module.exports = router;
