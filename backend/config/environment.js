const config = {
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-app',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Cookie Configuration
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'your-cookie-secret-change-this-in-production',

  // Google Cloud Vision API (Optional - for OCR feature)
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,

  // CORS Configuration
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5174',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

module.exports = config;
