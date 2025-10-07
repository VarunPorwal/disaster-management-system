import api from './api';

export const volunteersService = {
  getAllVolunteers: async () => {
    try {
      // Try detailed endpoint first
      const response = await api.get('/volunteers/with-assignments');
      return response.data;
    } catch (error) {
      console.warn('Detailed volunteers API failed, trying basic:', error.message);
      // Fallback to basic endpoint
      const response = await api.get('/volunteers');
      return response.data;
    }
  },
  createVolunteer: async (volunteerData) => {
    const response = await api.post('/volunteers', volunteerData);
    return response.data;
  },
  updateVolunteer: async (id, volunteerData) => {
    const response = await api.put(`/volunteers/${id}`, volunteerData);
    return response.data;
  },
  deleteVolunteer: async (id) => {
    const response = await api.delete(`/volunteers/${id}`);
    return response.data;
  },
  assignToArea: async (volunteerId, areaId) => {
    const response = await api.post('/volunteers/assign-area', { 
      volunteer_id: volunteerId, 
      area_id: areaId
    });
    return response.data;
  },
  assignTocamp: async (volunteerId, campId, role = 'General Worker') => {
    const response = await api.post('/volunteers/assign-camp', { 
      volunteer_id: volunteerId, 
      camp_id: campId, 
      role: role 
    });
    return response.data;
  }
};
