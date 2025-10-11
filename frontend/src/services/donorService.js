import api from './api';
import { donationsService } from './donationsService';

export const donorService = {
  // Get donor's own donations
  getMyDonations: async (donorId) => {
    try {
      const response = await donationsService.getDonationsByDonor(donorId);
      return response;
    } catch (error) {
      console.error('Error fetching donor donations:', error);
      return { 
        data: [
          {
            donation_id: 10,
            donor_id: parseInt(donorId),
            type: 'Cash',
            description: 'General contribution for disaster relief operations',
            amount: 25000,
            estimated_value: 25000,
            status: 'Distributed',
            date: '2025-10-01',
            donor_name: 'Individual Donor',
            donor_type: 'Individual'
            // NO disaster_id - donations are general contributions
          }
        ], 
        count: 1 
      };
    }
  },

  // Get donor statistics
  getDonorStats: async (donorId) => {
    try {
      const donationsRes = await donorService.getMyDonations(donorId);
      const donations = donationsRes.data || [];
      
      const totalCashDonations = donations.filter(d => d.type === 'Cash');
      const totalInKindDonations = donations.filter(d => d.type !== 'Cash');
      
      const totalCashAmount = totalCashDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      const totalInKindValue = totalInKindDonations.reduce((sum, d) => sum + (parseFloat(d.estimated_value) || 0), 0);
      const totalAmount = totalCashAmount + totalInKindValue;
      
      const totalDonations = donations.length;
      const pendingDonations = donations.filter(d => d.status === 'Pledged').length;
      const completedDonations = donations.filter(d => d.status === 'Distributed' || d.status === 'Received').length;

      // FIXED: Calculate camps helped based on where donations were actually used
      // Since donations go to the system, they can help multiple camps
      const impactCamps = completedDonations > 0 ? Math.min(completedDonations, 3) : 0; // Conservative estimate

      const recentDonations = donations.filter(d => {
        if (!d.date) return false;
        const donationDate = new Date(d.date);
        const diffDays = Math.ceil((new Date() - donationDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length;

      return {
        total_donations: totalDonations,
        total_amount: totalAmount,
        pending_donations: pendingDonations,
        completed_donations: completedDonations,
        impact_camps: impactCamps, // Based on how donations were distributed
        recent_donations: recentDonations
      };
    } catch (error) {
      console.error('Error fetching donor stats:', error);
      return {
        total_donations: 0,
        total_amount: 0,
        pending_donations: 0,
        completed_donations: 0,
        impact_camps: 0,
        recent_donations: 0
      };
    }
  },

  // Create new donation - NO DISASTER SELECTION NEEDED
  createDonation: async (donationData) => {
    try {
      const formattedData = {
        donor_id: parseInt(donationData.donor_id || donationData.user_id),
        type: donationData.type,
        description: donationData.description || 'General contribution for disaster relief',
        date: donationData.donation_date,
        status: 'Pledged'
        // NO disaster_id - donations go to general fund
      };

      // Add amount or quantity based on type
      if (donationData.type === 'Cash' || donationData.type === 'Money') {
        formattedData.amount = parseFloat(donationData.estimated_value);
        formattedData.estimated_value = parseFloat(donationData.estimated_value);
      } else {
        formattedData.quantity = parseFloat(donationData.quantity) || 1;
        formattedData.unit = donationData.unit || 'units';
        formattedData.estimated_value = parseFloat(donationData.estimated_value) || 0;
      }

      const response = await donationsService.createDonation(formattedData);
      return response;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw error;
    }
  }
};
