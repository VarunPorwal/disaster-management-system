import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Alert, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { MonetizationOn as DonationIcon, TrendingUp as ImpactIcon, Schedule as PendingIcon, CheckCircle as CompletedIcon, Add as AddIcon, Campaign as CampaignIcon } from '@mui/icons-material';
import { donorService } from '../services/donorService';
import { useAuth } from '../context/AuthContext';

const MyDonationsPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [donationDialog, setDonationDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    type: 'Cash',
    description: '',
    quantity: '',
    unit: '',
    estimated_value: '',
    donation_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [donationsRes, statsRes] = await Promise.all([
        donorService.getMyDonations(user.user_id),
        donorService.getDonorStats(user.user_id)
      ]);
      
      const processedDonations = donationsRes.data?.map(donation => ({
        ...donation,
        id: donation.donation_id,
        // FIXED: No disaster display needed - general contributions
        purpose_display: donation.description || 'General disaster relief contribution',
        status_color: { 'Pledged': 'warning', 'Received': 'info', 'Distributed': 'success' }[donation.status] || 'default',
        amount_display: donation.type === 'Cash' 
          ? (donation.amount ? `₹${donation.amount.toLocaleString()}` : `₹${donation.estimated_value?.toLocaleString() || 0}`)
          : (donation.estimated_value ? `₹${donation.estimated_value.toLocaleString()}` : 'N/A'),
        date_display: donation.date ? new Date(donation.date).toLocaleDateString('en-IN') : '-',
        type_color: { 'Money': 'success', 'Cash': 'success', 'Food': 'info', 'Medicine': 'error', 'Clothing': 'warning' }[donation.type] || 'default'
      })) || [];

      setDonations(processedDonations);
      setStats(statsRes);
      
    } catch (error) {
      console.error('Error loading donations:', error);
      showSnackbar('Error loading donations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleCreateDonation = async () => {
    try {
      if (!formData.type || !formData.estimated_value) {
        showSnackbar('Please fill required fields', 'error');
        return;
      }

      const donationData = {
        ...formData,
        user_id: user.user_id,
        donor_id: user.user_id,
        status: 'Pledged'
      };

      await donorService.createDonation(donationData);
      showSnackbar('✅ Thank you! Your donation has been pledged to support disaster relief operations!');
      setDonationDialog(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error creating donation:', error);
      showSnackbar('❌ Error creating donation: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const resetForm = () => setFormData({
    type: 'Cash',
    description: '',
    quantity: '',
    unit: '',
    estimated_value: '',
    donation_date: new Date().toISOString().split('T')[0]
  });

  const columns = [
    { field: 'donation_id', headerName: 'ID', width: 70, align: 'center' },
    { 
      field: 'type', 
      headerName: 'Type', 
      width: 100, 
      renderCell: (params) => <Chip label={params.value} color={params.row.type_color} size="small" />
    },
    { field: 'purpose_display', headerName: 'Purpose', width: 250 }, // Changed from disaster to purpose
    { field: 'amount_display', headerName: 'Value', width: 120, renderCell: (params) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>{params.value}</Typography> },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120, 
      renderCell: (params) => <Chip label={params.value} color={params.row.status_color} size="small" />
    },
    { field: 'date_display', headerName: 'Date', width: 100 }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            🎁 My Donations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {donations.length} donations • ₹{stats.total_amount?.toLocaleString() || 0} total contribution to disaster relief
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setDonationDialog(true)}
          size="large"
        >
          Make Donation
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ bgcolor: 'success.50' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <DonationIcon sx={{ fontSize: 48, mb: 1, color: 'success.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                ₹{stats.total_amount?.toLocaleString() || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Donated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ bgcolor: 'primary.50' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CampaignIcon sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                {stats.total_donations || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Total Donations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        
        
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ bgcolor: 'info.50' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <ImpactIcon sx={{ fontSize: 48, mb: 1, color: 'info.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 0.5 }}>
                {stats.impact_camps || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Camps Helped
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {stats.recent_donations > 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          🌟 Thank you! Your recent contributions are helping disaster relief operations across multiple locations.
        </Alert>
      )}

      <Card elevation={4}>
        <CardContent sx={{ p: 3 }}>
          <DataGrid 
            rows={donations} 
            columns={columns} 
            loading={loading} 
            pageSizeOptions={[10, 25, 50]} 
            initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} 
            disableRowSelectionOnClick 
            sx={{ height: 600 }} 
          />
        </CardContent>
      </Card>

      <Dialog open={donationDialog} onClose={() => setDonationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>🎁 Make a General Donation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 3 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your donation will go to the disaster management system's general fund, helping with ongoing relief operations across all active disasters and camps.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Donation Type *"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                >
                  {['Cash', 'Food', 'Medicine', 'Clothing', 'Water', 'Emergency Supplies'].map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated Value (₹) *"
                  type="number"
                  value={formData.estimated_value}
                  onChange={(e) => setFormData({...formData, estimated_value: e.target.value})}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description / Purpose"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g., General disaster relief, Emergency food supplies, etc."
                />
              </Grid>
              {formData.type !== 'Cash' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      placeholder="kg, liters, pieces, etc."
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Donation Date"
                  type="date"
                  value={formData.donation_date}
                  onChange={(e) => setFormData({...formData, donation_date: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDonationDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCreateDonation} variant="contained" color="success" size="large">
            Pledge Donation
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyDonationsPage;
