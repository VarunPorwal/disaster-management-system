import api from './api';

export const volunteerService = {
  // Get volunteer assignments
  getMyAssignments: async (volunteerId) => {
    try {
      const response = await api.get(`/volunteers/${volunteerId}/assignments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer assignments:', error);
      return { data: [], count: 0 };
    }
  },

  // Get assigned camps for volunteer
  getAssignedCamps: async (volunteerId) => {
    try {
      const response = await api.get(`/volunteers/${volunteerId}/camps`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned camps:', error);
      return { data: [], count: 0 };
    }
  },

  // Get volunteer statistics
  getVolunteerStats: async (volunteerId) => {
    try {
      const [assignmentsRes, requestsRes] = await Promise.all([
        api.get(`/volunteers/${volunteerId}/assignments`),
        api.get('/requests')
      ]);

      const assignments = assignmentsRes.data.data || [];
      const allRequests = requestsRes.data.data || [];
      
      // Get assigned camp IDs
      const assignedCampIds = assignments.map(a => a.camp_id);
      const campRequests = allRequests.filter(r => assignedCampIds.includes(r.camp_id));

      return {
        total_assignments: assignments.length,
        active_assignments: assignments.filter(a => a.status === 'Active').length,
        completed_assignments: assignments.filter(a => a.status === 'Completed').length,
        assigned_camps: assignedCampIds.length,
        pending_requests: campRequests.filter(r => r.status === 'Pending').length,
        high_priority_requests: campRequests.filter(r => r.priority === 'High' && r.status === 'Pending').length
      };
    } catch (error) {
      console.error('Error fetching volunteer stats:', error);
      return {
        total_assignments: 0,
        active_assignments: 0,
        completed_assignments: 0,
        assigned_camps: 0,
        pending_requests: 0,
        high_priority_requests: 0
      };
    }
  },

  // Update assignment status
  updateAssignmentStatus: async (assignmentId, status) => {
    try {
      const response = await api.put(`/assignments/${assignmentId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating assignment status:', error);
      throw error;
    }
  }
};
