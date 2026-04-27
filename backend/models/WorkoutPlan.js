const mongoose = require('mongoose');

const workoutItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Workout title is required'],
      trim: true,
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    duration: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const workoutDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    workouts: {
      type: [workoutItemSchema],
      default: [],
    },
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: [120, 'Plan name cannot exceed 120 characters'],
    },
    type: {
      type: String,
      enum: ['daily', 'weekly'],
      required: true,
    },
    days: {
      type: [workoutDaySchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
