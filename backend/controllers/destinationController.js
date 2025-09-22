const Destination = require('../models/Destination');
const User = require('../models/User');

// Get all destinations with pagination and filtering
const getDestinations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort = 'createdAt'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { isActive: true };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) query.price.$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'popular':
        sortOption = { bookingCount: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query
    const [destinations, total] = await Promise.all([
      Destination.find(query)
        .populate('createdBy', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Destination.countDocuments(query)
    ]);

    // Add isSaved flag for authenticated users
    if (req.user) {
      const user = await User.findById(req.user._id);
      destinations.forEach(dest => {
        dest.isSaved = user.savedDestinations.includes(dest._id);
      });
    }

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      destinations,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalDestinations: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destinations'
    });
  }
};

// Get single destination by ID
const getDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findById(id)
      .populate('createdBy', 'name avatar')
      .lean();

    if (!destination || !destination.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Increment view count
    await Destination.findByIdAndUpdate(id, { $inc: { 'metadata.views': 1 } });

    // Add isSaved flag for authenticated users
    if (req.user) {
      const user = await User.findById(req.user._id);
      destination.isSaved = user.savedDestinations.includes(destination._id);
    }

    res.json({
      success: true,
      destination
    });
  } catch (error) {
    console.error('Get destination error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch destination'
    });
  }
};

// Create new destination (Admin only)
const createDestination = async (req, res) => {
  try {
    const destinationData = {
      ...req.body,
      createdBy: req.user._id
    };

    const destination = new Destination(destinationData);
    await destination.save();

    // Populate creator info
    await destination.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      destination
    });
  } catch (error) {
    console.error('Create destination error:', error);
    
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
      message: 'Failed to create destination'
    });
  }
};

// Update destination (Admin only)
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Update destination
    Object.assign(destination, updates);
    await destination.save();

    // Populate creator info
    await destination.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Destination updated successfully',
      destination
    });
  } catch (error) {
    console.error('Update destination error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
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
      message: 'Failed to update destination'
    });
  }
};

// Delete destination (Admin only)
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Soft delete - set isActive to false
    destination.isActive = false;
    await destination.save();

    res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('Delete destination error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete destination'
    });
  }
};

// Get featured destinations
const getFeaturedDestinations = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const destinations = await Destination.find({
      isActive: true,
      isFeatured: true
    })
      .populate('createdBy', 'name')
      .sort({ rating: -1, bookingCount: -1 })
      .limit(parseInt(limit))
      .lean();

    // Add isSaved flag for authenticated users
    if (req.user) {
      const user = await User.findById(req.user._id);
      destinations.forEach(dest => {
        dest.isSaved = user.savedDestinations.includes(dest._id);
      });
    }

    res.json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Get featured destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured destinations'
    });
  }
};

// Get popular destinations
const getPopularDestinations = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const destinations = await Destination.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ bookingCount: -1, rating: -1 })
      .limit(parseInt(limit))
      .lean();

    // Add isSaved flag for authenticated users
    if (req.user) {
      const user = await User.findById(req.user._id);
      destinations.forEach(dest => {
        dest.isSaved = user.savedDestinations.includes(dest._id);
      });
    }

    res.json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Get popular destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular destinations'
    });
  }
};

// Search destinations by location
const searchByLocation = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const destinations = await Destination.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(maxDistance)
    )
      .populate('createdBy', 'name')
      .limit(parseInt(limit))
      .lean();

    // Add isSaved flag for authenticated users
    if (req.user) {
      const user = await User.findById(req.user._id);
      destinations.forEach(dest => {
        dest.isSaved = user.savedDestinations.includes(dest._id);
      });
    }

    res.json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Search by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search destinations by location'
    });
  }
};

// Get destination statistics (Admin only)
const getDestinationStats = async (req, res) => {
  try {
    const stats = await Destination.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalDestinations: { $sum: 1 },
          totalViews: { $sum: '$metadata.views' },
          totalSaves: { $sum: '$metadata.saves' },
          averagePrice: { $avg: '$price' },
          averageRating: { $avg: '$rating' },
          categoryBreakdown: {
            $push: '$category'
          }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await Destination.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Top destinations by rating
    const topRated = await Destination.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(5)
      .select('name location rating reviewCount')
      .lean();

    // Most popular destinations
    const mostPopular = await Destination.find({ isActive: true })
      .sort({ bookingCount: -1 })
      .limit(5)
      .select('name location bookingCount metadata.views')
      .lean();

    res.json({
      success: true,
      stats: stats[0] || {},
      categoryStats,
      topRated,
      mostPopular
    });
  } catch (error) {
    console.error('Get destination stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch destination statistics'
    });
  }
};

// Toggle destination featured status (Admin only)
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    destination.isFeatured = !destination.isFeatured;
    await destination.save();

    res.json({
      success: true,
      message: `Destination ${destination.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      destination
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status'
    });
  }
};

module.exports = {
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
};
