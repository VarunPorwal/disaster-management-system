import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LocationOn } from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Dashboard,
  Warning,
  People,
  Home,
  PersonAdd,
  Favorite,
  MonetizationOn,
  Inventory,
  Assignment,
  LocalShipping,
  Menu as MenuIcon,
  AccountCircle,
  Logout
} from '@mui/icons-material';

const drawerWidth = 280;

// Navigation items based on role
const getNavigationItems = (role) => {
  const adminNav = [
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/dashboard/disasters', label: 'Disasters', icon: <Warning /> },
    { path: '/dashboard/areas', label: 'Affected Areas', icon: <LocationOn /> },
    { path: '/dashboard/volunteers', label: 'Volunteers', icon: <People /> },
    { path: '/dashboard/camps', label: 'Relief Camps', icon: <Home /> },
    { path: '/dashboard/victims', label: 'Victims', icon: <PersonAdd /> },
    { path: '/dashboard/donors', label: 'Donors', icon: <Favorite /> },
    { path: '/dashboard/donations', label: 'Donations', icon: <MonetizationOn /> },
    { path: '/dashboard/supplies', label: 'Supply Management', icon: <Inventory /> },
    { path: '/dashboard/requests', label: 'Requests', icon: <Assignment /> },
    { path: '/dashboard/distributions', label: 'Distributions', icon: <LocalShipping /> },
    
  ];

  const campManagerNav = [
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/dashboard/my-camps', label: 'My Camps', icon: <Home /> },
    { path: '/dashboard/victims', label: 'Victims', icon: <PersonAdd /> },
    { path: '/dashboard/supplies', label: 'Supplies', icon: <Inventory /> },
    { path: '/dashboard/requests', label: 'Requests', icon: <Assignment /> },
    { path: '/dashboard/distributions', label: 'Distributions', icon: <LocalShipping /> },
  ];

  const volunteerNav = [
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/dashboard/my-assignments', label: 'My Assignments', icon: <Assignment /> },
    { path: '/dashboard/disasters', label: 'Disasters', icon: <Warning /> },
    { path: '/dashboard/camps', label: 'Relief Camps', icon: <Home /> },
  ];

  const donorNav = [
    { path: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/dashboard/my-donations', label: 'My Donations', icon: <MonetizationOn /> },
    { path: '/dashboard/disasters', label: 'Active Disasters', icon: <Warning /> },
  ];

  switch (role) {
    case 'Admin': return adminNav;
    case 'Camp Manager': return campManagerNav;
    case 'Volunteer': return volunteerNav;
    case 'Donor': return donorNav;
    default: return [];
  }
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigationItems = getNavigationItems(user?.role);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Camp Manager': return 'warning';
      case 'Volunteer': return 'success';
      case 'Donor': return 'info';
      default: return 'default';
    }
  };

  const drawer = (
    <div>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap>
          🏥 Disaster Management
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Chip 
            label={user?.role} 
            color={getRoleColor(user?.role)} 
            size="small"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Box>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            button 
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome, {user?.full_name || user?.username}
          </Typography>
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
