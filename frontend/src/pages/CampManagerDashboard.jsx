import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Alert, Chip, Avatar, List, ListItem, ListItemText, ListItemIcon, Divider, Paper, LinearProgress } from '@mui/material';
import { LocalShipping as DistributeIcon, Person as PersonIcon, Assignment as RequestIcon, Inventory as StockIcon, Warning as WarningIcon, CheckCircle as CheckIcon, Schedule as PendingIcon, Home as CampIcon, TrendingUp as TrendingIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { campManagerService } from '../services/campManagerService';
import { useNavigate } from 'react-router-dom';

const CampManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_id) {
      loadCampManagerData();
    }
  }, [user]);

  const loadCampManagerData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading data for camp manager:', user.user_id);
      
      // Get camps managed by this user
      const campsResponse = await campManagerService.getManagerCamps(user.user_id);
      const managerCamps = campsResponse.data || [];
      
      if (managerCamps.length === 0) {
        console.log('⚠️ No camps assigned to this manager');
        setCamps([]);
        return;
      }
      
      setCamps(managerCamps);
      console.log('✅ Found camps:', managerCamps.map(c => c.name));
      
      // Get camp statistics - FIXED: Using getCampStats instead of getCampSpecificData
      const campIds = managerCamps.map(c => c.camp_id);
      const campStats = await campManagerService.getCampStats(campIds);
      setStats(campStats);
      
      // Get recent requests
      const recentRequests = await campManagerService.getRecentRequests(campIds);
      setRequests(recentRequests.data);
      
      console.log('✅ Loaded camp manager dashboard data');
      
    } catch (error) {
      console.error('❌ Error loading camp manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, value, label, color, alert = false, trend = null, onClick = null }) => (
    <Grid item xs={12} sm={6} md={3}>
      <Card 
        elevation={3} 
        sx={{ 
          bgcolor: alert ? `${color}.50` : `${color}.25`, 
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s',
          border: alert ? `2px solid` : 'none',
          borderColor: alert ? `${color}.main` : 'transparent',
          '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: 4 } : {}
        }}
        onClick={onClick}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
            {icon}
            {trend && (
              <TrendingIcon 
                sx={{ 
                  ml: 1, 
                  fontSize: 20, 
                  color: trend > 0 ? 'success.main' : 'error.main',
                  transform: trend < 0 ? 'rotate(180deg)' : 'none'
                }} 
              />
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: `${color}.main`, mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          {alert && (
            <Chip 
              label="Action Needed" 
              color={color} 
              size="small" 
              sx={{ mt: 1 }}
              icon={<WarningIcon />}
            />
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  const CampOverviewCard = ({ camp }) => {
    const occupancyRate = camp.capacity > 0 ? (camp.current_occupancy / camp.capacity) * 100 : 0;
    const occupancyColor = occupancyRate > 90 ? 'error' : occupancyRate > 70 ? 'warning' : 'success';
    
    return (
      <Card elevation={3} sx={{ mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 48, height: 48 }}>
                <CampIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {camp.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📍 {camp.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 Established: {new Date(camp.date_established).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={camp.status} 
              color={camp.status === 'Active' ? 'success' : camp.status === 'Full' ? 'error' : 'warning'}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Occupancy: {camp.current_occupancy} / {camp.capacity}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {occupancyRate.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={occupancyRate} 
              color={occupancyColor}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/dashboard/supplies')}
                startIcon={<StockIcon />}
              >
                Manage Supplies
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/dashboard/victims')}
                startIcon={<PersonIcon />}
              >
                View Victims
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading your camp management dashboard...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (camps.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">No Camps Assigned</Typography>
          <Typography>You are not currently assigned to manage any relief camps. Please contact an administrator to get camp assignment.</Typography>
        </Alert>
        <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
          <CampIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="text.secondary">
            Waiting for Camp Assignment
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
          🏕️ Camp Manager Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.full_name}! Managing {camps.length} relief camp{camps.length > 1 ? 's' : ''}.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>

      {/* High Priority Alerts */}
      {(stats.high_priority_requests > 0 || stats.low_stock_supplies > 0) && (
        <Alert severity="error" sx={{ mb: 3, fontSize: '1rem' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>🚨 Urgent Attention Required!</Typography>
          {stats.high_priority_requests > 0 && (
            <Typography>• {stats.high_priority_requests} HIGH PRIORITY requests need immediate fulfillment</Typography>
          )}
          {stats.low_stock_supplies > 0 && (
            <Typography>• {stats.low_stock_supplies} supplies are critically low in your camps</Typography>
          )}
          <Button 
            variant="contained" 
            color="error" 
            sx={{ mt: 2 }}
            onClick={() => navigate('/dashboard/distributions')}
          >
            Take Action Now
          </Button>
        </Alert>
      )}

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard 
          icon={<RequestIcon sx={{ fontSize: 48, mb: 1 }} />} 
          value={stats.pending_requests || 0} 
          label="Pending Requests" 
          color="warning"
          alert={stats.pending_requests > 0}
          onClick={() => navigate('/dashboard/requests')}
        />
        <StatCard 
          icon={<StockIcon sx={{ fontSize: 48, mb: 1 }} />} 
          value={stats.low_stock_supplies || 0} 
          label="Low Stock Items" 
          color="error"
          alert={stats.low_stock_supplies > 0}
          onClick={() => navigate('/dashboard/supplies')}
        />
        <StatCard 
          icon={<CheckIcon sx={{ fontSize: 48, mb: 1 }} />} 
          value={stats.recent_distributions || 0} 
          label="Recent Distributions" 
          color="success"
          onClick={() => navigate('/dashboard/distributions')}
        />
        <StatCard 
          icon={<PersonIcon sx={{ fontSize: 48, mb: 1 }} />} 
          value={camps.reduce((total, camp) => total + (camp.current_occupancy || 0), 0)} 
          label="Total Occupancy" 
          color="info"
          onClick={() => navigate('/dashboard/victims')}
        />
      </Grid>

      <Grid container spacing={3}>
        {/* My Camps Overview */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            🏕️ My Relief Camps ({camps.length})
          </Typography>
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            {camps.map((camp) => (
              <CampOverviewCard key={camp.camp_id} camp={camp} />
            ))}
          </Box>
        </Grid>

        {/* Recent Activity & Quick Actions */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            🚀 Quick Actions
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                startIcon={<DistributeIcon />}
                onClick={() => navigate('/dashboard/distributions')}
                disabled={!stats.pending_requests || stats.pending_requests === 0}
                sx={{ 
                  bgcolor: 'success.main', 
                  '&:hover': { bgcolor: 'success.dark' }, 
                  minHeight: 60, 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  width: '100%'
                }}
              >
                Fulfill Pending Requests ({stats.pending_requests || 0})
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PersonIcon />}
                onClick={() => navigate('/dashboard/victims')}
                sx={{ minHeight: 60, width: '100%' }}
              >
                Register Victim
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<StockIcon />}
                onClick={() => navigate('/dashboard/supplies')}
                sx={{ minHeight: 60, width: '100%' }}
              >
                Manage Supplies
              </Button>
            </Grid>
          </Grid>

          {/* Recent Requests */}
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
                <PendingIcon sx={{ mr: 1 }} /> Recent Requests
                {stats.pending_requests > 0 && (
                  <Chip label={stats.pending_requests} color="warning" size="small" sx={{ ml: 1 }} />
                )}
              </Typography>
              
              {requests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                    No requests from your camps yet!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {requests.slice(0, 5).map((request, index) => (
                    <React.Fragment key={request.request_id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: request.priority === 'High' ? 'error.light' : 'warning.light',
                              width: 32, 
                              height: 32 
                            }}
                          >
                            <RequestIcon fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {request.item_requested} • {request.victim_name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption">
                                Qty: {request.quantity_needed} • {new Date(request.request_date).toLocaleDateString()}
                              </Typography>
                              <Chip 
                                label={request.priority} 
                                size="small"
                                color={request.priority === 'High' ? 'error' : 'warning'}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(requests.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              
              {requests.length > 5 && (
                <Button 
                  fullWidth 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/dashboard/requests')}
                >
                  View All Requests ({requests.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CampManagerDashboard;
