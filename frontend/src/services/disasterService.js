import api from './api';

export const disasterService = {
  // Get all disasters
  getAllDisasters: async () => {
    const response = await api.get('/disasters');
    return response.data;
  },

  // Get disaster by ID
  getDisasterById: async (id) => {
    const response = await api.get(`/disasters/${id}`);
    return response.data;
  },

  // Create new disaster
  createDisaster: async (disasterData) => {
    const response = await api.post('/disasters', disasterData);
    return response.data;
  },

  // Update disaster
  updateDisaster: async (id, disasterData) => {
    const response = await api.put(`/disasters/${id}`, disasterData);
    return response.data;
  },

  // Delete disaster  
  deleteDisaster: async (id) => {
    const response = await api.delete(`/disasters/${id}`);
    return response.data;
  },

  // Get disaster statistics
  getDisasterStats: async () => {
    const response = await api.get('/disasters/stats/overview');
    return response.data;
  }
};
