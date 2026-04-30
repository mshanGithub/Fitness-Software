const mongoose = require('mongoose');

const sessionSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
      trim: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Slot time must be in HH:mm format'],
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const sessionBookingConfigSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    sessionName: {
      type: String,
      trim: true,
      default: 'TWC: Strength + Core',
    },
    durationMinutes: {
      type: Number,
      min: 15,
      max: 240,
      default: 45,
    },
    description: {
      type: String,
      trim: true,
      default: 'Train with Cain adult strength training with a core focus.',
    },
    timezone: {
      type: String,
      trim: true,
      default: 'Asia/Calcutta',
    },
    slots: {
      type: [sessionSlotSchema],
      default: [],
    },
    blockedDates: {
      type: [String],
      default: [],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SessionBookingConfig', sessionBookingConfigSchema);
