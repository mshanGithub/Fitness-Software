const mongoose = require('mongoose');

const workoutSessionBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookingDate: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'bookingDate must be in YYYY-MM-DD format'],
      index: true,
    },
    slotTime: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{2}:\d{2}$/, 'slotTime must be in HH:mm format'],
      index: true,
    },
    slotLabel: {
      type: String,
      required: true,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled'],
      default: 'booked',
      index: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Calcutta',
      trim: true,
    },
    calendarEventId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

workoutSessionBookingSchema.index({ user: 1, bookingDate: 1, slotTime: 1 }, { unique: true });
workoutSessionBookingSchema.index({ bookingDate: 1, slotTime: 1, status: 1 });

module.exports = mongoose.model('WorkoutSessionBooking', workoutSessionBookingSchema);
