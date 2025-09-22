const express = require('express');
const router = express.Router();
const {
  toggleSaveDestination,
  getSavedDestinations,
  getUserBookings,
  getUserProfile,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getUserDashboardStats
} = require('../controllers/userController');
const {
  authenticate,
  adminOnly,
  ownerOrAdmin
} = require('../middleware/auth');
const {
  validatePagination,
  mongoIdValidation,
  sanitizeInput
} = require('../middleware/validation');

// User dashboard stats
router.get('/dashboard/stats', authenticate, getUserDashboardStats);

// Save/unsave destinations
router.post('/:userId/save/:destId', 
  authenticate, 
  mongoIdValidation('userId'), 
  mongoIdValidation('destId'), 
  toggleSaveDestination
);

// Get saved destinations
router.get('/:userId/saved', 
  authenticate, 
  mongoIdValidation('userId'), 
  validatePagination, 
  getSavedDestinations
);

// Get user bookings
router.get('/:userId/bookings', 
  authenticate, 
  mongoIdValidation('userId'), 
  validatePagination, 
  getUserBookings
);

// Get user profile
router.get('/:userId', 
  authenticate, 
  mongoIdValidation('userId'), 
  ownerOrAdmin(), 
  getUserProfile
);

// Admin only routes
router.get('/', authenticate, adminOnly, validatePagination, getAllUsers);

router.put('/:userId/role', 
  authenticate, 
  adminOnly, 
  mongoIdValidation('userId'), 
  sanitizeInput, 
  updateUserRole
);

router.patch('/:userId/status', 
  authenticate, 
  adminOnly, 
  mongoIdValidation('userId'), 
  toggleUserStatus
);

module.exports = router;
