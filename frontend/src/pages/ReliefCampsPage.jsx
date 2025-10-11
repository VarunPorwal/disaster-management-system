import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid, LinearProgress, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Home as CampIcon, People as PeopleIcon } from '@mui/icons-material';
import { reliefCampsService } from '../services/reliefCampsService';
import { affectedAreasService } from '../services/affectedAreasService';
import { campManagerService } from '../services/campManagerService';
import { useAuth } from '../context/AuthContext';

const ReliefCampsPage = () => {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]); const [affectedAreas, setAffectedAreas] = useState([]); const [loading, setLoading] = useState(true); const [openDialog, setOpenDialog] = useState(false); const [editingCamp, setEditingCamp] = useState(null); const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); const [formData, setFormData] = useState({ area_id: '', name: '', capacity: '', current_occupancy: '', location: '', status: 'Active', manager_id: '', date_established: '', latitude: '', longitude: '' });

  // Camp manager filtering
  const [managerCampIds, setManagerCampIds] = useState([]);
  const [campNames, setCampNames] = useState([]);
  const isCampManager = user?.role === 'Camp Manager';

  useEffect(() => { loadCamps(); loadAffectedAreas(); }, []);

  const loadCamps = async () => {
    try {
      setLoading(true);
      
      // Load camp IDs for filtering
      let campIdsToFilter = [];
      let campNamesForAlert = [];
      
      if (isCampManager && user?.user_id) {
        try {
          const managerCampsRes = await campManagerService.getManagerCamps(user.user_id);
          const managerCamps = managerCampsRes.data || [];
          campIdsToFilter = managerCamps.map(c => c.camp_id);
          campNamesForAlert = managerCamps.map(c => c.name);
          setManagerCampIds(campIdsToFilter);
          setCampNames(campNamesForAlert);
        } catch (error) {
          console.error('Error loading manager camps:', error);
        }
      }
      
      const response = await reliefCampsService.getAllCamps();
      
      // Use Map for 100% duplicate elimination
      const uniqueCamps = new Map();
      const processedIds = new Set();
      
      if (response.data?.length) {
        response.data.forEach(camp => {
          const campId = parseInt(camp.camp_id);
          
          // Triple check for uniqueness
          if (campId && !processedIds.has(campId) && !uniqueCamps.has(campId)) {
            processedIds.add(campId);
            uniqueCamps.set(campId, {
              ...camp,
              camp_id: campId,
              name: camp.name || 'Unnamed Camp',
              capacity: parseInt(camp.capacity) || 0,
              current_occupancy: parseInt(camp.current_occupancy) || 0,
              status: camp.status || 'Active',
              area_display: camp.area_name ? `${camp.area_name}, ${camp.area_district}` : 'Unknown Area',
              manager_display: camp.manager_name || `Manager ${camp.manager_id}`,
              location_display: camp.location ? (camp.location.length > 25 ? camp.location.substring(0, 25) + '...' : camp.location) : 'Not Set'
            });
          }
        });
      }
      
      // Convert to array
      let finalCamps = Array.from(uniqueCamps.values());
      
      // Apply camp manager filtering
      if (isCampManager && campIdsToFilter.length > 0) {
        finalCamps = finalCamps.filter(camp => campIdsToFilter.includes(camp.camp_id));
      }
      
      finalCamps = finalCamps.sort((a, b) => a.camp_id - b.camp_id);
      setCamps(finalCamps);
      console.log(`✅ Loaded ${finalCamps.length} ${isCampManager ? 'managed' : 'unique'} camps`);
    } catch (error) { showSnackbar('Error loading camps: ' + error.message, 'error'); setCamps([]); } finally { setLoading(false); }
  };

  const loadAffectedAreas = async () => { try { const res = await affectedAreasService.getAllAffectedAreas(); setAffectedAreas(res.data || []); } catch { setAffectedAreas([]); } };
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleSubmit = async () => {
    try {
      const submitData = { ...formData, capacity: parseInt(formData.capacity) || 0, current_occupancy: parseInt(formData.current_occupancy) || 0, manager_id: parseInt(formData.manager_id) || 1, latitude: parseFloat(formData.latitude) || null, longitude: parseFloat(formData.longitude) || null, date_established: formData.date_established || new Date().toISOString().split('T')[0] };
      if (editingCamp) { await reliefCampsService.updateCamp(editingCamp.camp_id, submitData); showSnackbar('Camp updated!'); } else { await reliefCampsService.createCamp(submitData); showSnackbar('Camp created!'); }
      setOpenDialog(false); resetForm(); loadCamps();
    } catch (error) { showSnackbar('Error: ' + (error.response?.data?.message || error.message), 'error'); }
  };

  const handleDelete = async (camp) => { if (window.confirm(`Delete ${camp.name}?`)) { try { await reliefCampsService.deleteCamp(camp.camp_id); showSnackbar('Camp deleted!'); loadCamps(); } catch (error) { showSnackbar('Error: ' + error.message, 'error'); } } };
  const handleCreate = () => { resetForm(); setEditingCamp(null); setOpenDialog(true); };
  const handleEdit = (camp) => { setFormData({ area_id: camp.area_id || '', name: camp.name || '', capacity: camp.capacity || '', current_occupancy: camp.current_occupancy || '', location: camp.location || '', status: camp.status || 'Active', manager_id: camp.manager_id || '', date_established: camp.date_established ? camp.date_established.split('T')[0] : '', latitude: camp.latitude || '', longitude: camp.longitude || '' }); setEditingCamp(camp); setOpenDialog(true); };
  const resetForm = () => setFormData({ area_id: '', name: '', capacity: '', current_occupancy: '', location: '', status: 'Active', manager_id: '', date_established: '', latitude: '', longitude: '' });
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const getOccupancyColor = (occ, cap) => { const pct = (occ / cap) * 100; return pct >= 90 ? 'error' : pct >= 70 ? 'warning' : 'success'; };

  const columns = [
    { field: 'camp_id', headerName: 'ID', width: 60, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Camp Name', width: 200, renderCell: (p) => <Tooltip title={p.value}><Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}><CampIcon sx={{ mr: 1, color: 'primary.main' }} /><Typography variant="body2" sx={{ fontWeight: 500 }}>{p.value}</Typography></Box></Tooltip> },
    { field: 'area_display', headerName: 'Area', width: 160, renderCell: (p) => <Tooltip title={p.value}><Typography variant="body2" sx={{ py: 1 }}>{p.value}</Typography></Tooltip> },
    { field: 'capacity', headerName: 'Capacity', width: 90, headerAlign: 'center', align: 'center', renderCell: (p) => <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}><PeopleIcon sx={{ mr: 1, color: 'info.main' }} />{p.value}</Box> },
    { field: 'current_occupancy', headerName: 'Occupancy', width: 140, renderCell: (p) => { const occ = p.value || 0, cap = p.row?.capacity || 0; if (!cap) return 'N/A'; const pct = Math.round((occ/cap)*100), color = getOccupancyColor(occ, cap); return <Box sx={{ width: '100%', py: 1 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{occ}/{cap}</Typography><Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{pct}%</Typography></Box><LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 6, borderRadius: 1 }} /></Box>; } },
    { field: 'status', headerName: 'Status', width: 100, headerAlign: 'center', align: 'center', renderCell: (p) => <Chip label={p.value} color={{ 'Active': 'success', 'Full': 'error', 'Closed': 'default', 'Under Construction': 'warning', 'Maintenance': 'info' }[p.value] || 'default'} size="small" /> },
    { field: 'manager_display', headerName: 'Manager', width: 120, renderCell: (p) => <Tooltip title={p.value}><Typography variant="body2" sx={{ py: 1 }}>{p.value}</Typography></Tooltip> },
    { field: 'location_display', headerName: 'Location', width: 180, renderCell: (p) => <Tooltip title={p.row.location}><Typography variant="body2" sx={{ py: 1 }}>{p.value}</Typography></Tooltip> },
    { field: 'actions', headerName: 'Actions', width: 90, sortable: false, headerAlign: 'center', align: 'center', renderCell: (p) => <Box sx={{ py: 0.5 }}>{(user?.role === 'Admin' || user?.role === 'Camp Manager') && <><IconButton onClick={() => handleEdit(p.row)} color="primary" size="small"><EditIcon fontSize="small" /></IconButton>{user?.role === 'Admin' && <IconButton onClick={() => handleDelete(p.row)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>}</>}</Box> }
  ];

  return (
    <Box>
      {isCampManager && campNames.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Managing camps: {campNames.join(', ')}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>🏕️ Relief Camps Management</Typography>
          <Typography variant="body2" color="text.secondary">{camps.length} {isCampManager ? 'managed' : 'total'} camps</Typography>
        </Box>
        {(user?.role === 'Admin' || user?.role === 'Camp Manager') && <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>Add Camp</Button>}
      </Box>
      <Card><CardContent><DataGrid rows={camps} columns={columns} getRowId={(row) => row.camp_id} loading={loading} pageSizeOptions={[5, 10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}, sorting: { sortModel: [{ field: 'camp_id', sort: 'asc' }] } }} disableRowSelectionOnClick sx={{ height: 650, '& .MuiDataGrid-row': { minHeight: '70px !important', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }, '& .MuiDataGrid-cell': { padding: '8px', display: 'flex', alignItems: 'center', whiteSpace: 'normal !important', wordWrap: 'break-word' } }} /></CardContent></Card>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>🏕️ {editingCamp ? 'Edit Camp' : 'Create Camp'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} md={6}><TextField fullWidth select label="Affected Area *" name="area_id" value={formData.area_id} onChange={handleFormChange} required><MenuItem value="">Select Area</MenuItem>{affectedAreas.map(area => <MenuItem key={area.area_id} value={area.area_id}>{area.name} - {area.district}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Camp Name *" name="name" value={formData.name} onChange={handleFormChange} required /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Capacity *" name="capacity" type="number" value={formData.capacity} onChange={handleFormChange} required inputProps={{ min: 1 }} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Current Occupancy" name="current_occupancy" type="number" value={formData.current_occupancy} onChange={handleFormChange} inputProps={{ min: 0 }} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth select label="Status *" name="status" value={formData.status} onChange={handleFormChange} required>{['Active', 'Full', 'Closed', 'Under Construction', 'Maintenance'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Manager ID *" name="manager_id" type="number" value={formData.manager_id} onChange={handleFormChange} required inputProps={{ min: 1 }} helperText={isCampManager ? `Your ID: ${user?.user_id}` : 'Enter manager user ID'} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Date Established" name="date_established" type="date" value={formData.date_established} onChange={handleFormChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Latitude" name="latitude" type="number" value={formData.latitude} onChange={handleFormChange} inputProps={{ step: 'any' }} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Longitude" name="longitude" type="number" value={formData.longitude} onChange={handleFormChange} inputProps={{ step: 'any' }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Location *" name="location" value={formData.location} onChange={handleFormChange} required multiline rows={2} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenDialog(false)} variant="outlined">Cancel</Button><Button onClick={handleSubmit} variant="contained">{editingCamp ? 'Update' : 'Create'} Camp</Button></DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
};

export default ReliefCampsPage;
