const User = require('../models/User');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');

// Save/unsave destination
const toggleSaveDestination = async (req, res) => {
  try {
    const { userId, destId } = req.params;
    
    // Check if user is accessing their own data or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [user, destination] = await Promise.all([
      User.findById(userId),
      Destination.findById(destId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!destination || !destination.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    const isSaved = user.savedDestinations.includes(destId);
    
    if (isSaved) {
      // Remove from saved destinations
      user.savedDestinations = user.savedDestinations.filter(
        id => id.toString() !== destId
      );
      await destination.decrementSaves();
    } else {
      // Add to saved destinations
      user.savedDestinations.push(destId);
      await destination.incrementSaves();
    }

    await user.save();

    res.json({
      success: true,
      message: isSaved ? 'Destination removed from saved list' : 'Destination saved successfully',
      isSaved: !isSaved
    });
  } catch (error) {
    console.error('Toggle save destination error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update saved destinations'
    });
  }
};

// Get user's saved destinations
const getSavedDestinations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user is accessing their own data or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(userId)
      .populate({
        path: 'savedDestinations',
        match: { isActive: true },
        select: 'name description location images price rating category createdAt',
        options: {
          skip: skip,
          limit: limitNum,
          sort: { createdAt: -1 }
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get total count of saved destinations
    const totalSaved = await User.findById(userId)
      .populate({
        path: 'savedDestinations',
        match: { isActive: true }
      });

    const total = totalSaved.savedDestinations.length;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      destinations: user.savedDestinations,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalDestinations: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get saved destinations error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved destinations'
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check if user is accessing their own data or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('destination', 'name location images price rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBookings: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings'
    });
  }
};

// Get user profile by ID
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('savedDestinations', 'name location images price')
      .select('-refreshTokens')
      .lean();

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const bookingStats = await Booking.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      }
    ]);

    const stats = {
      totalBookings: bookingStats.reduce((sum, stat) => sum + stat.count, 0),
      totalSpent: bookingStats.reduce((sum, stat) => sum + stat.totalSpent, 0),
      savedDestinations: user.savedDestinations.length,
      statusBreakdown: bookingStats
    };

    res.json({
      success: true,
      user: {
        ...user,
        stats
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-refreshTokens -password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    // Get booking statistics for each user
    const userIds = users.map(user => user._id);
    const bookingStats = await Booking.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: '$user',
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Merge statistics with user data
    const usersWithStats = users.map(user => {
      const stats = bookingStats.find(stat => stat._id.toString() === user._id.toString());
      return {
        ...user,
        stats: {
          totalBookings: stats?.totalBookings || 0,
          totalSpent: stats?.totalSpent || 0,
          savedDestinations: user.savedDestinations?.length || 0
        }
      };
    });

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

// Toggle user active status (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Clear refresh tokens if deactivating
    if (!user.isActive) {
      await user.clearRefreshTokens();
    }

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status'
    });
  }
};

// Get user dashboard stats
const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, bookingStats] = await Promise.all([
      User.findById(userId).select('savedDestinations'),
      Booking.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' }
          }
        }
      ])
    ]);

    // Recent bookings
    const recentBookings = await Booking.find({ user: userId })
      .populate('destination', 'name location images')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Upcoming bookings
    const upcomingBookings = await Booking.find({
      user: userId,
      status: 'confirmed',
      startDate: { $gte: new Date() }
    })
      .populate('destination', 'name location images')
      .sort({ startDate: 1 })
      .limit(3)
      .lean();

    const stats = {
      savedDestinations: user.savedDestinations.length,
      totalBookings: bookingStats.reduce((sum, stat) => sum + stat.count, 0),
      totalSpent: bookingStats.reduce((sum, stat) => sum + stat.totalSpent, 0),
      statusBreakdown: bookingStats,
      recentBookings,
      upcomingBookings
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  toggleSaveDestination,
  getSavedDestinations,
  getUserBookings,
  getUserProfile,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getUserDashboardStats
};
