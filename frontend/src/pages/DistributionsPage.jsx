import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Alert, Snackbar, Grid, Avatar, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { LocalShipping as DistributeIcon, Person as PersonIcon, CheckCircle as CompletedIcon, Schedule as PendingIcon, Inventory as StockIcon, Assignment as RequestIcon } from '@mui/icons-material';
import { distributionsService } from '../services/distributionsService';
import { requestsService } from '../services/requestsService';
import { useAuth } from '../context/AuthContext';
import { suppliesService } from '../services/suppliesService';

const DistributionsPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0); const [distributions, setDistributions] = useState({ all: [], recent: [] }); const [pendingRequests, setPendingRequests] = useState([]); const [campSupplies, setCampSupplies] = useState([]); const [loading, setLoading] = useState(true); const [dialog, setDialog] = useState({ open: false, data: null }); const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); const [stats, setStats] = useState({}); const [formData, setFormData] = useState({ supply_id: '', quantity_distributed: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [distRes, reqRes, statsRes] = await Promise.all([distributionsService.getAll(), requestsService.getAll(), distributionsService.getStats()]);
      
      if (distRes.data?.length) {
        const processed = distRes.data.filter(d => d.request_id).map((d, i) => ({ ...d, id: d.distribution_id, distribution_id: d.distribution_id, victim_display: d.victim_name || `Victim ${d.victim_id}`, supply_display: d.supply_item_name || 'Unknown Item', request_display: `Request #${d.request_id}`, date_display: d.distribution_date ? new Date(d.distribution_date).toLocaleDateString('en-IN') : '-', is_medical: d.victim_medical_condition || d.item_requested?.toLowerCase().includes('medicine'), camp_display: d.camp_name || 'Unknown Camp', priority_color: { High: 'error', Medium: 'warning', Low: 'info' }[d.request_priority] || 'default' })).sort((a, b) => new Date(b.distribution_date) - new Date(a.distribution_date));
        const recent = processed.filter(d => { const diffDays = Math.ceil((new Date() - new Date(d.distribution_date)) / (1000 * 60 * 60 * 24)); return diffDays <= 7; });
        setDistributions({ all: processed, recent });
      }
      
      if (reqRes.data?.length) {
        const pending = reqRes.data.filter(r => r.status === 'Pending').map(r => ({ ...r, victim_display: r.victim_name || `Victim ${r.victim_id}`, camp_display: r.camp_name || `Camp ${r.camp_id}`, is_urgent: r.priority === 'High' && (r.victim_medical_condition || r.item_requested?.toLowerCase().includes('medicine')) })).sort((a, b) => { if (a.priority === 'High' && b.priority !== 'High') return -1; if (b.priority === 'High' && a.priority !== 'High') return 1; return new Date(a.request_date) - new Date(b.request_date); });
        setPendingRequests(pending);
      }
      
      setStats({...statsRes.data, request_fulfillments: distributions.all?.length || 0}); console.log('✅ Loaded distributions');
    } catch (error) { showSnackbar('Error: ' + error.message, 'error'); } finally { setLoading(false); }
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const openFulfillDialog = async (request) => { 
  try {
    setFormData({ supply_id: '', quantity_distributed: request.quantity_needed || '' }); 
    setDialog({ open: true, data: request });
    
    console.log('🔍 Loading supplies for camp:', request.camp_id);
    
    if (request.camp_id) {
      // Use existing supplies service
      const campSuppliesRes = await suppliesService.getSuppliesByCamp(request.camp_id);
      const availableSupplies = campSuppliesRes.data?.filter(s => s.current_quantity > 0) || [];
      setCampSupplies(availableSupplies);
      console.log('✅ Loaded supplies for camp:', availableSupplies.length);
    } else {
      console.log('⚠️ No camp_id found in request');
      setCampSupplies([]);
    }
  } catch (error) {
    console.error('❌ Error loading camp supplies:', error);
    showSnackbar('Error loading camp supplies: ' + error.message, 'error');
    setCampSupplies([]);
  }
}
  const closeDialog = () => setDialog({ open: false, data: null });

  const handleFulfill = async () => {
    try {
      if (!formData.supply_id || !formData.quantity_distributed) { showSnackbar('Please select supply and enter quantity', 'error'); return; }
      await distributionsService.fulfillRequest(dialog.data.request_id, { supply_id: parseInt(formData.supply_id), quantity_distributed: parseFloat(formData.quantity_distributed) });
      showSnackbar('✅ Request fulfilled successfully!'); closeDialog(); loadData();
    } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); }
  };

  const gridStyles = { height: 600, '& .MuiDataGrid-row': { minHeight: '80px !important', '&.urgent-row': { bgcolor: 'error.50', borderLeft: '4px solid', borderColor: 'error.main' } }, '& .MuiDataGrid-cell': { padding: '12px 8px', fontSize: '0.875rem', whiteSpace: 'normal' }, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.100', fontWeight: 700 } };

  const createDistributionsColumns = () => [
    { field: 'distribution_id', headerName: 'ID', width: 70, align: 'center', renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{p.value}</Typography> },
    { field: 'request_display', headerName: 'Request', width: 100, align: 'center', renderCell: p => <Chip label={p.value} color="info" size="small" /> },
    { field: 'victim_display', headerName: 'Victim', width: 160, renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: p.row.is_medical ? 'error.light' : 'success.light' }}><PersonIcon fontSize="small" /></Avatar><Box><Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.value}</Typography>{p.row.victim_medical_condition && <Typography variant="caption" color="error.main">{p.row.victim_medical_condition}</Typography>}</Box></Box> },
    { field: 'item_requested', headerName: 'Item Requested', width: 140, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.value}</Typography> },
    { field: 'supply_display', headerName: 'Item Distributed', width: 160, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>{p.value}</Typography> },
    { field: 'quantity_distributed', headerName: 'Qty', width: 80, align: 'center', renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem', color: 'success.main' }}>{p.value}</Typography> },
    { field: 'request_priority', headerName: 'Priority', width: 90, renderCell: p => <Chip label={p.value} color={p.row.priority_color} size="small" /> },
    { field: 'camp_display', headerName: 'Camp', width: 140 },
    { field: 'date_display', headerName: 'Distributed', width: 100 }
  ];

  const createPendingRequestsColumns = () => [
    { field: 'request_id', headerName: 'ID', width: 70, align: 'center', renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>#{p.value}</Typography> },
    { field: 'victim_display', headerName: 'Victim', width: 160, renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: p.row.is_urgent ? 'error.light' : 'warning.light' }}><PersonIcon fontSize="small" /></Avatar><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography>{p.row.victim_medical_condition && <Typography variant="caption" color="error.main">{p.row.victim_medical_condition}</Typography>}</Box></Box> },
    { field: 'item_requested', headerName: 'Item Needed', width: 150, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 600, color: p.row.is_urgent ? 'error.main' : 'warning.main' }}>{p.value}</Typography> },
    { field: 'quantity_needed', headerName: 'Qty', width: 80, align: 'center', renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.value}</Typography> },
    { field: 'priority', headerName: 'Priority', width: 100, renderCell: p => <Chip label={p.value} color={{ High: 'error', Medium: 'warning', Low: 'info' }[p.value]} size="small" icon={p.value === 'High' ? <RequestIcon /> : null} /> },
    { field: 'camp_display', headerName: 'Camp', width: 140 },
    { field: 'request_date', headerName: 'Requested', width: 100, renderCell: p => <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{new Date(p.value).toLocaleDateString('en-IN')}</Typography> },
    { field: 'actions', headerName: 'Actions', width: 120, sortable: false, align: 'center', renderCell: p => (user?.role === 'Admin' || user?.role === 'Camp Manager') && <Button onClick={() => openFulfillDialog(p.row)} variant="contained" color={p.row.is_urgent ? 'error' : 'success'} size="small" startIcon={<DistributeIcon />}>Fulfill</Button> }
  ];

  const StatCard = ({ icon, value, label, color, action = null }) => (
    <Grid item xs={12} md={3}>
      <Card elevation={3} sx={{ bgcolor: `${color}.50`, transition: 'all 0.3s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          {icon}
          <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main`, mb: 0.5 }}>{value}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: action ? 1 : 0 }}>{label}</Typography>
          {action}
        </CardContent>
      </Card>
    </Grid>
  );

  const tabData = [{ label: `📦 All Distributions (${distributions.all.length})`, data: distributions.all, type: 'distributions' }, { label: `📅 Recent (${distributions.recent.length})`, data: distributions.recent, type: 'distributions' }, { label: `⏳ Pending Requests (${pendingRequests.length})`, data: pendingRequests, type: 'pending' }];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>📦 Request Fulfillment & Distribution</Typography><Typography variant="body2" color="text.secondary">{stats.requests_fulfilled || 0} requests fulfilled • {pendingRequests.length} pending</Typography></Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard icon={<CompletedIcon sx={{ fontSize: 48, mb: 1 }} />} value={stats.requests_fulfilled || 0} label="Requests Fulfilled" color="success" />
        <StatCard icon={<PendingIcon sx={{ fontSize: 48, mb: 1 }} />} value={pendingRequests.length} label="Pending Requests" color="warning" action={pendingRequests.length > 0 && <Button size="small" color="warning" variant="outlined" onClick={() => setTabValue(2)}>Fulfill Now</Button>} />
        <StatCard icon={<StockIcon sx={{ fontSize: 48, mb: 1 }} />} value={stats.victims_served || 0} label="Victims Served" color="info" />
        <StatCard icon={<DistributeIcon sx={{ fontSize: 48, mb: 1 }} />} value={distributions.recent.length} label="Recent Distributions" color="primary" />
      </Grid>

      {pendingRequests.filter(r => r.priority === 'High').length > 0 && <Alert severity="error" sx={{ mb: 3 }}><Typography variant="h6" sx={{ mb: 1 }}>🚨 {pendingRequests.filter(r => r.priority === 'High').length} High Priority Requests Need Immediate Fulfillment!</Typography>These urgent requests require immediate distribution.</Alert>}

      <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 3 }}><Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>{tabData.map((tab, i) => <Tab key={i} label={tab.label} />)}</Tabs></Box>

      <Card elevation={4}><CardContent sx={{ p: 3 }}><DataGrid rows={tabData[tabValue].data} columns={tabData[tabValue].type === 'pending' ? createPendingRequestsColumns() : createDistributionsColumns()} getRowId={row => tabValue === 2 ? row.request_id : row.distribution_id} loading={loading} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} disableRowSelectionOnClick sx={gridStyles} getRowHeight={() => 'auto'} getRowClassName={params => (params.row.is_urgent && tabValue === 2) ? 'urgent-row' : ''} /></CardContent></Card>

      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>📦 Fulfill Request #{dialog.data?.request_id}</DialogTitle>
        <DialogContent><Box sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>Fulfilling <strong>{dialog.data?.item_requested}</strong> for <strong>{dialog.data?.victim_display}</strong><br />Camp: <strong>{dialog.data?.camp_display}</strong> • Quantity: <strong>{dialog.data?.quantity_needed}</strong></Alert>
          <Grid container spacing={3}>
            <Grid item xs={12}><TextField fullWidth select label="Select Supply from Camp *" value={formData.supply_id} onChange={e => setFormData({...formData, supply_id: e.target.value})} required helperText={`${campSupplies.length} supplies available in ${dialog.data?.camp_display}`}><MenuItem value="">Choose supply from this camp</MenuItem>{campSupplies.length === 0 ? <MenuItem disabled>No supplies available in this camp</MenuItem> : campSupplies.map(s => <MenuItem key={s.supply_id} value={s.supply_id}>{s.item_name} (Available: {s.current_quantity} {s.unit || 'units'})</MenuItem>)}</TextField></Grid>
            <Grid item xs={12}><TextField fullWidth label="Quantity to Distribute *" type="number" value={formData.quantity_distributed} onChange={e => setFormData({...formData, quantity_distributed: e.target.value})} required inputProps={{ max: dialog.data?.quantity_needed }} helperText={`Maximum: ${dialog.data?.quantity_needed}`} /></Grid>
          </Grid>
        </Box></DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={closeDialog} variant="outlined">Cancel</Button><Button onClick={handleFulfill} variant="contained" color="success" size="large" disabled={campSupplies.length === 0}>{campSupplies.length === 0 ? 'No Supplies Available' : 'Fulfill & Distribute'}</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
};

export default DistributionsPage;
