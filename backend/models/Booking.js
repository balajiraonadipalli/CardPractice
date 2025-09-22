const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: [true, 'Destination is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date cannot be in the past'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [20, 'Maximum 20 guests allowed']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    maxlength: 3
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash'],
    default: 'credit_card'
  },
  paymentId: {
    type: String,
    default: null
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters'],
    trim: true
  },
  guestDetails: {
    primaryGuest: {
      name: {
        type: String,
        required: [true, 'Primary guest name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Primary guest email is required'],
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      }
    },
    additionalGuests: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      age: {
        type: Number,
        min: 0,
        max: 120
      }
    }]
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: {
      type: Number,
      min: 0
    }
  },
  confirmation: {
    confirmedAt: Date,
    confirmationNumber: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  checkIn: {
    checkedInAt: Date,
    notes: String
  },
  checkOut: {
    checkedOutAt: Date,
    notes: String
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    reviewedAt: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'admin'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ destination: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ 'confirmation.confirmationNumber': 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ destination: 1, status: 1 });
bookingSchema.index({ startDate: 1, status: 1 });

// Virtual for booking duration in nights
bookingSchema.virtual('nights').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for booking status display
bookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    refunded: 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
bookingSchema.virtual('paymentStatusDisplay').get(function() {
  const statusMap = {
    pending: 'Payment Pending',
    paid: 'Paid',
    failed: 'Payment Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded'
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

// Virtual to check if booking is active
bookingSchema.virtual('isActive').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual to check if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date() && this.isActive;
});

// Virtual to check if booking is current
bookingSchema.virtual('isCurrent').get(function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.status === 'confirmed';
});

// Virtual to check if booking is past
bookingSchema.virtual('isPast').get(function() {
  return this.endDate < new Date();
});

// Static method to find user bookings
bookingSchema.statics.findUserBookings = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('destination', 'name location images price')
    .sort({ createdAt: -1 });
};

// Static method to find destination bookings
bookingSchema.statics.findDestinationBookings = function(destinationId, status = null) {
  const query = { destination: destinationId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('user', 'name email')
    .sort({ startDate: 1 });
};

// Static method to check availability
bookingSchema.statics.checkAvailability = function(destinationId, startDate, endDate) {
  return this.find({
    destination: destinationId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      {
        startDate: { $lte: startDate },
        endDate: { $gt: startDate }
      },
      {
        startDate: { $lt: endDate },
        endDate: { $gte: endDate }
      },
      {
        startDate: { $gte: startDate },
        endDate: { $lte: endDate }
      }
    ]
  });
};

// Static method to get booking statistics
bookingSchema.statics.getStatistics = function(filter = {}) {
  return this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageBookingValue: { $avg: '$totalPrice' },
        statusBreakdown: {
          $push: '$status'
        }
      }
    }
  ]);
};

// Instance method to generate confirmation number
bookingSchema.methods.generateConfirmationNumber = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TRV-${timestamp}-${random}`.toUpperCase();
};

// Instance method to confirm booking
bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  this.confirmation.confirmedAt = new Date();
  this.confirmation.confirmationNumber = this.generateConfirmationNumber();
  return this.save();
};

// Instance method to cancel booking
bookingSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellation.cancelledAt = new Date();
  this.cancellation.reason = reason;
  this.cancellation.cancelledBy = cancelledBy;
  return this.save();
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const daysUntilStart = Math.ceil((this.startDate - now) / (1000 * 60 * 60 * 24));
  
  // Refund policy: 
  // - More than 7 days: 100% refund
  // - 3-7 days: 50% refund  
  // - Less than 3 days: No refund
  if (daysUntilStart > 7) return this.totalPrice;
  if (daysUntilStart >= 3) return this.totalPrice * 0.5;
  return 0;
};

// Pre-save middleware to calculate total price
bookingSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('endDate') || this.isModified('pricePerNight')) {
    const nights = this.nights;
    this.totalPrice = nights * this.pricePerNight * this.guests;
  }
  
  // Set primary guest details from user if not provided
  if (!this.guestDetails.primaryGuest.name && this.user) {
    // This would need to be populated in the controller
  }
  
  next();
});

// Pre-save middleware to validate guest count against destination capacity
bookingSchema.pre('save', async function(next) {
  if (this.isModified('guests') || this.isModified('destination')) {
    try {
      const destination = await mongoose.model('Destination').findById(this.destination);
      if (destination && this.guests > destination.maxGuests) {
        return next(new Error(`Number of guests (${this.guests}) exceeds maximum capacity (${destination.maxGuests})`));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
