import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid, Tooltip, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Assignment as AssignIcon, Edit as EditIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon, WorkOutline as WorkIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { volunteersService } from '../services/volunteersService';
import { affectedAreasService } from '../services/affectedAreasService';
import { reliefCampsService } from '../services/reliefCampsService';
import { useAuth } from '../context/AuthContext';

const VolunteersPage = () => {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]); const [areas, setAreas] = useState([]); const [camps, setCamps] = useState([]); const [loading, setLoading] = useState(true); const [openAssignDialog, setOpenAssignDialog] = useState(false); const [openCreateDialog, setOpenCreateDialog] = useState(false); const [editingVolunteer, setEditingVolunteer] = useState(null); const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); const [assignData, setAssignData] = useState({ assigned_to: '', works_at: '' }); const [formData, setFormData] = useState({ name: '', email: '', contact: '', skills: '' });

  useEffect(() => { loadVolunteers(); loadAreas(); loadCamps(); }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const response = await volunteersService.getAllVolunteers();
      
      console.log('API Response:', response);
      
      if (response.data?.length) {
        // Group volunteers by volunteer_id to handle multiple assignments
        const volunteersMap = new Map();
        
        response.data.forEach(record => {
          const volunteerId = record.volunteer_id;
          
          if (!volunteersMap.has(volunteerId)) {
            volunteersMap.set(volunteerId, {
              volunteer_id: volunteerId,
              name: record.name || 'Unknown',
              email: record.email || 'Not provided',
              contact: record.contact || 'Not provided', 
              skills: record.skills || 'General',
              areas: new Set(),
              camps: new Set(),
              area_names: [],
              camp_names: [],
              work_roles: []
            });
          }
          
          const volunteer = volunteersMap.get(volunteerId);
          
          // Add unique area assignments
          if (record.assigned_area_id && record.area_name) {
            const areaKey = `${record.assigned_area_id}`;
            if (!volunteer.areas.has(areaKey)) {
              volunteer.areas.add(areaKey);
              volunteer.area_names.push(`${record.area_name}, ${record.area_district}`);
            }
          }
          
          // Add unique camp assignments  
          if (record.works_at_camp_id && record.camp_name) {
            const campKey = `${record.works_at_camp_id}`;
            if (!volunteer.camps.has(campKey)) {
              volunteer.camps.add(campKey);
              volunteer.camp_names.push(record.camp_name);
              volunteer.work_roles.push(record.work_role || 'General');
            }
          }
        });
        
        // Convert to final display format
        const processedVolunteers = Array.from(volunteersMap.values()).map(vol => {
          // Determine assignment status
          let status = 'Pending';
          if (vol.area_names.length > 0 && vol.camp_names.length > 0) {
            status = 'Fully Assigned';
          } else if (vol.area_names.length > 0) {
            status = 'Area Only';
          }
          
          return {
            ...vol,
            // Display fields
            assigned_area: vol.area_names.length > 0 ? vol.area_names.join(' | ') : 'Not Assigned',
            works_camp: vol.camp_names.length > 0 ? vol.camp_names.join(' | ') : 'Not Assigned',
            assignment_status: status,
            
            // For assignment dialog (use first values)
            assigned_to: vol.areas.size > 0 ? parseInt(Array.from(vol.areas)[0]) : null,
            works_at: vol.camps.size > 0 ? parseInt(Array.from(vol.camps)[0]) : null,
            
            // Count display
            areas_count: vol.area_names.length,
            camps_count: vol.camp_names.length
          };
        }).sort((a, b) => a.volunteer_id - b.volunteer_id);
        
        setVolunteers(processedVolunteers);
        console.log(`✅ Processed ${processedVolunteers.length} unique volunteers with assignments`);
      } else {
        setVolunteers([]);
      }
    } catch (error) {
      console.error('Load volunteers error:', error);
      showSnackbar('Error loading volunteers: ' + error.message, 'error');
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => { try { const res = await affectedAreasService.getAllAffectedAreas(); setAreas(res.data || []); } catch { setAreas([]); } };
  const loadCamps = async () => { try { const res = await reliefCampsService.getAllCamps(); setCamps(res.data || []); } catch { setCamps([]); } };
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleAssign = (volunteer) => { setEditingVolunteer(volunteer); setAssignData({ assigned_to: '', works_at: '' }); setOpenAssignDialog(true); };
  const handleCreate = () => { setFormData({ name: '', email: '', contact: '', skills: '' }); setEditingVolunteer(null); setOpenCreateDialog(true); };

  const handleAssignSubmit = async () => {
    try {
      if (!assignData.assigned_to) { showSnackbar('Please select an area', 'error'); return; }
      
      // Assign to area first
      await volunteersService.assignToArea(editingVolunteer.volunteer_id, parseInt(assignData.assigned_to));
      
      // Then assign to camp if selected
      if (assignData.works_at) {
        await volunteersService.assignTocamp(editingVolunteer.volunteer_id, parseInt(assignData.works_at), 'General Worker');
      }
      
      showSnackbar('✅ Volunteer assigned successfully!');
      setOpenAssignDialog(false);
      loadVolunteers(); // Reload to show new assignments
    } catch (error) {
      console.error('Assignment error:', error);
      const message = error.response?.data?.message || error.message;
      if (message.includes('already assigned')) {
        showSnackbar('⚠️ Already assigned: ' + message, 'warning');
      } else {
        showSnackbar('❌ Error: ' + message, 'error');
      }
    }
  };

  const handleCreateSubmit = async () => {
    try {
      if (!formData.name || !formData.email) { showSnackbar('Please fill required fields', 'error'); return; }
      await volunteersService.createVolunteer(formData);
      showSnackbar('✅ Volunteer created successfully!');
      setOpenCreateDialog(false); loadVolunteers();
    } catch (error) { showSnackbar('❌ Error: ' + (error.response?.data?.message || error.message), 'error'); }
  };

  const handleDelete = async (volunteer) => { if (window.confirm(`Delete volunteer "${volunteer.name}"?`)) { try { await volunteersService.deleteVolunteer(volunteer.volunteer_id); showSnackbar('✅ Volunteer deleted!'); loadVolunteers(); } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); } } };

  const filteredCamps = camps.filter(camp => !assignData.assigned_to || camp.area_id === parseInt(assignData.assigned_to));

  const columns = [
    { field: 'volunteer_id', headerName: 'ID', width: 60, headerAlign: 'center', align: 'center', renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{p.value}</Typography> },
    { field: 'name', headerName: 'Name', width: 160, renderCell: (p) => <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}><Avatar sx={{ mr: 1, width: 28, height: 28, bgcolor: 'secondary.light', fontSize: '0.75rem' }}>{p.value?.charAt(0) || 'V'}</Avatar><Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{p.value}</Typography></Box> },
    { field: 'email', headerName: 'Email', width: 170, renderCell: (p) => <Typography variant="body2" sx={{ py: 1, fontSize: '0.75rem' }}>{p.value}</Typography> },
    { field: 'contact', headerName: 'Phone', width: 110, renderCell: (p) => <Typography variant="body2" sx={{ py: 1, fontSize: '0.75rem' }}>{p.value}</Typography> },
    { field: 'skills', headerName: 'Skills', width: 130, renderCell: (p) => <Tooltip title={p.value}><Typography variant="body2" sx={{ py: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>{p.value?.length > 12 ? p.value.substring(0, 12) + '...' : p.value}</Typography></Tooltip> },
    { field: 'assigned_area', headerName: 'Areas', width: 140, renderCell: (p) => <Tooltip title={p.value}><Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}><LocationIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: p.value === 'Not Assigned' ? 'grey.400' : 'info.main' }} /><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{p.row.areas_count > 0 ? `${p.row.areas_count} areas` : 'None'}</Typography></Box></Tooltip> },
    { field: 'works_camp', headerName: 'Camps', width: 140, renderCell: (p) => <Tooltip title={p.value}><Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}><WorkIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: p.value === 'Not Assigned' ? 'grey.400' : 'success.main' }} /><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{p.row.camps_count > 0 ? `${p.row.camps_count} camps` : 'None'}</Typography></Box></Tooltip> },
    { field: 'assignment_status', headerName: 'Status', width: 110, renderCell: (p) => <Chip label={p.value} color={{ 'Fully Assigned': 'success', 'Area Only': 'warning', 'Pending': 'error' }[p.value] || 'default'} size="small" sx={{ fontSize: '0.65rem' }} /> },
    { field: 'actions', headerName: 'Actions', width: 100, sortable: false, headerAlign: 'center', align: 'center', renderCell: (p) => <Box sx={{ display: 'flex', gap: 0.5, py: 0.5 }}>{user?.role === 'Admin' && <><Tooltip title="Assign More"><IconButton onClick={() => handleAssign(p.row)} color="primary" size="small"><AssignIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete"><IconButton onClick={() => handleDelete(p.row)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton></Tooltip></>}</Box> }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>🙋‍♂️ Volunteers Management</Typography>
          <Typography variant="body2" color="text.secondary">{volunteers.length} registered volunteers</Typography>
        </Box>
        {user?.role === 'Admin' && <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleCreate} size="large">Add Volunteer</Button>}
      </Box>

      {/* Success Alert */}
      <Alert severity="success" sx={{ mb: 2 }}>
        <strong>✅ Junction Tables Working!</strong> Showing volunteers with their area and camp assignments from AssignedTo and WorksAt tables.
      </Alert>
      
      <Card elevation={3}><CardContent sx={{ p: 2 }}><DataGrid rows={volunteers} columns={columns} getRowId={(row) => row.volunteer_id} loading={loading} pageSizeOptions={[5, 10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}, sorting: { sortModel: [{ field: 'volunteer_id', sort: 'asc' }] } }} disableRowSelectionOnClick sx={{ height: 650, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 700 }, '& .MuiDataGrid-row': { minHeight: '60px !important', '&:hover': { bgcolor: 'action.hover' } }, '& .MuiDataGrid-cell': { padding: '4px', display: 'flex', alignItems: 'center', fontSize: '0.75rem' } }} /></CardContent></Card>
      
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>📍 Assign: {editingVolunteer?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <Grid item xs={12}><TextField fullWidth select label="Assigned Area *" value={assignData.assigned_to} onChange={(e) => setAssignData({ ...assignData, assigned_to: e.target.value, works_at: '' })} required><MenuItem value="">Select Area</MenuItem>{areas.map(area => <MenuItem key={area.area_id} value={area.area_id}>{area.name} - {area.district}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><TextField fullWidth select label="Works At Camp" value={assignData.works_at} onChange={(e) => setAssignData({ ...assignData, works_at: e.target.value })} disabled={!assignData.assigned_to}><MenuItem value="">No Camp Assignment</MenuItem>{filteredCamps.map(camp => <MenuItem key={camp.camp_id} value={camp.camp_id}>{camp.name}</MenuItem>)}</TextField></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button><Button onClick={handleAssignSubmit} variant="contained">Assign</Button></DialogActions>
      </Dialog>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white' }}>👤 Add New Volunteer</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Full Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Contact Number" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Skills" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} placeholder="Medical, Logistics, Translation, etc." multiline rows={2} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button><Button onClick={handleCreateSubmit} variant="contained">Create</Button></DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
};

export default VolunteersPage;
