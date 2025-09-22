const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getFeaturedDestinations,
  getPopularDestinations,
  searchByLocation,
  getDestinationStats,
  toggleFeatured
} = require('../controllers/destinationController');
const {
  authenticate,
  optionalAuth,
  adminOnly
} = require('../middleware/auth');
const {
  validateDestinationCreate,
  validateDestinationUpdate,
  validateDestinationQuery,
  mongoIdValidation,
  sanitizeInput
} = require('../middleware/validation');

// Public routes with optional authentication
router.get('/', optionalAuth, validateDestinationQuery, getDestinations);
router.get('/featured', optionalAuth, getFeaturedDestinations);
router.get('/popular', optionalAuth, getPopularDestinations);
router.get('/search/location', optionalAuth, searchByLocation);
router.get('/:id', mongoIdValidation('id'), optionalAuth, getDestination);

// Admin only routes
router.post('/', authenticate, adminOnly, sanitizeInput, validateDestinationCreate, createDestination);
router.put('/:id', authenticate, adminOnly, mongoIdValidation('id'), sanitizeInput, validateDestinationUpdate, updateDestination);
router.delete('/:id', authenticate, adminOnly, mongoIdValidation('id'), deleteDestination);
router.get('/admin/stats', authenticate, adminOnly, getDestinationStats);
router.patch('/:id/featured', authenticate, adminOnly, mongoIdValidation('id'), toggleFeatured);

module.exports = router;
