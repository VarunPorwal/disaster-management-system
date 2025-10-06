const express = require('express');
const router = express.Router();
const DonationModel = require('../models/donation');

router.get('/', async (req, res) => {
  try {
    const donations = await DonationModel.getAllDonations();
    res.json({ success: true, data: donations, count: donations.length, message: 'Donations retrieved successfully' });
  } catch (error) {
    console.error('Error in GET /donations:', error);
    res.status(500).json({ success: false, message: 'Error retrieving donations', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const donation = await DonationModel.getDonationById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.json({ success: true, data: donation, message: 'Donation retrieved successfully' });
  } catch (error) {
    console.error('Error in GET /donations/:id:', error);
    res.status(500).json({ success: false, message: 'Error retrieving donation', error: error.message });
  }
});

router.get('/cash/all', async (req, res) => {
  try {
    const donations = await DonationModel.getCashDonations();
    res.json({ 
      success: true, 
      data: donations, 
      count: donations.length, 
      message: 'Cash donations retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /donations/cash/all:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving cash donations', 
      error: error.message 
    });
  }
});

// GET in-kind donations only
router.get('/in-kind/all', async (req, res) => {
  try {
    const donations = await DonationModel.getInKindDonations();
    res.json({ 
      success: true, 
      data: donations, 
      count: donations.length, 
      message: 'In-kind donations retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /donations/in-kind/all:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving in-kind donations', 
      error: error.message 
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { donor_id, type, date } = req.body;
    
    // Basic validation
    if (!donor_id || !type || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: donor_id, type, date' 
      });
    }

    // Type-specific validation
    if (type === 'Cash' && !req.body.amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cash donations require amount field' 
      });
    }

    if (type !== 'Cash' && (!req.body.quantity || !req.body.unit)) {
      return res.status(400).json({ 
        success: false, 
        message: 'In-kind donations require quantity and unit fields' 
      });
    }
    
    const newDonation = await DonationModel.createDonation(req.body);
    res.status(201).json({ 
      success: true, 
      data: newDonation, 
      message: 'Donation created successfully' 
    });
  } catch (error) {
    console.error('Error in POST /donations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating donation', 
      error: error.message 
    });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { donor_id, type, date } = req.body;
    if (!donor_id || !type || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields: donor_id, type, date' });
    }
    const updated = await DonationModel.updateDonation(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.json({ success: true, data: updated, message: 'Donation updated successfully' });
  } catch (error) {
    console.error('Error in PUT /donations/:id:', error);
    res.status(500).json({ success: false, message: 'Error updating donation', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await DonationModel.deleteDonation(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.json({ success: true, data: deleted, message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /donations/:id:', error);
    res.status(500).json({ success: false, message: 'Error deleting donation', error: error.message });
  }
});

router.get('/donor/:donor_id', async (req, res) => {
  try {
    const donations = await DonationModel.getDonationsByDonor(req.params.donor_id);
    res.json({ success: true, data: donations, count: donations.length, message: 'Donations by donor retrieved successfully' });
  } catch (error) {
    console.error('Error in GET /donations/donor/:donor_id:', error);
    res.status(500).json({ success: false, message: 'Error retrieving donations by donor', error: error.message });
  }
});

router.get('/with-donor/info', async (req, res) => {
  try {
    const donations = await DonationModel.getDonationsWithDonorInfo();
    res.json({ success: true, data: donations, count: donations.length, message: 'Donations with donor info retrieved successfully' });
  } catch (error) {
    console.error('Error in GET /donations/with-donor/info:', error);
    res.status(500).json({ success: false, message: 'Error retrieving donations with donor info', error: error.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await DonationModel.getDonationStats();
    res.json({ success: true, data: stats, message: 'Donation statistics retrieved successfully' });
  } catch (error) {
    console.error('Error in GET /donations/stats/overview:', error);
    res.status(500).json({ success: false, message: 'Error retrieving donation statistics', error: error.message });
  }
});

module.exports = router;
