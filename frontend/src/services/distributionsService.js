import api from './api';

export const distributionsService = {
  getAll: async () => { try { const res = await api.get('/distributions/with-details/info'); return res.data; } catch { const res = await api.get('/distributions'); return res.data; } },
  getById: async (id) => (await api.get(`/distributions/${id}`)).data,
  create: async (data) => (await api.post('/distributions', data)).data,
  update: async (id, data) => (await api.put(`/distributions/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/distributions/${id}`)).data,
  getByVictim: async (victimId) => (await api.get(`/distributions/victim/${victimId}`)).data,
  getByRequest: async (requestId) => (await api.get(`/distributions/request/${requestId}`)).data,
  getStats: async () => (await api.get('/distributions/stats/overview')).data,
  fulfillRequest: async (requestId, data) => (await api.post(`/distributions/fulfill-request/${requestId}`, data)).data
};
