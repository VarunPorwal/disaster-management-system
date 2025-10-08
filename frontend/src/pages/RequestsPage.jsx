import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid, Tooltip, Avatar, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PriorityHigh as UrgentIcon, Assignment as RequestIcon, CheckCircle as FulfilledIcon, Cancel as RejectedIcon, Person as PersonIcon, LocalHospital as MedicalIcon } from '@mui/icons-material';
import { requestsService } from '../services/requestsService';
import { victimsService } from '../services/victimsService';
import { reliefCampsService } from '../services/reliefCampsService';
import { useAuth } from '../context/AuthContext';

const RequestsPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0); const [requests, setRequests] = useState({ all: [], pending: [], urgent: [] }); const [victims, setVictims] = useState([]); const [camps, setCamps] = useState([]); const [loading, setLoading] = useState(true); const [dialog, setDialog] = useState({ open: false, editing: null }); const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); const [stats, setStats] = useState({}); const [formData, setFormData] = useState({ victim_id: '', camp_id: '', item_requested: '', quantity_needed: '', priority: 'Medium', status: 'Pending', request_date: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, vicRes, campRes, statsRes, urgentRes] = await Promise.all([requestsService.getAll(), victimsService.getAllVictims(), reliefCampsService.getAllCamps(), requestsService.getStats(), requestsService.getUrgent()]);
      
      if (reqRes.data?.length) {
        const processed = reqRes.data.map((r, i) => ({ ...r, id: r.request_id || i + 1, request_id: r.request_id || i + 1, victim_display: r.victim_name || `Victim ${r.victim_id}`, camp_display: r.camp_name || `Camp ${r.camp_id}`, date_display: r.request_date ? new Date(r.request_date).toLocaleDateString('en-IN') : '-', priority_color: { High: 'error', Medium: 'warning', Low: 'info' }[r.priority] || 'default', status_color: { Pending: 'warning', Fulfilled: 'success', Rejected: 'error' }[r.status] || 'default', medical_urgent: r.priority === 'High' && (r.item_requested?.toLowerCase().includes('medicine') || r.item_requested?.toLowerCase().includes('insulin') || r.victim_medical_condition) })).sort((a, b) => { if (a.priority === 'High' && b.priority !== 'High') return -1; if (b.priority === 'High' && a.priority !== 'High') return 1; return new Date(b.request_date) - new Date(a.request_date); });
        
        const pending = processed.filter(r => r.status === 'Pending'); const urgent = processed.filter(r => r.priority === 'High' && r.status === 'Pending');
        setRequests({ all: processed, pending, urgent });
      }
      
      setVictims(vicRes.data || []); setCamps(campRes.data || []); setStats(statsRes.data || {}); console.log('✅ Loaded requests:', reqRes.data?.length);
    } catch (error) { showSnackbar('Error: ' + error.message, 'error'); } finally { setLoading(false); }
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const openDialog = (editing = null) => { if (editing) { setFormData({ victim_id: editing.victim_id || '', camp_id: editing.camp_id || '', item_requested: editing.item_requested || '', quantity_needed: editing.quantity_needed || '', priority: editing.priority || 'Medium', status: editing.status || 'Pending', request_date: editing.request_date?.split('T')[0] || new Date().toISOString().split('T')[0] }); } else { setFormData({ victim_id: '', camp_id: '', item_requested: '', quantity_needed: '', priority: 'Medium', status: 'Pending', request_date: new Date().toISOString().split('T')[0] }); } setDialog({ open: true, editing }); };
  const closeDialog = () => setDialog({ open: false, editing: null });

  const handleSubmit = async () => {
    try {
      if (!formData.victim_id || !formData.camp_id || !formData.item_requested || !formData.quantity_needed) { showSnackbar('Please fill required fields', 'error'); return; }
      const submitData = { ...formData, victim_id: parseInt(formData.victim_id), camp_id: parseInt(formData.camp_id), quantity_needed: parseInt(formData.quantity_needed) };
      
      if (dialog.editing) { await requestsService.update(dialog.editing.request_id, submitData); showSnackbar('✅ Request updated!'); } else { await requestsService.create(submitData); showSnackbar('✅ Request created!'); }
      closeDialog(); loadData();
    } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); }
  };

  const handleDelete = async (request) => { if (window.confirm(`Delete request for ${request.item_requested}?`)) { try { await requestsService.delete(request.request_id); showSnackbar('✅ Request deleted!'); loadData(); } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); } } };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await requestsService.update(requestId, { status: newStatus, fulfilled_date: newStatus === 'Fulfilled' ? new Date().toISOString().split('T')[0] : null });
      showSnackbar(`✅ Status updated to ${newStatus}!`); loadData();
    } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); }
  };

  const gridStyles = { height: 600, '& .MuiDataGrid-row': { minHeight: '80px !important', '&.urgent-row': { bgcolor: 'error.50', borderLeft: '4px solid', borderColor: 'error.main' } }, '& .MuiDataGrid-cell': { padding: '12px 8px', fontSize: '0.875rem', whiteSpace: 'normal' }, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.100', fontWeight: 700 } };

  const createColumns = (type) => {
    const baseColumns = [
      { field: 'request_id', headerName: 'ID', width: 70, align: 'center', renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{p.value}</Typography> },
      { field: 'victim_display', headerName: 'Victim', width: 160, renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: p.row.medical_urgent ? 'error.light' : 'info.light' }}>{p.row.medical_urgent ? <MedicalIcon fontSize="small" /> : <PersonIcon fontSize="small" />}</Avatar><Box><Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.value}</Typography>{p.row.victim_medical_condition && <Typography variant="caption" color="error.main">{p.row.victim_medical_condition}</Typography>}</Box></Box> },
      { field: 'camp_display', headerName: 'Camp', width: 140, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.value}</Typography> },
      { field: 'item_requested', headerName: 'Item Requested', width: 150, renderCell: p => <Tooltip title={p.value}><Typography variant="body2" sx={{ fontWeight: 600, color: p.row.medical_urgent ? 'error.main' : 'text.primary' }}>{p.value}</Typography></Tooltip> },
      { field: 'quantity_needed', headerName: 'Qty', width: 80, align: 'center', renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.value}</Typography> },
      { field: 'priority', headerName: 'Priority', width: 100, renderCell: p => <Chip label={p.value} color={p.row.priority_color} size="small" icon={p.value === 'High' ? <UrgentIcon /> : null} /> },
      { field: 'status', headerName: 'Status', width: 120, renderCell: p => user?.role === 'Admin' || user?.role === 'Camp Manager' ? <TextField select value={p.value} onChange={e => handleStatusChange(p.row.request_id, e.target.value)} size="small" variant="outlined" sx={{ minWidth: 100 }}><MenuItem value="Pending">Pending</MenuItem><MenuItem value="Fulfilled">Fulfilled</MenuItem><MenuItem value="Rejected">Rejected</MenuItem></TextField> : <Chip label={p.value} color={p.row.status_color} size="small" /> },
      { field: 'date_display', headerName: 'Date', width: 100, renderCell: p => <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{p.value}</Typography> }
    ];

    if (type === 'urgent') return [ ...baseColumns, { field: 'actions', headerName: 'Actions', width: 100, sortable: false, align: 'center', renderCell: p => (user?.role === 'Admin' || user?.role === 'Camp Manager') && <Box sx={{ display: 'flex', gap: 0.5 }}><Tooltip title="Fulfill Urgent"><Button onClick={() => handleStatusChange(p.row.request_id, 'Fulfilled')} color="success" size="small" variant="contained" sx={{ minWidth: 'auto', px: 1 }}>✓</Button></Tooltip></Box> } ];
    
    return [ ...baseColumns, { field: 'actions', headerName: 'Actions', width: 100, sortable: false, align: 'center', renderCell: p => (user?.role === 'Admin' || user?.role === 'Camp Manager' || user?.role === 'Volunteer') && <Box sx={{ display: 'flex', gap: 0.5 }}><IconButton onClick={() => openDialog(p.row)} color="primary" size="small"><EditIcon fontSize="small" /></IconButton>{(user?.role === 'Admin' || user?.role === 'Camp Manager') && <IconButton onClick={() => handleDelete(p.row)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton>}</Box> } ];
  };

  const StatCard = ({ icon, value, label, color, urgent = false }) => (
    <Grid item xs={12} md={3}>
      <Card elevation={urgent ? 4 : 3} sx={{ bgcolor: `${color}.50`, border: urgent ? 2 : 0, borderColor: urgent ? `${color}.main` : 'transparent' }}>
        <CardContent sx={{ textAlign: 'center', p: urgent ? 4 : 3 }}>
          {icon}
          <Typography variant={urgent ? "h3" : "h4"} sx={{ fontWeight: 700, color: `${color}.main`, mb: 0.5 }}>{value}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  const tabData = [{ label: `📋 All Requests (${requests.all.length})`, data: requests.all, type: 'all' }, { label: `⏳ Pending (${requests.pending.length})`, data: requests.pending, type: 'pending' }, { label: `🚨 Urgent (${requests.urgent.length})`, data: requests.urgent, type: 'urgent' }];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>📋 Supply Requests</Typography><Typography variant="body2" color="text.secondary">{stats.total_requests || 0} total requests • {requests.urgent.length} urgent</Typography></Box>
        {(user?.role === 'Admin' || user?.role === 'Camp Manager' || user?.role === 'Volunteer') && <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()} size="large">Create Request</Button>}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard icon={<RequestIcon sx={{ fontSize: 48, mb: 1 }} />} value={stats.total_requests || 0} label="Total Requests" color="primary" />
        <StatCard icon={<UrgentIcon sx={{ fontSize: 48, mb: 1 }} />} value={requests.urgent.length} label="Urgent Requests" color="error" urgent={requests.urgent.length > 0} />
        <StatCard icon={<FulfilledIcon sx={{ fontSize: 48, mb: 1 }} />} value={stats.fulfilled_requests || 0} label="Fulfilled" color="success" />
        <StatCard icon={<RejectedIcon sx={{ fontSize: 48, mb: 1 }} />} value={stats.pending_requests || 0} label="Pending" color="warning" />
      </Grid>

      {requests.urgent.length > 0 && <Alert severity="error" sx={{ mb: 3, fontSize: '1rem' }}><Typography variant="h6" sx={{ mb: 1 }}>🚨 {requests.urgent.length} Urgent Requests Need Immediate Attention!</Typography>High priority medical and emergency requests are waiting for fulfillment.</Alert>}

      <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 3 }}><Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>{tabData.map((tab, i) => <Tab key={i} label={tab.label} />)}</Tabs></Box>

      <Card elevation={4}><CardContent sx={{ p: 3 }}><DataGrid rows={tabData[tabValue].data} columns={createColumns(tabData[tabValue].type)} getRowId={row => row.request_id} loading={loading} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} disableRowSelectionOnClick sx={gridStyles} getRowHeight={() => 'auto'} getRowClassName={params => params.row.medical_urgent ? 'urgent-row' : ''} /></CardContent></Card>

      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>{dialog.editing ? '✏️ Edit' : '📋 Create'} Supply Request</DialogTitle>
        <DialogContent><Grid container spacing={3} sx={{ pt: 3 }}>
          <Grid item xs={6}><TextField fullWidth select label="Victim *" value={formData.victim_id} onChange={e => setFormData({...formData, victim_id: e.target.value})} required><MenuItem value="">Select Victim</MenuItem>{victims.map(v => <MenuItem key={v.victim_id} value={v.victim_id}>{v.name} {v.medical_condition && `(${v.medical_condition})`}</MenuItem>)}</TextField></Grid>
          <Grid item xs={6}><TextField fullWidth select label="Camp *" value={formData.camp_id} onChange={e => setFormData({...formData, camp_id: e.target.value})} required><MenuItem value="">Select Camp</MenuItem>{camps.map(c => <MenuItem key={c.camp_id} value={c.camp_id}>{c.name}</MenuItem>)}</TextField></Grid>
          <Grid item xs={8}><TextField fullWidth label="Item Requested *" value={formData.item_requested} onChange={e => setFormData({...formData, item_requested: e.target.value})} required placeholder="Medicine, Food, Clothing, etc." /></Grid>
          <Grid item xs={4}><TextField fullWidth label="Quantity *" type="number" value={formData.quantity_needed} onChange={e => setFormData({...formData, quantity_needed: e.target.value})} required /></Grid>
          <Grid item xs={4}><TextField fullWidth select label="Priority *" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} required><MenuItem value="Low">🟢 Low</MenuItem><MenuItem value="Medium">🟡 Medium</MenuItem><MenuItem value="High">🔴 High</MenuItem></TextField></Grid>
          <Grid item xs={4}><TextField fullWidth select label="Status" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><MenuItem value="Pending">⏳ Pending</MenuItem><MenuItem value="Fulfilled">✅ Fulfilled</MenuItem><MenuItem value="Rejected">❌ Rejected</MenuItem></TextField></Grid>
          <Grid item xs={4}><TextField fullWidth label="Request Date" type="date" value={formData.request_date} onChange={e => setFormData({...formData, request_date: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
        </Grid></DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={closeDialog} variant="outlined">Cancel</Button><Button onClick={handleSubmit} variant="contained">{dialog.editing ? 'Update' : 'Create'} Request</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
};

export default RequestsPage;
