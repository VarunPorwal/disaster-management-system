import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Alert, Snackbar, Grid, Tooltip, Avatar, Tabs, Tab } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Inventory as InventoryIcon, Warning as WarningIcon, TrendingUp as TrendingIcon, Transform as ConvertIcon, Assignment as AssignIcon } from '@mui/icons-material';
import { suppliesService, donationsService } from '../services/suppliesService';
import { reliefCampsService } from '../services/reliefCampsService';
import { campManagerService } from '../services/campManagerService';
import { useAuth } from '../context/AuthContext';

const SuppliesPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [supplies, setSupplies] = useState([]);
  const [donations, setDonations] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [convertData, setConvertData] = useState({ camp_id: '', category: '', item_name: '', quantity: '', expiry_date: '' });
  const [stats, setStats] = useState(null);
  
  // Camp manager filtering
  const [managerCampIds, setManagerCampIds] = useState([]);
  const [campNames, setCampNames] = useState([]);
  const isCampManager = user?.role === 'Camp Manager';

  useEffect(() => { loadSupplies(); loadDonations(); loadCamps(); loadStats(); }, []);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      
      // Get camp IDs for filtering
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
      
      const response = await suppliesService.getAllSupplies();
      if (response.data?.length) {
        let processedSupplies = response.data.map(supply => ({
          ...supply,
          supply_id: supply.supply_id,
          camp_name: supply.camp_name || 'Unknown Camp',
          donor_name: supply.donor_name || 'Unknown Donor',
          stock_level: supply.current_quantity || 0,
          total_quantity: supply.quantity || 0,
          stock_percentage: supply.quantity > 0 ? Math.round((supply.current_quantity / supply.quantity) * 100) : 0,
          expiry_status: getExpiryStatus(supply.expiry_date),
          value_per_unit: supply.estimated_value && supply.quantity ? Math.round(supply.estimated_value / supply.quantity) : 0
        }));
        
        // Apply camp manager filtering
        if (isCampManager && campIdsToFilter.length > 0) {
          processedSupplies = processedSupplies.filter(supply => campIdsToFilter.includes(supply.camp_id));
        }
        
        setSupplies(processedSupplies.sort((a, b) => a.supply_id - b.supply_id));
      } else {
        setSupplies([]);
      }
    } catch (error) { showSnackbar('Error loading supplies: ' + error.message, 'error'); setSupplies([]); } finally { setLoading(false); }
  };

  const loadDonations = async () => { try { const response = await donationsService.getAllDonations(); setDonations(response.data || []); } catch { setDonations([]); } };
  const loadCamps = async () => { try { const response = await reliefCampsService.getAllCamps(); setCamps(response.data || []); } catch { setCamps([]); } };
  const loadStats = async () => { try { const response = await suppliesService.getSupplyStats(); setStats(response.data); } catch { setStats(null); } };
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'No Expiry';
    const today = new Date(); const expiry = new Date(expiryDate); const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired'; if (diffDays <= 30) return 'Expiring Soon'; if (diffDays <= 90) return 'Monitor'; return 'Good';
  };

  const getStockColor = (percentage) => { if (percentage <= 15) return 'error'; if (percentage <= 30) return 'warning'; return 'success'; };
  const getExpiryColor = (status) => { return { 'Expired': 'error', 'Expiring Soon': 'warning', 'Monitor': 'info', 'Good': 'success', 'No Expiry': 'default' }[status] || 'default'; };

  const handleConvertDonation = (donation) => { setSelectedDonation(donation); setConvertData({ camp_id: '', category: donation.type || 'Food', item_name: donation.description?.split(' ')[0] || '', quantity: donation.quantity || '', expiry_date: '' }); setOpenConvertDialog(true); };

  const handleConvertSubmit = async () => {
    try {
      if (!convertData.camp_id || !convertData.item_name || !convertData.quantity) { showSnackbar('Please fill required fields', 'error'); return; }
      
      const supplyData = { camp_id: parseInt(convertData.camp_id), donation_id: selectedDonation.donation_id, type: selectedDonation.type, quantity: parseFloat(convertData.quantity), current_quantity: parseFloat(convertData.quantity), category: convertData.category, item_name: convertData.item_name, expiry_date: convertData.expiry_date || null, status: 'Available' };
      
      await suppliesService.createSupply(supplyData);
      await donationsService.updateDonationStatus(selectedDonation.donation_id, 'Distributed');
      
      showSnackbar('✅ Donation converted to supply and assigned to camp!');
      setOpenConvertDialog(false); loadSupplies(); loadDonations();
    } catch (error) { showSnackbar('❌ Error: ' + (error.response?.data?.message || error.message), 'error'); }
  };

  const handleUpdateStock = async (supplyId, newQuantity) => {
    try {
      await suppliesService.updateSupply(supplyId, { current_quantity: newQuantity });
      showSnackbar('✅ Stock updated!');
      loadSupplies();
    } catch (error) { showSnackbar('❌ Error: ' + error.message, 'error'); }
  };

  const pendingDonations = donations.filter(d => d.status === 'Pledged');

  const suppliesColumns = [
    { field: 'supply_id', headerName: 'ID', width: 60, headerAlign: 'center', align: 'center' },
    { field: 'item_name', headerName: 'Item', width: 150, renderCell: (p) => <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}><InventoryIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} /><Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{p.value}</Typography></Box> },
    { field: 'category', headerName: 'Category', width: 100, renderCell: (p) => <Chip label={p.value} color={{ 'Food': 'success', 'Medicine': 'error', 'Clothing': 'info', 'Emergency': 'warning' }[p.value] || 'default'} size="small" /> },
    { field: 'camp_name', headerName: 'Camp', width: 140, renderCell: (p) => <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{p.value}</Typography> },
    { field: 'stock_level', headerName: 'Stock', width: 120, renderCell: (p) => <Box sx={{ width: '100%', py: 1 }}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{p.value}/{p.row.total_quantity}</Typography><Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.row.stock_percentage}%</Typography></Box><Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6 }}><Box sx={{ width: `${Math.min(p.row.stock_percentage, 100)}%`, bgcolor: getStockColor(p.row.stock_percentage) === 'error' ? 'error.main' : getStockColor(p.row.stock_percentage) === 'warning' ? 'warning.main' : 'success.main', borderRadius: 1, height: '100%' }} /></Box></Box> },
    { field: 'expiry_date', headerName: 'Expires', width: 100, renderCell: (p) => <Chip label={p.row.expiry_status} color={getExpiryColor(p.row.expiry_status)} size="small" sx={{ fontSize: '0.65rem' }} /> },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (p) => <Chip label={p.value} color={{ 'Available': 'success', 'Low Stock': 'warning', 'Expiring Soon': 'error' }[p.value] || 'default'} size="small" /> },
    { field: 'actions', headerName: 'Actions', width: 80, sortable: false, renderCell: (p) => <Box sx={{ display: 'flex', gap: 0.5 }}>{user?.role === 'Admin' && <Tooltip title="Edit Stock"><IconButton onClick={() => {}} color="primary" size="small"><EditIcon fontSize="small" /></IconButton></Tooltip>}</Box> }
  ];

  const donationsColumns = [
    { field: 'donation_id', headerName: 'ID', width: 60 },
    { field: 'donor_name', headerName: 'Donor', width: 150, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.value || 'Unknown'}</Typography> },
    { field: 'type', headerName: 'Type', width: 100, renderCell: (p) => <Chip label={p.value} size="small" /> },
    { field: 'description', headerName: 'Description', width: 200, renderCell: (p) => <Tooltip title={p.value}><Typography variant="body2" sx={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.value?.length > 30 ? p.value.substring(0, 30) + '...' : p.value}</Typography></Tooltip> },
    { field: 'quantity', headerName: 'Quantity', width: 80, renderCell: (p) => <Typography variant="body2">{p.value} {p.row.unit}</Typography> },
    { field: 'estimated_value', headerName: 'Value', width: 100, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>₹{p.value?.toLocaleString()}</Typography> },
    { field: 'status', headerName: 'Status', width: 100, renderCell: (p) => <Chip label={p.value} color={{ 'Pledged': 'warning', 'Received': 'info', 'Distributed': 'success' }[p.value] || 'default'} size="small" /> },
    { field: 'actions', headerName: 'Actions', width: 100, sortable: false, renderCell: (p) => <Box>{p.row.status === 'Pledged' && user?.role === 'Admin' && <Tooltip title="Convert to Supply"><IconButton onClick={() => handleConvertDonation(p.row)} color="primary" size="small"><ConvertIcon fontSize="small" /></IconButton></Tooltip>}</Box> }
  ];

  return (
    <Box>
      {isCampManager && campNames.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing supplies from: {campNames.join(', ')}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>📦 Supply Management</Typography>
          <Typography variant="body2" color="text.secondary">{supplies.length} {isCampManager ? 'camp' : ''} supplies • {pendingDonations.length} pending donations</Typography>
        </Box>
      </Box>

      {stats && <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}><Card><CardContent sx={{ textAlign: 'center' }}><TrendingIcon sx={{ color: 'primary.main', fontSize: 40, mb: 1 }} /><Typography variant="h5" sx={{ fontWeight: 700 }}>{supplies.length}</Typography><Typography variant="body2" color="text.secondary">{isCampManager ? 'Camp' : 'Total'} Supplies</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent sx={{ textAlign: 'center' }}><WarningIcon sx={{ color: 'warning.main', fontSize: 40, mb: 1 }} /><Typography variant="h5" sx={{ fontWeight: 700 }}>{supplies.filter(s => s.stock_percentage <= 30).length}</Typography><Typography variant="body2" color="text.secondary">Low Stock</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent sx={{ textAlign: 'center' }}><AssignIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} /><Typography variant="h5" sx={{ fontWeight: 700 }}>{isCampManager ? campNames.length : stats.total_camps || 0}</Typography><Typography variant="body2" color="text.secondary">{isCampManager ? 'Managed' : 'Active'} Camps</Typography></CardContent></Card></Grid>
        <Grid item xs={12} md={3}><Card><CardContent sx={{ textAlign: 'center' }}><ConvertIcon sx={{ color: 'info.main', fontSize: 40, mb: 1 }} /><Typography variant="h5" sx={{ fontWeight: 700 }}>{pendingDonations.length}</Typography><Typography variant="body2" color="text.secondary">Pending Donations</Typography></CardContent></Card></Grid>
      </Grid>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="📦 Current Supplies" />
          <Tab label="🎁 Pending Donations" />
        </Tabs>
      </Box>

      {tabValue === 0 && <Card elevation={3}><CardContent sx={{ p: 2 }}><DataGrid rows={supplies} columns={suppliesColumns} getRowId={(row) => row.supply_id} loading={loading} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} disableRowSelectionOnClick sx={{ height: 650, '& .MuiDataGrid-row': { minHeight: '60px !important' }}} /></CardContent></Card>}

      {tabValue === 1 && <Card elevation={3}><CardContent sx={{ p: 2 }}><DataGrid rows={pendingDonations} columns={donationsColumns} getRowId={(row) => row.donation_id} loading={loading} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} disableRowSelectionOnClick sx={{ height: 650, '& .MuiDataGrid-row': { minHeight: '60px !important' }}} /></CardContent></Card>}

      <Dialog open={openConvertDialog} onClose={() => setOpenConvertDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>🔄 Convert Donation to Supply</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ pt: 3 }}>
            <Grid item xs={12}><Typography variant="h6" sx={{ mb: 2 }}>Converting: {selectedDonation?.description}</Typography></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth select label="Assign to Camp *" value={convertData.camp_id} onChange={(e) => setConvertData({ ...convertData, camp_id: e.target.value })} required><MenuItem value="">Select Camp</MenuItem>{camps.map(camp => <MenuItem key={camp.camp_id} value={camp.camp_id}>{camp.name}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth select label="Category *" value={convertData.category} onChange={(e) => setConvertData({ ...convertData, category: e.target.value })} required>{['Food', 'Medicine', 'Clothing', 'Emergency Supplies', 'Water', 'Sanitation'].map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Item Name *" value={convertData.item_name} onChange={(e) => setConvertData({ ...convertData, item_name: e.target.value })} required /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Quantity *" type="number" value={convertData.quantity} onChange={(e) => setConvertData({ ...convertData, quantity: e.target.value })} required /></Grid>
            <Grid item xs={12} md={3}><TextField fullWidth label="Expiry Date" type="date" value={convertData.expiry_date} onChange={(e) => setConvertData({ ...convertData, expiry_date: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}><Button onClick={() => setOpenConvertDialog(false)}>Cancel</Button><Button onClick={handleConvertSubmit} variant="contained">Convert & Assign</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Box>
  );
};

export default SuppliesPage;
