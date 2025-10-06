import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';

const DashboardHome = () => {
  const { user } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Camp Manager': return 'warning';
      case 'Volunteer': return 'success';
      case 'Donor': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        🏠 Dashboard Home
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome, {user?.full_name || user?.username}!
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={user?.role} 
                  color={getRoleColor(user?.role)} 
                  variant="outlined" 
                  size="large"
                />
              </Box>

              <Typography variant="body1" color="textSecondary" gutterBottom>
                User ID: {user?.user_id}
              </Typography>
              
              {user?.email && (
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  Email: {user.email}
                </Typography>
              )}

              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  🎉 System Status
                </Typography>
                <Typography variant="body2">
                  ✅ Authentication Active<br />
                  ✅ Role-based Access Working<br />
                  ✅ CRUD Operations Ready<br />
                  🚀 Dashboard Functional!
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                📊 Quick Stats
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Real-time statistics will be loaded here from your backend APIs.
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">🚀 Features Ready:</Typography>
                <Typography variant="body2">
                  • Complete CRUD for disasters<br />
                  • Role-based navigation<br />
                  • Data tables with sorting<br />
                  • Form validation<br />
                  • Real-time notifications
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
