const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Common validation rules
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces');

const mongoIdValidation = (field) => param(field)
  .isMongoId()
  .withMessage(`Invalid ${field} ID format`);

// User validation rules
const validateUserRegistration = [
  nameValidation,
  emailValidation,
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors
];

const validateUserLogin = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),
  handleValidationErrors
];

// Destination validation rules
const validateDestinationCreate = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*')
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('category')
    .optional()
    .isIn(['adventure', 'beach', 'city', 'cultural', 'nature', 'luxury', 'budget', 'family', 'romantic'])
    .withMessage('Invalid category'),
  body('maxGuests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum guests must be at least 1'),
  body('coordinates.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with longitude and latitude'),
  body('coordinates.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  handleValidationErrors
];

const validateDestinationUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('category')
    .optional()
    .isIn(['adventure', 'beach', 'city', 'cultural', 'nature', 'luxury', 'budget', 'family', 'romantic'])
    .withMessage('Invalid category'),
  body('maxGuests')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum guests must be at least 1'),
  handleValidationErrors
];

// Booking validation rules
const validateBookingCreate = [
  body('destinationId')
    .isMongoId()
    .withMessage('Invalid destination ID'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('guests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be between 1 and 20'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
  body('guestDetails.primaryGuest.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Primary guest name must be between 2 and 50 characters'),
  body('guestDetails.primaryGuest.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Primary guest email must be valid'),
  body('guestDetails.primaryGuest.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Primary guest phone must be valid'),
  handleValidationErrors
];

const validateBookingUpdate = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('guests')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be between 1 and 20'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'refunded'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateDestinationQuery = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters'),
  query('category')
    .optional()
    .isIn(['adventure', 'beach', 'city', 'cultural', 'nature', 'luxury', 'budget', 'family', 'romantic'])
    .withMessage('Invalid category'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  ...validatePagination
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  handleValidationErrors
];

// Sanitize user input
const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags and dangerous characters
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange,
  validateDestinationCreate,
  validateDestinationUpdate,
  validateBookingCreate,
  validateBookingUpdate,
  validatePagination,
  validateDestinationQuery,
  validateReview,
  sanitizeInput,
  mongoIdValidation
};
