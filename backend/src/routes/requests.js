const express = require('express');
const router = express.Router();
const RequestModel = require('../models/request');

// GET all requests
router.get('/', async (req, res) => {
  try {
    const requests = await RequestModel.getAllRequests();
    res.json({ 
      success: true, 
      data: requests, 
      count: requests.length, 
      message: 'Requests retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving requests', 
      error: error.message 
    });
  }
});

// GET request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await RequestModel.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }
    res.json({ 
      success: true, 
      data: request, 
      message: 'Request retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /requests/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving request', 
      error: error.message 
    });
  }
});

// POST create new request
router.post('/', async (req, res) => {
  try {
    const { victim_id, camp_id, item_requested, quantity_needed, request_date } = req.body;
    
    // Basic validation
    if (!victim_id || !camp_id || !item_requested || !quantity_needed || !request_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: victim_id, camp_id, item_requested, quantity_needed, request_date' 
      });
    }
    
    const newRequest = await RequestModel.createRequest(req.body);
    res.status(201).json({ 
      success: true, 
      data: newRequest, 
      message: 'Request created successfully' 
    });
  } catch (error) {
    console.error('Error in POST /requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating request', 
      error: error.message 
    });
  }
});

// PUT update request
router.put('/:id', async (req, res) => {
  try {
    const { victim_id, camp_id, item_requested, quantity_needed, request_date } = req.body;
    
    // Basic validation
    if (!victim_id || !camp_id || !item_requested || !quantity_needed || !request_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: victim_id, camp_id, item_requested, quantity_needed, request_date' 
      });
    }
    
    const updatedRequest = await RequestModel.updateRequest(req.params.id, req.body);
    if (!updatedRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updatedRequest, 
      message: 'Request updated successfully' 
    });
  } catch (error) {
    console.error('Error in PUT /requests/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating request', 
      error: error.message 
    });
  }
});

// DELETE request
router.delete('/:id', async (req, res) => {
  try {
    const deletedRequest = await RequestModel.deleteRequest(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: deletedRequest, 
      message: 'Request deleted successfully' 
    });
  } catch (error) {
    console.error('Error in DELETE /requests/:id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting request', 
      error: error.message 
    });
  }
});

// GET requests by victim
router.get('/victim/:victim_id', async (req, res) => {
  try {
    const requests = await RequestModel.getRequestsByVictim(req.params.victim_id);
    res.json({ 
      success: true, 
      data: requests, 
      count: requests.length, 
      message: 'Requests by victim retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /requests/victim/:victim_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving requests by victim', 
      error: error.message 
    });
  }
});

// GET requests by camp
router.get('/camp/:camp_id', async (req, res) => {
  try {
    const requests = await RequestModel.getRequestsByCamp(req.params.camp_id);
    res.json({ 
      success: true, 
      data: requests, 
      count: requests.length, 
      message: 'Requests by camp retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /requests/camp/:camp_id:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving requests by camp', 
      error: error.message 
    });
  }
});

// GET requests with detailed info
router.get('/with-details/info', async (req, res) => {
  try {
    const requestsWithDetails = await RequestModel.getRequestsWithDetails();
    res.json({ 
      success: true, 
      data: requestsWithDetails, 
      count: requestsWithDetails.length, 
      message: 'Requests with details retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /requests/with-details/info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving requests with details', 
      error: error.message 
    });
  }
});

// GET request statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await RequestModel.getRequestStats();
    res.json({ 
      success: true, 
      data: stats, 
      message: 'Request statistics retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /requests/stats/overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving request statistics', 
      error: error.message 
    });
  }
});

// GET urgent requests
router.get('/alerts/urgent', async (req, res) => {
  try {
    const urgentRequests = await RequestModel.getUrgentRequests();
    res.json({ 
      success: true, 
      data: urgentRequests, 
      count: urgentRequests.length, 
      message: 'Urgent requests retrieved successfully' 
    });
  } catch (error) {
    console.error('Error in GET /requests/alerts/urgent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving urgent requests', 
      error: error.message 
    });
  }
});

module.exports = router;
