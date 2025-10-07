import api from './api';

export const suppliesService = {
  // Get all supplies with camp/donor details
  getAllSupplies: async () => {
    try {
      const response = await api.get('/supplies/with-details/info');
      return response.data;
    } catch (error) {
      console.warn('Detailed supplies API failed, trying basic:', error.message);
      const response = await api.get('/supplies');
      return response.data;
    }
  },
  
  // Get supplies by specific camp
  getSuppliesByCamp: async (campId) => {
    const response = await api.get(`/supplies/camp/${campId}`);
    return response.data;
  },
  
  // Create new supply (from donation conversion)
  createSupply: async (supplyData) => {
    const response = await api.post('/supplies', supplyData);
    return response.data;
  },
  
  // Update supply quantities/status
  updateSupply: async (id, supplyData) => {
    const response = await api.put(`/supplies/${id}`, supplyData);
    return response.data;
  },
  
  // Delete supply
  deleteSupply: async (id) => {
    const response = await api.delete(`/supplies/${id}`);
    return response.data;
  },
  
  // Get low stock alerts
  getLowStockAlerts: async () => {
    const response = await api.get('/supplies/alerts/low-stock');
    return response.data;
  },
  
  // Get supply statistics
  getSupplyStats: async () => {
    const response = await api.get('/supplies/stats/overview');
    return response.data;
  }
};

export const donationsService = {
  // Get all donations
  getAllDonations: async () => {
    const response = await api.get('/donations');
    return response.data;
  },
  
  // Get pending donations (not yet converted to supplies)
  getPendingDonations: async () => {
    const response = await api.get('/donations?status=Pledged');
    return response.data;
  },
  
  // Update donation status (Pledged → Received → Distributed)
  updateDonationStatus: async (id, status) => {
    const response = await api.put(`/donations/${id}`, { status });
    return response.data;
  }
};
