const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const strongPasswordMessage = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, strongPasswordMessage],
      validate: {
        validator: (value) => /[a-z]/.test(value)
          && /[A-Z]/.test(value)
          && /\d/.test(value)
          && /[^A-Za-z0-9]/.test(value),
        message: strongPasswordMessage,
      },
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
      default: 'general_fitness',
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    avatar: {
      type: String,
      default: '',
    },
    stats: {
      workoutsCompleted: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      totalCaloriesBurned: { type: Number, default: 0 },
      weeklyGoal: { type: Number, default: 4 },
    },
    workoutPlanReport: {
      type: [
        {
          workoutId: { type: String, default: '' },
          workoutName: { type: String, default: '' },
          planName: { type: String, default: '' },
          dayNumber: { type: Number, default: null },
          duration: { type: String, default: '' },
          videoUrl: { type: String, default: '' },
          status: {
            type: String,
            enum: ['completed', 'skipped'],
            default: 'completed',
          },
          caloriesBurned: { type: Number, default: 0 },
          loggedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedWorkoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      default: null,
    },
    assignedFoodPlans: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'FoodPlan',
      default: [],
    },
    passwordResetOtpHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Return user without password
userSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
