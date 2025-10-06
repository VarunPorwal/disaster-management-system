const express = require('express');
const router = express.Router();
const DonorModel = require('../models/donor');
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/auth');

// GET all donors - Protected with role-based access
router.get('/', authenticateToken, async (req, res) => {
  try {
    const donors = await DonorModel.getAllDonors();
    
    // Filter sensitive information based on role
    let filteredData = donors;
    if (req.user.role === 'Donor' && req.user.donor_id) {
      // Donors can only see their own detailed info and basic info of others
      filteredData = donors.map(donor => {
        if (donor.donor_id === req.user.donor_id) {
          return donor; // Full access to own data
        } else {
          return { // Limited access to others
            donor_id: donor.donor_id,
            name: donor.name,
            type: donor.type
          };
        }
      });
    } else if (req.user.role === 'Volunteer') {
      // Volunteers can see basic donor information
      filteredData = donors.map(donor => ({
        donor_id: donor.donor_id,
        name: donor.name,
        type: donor.type
      }));
    }
    
    res.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      message: 'Donors retrieved successfully',
      user_context: { role: req.user.role, access_level: req.user.role }
    });
  } catch (error) {
    console.error('Error in GET /donors:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving donors',
      error: error.message
    });
  }
});

// GET donor by ID - Role-based access
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const donor = await DonorModel.getDonorById(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    // Check if donor can access this specific record
    if (req.user.role === 'Donor' && req.user.donor_id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }
    
    // Filter data for volunteers
    let responseData = donor;
    if (req.user.role === 'Volunteer') {
      responseData = {
        donor_id: donor.donor_id,
        name: donor.name,
        type: donor.type
      };
    }
    
    res.json({
      success: true,
      data: responseData,
      message: 'Donor retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /donors/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving donor',
      error: error.message
    });
  }
});

// CREATE donor - Admin or self-registration
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, type } = req.body;
    
    // Basic validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, type'
      });
    }
    
    // If user is authenticated, check permissions
    if (req.user && req.user.role !== 'Admin' && req.user.role !== 'Donor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins or donors can create donor records.'
      });
    }
    
    const newDonor = await DonorModel.createDonor(req.body);
    
    res.status(201).json({
      success: true,
      data: newDonor,
      message: 'Donor registered successfully',
      created_by: req.user ? req.user.username : 'Self-registration'
    });
  } catch (error) {
    console.error('Error in POST /donors:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering donor',
      error: error.message
    });
  }
});

// UPDATE donor - Admin or the donor themselves
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== 'Admin' && req.user.donor_id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }
    
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, type'
      });
    }
    
    const updatedDonor = await DonorModel.updateDonor(req.params.id, req.body);
    if (!updatedDonor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedDonor,
      message: 'Donor updated successfully',
      updated_by: req.user.username
    });
  } catch (error) {
    console.error('Error in PUT /donors/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating donor',
      error: error.message
    });
  }
});

// DELETE donor - Admin only
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const deletedDonor = await DonorModel.deleteDonor(req.params.id);
    if (!deletedDonor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }
    res.json({
      success: true,
      data: deletedDonor,
      message: 'Donor deleted successfully',
      deleted_by: req.user.username
    });
  } catch (error) {
    console.error('Error in DELETE /donors/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting donor',
      error: error.message
    });
  }
});

// GET donors by type - Protected
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const donors = await DonorModel.getDonorsByType(req.params.type);
    
    // Apply same filtering logic
    let filteredData = donors;
    if (req.user.role === 'Donor' || req.user.role === 'Volunteer') {
      filteredData = donors.map(donor => ({
        donor_id: donor.donor_id,
        name: donor.name,
        type: donor.type
      }));
    }
    
    res.json({
      success: true,
      data: filteredData,
      count: filteredData.length,
      message: 'Donors by type retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /donors/type/:type:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving donors by type',
      error: error.message
    });
  }
});

// GET donor statistics - Admin and Camp Manager only
router.get('/stats/overview', authenticateToken, authorizeRoles('Admin', 'Camp Manager'), async (req, res) => {
  try {
    const stats = await DonorModel.getDonorStats();
    res.json({
      success: true,
      data: stats,
      message: 'Donor statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /donors/stats/overview:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving donor statistics',
      error: error.message
    });
  }
});

// GET donors with donation statistics - Admin and Camp Manager only
router.get('/with-stats/info', authenticateToken, authorizeRoles('Admin', 'Camp Manager'), async (req, res) => {
  try {
    const donorsWithStats = await DonorModel.getDonorsWithStats();
    res.json({
      success: true,
      data: donorsWithStats,
      count: donorsWithStats.length,
      message: 'Donors with statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in GET /donors/with-stats/info:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving donors with statistics',
      error: error.message
    });
  }
});

module.exports = router;
