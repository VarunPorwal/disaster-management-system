import api from './api';

export const affectedAreasService = {
  // Get all affected areas
  getAllAffectedAreas: async () => {
    const response = await api.get('/areas');
    return response.data;
  },

  // Get affected area by ID
  getAffectedAreaById: async (id) => {
    const response = await api.get(`/areas/${id}`);
    return response.data;
  },

  // Create new affected area
  createAffectedArea: async (areaData) => {
    const response = await api.post('/areas', areaData);
    return response.data;
  },

  // Update affected area
  updateAffectedArea: async (id, areaData) => {
    const response = await api.put(`/areas/${id}`, areaData);
    return response.data;
  },

  // Delete affected area
  deleteAffectedArea: async (id) => {
    const response = await api.delete(`/areas/${id}`);
    return response.data;
  },

  // Get areas by disaster
  getAreasByDisaster: async (disasterId) => {
    const response = await api.get(`/areas/disaster/${disasterId}`);
    return response.data;
  },

  // Get areas with disaster details
  getAreasWithDetails: async () => {
    const response = await api.get('/areas/with-details/info');
    return response.data;
  }
};
