import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid, Tooltip, Avatar, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AttachMoney as MoneyIcon, Inventory2 as GiftIcon, Business as BusinessIcon, Person as PersonIcon, TrendingUp as TrendingIcon, Assessment as StatsIcon } from '@mui/icons-material';
import { donationsService } from '../services/donationsService';
import { useAuth } from '../context/AuthContext';

const DonationsPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0); const [donations, setDonations] = useState({ all: [], cash: [], inKind: [] }); const [loading, setLoading] = useState(true); const [dialogs, setDialogs] = useState({ create: false, edit: false }); const [editing, setEditing] = useState(null); const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); const [stats, setStats] = useState({ total_donations: 0, total_cash: 0, total_in_kind: 0, active_donors: 0 }); const [formData, setFormData] = useState({ donor_id: '', type: 'Cash', amount: '', quantity: '', unit: '', description: '', estimated_value: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await donationsService.getAllDonations();
      if (res.data?.length) {
        const processed = res.data.map((d, i) => ({ ...d, id: d.donation_id || i + 1, donation_id: d.donation_id || i + 1, donor_display: d.donor_name || `Donor ${d.donor_id}`, donor_type_display: d.donor_type || 'Individual', amount_display: d.amount ? `₹${Number(d.amount).toLocaleString()}` : '-', quantity_display: d.quantity ? `${d.quantity} ${d.unit || 'units'}` : '-', value_display: d.estimated_value ? `₹${Number(d.estimated_value).toLocaleString()}` : '-', date_display: d.date ? new Date(d.date).toLocaleDateString('en-IN') : '-', status_display: d.status || 'Pledged' })).sort((a, b) => b.donation_id - a.donation_id);
        
        const cash = processed.filter(d => d.type === 'Cash'); const inKind = processed.filter(d => d.type !== 'Cash');
        setDonations({ all: processed, cash, inKind });
        
        const totalCash = cash.reduce((sum, d) => sum + (Number(d.amount) || 0), 0); const totalInKind = inKind.reduce((sum, d) => sum + (Number(d.estimated_value) || 0), 0);
        setStats({ total_donations: processed.length, total_cash: totalCash, total_in_kind: totalInKind, active_donors: new Set(processed.map(d => d.donor_id)).size });
      }
    } catch (error) { showSnackbar('Error: ' + error.message, 'error'); } finally { setLoading(false); }
  };

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const openDialog = (type, data = null) => { setDialogs({ ...dialogs, [type]: true }); if (data) { setEditing(data); setFormData({ donor_id: data.donor_id || '', type: data.type || 'Cash', amount: data.amount || '', quantity: data.quantity || '', unit: data.unit || '', description: data.description || '', estimated_value: data.estimated_value || '' }); } else { setFormData({ donor_id: '', type: 'Cash', amount: '', quantity: '', unit: '', description: '', estimated_value: '' }); setEditing(null); } };
  const closeDialog = (type) => setDialogs({ ...dialogs, [type]: false });

  const handleSubmit = async () => {
    try {
      if (!formData.donor_id || !formData.type) { showSnackbar('Please fill required fields', 'error'); return; }
      const submitData = { ...formData, donor_id: parseInt(formData.donor_id), date: new Date().toISOString().split('T')[0], amount: formData.type === 'Cash' ? parseFloat(formData.amount) || null : null, quantity: formData.type !== 'Cash' ? parseFloat(formData.quantity) || null : null, estimated_value: parseFloat(formData.estimated_value) || null };
      
      if (editing) { await donationsService.updateDonation(editing.donation_id, submitData); showSnackbar('✅ Updated!'); } else { await donationsService.createDonation(submitData); showSnackbar('✅ Created!'); }
      closeDialog(editing ? 'edit' : 'create'); loadData();
    } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); }
  };

  const handleDelete = async (donation) => { if (window.confirm(`Delete donation from "${donation.donor_display}"?`)) { try { await donationsService.deleteDonation(donation.donation_id); showSnackbar('✅ Deleted!'); loadData(); } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); } } };

  const gridStyles = { height: 600, '& .MuiDataGrid-row': { minHeight: '80px !important' }, '& .MuiDataGrid-cell': { padding: '12px 8px', fontSize: '0.875rem', whiteSpace: 'normal' }, '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.100', fontWeight: 700 } };

  const createColumns = (type) => {
    const baseColumns = [ { field: 'donation_id', headerName: 'ID', width: 70, align: 'center', renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{p.value}</Typography> } ];
    
    if (type === 'all') return [ ...baseColumns, { field: 'donor_display', headerName: 'Donor', width: 200, renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ mr: 1.5, width: 36, height: 36, bgcolor: p.row.donor_type_display === 'Corporate' ? 'success.light' : 'info.light' }}>{p.row.donor_type_display === 'Corporate' ? <BusinessIcon fontSize="small" /> : <PersonIcon fontSize="small" />}</Avatar><Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography><Typography variant="caption" color="text.secondary">{p.row.donor_type_display}</Typography></Box></Box> }, { field: 'type', headerName: 'Type', width: 120, renderCell: p => <Chip icon={p.value === 'Cash' ? <MoneyIcon /> : <GiftIcon />} label={p.value} color={p.value === 'Cash' ? 'success' : 'info'} /> }, { field: 'description', headerName: 'Description', width: 220, renderCell: p => <Tooltip title={p.value || 'No description'}><Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.value || 'No description'}</Typography></Tooltip> }, { field: 'amount_display', headerName: 'Cash', width: 120, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, color: p.value !== '-' ? 'success.main' : 'text.secondary' }}>{p.value}</Typography> }, { field: 'quantity_display', headerName: 'Quantity', width: 120 }, { field: 'value_display', headerName: 'Value', width: 120, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{p.value}</Typography> }, { field: 'date_display', headerName: 'Date', width: 100 }, { field: 'status_display', headerName: 'Status', width: 120, renderCell: p => <Chip label={p.value} color={{ Pledged: 'warning', Received: 'info', Distributed: 'success' }[p.value]} /> }, { field: 'actions', headerName: 'Actions', width: 100, sortable: false, align: 'center', renderCell: p => user?.role === 'Admin' && <Box sx={{ display: 'flex', gap: 0.5 }}><IconButton onClick={() => openDialog('edit', p.row)} color="primary" size="small"><EditIcon fontSize="small" /></IconButton><IconButton onClick={() => handleDelete(p.row)} color="error" size="small"><DeleteIcon fontSize="small" /></IconButton></Box> } ];
    
    if (type === 'cash') return [ ...baseColumns, { field: 'donor_display', headerName: 'Donor', width: 250, renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center' }}><MoneyIcon sx={{ mr: 1.5, color: 'success.main', fontSize: '1.5rem' }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography></Box> }, { field: 'amount_display', headerName: 'Amount', width: 140, renderCell: p => <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>{p.value}</Typography> }, { field: 'description', headerName: 'Purpose', width: 280 }, { field: 'date_display', headerName: 'Date', width: 100 }, { field: 'status_display', headerName: 'Status', width: 120, renderCell: p => <Chip label={p.value} color={{ Pledged: 'warning', Received: 'success' }[p.value]} /> } ];
    
    return [ ...baseColumns, { field: 'donor_display', headerName: 'Donor', width: 200, renderCell: p => <Box sx={{ display: 'flex', alignItems: 'center' }}><GiftIcon sx={{ mr: 1.5, color: 'info.main' }} /><Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography></Box> }, { field: 'type', headerName: 'Type', width: 120, renderCell: p => <Chip label={p.value} color={{ Food: 'success', Medicine: 'error', Clothing: 'info' }[p.value]} /> }, { field: 'quantity_display', headerName: 'Quantity', width: 130, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.value}</Typography> }, { field: 'value_display', headerName: 'Value', width: 120, renderCell: p => <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{p.value}</Typography> }, { field: 'description', headerName: 'Description', width: 220 }, { field: 'date_display', headerName: 'Date', width: 100 }, { field: 'status_display', headerName: 'Status', width: 120, renderCell: p => <Chip label={p.value} color={{ Pledged: 'warning', Received: 'info', Distributed: 'success' }[p.value]} /> } ];
  };

  const StatCard = ({ icon, value, label, color }) => (
    <Grid item xs={12} md={3}>
      <Card elevation={3} sx={{ bgcolor: `${color}.50` }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          {icon}
          <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main`, mb: 0.5 }}>{value}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  const tabData = [{ label: `🎁 All (${donations.all.length})`, data: donations.all, type: 'all' }, { label: `💰 Cash (${donations.cash.length})`, data: donations.cash, type: 'cash' }, { label: `📦 In-Kind (${donations.inKind.length})`, data: donations.inKind, type: 'inKind' }];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>🎁 Donations Management</Typography><Typography variant="body2" color="text.secondary">{stats.total_donations} donations • ₹{(stats.total_cash + stats.total_in_kind).toLocaleString()} total</Typography></Box>
        {user?.role === 'Admin' && <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog('create')} size="large">Add Donation</Button>}
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard icon={<TrendingIcon sx={{ fontSize: 48, mb: 1 }} />} value={stats.total_donations} label="Total Donations" color="primary" />
        <StatCard icon={<MoneyIcon sx={{ fontSize: 48, mb: 1 }} />} value={`₹${stats.total_cash.toLocaleString()}`} label="Cash Donations" color="success" />
        <StatCard icon={<GiftIcon sx={{ fontSize: 48, mb: 1 }} />} value={`₹${stats.total_in_kind.toLocaleString()}`} label="In-Kind Value" color="info" />
        <StatCard icon={<StatsIcon sx={{ fontSize: 48, mb: 1 }} />} value={stats.active_donors} label="Active Donors" color="warning" />
      </Grid>

      <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 3 }}><Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>{tabData.map((tab, i) => <Tab key={i} label={tab.label} />)}</Tabs></Box>

      <Card elevation={4}><CardContent sx={{ p: 3 }}><DataGrid rows={tabData[tabValue].data} columns={createColumns(tabData[tabValue].type)} getRowId={row => row.donation_id} loading={loading} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} disableRowSelectionOnClick sx={gridStyles} getRowHeight={() => 'auto'} /></CardContent></Card>

      <Dialog open={dialogs.create || dialogs.edit} onClose={() => closeDialog(editing ? 'edit' : 'create')} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>{editing ? '✏️ Edit' : '🎁 Add'} Donation</DialogTitle>
        <DialogContent><Grid container spacing={3} sx={{ pt: 3 }}>
          <Grid item xs={6}><TextField fullWidth label="Donor ID *" type="number" value={formData.donor_id} onChange={e => setFormData({...formData, donor_id: e.target.value})} required /></Grid>
          <Grid item xs={6}><TextField fullWidth select label="Type *" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required><MenuItem value="Cash">💰 Cash</MenuItem><MenuItem value="Food">🍽️ Food</MenuItem><MenuItem value="Medicine">💊 Medicine</MenuItem><MenuItem value="Clothing">👕 Clothing</MenuItem><MenuItem value="Emergency Supplies">🆘 Emergency</MenuItem></TextField></Grid>
          {formData.type === 'Cash' ? <Grid item xs={12}><TextField fullWidth label="Amount *" type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} InputProps={{startAdornment: '₹'}} required /></Grid> : <><Grid item xs={6}><TextField fullWidth label="Quantity *" type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required /></Grid><Grid item xs={6}><TextField fullWidth label="Unit *" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required /></Grid></>}
          <Grid item xs={6}><TextField fullWidth label="Est. Value" type="number" value={formData.estimated_value} onChange={e => setFormData({...formData, estimated_value: e.target.value})} InputProps={{startAdornment: '₹'}} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} multiline rows={2} /></Grid>
        </Grid></DialogContent>
        <DialogActions sx={{p: 3}}><Button onClick={() => closeDialog(editing ? 'edit' : 'create')} variant="outlined">Cancel</Button><Button onClick={handleSubmit} variant="contained">{editing ? 'Update' : 'Add'}</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
};

export default DonationsPage;
