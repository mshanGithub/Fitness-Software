const mongoose = require('mongoose');

const workoutVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
    },
    youtubeId: {
      type: String,
      required: [true, 'YouTube video ID is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    duration: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'Workout Videos',
  }
);

module.exports = mongoose.model('WorkoutVideo', workoutVideoSchema);
