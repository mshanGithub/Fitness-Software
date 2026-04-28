const mongoose = require('mongoose');

const liveMeetSchema = new mongoose.Schema(
  {
    meetingUrl: {
      type: String,
      default: '',
      trim: true,
    },
    audience: {
      type: String,
      enum: ['all', 'selected'],
      default: 'all',
    },
    allowedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

module.exports = mongoose.model('LiveMeet', liveMeetSchema);
