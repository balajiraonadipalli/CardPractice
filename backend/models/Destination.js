const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  images: [{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    default: null
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    maxlength: 3
  },
  category: {
    type: String,
    enum: ['adventure', 'beach', 'city', 'cultural', 'nature', 'luxury', 'budget', 'family', 'romantic'],
    default: 'nature'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'difficult'],
    default: 'easy'
  },
  duration: {
    min: {
      type: Number,
      min: 1,
      default: 1
    },
    max: {
      type: Number,
      min: 1,
      default: 1
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      default: 'days'
    }
  },
  maxGuests: {
    type: Number,
    min: 1,
    default: 10
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableTo: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingCount: {
    type: Number,
    min: 0,
    default: 0
  },
  lastBookedAt: {
    type: Date,
    default: null
  },
  metadata: {
    views: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance and geospatial queries
destinationSchema.index({ coordinates: '2dsphere' });
destinationSchema.index({ location: 'text', name: 'text', description: 'text' });
destinationSchema.index({ category: 1 });
destinationSchema.index({ price: 1 });
destinationSchema.index({ rating: -1 });
destinationSchema.index({ isActive: 1, isFeatured: -1 });
destinationSchema.index({ createdBy: 1 });
destinationSchema.index({ availableFrom: 1, availableTo: 1 });
destinationSchema.index({ tags: 1 });

// Virtual for discount percentage
destinationSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for average rating display
destinationSchema.virtual('displayRating').get(function() {
  return this.rating ? this.rating.toFixed(1) : '0.0';
});

// Virtual for price range
destinationSchema.virtual('priceRange').get(function() {
  if (this.price <= 50) return 'budget';
  if (this.price <= 200) return 'moderate';
  if (this.price <= 500) return 'expensive';
  return 'luxury';
});

// Static method to find active destinations
destinationSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find featured destinations
destinationSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true });
};

// Static method to search destinations
destinationSchema.statics.search = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    rating,
    limit = 10,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  let searchQuery = { isActive: true };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (category) {
    searchQuery.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    searchQuery.price = {};
    if (minPrice !== undefined) searchQuery.price.$gte = minPrice;
    if (maxPrice !== undefined) searchQuery.price.$lte = maxPrice;
  }

  if (rating) {
    searchQuery.rating = { $gte: rating };
  }

  return this.find(searchQuery)
    .populate('createdBy', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to find nearby destinations
destinationSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    isActive: true,
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    }
  });
};

// Instance method to increment views
destinationSchema.methods.incrementViews = function() {
  this.metadata.views += 1;
  return this.save();
};

// Instance method to increment saves
destinationSchema.methods.incrementSaves = function() {
  this.metadata.saves += 1;
  return this.save();
};

// Instance method to decrement saves
destinationSchema.methods.decrementSaves = function() {
  this.metadata.saves = Math.max(0, this.metadata.saves - 1);
  return this.save();
};

// Instance method to check availability
destinationSchema.methods.isAvailable = function(date = new Date()) {
  return date >= this.availableFrom && date <= this.availableTo && this.isActive;
};

// Pre-save middleware to validate price consistency
destinationSchema.pre('save', function(next) {
  if (this.originalPrice && this.originalPrice < this.price) {
    return next(new Error('Original price cannot be less than current price'));
  }
  next();
});

module.exports = mongoose.model('Destination', destinationSchema);
