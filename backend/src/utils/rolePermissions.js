// Complete Role-based permission matrix for disaster management system
const ROLE_PERMISSIONS = {
  'Admin': {
    disasters: ['read', 'create', 'update', 'delete'],
    volunteers: ['read', 'create', 'update', 'delete'],
    areas: ['read', 'create', 'update', 'delete'],
    camps: ['read', 'create', 'update', 'delete'],
    victims: ['read', 'create', 'update', 'delete'],
    donors: ['read', 'create', 'update', 'delete'],
    donations: ['read', 'create', 'update', 'delete'],
    supplies: ['read', 'create', 'update', 'delete'],
    requests: ['read', 'create', 'update', 'delete'],
    distributions: ['read', 'create', 'update', 'delete'],
    worksAt: ['read', 'create', 'update', 'delete'],
    assignedTo: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'], // User management
    reports: ['read', 'create'] // System reports
  },
  
  'Camp Manager': {
    disasters: ['read'],
    volunteers: ['read', 'update'], // Can update volunteers in their camps
    areas: ['read'],
    camps: ['read', 'update'], // Can update camps they manage
    victims: ['read', 'create', 'update'], // Manage victims in their camps
    donors: ['read'],
    donations: ['read'],
    supplies: ['read', 'update', 'delete'], // Manage supplies in their camps
    requests: ['read', 'create', 'update'], // Handle requests from victims
    distributions: ['read', 'create'], // Distribute supplies to victims
    worksAt: ['read', 'create', 'delete'], // Manage volunteer assignments
    assignedTo: ['read'],
    users: [], // No user management
    reports: ['read'] // View camp reports
  },
  
  'Volunteer': {
    disasters: ['read'],
    volunteers: ['read'], // See other volunteers (limited info)
    areas: ['read'],
    camps: ['read'],
    victims: ['read', 'create', 'update'], // See victims they're helping
    donors: ['read'], // Basic donor info
    donations: ['read'], // See what donations are available
    supplies: ['read'],
    requests: ['read', 'create', 'update'], // See requests in their assigned areas
    distributions: ['read'], // See distributions they made
    worksAt: ['read'], // See their own work assignments
    assignedTo: ['read'], // See their area assignments
    users: [], // No user management
    reports: [] // No reports access
  },
  
  'Donor': {
    disasters: ['read'], // See what disasters need help
    volunteers: ['read'], // No volunteer access
    areas: ['read'], // See affected areas
    camps: ['read'], // See relief camps
    victims: [], // No victim access
    donors: ['read'], // See other donors (basic info)
    donations: ['read', 'create'], // See and create their own donations
    supplies: ['read'], // See how donations become supplies
    requests: ['read'], // See what's needed
    distributions: ['read'], // See how supplies are distributed
    worksAt: [], // No volunteer assignments
    assignedTo: [], // No area assignments
    users: [], // No user management
    reports: ['read'] // See donation impact reports
  }
};

// Check if user has permission for specific resource and action
const hasPermission = (userRole, resource, action) => {
  if (!ROLE_PERMISSIONS[userRole]) return false;
  if (!ROLE_PERMISSIONS[userRole][resource]) return false;
  return ROLE_PERMISSIONS[userRole][resource].includes(action);
};

// Middleware to check resource-specific permissions
const checkResourcePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (hasPermission(req.user.role, resource, action)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Access denied. Your role '${req.user.role}' does not have '${action}' permission for ${resource}.`,
        required_permission: `${resource}:${action}`,
        user_role: req.user.role,
        available_permissions: ROLE_PERMISSIONS[req.user.role] || {}
      });
    }
  };
};

// Get all permissions for a role
const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || {};
};

// Check if user can access specific resource based on ownership
const checkOwnership = (resource, userRole, userId, resourceUserId) => {
  // Admin can access everything
  if (userRole === 'Admin') return true;
  
  // Users can access their own resources
  if (userId === resourceUserId) return true;
  
  // Additional ownership rules
  switch (resource) {
    case 'volunteers':
      return userRole === 'Camp Manager' || (userRole === 'Volunteer' && userId === resourceUserId);
    case 'donors':
      return userRole === 'Admin' || (userRole === 'Donor' && userId === resourceUserId);
    case 'donations':
      return userRole === 'Admin' || userRole === 'Camp Manager' || (userRole === 'Donor' && userId === resourceUserId);
    default:
      return hasPermission(userRole, resource, 'read');
  }
};

module.exports = {
  ROLE_PERMISSIONS,
  hasPermission,
  checkResourcePermission,
  getRolePermissions,
  checkOwnership
};
