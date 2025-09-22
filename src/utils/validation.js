import * as yup from 'yup';

// Input sanitization function
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Login validation schema
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .transform(sanitizeInput),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

// Registration validation schema
export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .required('Name is required')
    .transform(sanitizeInput),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .transform(sanitizeInput),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

// Destination validation schema
export const destinationSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .required('Destination name is required')
    .transform(sanitizeInput),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .required('Description is required')
    .transform(sanitizeInput),
  location: yup
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location must not exceed 100 characters')
    .required('Location is required')
    .transform(sanitizeInput),
  price: yup
    .number()
    .positive('Price must be a positive number')
    .required('Price is required'),
  images: yup
    .array()
    .of(yup.string().url('Please provide valid image URLs'))
    .min(1, 'At least one image is required')
});

// Booking validation schema
export const bookingSchema = yup.object({
  destinationId: yup
    .string()
    .required('Destination is required'),
  startDate: yup
    .date()
    .min(new Date(), 'Start date cannot be in the past')
    .required('Start date is required'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  guests: yup
    .number()
    .integer('Number of guests must be a whole number')
    .min(1, 'At least 1 guest is required')
    .max(20, 'Maximum 20 guests allowed')
    .required('Number of guests is required'),
  specialRequests: yup
    .string()
    .max(500, 'Special requests must not exceed 500 characters')
    .transform(sanitizeInput)
});

// Search validation
export const searchSchema = yup.object({
  query: yup
    .string()
    .max(100, 'Search query must not exceed 100 characters')
    .transform(sanitizeInput)
});

// Validation helper functions
export const validateField = async (schema, field, value) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return null;
  } catch (error) {
    return error.message;
  }
};

export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};
