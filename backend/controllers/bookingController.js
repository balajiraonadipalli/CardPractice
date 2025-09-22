const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const User = require('../models/User');

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const {
      destinationId,
      startDate,
      endDate,
      guests,
      specialRequests,
      guestDetails
    } = req.body;

    // Find destination
    const destination = await Destination.findById(destinationId);
    if (!destination || !destination.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if destination is available for the dates
    const existingBookings = await Booking.checkAvailability(
      destinationId,
      new Date(startDate),
      new Date(endDate)
    );

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Destination is not available for the selected dates'
      });
    }

    // Check guest capacity
    if (guests > destination.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Number of guests exceeds maximum capacity (${destination.maxGuests})`
      });
    }

    // Get user details for primary guest if not provided
    const user = await User.findById(req.user._id);
    const primaryGuestDetails = guestDetails?.primaryGuest || {
      name: user.name,
      email: user.email,
      phone: guestDetails?.primaryGuest?.phone || ''
    };

    // Calculate booking details
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const pricePerNight = destination.price;
    const totalPrice = nights * pricePerNight * guests;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      destination: destinationId,
      startDate: start,
      endDate: end,
      guests,
      pricePerNight,
      totalPrice,
      specialRequests,
      guestDetails: {
        primaryGuest: primaryGuestDetails,
        additionalGuests: guestDetails?.additionalGuests || []
      },
      metadata: {
        source: 'web',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await booking.save();

    // Update destination booking count
    destination.bookingCount += 1;
    destination.lastBookedAt = new Date();
    await destination.save();

    // Populate booking details
    await booking.populate([
      { path: 'destination', select: 'name location images price' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

// Get all bookings (Admin only) or user's bookings
const getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      destinationId,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    } else if (userId) {
      query.user = userId;
    }

    if (status) {
      query.status = status;
    }

    if (destinationId) {
      query.destination = destinationId;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('destination', 'name location images price rating')
        .populate('user', 'name email')
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
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Get single booking by ID
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('destination', 'name description location images price rating amenities')
      .populate('user', 'name email avatar')
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can access this booking
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can update this booking
    const canUpdate = req.user.role === 'admin' || 
                     (booking.user.toString() === req.user._id.toString() && 
                      booking.status === 'pending');

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this booking'
      });
    }

    // Restrict what regular users can update
    if (req.user.role !== 'admin') {
      const allowedUpdates = ['specialRequests', 'guestDetails'];
      const actualUpdates = {};
      
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          actualUpdates[key] = updates[key];
        }
      }
      
      Object.assign(booking, actualUpdates);
    } else {
      // Admin can update anything
      Object.assign(booking, updates);
    }

    await booking.save();

    // Populate booking details
    await booking.populate([
      { path: 'destination', select: 'name location images price' },
      { path: 'user', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    const canCancel = req.user.role === 'admin' || 
                     (booking.user.toString() === req.user._id.toString() && 
                      ['pending', 'confirmed'].includes(booking.status));

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'You cannot cancel this booking'
      });
    }

    // Check if booking can be cancelled (not in the past)
    if (booking.startDate <= new Date() && booking.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already started'
      });
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    // Cancel booking
    await booking.cancel(reason, req.user._id);

    // Set refund amount
    booking.cancellation.refundAmount = refundAmount;
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
      refundAmount
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

// Confirm booking (Admin only)
const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed'
      });
    }

    // Confirm booking
    await booking.confirm();

    // Populate booking details
    await booking.populate([
      { path: 'destination', select: 'name location images price' },
      { path: 'user', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to confirm booking'
    });
  }
};

// Check availability
const checkAvailability = async (req, res) => {
  try {
    const { destinationId, startDate, endDate } = req.query;

    if (!destinationId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Destination ID, start date, and end date are required'
      });
    }

    const destination = await Destination.findById(destinationId);
    if (!destination || !destination.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.checkAvailability(
      destinationId,
      new Date(startDate),
      new Date(endDate)
    );

    const isAvailable = conflictingBookings.length === 0;

    res.json({
      success: true,
      available: isAvailable,
      conflictingBookings: isAvailable ? [] : conflictingBookings.map(booking => ({
        id: booking._id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status
      }))
    });
  } catch (error) {
    console.error('Check availability error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to check availability'
    });
  }
};

// Get booking statistics (Admin only)
const getBookingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // General statistics
    const stats = await Booking.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averageBookingValue: { $avg: '$totalPrice' },
          averageGuests: { $avg: '$guests' }
        }
      }
    ]);

    // Status breakdown
    const statusStats = await Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly revenue trend
    const monthlyStats = await Booking.aggregate([
      { $match: { ...dateFilter, status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top destinations by bookings
    const topDestinations = await Booking.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$destination', bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'destinations',
          localField: '_id',
          foreignField: '_id',
          as: 'destination'
        }
      },
      { $unwind: '$destination' },
      {
        $project: {
          name: '$destination.name',
          location: '$destination.location',
          bookings: 1,
          revenue: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        averageGuests: 0
      },
      statusStats,
      monthlyStats,
      topDestinations
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics'
    });
  }
};

// Add review to booking
const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user can review this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own bookings'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
    }

    // Check if already reviewed
    if (booking.review.rating) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Add review
    booking.review = {
      rating,
      comment,
      reviewedAt: new Date()
    };

    await booking.save();

    // Update destination rating
    const destination = await Destination.findById(booking.destination);
    if (destination) {
      const allReviews = await Booking.find({
        destination: destination._id,
        'review.rating': { $exists: true }
      }).select('review.rating');

      const totalRating = allReviews.reduce((sum, booking) => sum + booking.review.rating, 0);
      const averageRating = totalRating / allReviews.length;

      destination.rating = Math.round(averageRating * 10) / 10;
      destination.reviewCount = allReviews.length;
      await destination.save();
    }

    res.json({
      success: true,
      message: 'Review added successfully',
      booking
    });
  } catch (error) {
    console.error('Add review error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  checkAvailability,
  getBookingStats,
  addReview
};
