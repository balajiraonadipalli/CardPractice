const jwt = require('jsonwebtoken');
const config = require('../config/environment');

// Generate access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
    issuer: 'travel-app',
    audience: 'travel-app-users'
  });
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    issuer: 'travel-app',
    audience: 'travel-app-users'
  });
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET, {
      issuer: 'travel-app',
      audience: 'travel-app-users'
    });
  } catch (error) {
    throw error;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET, {
      issuer: 'travel-app',
      audience: 'travel-app-users'
    });
  } catch (error) {
    throw error;
  }
};

// Generate token pair
const generateTokenPair = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken
  };
};

// Extract token from authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Generate password reset token
const generatePasswordResetToken = (userId) => {
  return jwt.sign(
    { userId, purpose: 'password-reset' },
    config.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Verify password reset token
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.purpose !== 'password-reset') {
      throw new Error('Invalid token purpose');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Generate email verification token
const generateEmailVerificationToken = (userId) => {
  return jwt.sign(
    { userId, purpose: 'email-verification' },
    config.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Verify email verification token
const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.purpose !== 'email-verification') {
      throw new Error('Invalid token purpose');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  extractTokenFromHeader,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  verifyEmailVerificationToken
};
