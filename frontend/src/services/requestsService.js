import api from './api';

export const requestsService = {
  getAll: async () => { try { const res = await api.get('/requests/with-details/info'); return res.data; } catch { const res = await api.get('/requests'); return res.data; } },
  getById: async (id) => (await api.get(`/requests/${id}`)).data,
  create: async (data) => (await api.post('/requests', data)).data,
  update: async (id, data) => (await api.put(`/requests/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/requests/${id}`)).data,
  getByCamp: async (campId) => (await api.get(`/requests/camp/${campId}`)).data,
  getByVictim: async (victimId) => (await api.get(`/requests/victim/${victimId}`)).data,
  getUrgent: async () => (await api.get('/requests/alerts/urgent')).data,
  getStats: async () => (await api.get('/requests/stats/overview')).data
};
