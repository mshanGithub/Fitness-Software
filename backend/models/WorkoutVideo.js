const mongoose = require('mongoose');
const { WORKOUT_CATEGORY_VALUES } = require('../config/workoutCategories');

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
      enum: WORKOUT_CATEGORY_VALUES,
      default: 'full_body',
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
