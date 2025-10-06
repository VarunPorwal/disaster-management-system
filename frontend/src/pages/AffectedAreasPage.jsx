import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  LocationOn as LocationIcon, People as PeopleIcon
} from '@mui/icons-material';
import { affectedAreasService } from '../services/affectedAreasService';
import { disasterService } from '../services/disasterService';
import { useAuth } from '../context/AuthContext';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const AffectedAreasPage = () => {
  const { user } = useAuth();
  const [areas, setAreas] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Updated form data to match backend schema
  const [formData, setFormData] = useState({
    disaster_id: '',
    name: '',
    state: '',
    district: '',
    pincode: '',
    latitude: '',
    longitude: '',
    pop_affected: '',
    status: ''
  });

  useEffect(() => {
    loadAffectedAreas();
    loadDisasters();
  }, []);

  const loadAffectedAreas = async () => {
    try {
      setLoading(true);
      const response = await affectedAreasService.getAllAffectedAreas();
      setAreas(response.data || []);
    } catch (error) {
      showSnackbar('Error loading affected areas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDisasters = async () => {
    try {
      const response = await disasterService.getAllDisasters();
      setDisasters(response.data || []);
    } catch (error) {
      console.error('Error loading disasters:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        pop_affected: parseInt(formData.pop_affected) || 0,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null
      };

      if (editingArea) {
        await affectedAreasService.updateAffectedArea(editingArea.area_id, submitData);
        showSnackbar('Affected area updated successfully!');
      } else {
        await affectedAreasService.createAffectedArea(submitData);
        showSnackbar('Affected area created successfully!');
      }
      setOpenDialog(false);
      resetForm();
      loadAffectedAreas();
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error saving affected area: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (area) => {
    if (window.confirm(`Are you sure you want to delete: ${area.name}, ${area.district}?`)) {
      try {
        await affectedAreasService.deleteAffectedArea(area.area_id);
        showSnackbar('Affected area deleted successfully!');
        loadAffectedAreas();
      } catch (error) {
        showSnackbar('Error deleting affected area: ' + error.message, 'error');
      }
    }
  };

  const handleCreate = () => {
    resetForm();
    setEditingArea(null);
    setOpenDialog(true);
  };

  const handleEdit = (area) => {
    setFormData({
      disaster_id: area.disaster_id || '',
      name: area.name || '',
      state: area.state || '',
      district: area.district || '',
      pincode: area.pincode || '',
      latitude: area.latitude || '',
      longitude: area.longitude || '',
      pop_affected: area.pop_affected || '',
      status: area.status || ''
    });
    setEditingArea(area);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      disaster_id: '', name: '', state: '', district: '', pincode: '',
      latitude: '', longitude: '', pop_affected: '', status: ''
    });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const columns = [
    { field: 'area_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Area Name', width: 180 },
    { field: 'state', headerName: 'State', width: 140 },
    { field: 'district', headerName: 'District', width: 140 },
    { field: 'pincode', headerName: 'Pincode', width: 100 },
    { 
      field: 'pop_affected', headerName: 'Population', width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 1, color: 'info.main' }} />
          {params.value?.toLocaleString() || 0}
        </Box>
      )
    },
    { 
      field: 'status', headerName: 'Status', width: 120,
      renderCell: (params) => {
        const color = { 'Active': 'error', 'Resolved': 'success', 'Monitoring': 'warning' }[params.value] || 'default';
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (params) => (
        <Box>
          {(user?.role === 'Admin' || user?.role === 'Camp Manager') && (
            <>
              <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small">
                <EditIcon />
              </IconButton>
              {user?.role === 'Admin' && (
                <IconButton onClick={() => handleDelete(params.row)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              )}
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>🗺️ Affected Areas Management</Typography>
        {(user?.role === 'Admin' || user?.role === 'Camp Manager') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Add Affected Area
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={areas} columns={columns} getRowId={(row) => row.area_id} loading={loading}
              pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* Enhanced Dialog with Better Spacing */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: { 
            minHeight: '85vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ pb: 3, fontSize: '1.5rem', fontWeight: 600 }}>
          {editingArea ? '✏️ Edit Affected Area' : '➕ Create New Affected Area'}
        </DialogTitle>
        
        <DialogContent sx={{ pt: 0 }}>
          <Grid container spacing={4} sx={{ pt: 2 }}>
            
            {/* Row 1: Disaster Selection - Full Width */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                📋 Basic Information
              </Typography>
              <TextField
                fullWidth
                select
                label="Associated Disaster *"
                name="disaster_id"
                value={formData.disaster_id}
                onChange={handleFormChange}
                required
                size="medium"
                sx={{ mb: 2 }}
              >
                <MenuItem value=""><em>Select Disaster</em></MenuItem>
                {disasters.map((disaster) => (
                  <MenuItem key={disaster.disaster_id} value={disaster.disaster_id}>
                    🌪️ {disaster.type} - {disaster.date ? new Date(disaster.date).toLocaleDateString() : ''} ({disaster.severity})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Row 2: Location Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                📍 Location Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="State *"
                name="state"
                value={formData.state}
                onChange={handleFormChange}
                required
                size="medium"
              >
                <MenuItem value=""><em>Select State</em></MenuItem>
                {indianStates.map((state) => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="District *"
                name="district"
                value={formData.district}
                onChange={handleFormChange}
                placeholder="e.g., Mumbai, Kolkata, Chennai"
                required
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Area/Village Name *"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g., South Gujarat, Bandra East"
                required
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleFormChange}
                placeholder="e.g., 392001, 400051"
                size="medium"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Status *"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
                size="medium"
              >
                <MenuItem value=""><em>Select Status</em></MenuItem>
                <MenuItem value="Active">🔴 Active</MenuItem>
                <MenuItem value="Monitoring">🟡 Monitoring</MenuItem>
                <MenuItem value="Resolved">🟢 Resolved</MenuItem>
              </TextField>
            </Grid>

            {/* Row 3: Geographic Coordinates */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                🌐 Geographic Coordinates (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                value={formData.latitude}
                onChange={handleFormChange}
                placeholder="e.g., 21.7051"
                inputProps={{ step: "any", min: -90, max: 90 }}
                helperText="GPS Latitude (-90 to 90)"
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleFormChange}
                placeholder="e.g., 72.996"
                inputProps={{ step: "any", min: -180, max: 180 }}
                helperText="GPS Longitude (-180 to 180)"
                size="medium"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Population Affected"
                name="pop_affected"
                type="number"
                value={formData.pop_affected}
                onChange={handleFormChange}
                placeholder="e.g., 80000"
                inputProps={{ min: 0 }}
                helperText="Number of people affected"
                size="medium"
              />
            </Grid>

          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={() => setOpenDialog(false)} size="large" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" size="large" sx={{ minWidth: 120 }}>
            {editingArea ? 'Update Area' : 'Create Area'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AffectedAreasPage;
