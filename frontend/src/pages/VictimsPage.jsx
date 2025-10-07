import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid, Tooltip, Avatar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon, Man as MaleIcon, Woman as FemaleIcon, ChildCare as ChildIcon, ElderlyWoman as ElderlyIcon } from '@mui/icons-material';
import { victimsService } from '../services/victimsService';
import { reliefCampsService } from '../services/reliefCampsService';
import { affectedAreasService } from '../services/affectedAreasService';
import { useAuth } from '../context/AuthContext';

const VictimsPage = () => {
  const { user } = useAuth();
  const [victims, setVictims] = useState([]); const [camps, setCamps] = useState([]); const [areas, setAreas] = useState([]); const [loading, setLoading] = useState(true); const [openDialog, setOpenDialog] = useState(false); const [editingVictim, setEditingVictim] = useState(null); const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); const [formData, setFormData] = useState({ area_id: '', camp_id: '', name: '', age: '', gender: '', contact: '', address: '', medical_condition: '' });

  useEffect(() => { loadVictims(); loadCamps(); loadAreas(); }, []);

  const loadVictims = async () => {
    try {
      setLoading(true);
      const [victimsRes, areasRes, campsRes] = await Promise.all([victimsService.getAllVictims(), affectedAreasService.getAllAffectedAreas(), reliefCampsService.getAllCamps()]);
      const areasMap = {}; const campsMap = {};
      if (areasRes.data?.length) areasRes.data.forEach(area => areasMap[area.area_id] = { name: area.name, district: area.district });
      if (campsRes.data?.length) campsRes.data.forEach(camp => campsMap[camp.camp_id] = { name: camp.name });
      
      const uniqueVictims = new Map(); const processedIds = new Set();
      if (victimsRes.data?.length) {
        victimsRes.data.forEach(victim => {
          const victimId = parseInt(victim.victim_id);
          if (victimId && !processedIds.has(victimId) && !uniqueVictims.has(victimId)) {
            processedIds.add(victimId);
            const areaInfo = areasMap[victim.area_id]; const campInfo = campsMap[victim.camp_id];
            uniqueVictims.set(victimId, { ...victim, victim_id: victimId, name: victim.name || 'Unknown', age: parseInt(victim.age) || 0, gender: victim.gender || 'Unknown', area_display: areaInfo ? `${areaInfo.name}, ${areaInfo.district}` : 'Unknown Area', camp_display: campInfo ? campInfo.name : 'No Camp', age_category: victim.age < 18 ? 'Child' : victim.age >= 60 ? 'Elderly' : 'Adult', medical_status: victim.medical_condition ? 'Medical Needs' : 'Normal' });
          }
        });
      }
      setVictims(Array.from(uniqueVictims.values()).sort((a, b) => a.victim_id - b.victim_id));
    } catch (error) { showSnackbar('Error loading victims: ' + error.message, 'error'); setVictims([]); } finally { setLoading(false); }
  };

  const loadCamps = async () => { try { const res = await reliefCampsService.getAllCamps(); setCamps(res.data || []); } catch { setCamps([]); } };
  const loadAreas = async () => { try { const res = await affectedAreasService.getAllAffectedAreas(); setAreas(res.data || []); } catch { setAreas([]); } };
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleSubmit = async () => {
    try {
      if (!formData.area_id || !formData.name || !formData.age || !formData.gender) { showSnackbar('Please fill required fields', 'error'); return; }
      const submitData = { area_id: parseInt(formData.area_id), camp_id: formData.camp_id ? parseInt(formData.camp_id) : null, name: formData.name.trim(), age: parseInt(formData.age), gender: formData.gender, contact: formData.contact.trim() || null, address: formData.address.trim() || null, medical_condition: formData.medical_condition.trim() || null };
      if (editingVictim) { await victimsService.updateVictim(editingVictim.victim_id, submitData); showSnackbar('✅ Victim updated!'); } else { await victimsService.createVictim(submitData); showSnackbar('✅ Victim registered!'); }
      setOpenDialog(false); resetForm(); loadVictims();
    } catch (error) { showSnackbar('❌ Error: ' + (error.response?.data?.message || error.message), 'error'); }
  };

  const handleDelete = async (victim) => { if (window.confirm(`Remove "${victim.name}"?`)) { try { await victimsService.deleteVictim(victim.victim_id); showSnackbar('✅ Victim removed!'); loadVictims(); } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); } } };
  const handleCreate = () => { resetForm(); setEditingVictim(null); setOpenDialog(true); };
  const handleEdit = (victim) => { setFormData({ area_id: victim.area_id || '', camp_id: victim.camp_id || '', name: victim.name || '', age: victim.age || '', gender: victim.gender || '', contact: victim.contact || '', address: victim.address || '', medical_condition: victim.medical_condition || '' }); setEditingVictim(victim); setOpenDialog(true); };
  const resetForm = () => setFormData({ area_id: '', camp_id: '', name: '', age: '', gender: '', contact: '', address: '', medical_condition: '' });
  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const getGenderIcon = (gender) => { if (gender === 'Male') return <MaleIcon sx={{ color: 'blue', fontSize: '1.1rem' }} />; if (gender === 'Female') return <FemaleIcon sx={{ color: 'pink', fontSize: '1.1rem' }} />; return <PersonIcon sx={{ color: 'grey', fontSize: '1.1rem' }} />; };
  const getAgeIcon = (age) => { if (age < 18) return <ChildIcon sx={{ color: 'orange', fontSize: '1.1rem' }} />; if (age >= 60) return <ElderlyIcon sx={{ color: 'purple', fontSize: '1.1rem' }} />; return <PersonIcon sx={{ color: 'green', fontSize: '1.1rem' }} />; };

  const columns = [
    { field: 'victim_id', headerName: 'ID', width: 60, headerAlign: 'center', align: 'center', renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{p.value}</Typography> },
    { field: 'name', headerName: 'Name', width: 170, renderCell: (p) => <Tooltip title={p.value}><Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}><Avatar sx={{ mr: 1, width: 30, height: 30, bgcolor: 'primary.light', fontSize: '0.8rem' }}>{p.value?.charAt(0) || 'N'}</Avatar><Typography variant="body2" sx={{ fontWeight: 500 }}>{p.value}</Typography></Box></Tooltip> },
    { field: 'age', headerName: 'Age', width: 80, headerAlign: 'center', align: 'center', renderCell: (p) => <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>{getAgeIcon(p.value)}<Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600 }}>{p.value}</Typography></Box> },
    { field: 'gender', headerName: 'Gender', width: 90, headerAlign: 'center', align: 'center', renderCell: (p) => <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>{getGenderIcon(p.value)}<Typography variant="body2" sx={{ ml: 0.5, fontSize: '0.8rem' }}>{p.value}</Typography></Box> },
    { field: 'area_display', headerName: 'Area', width: 150, renderCell: (p) => <Tooltip title={p.value}><Typography variant="body2" sx={{ py: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.value}</Typography></Tooltip> },
    { field: 'camp_display', headerName: 'Camp', width: 130, renderCell: (p) => <Tooltip title={p.value}><Typography variant="body2" sx={{ py: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem' }}>{p.value}</Typography></Tooltip> },
    { field: 'contact', headerName: 'Contact', width: 120, renderCell: (p) => <Typography variant="body2" sx={{ py: 1, fontSize: '0.75rem' }}>{p.value || 'Not provided'}</Typography> },
    { field: 'medical_status', headerName: 'Medical', width: 100, renderCell: (p) => <Chip label={p.value === 'Medical Needs' ? 'Medical' : 'Normal'} color={p.value === 'Medical Needs' ? 'warning' : 'success'} size="small" sx={{ fontSize: '0.65rem' }} /> },
    { field: 'age_category', headerName: 'Category', width: 80, renderCell: (p) => <Chip label={p.value} color={{ 'Child': 'info', 'Adult': 'primary', 'Elderly': 'secondary' }[p.value] || 'default'} size="small" sx={{ fontSize: '0.65rem' }} /> },
    { field: 'actions', headerName: 'Actions', width: 90, sortable: false, headerAlign: 'center', align: 'center', renderCell: (p) => <Box sx={{ display: 'flex', gap: 0.5, py: 0.5 }}>{(user?.role === 'Admin' || user?.role === 'Camp Manager') && <><IconButton onClick={() => handleEdit(p.row)} color="primary" size="small"><EditIcon fontSize="small" /></IconButton>{user?.role === 'Admin' && <IconButton onClick={() => handleDelete(p.row)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>}</>}</Box> }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>👥 Victims Registration</Typography>
          <Typography variant="body2" color="text.secondary">{victims.length} registered victims</Typography>
        </Box>
        {(user?.role === 'Admin' || user?.role === 'Camp Manager') && <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} size="large">Register Victim</Button>}
      </Box>
      
      <Card elevation={3}><CardContent sx={{ p: 2 }}><DataGrid rows={victims} columns={columns} getRowId={(row) => row.victim_id} loading={loading} pageSizeOptions={[5, 10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}, sorting: { sortModel: [{ field: 'victim_id', sort: 'asc' }] } }} disableRowSelectionOnClick sx={{ height: 650, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 700 }, '& .MuiDataGrid-row': { minHeight: '65px !important', '&:hover': { bgcolor: 'action.hover' }, '&:nth-of-type(even)': { bgcolor: 'grey.25' } }, '& .MuiDataGrid-cell': { padding: '6px', display: 'flex', alignItems: 'center', fontSize: '0.8rem' } }} /></CardContent></Card>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontSize: '1.2rem' }}>{editingVictim ? '✏️ Edit Victim' : '👥 Register New Victim'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <Grid item xs={12}><Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>📋 Basic Information</Typography></Grid>
            
            <Grid item xs={12} md={6}><TextField fullWidth select label="Affected Area *" name="area_id" value={formData.area_id} onChange={handleFormChange} required><MenuItem value="">Select Area</MenuItem>{areas.map(area => <MenuItem key={area.area_id} value={area.area_id}>{area.name} - {area.district}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth select label="Relief Camp" name="camp_id" value={formData.camp_id} onChange={handleFormChange}><MenuItem value="">No Camp</MenuItem>{camps.filter(camp => !formData.area_id || camp.area_id === parseInt(formData.area_id)).map(camp => <MenuItem key={camp.camp_id} value={camp.camp_id}>{camp.name}</MenuItem>)}</TextField></Grid>
            
            <Grid item xs={12} md={6}><TextField fullWidth label="Full Name *" name="name" value={formData.name} onChange={handleFormChange} required placeholder="e.g., Rajesh Kumar" /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Age *" name="age" type="number" value={formData.age} onChange={handleFormChange} required inputProps={{ min: 0, max: 120 }} /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth select label="Gender *" name="gender" value={formData.gender} onChange={handleFormChange} required><MenuItem value="">Select</MenuItem><MenuItem value="Male">👨 Male</MenuItem><MenuItem value="Female">👩 Female</MenuItem><MenuItem value="Other">⚧ Other</MenuItem></TextField></Grid>
            
            <Grid item xs={12}><Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>📞 Contact & Medical</Typography></Grid>
            
            <Grid item xs={12} md={6}><TextField fullWidth label="Contact Number" name="contact" value={formData.contact} onChange={handleFormChange} placeholder="+91-9999999999" /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleFormChange} placeholder="Previous residence" /></Grid>
            
            <Grid item xs={12}><TextField fullWidth label="Medical Conditions" name="medical_condition" value={formData.medical_condition} onChange={handleFormChange} multiline rows={2} placeholder="Medical conditions, medications, etc. (optional)" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenDialog(false)} size="large">Cancel</Button><Button onClick={handleSubmit} variant="contained" size="large">{editingVictim ? 'Update' : 'Register'}</Button></DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
};

export default VictimsPage;
