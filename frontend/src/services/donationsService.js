import api from './api';

export const donationsService = {
  // Get all donations with donor details
  getAllDonations: async () => {
    try {
      const response = await api.get('/donations/with-donor/info');
      return response.data;
    } catch (error) {
      console.warn('Detailed donations API failed, trying basic:', error.message);
      const response = await api.get('/donations');
      return response.data;
    }
  },
  
  // Get cash donations only
  getCashDonations: async () => {
    const response = await api.get('/donations/cash/all');
    return response.data;
  },
  
  // Get in-kind donations only
  getInKindDonations: async () => {
    const response = await api.get('/donations/in-kind/all');
    return response.data;
  },
  
  // Get donations by specific donor
  getDonationsByDonor: async (donorId) => {
    const response = await api.get(`/donations/donor/${donorId}`);
    return response.data;
  },
  
  // Create new donation
  createDonation: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },
  
  // Update donation
  updateDonation: async (id, donationData) => {
    const response = await api.put(`/donations/${id}`, donationData);
    return response.data;
  },
  
  // Update donation status only
  updateDonationStatus: async (id, status) => {
    const response = await api.put(`/donations/${id}`, { status });
    return response.data;
  },
  
  // Delete donation
  deleteDonation: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },
  
  // Get donation statistics
  getDonationStats: async () => {
    const response = await api.get('/donations/stats/overview');
    return response.data;
  }
};
