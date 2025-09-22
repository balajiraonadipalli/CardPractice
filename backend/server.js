const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import configuration and database
const config = require('./config/environment');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const userRoutes = require('./routes/users');
const bookingRoutes = require('./routes/bookings');
const ocrRoutes = require('./routes/ocr');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    config.CLIENT_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser(config.COOKIE_SECRET));

// Request logging middleware (development)
if (config.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Travel App API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/ocr', ocrRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Travel App API',
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile'
      },
      destinations: {
        list: 'GET /api/destinations',
        get: 'GET /api/destinations/:id',
        create: 'POST /api/destinations (admin)',
        update: 'PUT /api/destinations/:id (admin)',
        delete: 'DELETE /api/destinations/:id (admin)',
        featured: 'GET /api/destinations/featured',
        popular: 'GET /api/destinations/popular'
      },
      users: {
        profile: 'GET /api/users/:userId',
        saved: 'GET /api/users/:userId/saved',
        bookings: 'GET /api/users/:userId/bookings',
        saveDestination: 'POST /api/users/:userId/save/:destId'
      },
      bookings: {
        create: 'POST /api/booking',
        list: 'GET /api/booking',
        get: 'GET /api/booking/:id',
        cancel: 'POST /api/booking/:id/cancel',
        availability: 'GET /api/booking/availability'
      },
      ocr: {
        process: 'POST /api/ocr',
        status: 'GET /api/ocr/status'
      }
    },
    features: [
      'JWT Authentication with refresh tokens',
      'Role-based authorization (user/admin)',
      'Destination management with search and filtering',
      'Booking system with availability checking',
      'User saved destinations',
      'OCR text extraction from travel documents',
      'Rate limiting and security headers',
      'Input validation and sanitization',
      'MongoDB with Mongoose ODM'
    ]
  });
});

// Handle 404 for API routes
app.use('/api', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.path
    });
  }
  next();
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Multer errors (file upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: config.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = config.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Travel App API Server Started!
📍 Environment: ${config.NODE_ENV}
🌐 Port: ${PORT}
🔗 Health Check: http://localhost:${PORT}/health
📚 API Docs: http://localhost:${PORT}/api
🎯 Client URL: ${config.CLIENT_URL}
⏰ Started at: ${new Date().toISOString()}
  `);
});

module.exports = app;
