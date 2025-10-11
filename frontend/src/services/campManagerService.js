import api from './api';

export const campManagerService = {
  // Get camps managed by this user
  getManagerCamps: async (managerId) => {
    try {
      const response = await api.get(`/camps/manager/${managerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching manager camps:', error);
      return { data: [], count: 0 };
    }
  },

  // Get camp-specific statistics
  getCampStats: async (campIds) => {
    try {
      if (campIds.length === 0) return {
        total_requests: 0,
        pending_requests: 0,
        total_supplies: 0,
        low_stock_supplies: 0,
        total_distributions: 0,
        recent_distributions: 0
      };

      const [requestsRes, suppliesRes] = await Promise.all([
        api.get('/requests'),
        api.get('/supplies')
      ]);

      const allRequests = requestsRes.data.data || [];
      const allSupplies = suppliesRes.data.data || [];
      
      const campRequests = allRequests.filter(r => campIds.includes(r.camp_id));
      const campSupplies = allSupplies.filter(s => campIds.includes(s.camp_id));

      return {
        total_requests: campRequests.length,
        pending_requests: campRequests.filter(r => r.status === 'Pending').length,
        high_priority_requests: campRequests.filter(r => r.priority === 'High' && r.status === 'Pending').length,
        total_supplies: campSupplies.length,
        low_stock_supplies: campSupplies.filter(s => s.current_quantity < (s.quantity * 0.2)).length,
        total_distributions: 0,
        recent_distributions: 0
      };
    } catch (error) {
      console.error('Error fetching camp stats:', error);
      return {
        total_requests: 0,
        pending_requests: 0,
        high_priority_requests: 0,
        total_supplies: 0,
        low_stock_supplies: 0,
        total_distributions: 0,
        recent_distributions: 0
      };
    }
  },

  // Get recent requests for manager's camps
  getRecentRequests: async (campIds, limit = 5) => {
    try {
      const response = await api.get('/requests');
      const campRequests = response.data.data?.filter(r => 
        campIds.includes(r.camp_id) && r.status === 'Pending'
      ).slice(0, limit) || [];
      return { data: campRequests, count: campRequests.length };
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      return { data: [], count: 0 };
    }
  }
};
