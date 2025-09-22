const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  checkAvailability,
  getBookingStats,
  addReview
} = require('../controllers/bookingController');
const {
  authenticate,
  adminOnly
} = require('../middleware/auth');
const {
  validateBookingCreate,
  validateBookingUpdate,
  validateReview,
  validatePagination,
  mongoIdValidation,
  sanitizeInput
} = require('../middleware/validation');

// Check availability (public)
router.get('/availability', checkAvailability);

// User routes
router.post('/', authenticate, sanitizeInput, validateBookingCreate, createBooking);
router.get('/', authenticate, validatePagination, getBookings);
router.get('/:id', authenticate, mongoIdValidation('id'), getBooking);
router.put('/:id', authenticate, mongoIdValidation('id'), sanitizeInput, validateBookingUpdate, updateBooking);
router.post('/:id/cancel', authenticate, mongoIdValidation('id'), sanitizeInput, cancelBooking);
router.post('/:id/review', authenticate, mongoIdValidation('id'), sanitizeInput, validateReview, addReview);

// Admin routes
router.post('/:id/confirm', authenticate, adminOnly, mongoIdValidation('id'), confirmBooking);
router.get('/admin/stats', authenticate, adminOnly, getBookingStats);

module.exports = router;
