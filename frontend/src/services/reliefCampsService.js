import api from './api';

export const reliefCampsService = {
  getAllCamps: async () => {
    const response = await api.get('/camps/with-details/info');  // Use the detailed endpoint
    return response.data;
  },
  getCampById: async (id) => {
    const response = await api.get(`/camps/${id}`);
    return response.data;
  },
  createCamp: async (campData) => {
    const response = await api.post('/camps', campData);
    return response.data;
  },
  updateCamp: async (id, campData) => {
    const response = await api.put(`/camps/${id}`, campData);
    return response.data;
  },
  deleteCamp: async (id) => {
    const response = await api.delete(`/camps/${id}`);
    return response.data;
  }
};
