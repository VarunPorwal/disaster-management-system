import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { disasterService } from '../services/disasterService';
import { useAuth } from '../context/AuthContext';

const DisastersPage = () => {
  const { user } = useAuth();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    severity: '',
    status: '',
    location: '',
    description: ''
  });

  const severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const statusOptions = ['Active', 'Monitoring', 'Resolved'];

  // Load disasters on component mount
  useEffect(() => {
    loadDisasters();
  }, []);

  const loadDisasters = async () => {
    try {
      setLoading(true);
      const response = await disasterService.getAllDisasters();
      setDisasters(response.data || []);
    } catch (error) {
      showSnackbar('Error loading disasters: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingDisaster) {
        // Update existing disaster
        await disasterService.updateDisaster(editingDisaster.disaster_id, formData);
        showSnackbar('Disaster updated successfully!');
      } else {
        // Create new disaster
        await disasterService.createDisaster(formData);
        showSnackbar('Disaster created successfully!');
      }
      
      setOpenDialog(false);
      resetForm();
      loadDisasters(); // Reload data
    } catch (error) {
      showSnackbar('Error saving disaster: ' + error.message, 'error');
    }
  };

  // Handle delete
  const handleDelete = async (disaster) => {
    if (window.confirm(`Are you sure you want to delete the disaster: ${disaster.type}?`)) {
      try {
        await disasterService.deleteDisaster(disaster.disaster_id);
        showSnackbar('Disaster deleted successfully!');
        loadDisasters();
      } catch (error) {
        showSnackbar('Error deleting disaster: ' + error.message, 'error');
      }
    }
  };

  // Open create dialog
  const handleCreate = () => {
    resetForm();
    setEditingDisaster(null);
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleEdit = (disaster) => {
    setFormData({
      type: disaster.type || '',
      date: disaster.date ? disaster.date.split('T')[0] : '', // Format date for input
      severity: disaster.severity || '',
      status: disaster.status || '',
      location: disaster.location || '',
      description: disaster.description || ''
    });
    setEditingDisaster(disaster);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      date: '',
      severity: '',
      status: '',
      location: '',
      description: ''
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Define columns for DataGrid
  const columns = [
    { 
      field: 'disaster_id', 
      headerName: 'ID', 
      width: 80 
    },
    { 
      field: 'type', 
      headerName: 'Disaster Type', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 120,
      renderCell: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : '';
      }
    },
    { 
      field: 'severity', 
      headerName: 'Severity', 
      width: 120,
      renderCell: (params) => {
        const color = {
          'Low': 'success',
          'Medium': 'warning', 
          'High': 'error',
          'Critical': 'error'
        }[params.value] || 'default';
        
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const color = {
          'Active': 'error',
          'Monitoring': 'warning',
          'Resolved': 'success'
        }[params.value] || 'default';
        
        return <Chip label={params.value} color={color} size="small" />;
      }
    },
    { 
      field: 'location', 
      headerName: 'Location', 
      width: 200 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {user?.role === 'Admin' && (
            <>
              <IconButton 
                onClick={() => handleEdit(params.row)}
                color="primary"
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={() => handleDelete(params.row)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          ⚠️ Disasters Management
        </Typography>
        {user?.role === 'Admin' && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add New Disaster
          </Button>
        )}
      </Box>

      {/* Data Grid */}
      <Card>
        <CardContent>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={disasters}
              columns={columns}
              getRowId={(row) => row.disaster_id}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDisaster ? 'Edit Disaster' : 'Create New Disaster'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Disaster Type"
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              margin="normal"
              placeholder="e.g., Earthquake, Flood, Cyclone"
              required
            />
            
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              fullWidth
              select
              label="Severity"
              name="severity"
              value={formData.severity}
              onChange={handleFormChange}
              margin="normal"
              required
            >
              {severityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              margin="normal"
              required
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
              margin="normal"
              placeholder="e.g., Mumbai, Maharashtra"
            />
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={3}
              placeholder="Additional details about the disaster..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDisaster ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DisastersPage;
