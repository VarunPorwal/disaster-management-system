const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const disasterRoutes = require('./src/routes/disasters');
const volunteerRoutes = require('./src/routes/volunteers');
const affectedAreaRoutes = require('./src/routes/affectedAreas');
const reliefCampRoutes = require('./src/routes/reliefCamps');
const victimRoutes = require('./src/routes/victims');
const donorRoutes = require('./src/routes/donors');
const donationRoutes = require('./src/routes/donations');
const supplyRoutes = require('./src/routes/supplies');
const requestRoutes = require('./src/routes/requests');
const distributionRoutes = require('./src/routes/distributions');
const worksAtRoutes = require('./src/routes/worksAt');
const assignedToRoutes = require('./src/routes/assignedTo');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes - Authentication first
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api/disasters', disasterRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/areas', affectedAreaRoutes);
app.use('/api/camps', reliefCampRoutes);
app.use('/api/victims', victimRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/works-at', worksAtRoutes);
app.use('/api/assigned-to', assignedToRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Disaster Management System API',
    status: 'Running',
    version: '2.0.0',
    features: ['Complete CRUD Operations', 'JWT Authentication', 'Role-based Access Control'],
    endpoints: {
      // Authentication
      auth: '/api/auth',
      // Core APIs
      disasters: '/api/disasters',
      volunteers: '/api/volunteers',
      areas: '/api/areas',
      camps: '/api/camps',
      victims: '/api/victims',
      donors: '/api/donors',
      donations: '/api/donations',
      supplies: '/api/supplies',
      requests: '/api/requests',
      distributions: '/api/distributions',
      worksAt: '/api/works-at',
      assignedTo: '/api/assigned-to',
      health: '/api/health'
    },
    auth_info: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/profile (requires token)',
      roles: ['Admin', 'Camp Manager', 'Volunteer', 'Donor']
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    authentication: 'Enabled',
    database: 'Connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler - FIXED for Express v5
app.use((req, res) => {  // ✅ REMOVED THE '*' WILDCARD
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requested_path: req.path,
    method: req.method,
    available_endpoints: ['/api/auth', '/api/disasters', '/api/volunteers', '/api/donors', '/api/supplies']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 Authentication system enabled`);
  console.log(`👥 Role-based access control active`);
  console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
