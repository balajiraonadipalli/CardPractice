const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAuthStatus
} = require('../controllers/authController');
const {
  authenticate,
  optionalAuth
} = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  sanitizeInput
} = require('../middleware/validation');

// Public routes
router.post('/register', sanitizeInput, validateUserRegistration, register);
router.post('/login', sanitizeInput, validateUserLogin, login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, sanitizeInput, validateUserUpdate, updateProfile);
router.put('/change-password', authenticate, sanitizeInput, validatePasswordChange, changePassword);
router.delete('/account', authenticate, deleteAccount);

// Optional auth routes
router.get('/status', optionalAuth, getAuthStatus);

module.exports = router;
