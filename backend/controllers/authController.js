const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const config = require('../config/environment');

// Register a new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: 'user'
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Save refresh token to user
    await user.addRefreshToken(refreshToken);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove sensitive data from response
    const userResponse = user.toJSON();
    delete userResponse.refreshTokens;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      accessToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Save refresh token to user
    await user.addRefreshToken(refreshToken);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove sensitive data from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Refresh access token
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    // Replace old refresh token with new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = req.user;

    if (refreshToken && user) {
      // Remove refresh token from user
      await user.removeRefreshToken(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Logout from all devices
const logoutAll = async (req, res) => {
  try {
    const user = req.user;

    // Clear all refresh tokens
    await user.clearRefreshTokens();

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout from all devices failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    // Get user with populated saved destinations
    const populatedUser = await User.findById(user._id)
      .populate('savedDestinations', 'name location images price')
      .lean();

    res.json({
      success: true,
      user: populatedUser
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

    // Fields that can be updated
    const allowedUpdates = ['name', 'avatar'];
    const actualUpdates = {};

    // Filter allowed updates
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        actualUpdates[key] = updates[key];
      }
    }

    // Update user
    Object.assign(user, actualUpdates);
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    // Clear all refresh tokens (logout from all devices)
    await userWithPassword.clearRefreshTokens();

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    const { password } = req.body;

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    
    // Verify password
    const isPasswordValid = await userWithPassword.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Deactivate account instead of deleting
    userWithPassword.isActive = false;
    await userWithPassword.save();

    // Clear all refresh tokens
    await userWithPassword.clearRefreshTokens();

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Account deletion failed'
    });
  }
};

// Get authentication status
const getAuthStatus = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    res.json({
      success: true,
      authenticated: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Get auth status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get authentication status'
    });
  }
};

module.exports = {
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
};
