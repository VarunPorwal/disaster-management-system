import api from './api';

export const victimsService = {
  getAllVictims: async () => {
    try {
      const response = await api.get('/victims/with-details/info');
      return response.data;
    } catch (error) {
      console.warn('Detailed victims API failed, trying basic:', error.message);
      const response = await api.get('/victims');
      return response.data;
    }
  },

  // Add this new method to get victims by camp
  getVictimsByCamp: async (campId) => {
    const response = await api.get(`/victims/camp/${campId}`);
    return response.data;
  },

  createVictim: async (victimData) => {
    const response = await api.post('/victims', victimData);
    return response.data;
  },
  updateVictim: async (id, victimData) => {
    const response = await api.put(`/victims/${id}`, victimData);
    return response.data;
  },
  deleteVictim: async (id) => {
    const response = await api.delete(`/victims/${id}`);
    return response.data;
  },
  getVictimStats: async () => {
    const response = await api.get('/victims/stats/overview');
    return response.data;
  }
};
