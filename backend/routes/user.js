const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { PREDEFINED_FOOD_PLANS } = require('../config/predefinedFoodPlans');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const predefinedFoodPlanByCode = PREDEFINED_FOOD_PLANS.reduce((accumulator, plan) => {
  accumulator[plan.code] = plan;
  return accumulator;
}, {});

// @route  GET /api/user/profile
// @desc   Get current user profile
// @access Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedWorkoutPlan', 'name type days')
      .populate('assignedFoodPlans', 'name summary sections code structuredPlan');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.toPublicJSON());
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route  GET /api/user/assigned-plans
// @desc   Get plans assigned to current user
// @access Private
router.get('/assigned-plans', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('assignedWorkoutPlan assignedFoodPlans fitnessGoal')
      .populate('assignedWorkoutPlan', 'name type days')
      .populate('assignedFoodPlans', 'name summary sections code structuredPlan');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const workoutPlan = user.assignedWorkoutPlan ? user.assignedWorkoutPlan.toObject() : null;
    if (workoutPlan) {
      workoutPlan.totalWorkouts = workoutPlan.days.reduce((total, day) => total + day.workouts.length, 0);
      workoutPlan.numberOfDays = workoutPlan.days.length;
    }

    const foodPlans = (user.assignedFoodPlans || []).map((planDoc) => {
      const plain = typeof planDoc.toObject === 'function' ? planDoc.toObject() : planDoc;
      if (!plain.structuredPlan && plain.code && predefinedFoodPlanByCode[plain.code]?.structuredPlan) {
        plain.structuredPlan = predefinedFoodPlanByCode[plain.code].structuredPlan;
      }
      return plain;
    });

    return res.status(200).json({
      fitnessGoal: user.fitnessGoal,
      workoutPlan,
      foodPlans,
    });
  } catch (error) {
    console.error('Assigned plans error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route  PUT /api/user/profile
// @desc   Update user profile
// @access Private
router.put(
  '/profile',
  protect,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('fitnessGoal').optional().isIn([
      'weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness',
    ]),
    body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, fitnessGoal, fitnessLevel } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (fitnessGoal) updates.fitnessGoal = fitnessGoal;
    if (fitnessLevel) updates.fitnessLevel = fitnessLevel;

    try {
      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });
      res.status(200).json(user.toPublicJSON());
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route  GET /api/user/stats
// @desc   Get user fitness statistics
// @access Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const weeklyProgress = Math.min(
      Math.round((user.stats.workoutsCompleted % user.stats.weeklyGoal) /
        user.stats.weeklyGoal * 100),
      100
    );

    res.status(200).json({
      stats: user.stats,
      weeklyProgress,
      memberSince: user.createdAt,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route  GET /api/user/workout-report
// @desc   Get user workout plan report history
// @access Private
router.get('/workout-report', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('workoutPlanReport');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const report = [...(user.workoutPlanReport || [])]
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

    return res.status(200).json({ report });
  } catch (error) {
    console.error('Workout report error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route  POST /api/user/log-workout
// @desc   Log a completed workout
// @access Private
router.post('/log-workout', protect, async (req, res) => {
  const {
    caloriesBurned = 0,
    status = 'completed',
    workoutId = '',
    workoutName = '',
    planName = '',
    dayNumber = null,
    duration = '',
    videoUrl = '',
  } = req.body;

  if (!['completed', 'skipped'].includes(status)) {
    return res.status(400).json({ message: 'Status must be either completed or skipped' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const normalizedCalories = status === 'completed' ? Number(caloriesBurned) || 0 : 0;

    user.workoutPlanReport.push({
      workoutId: String(workoutId || ''),
      workoutName: String(workoutName || ''),
      planName: String(planName || ''),
      dayNumber: Number.isFinite(Number(dayNumber)) ? Number(dayNumber) : null,
      duration: String(duration || ''),
      videoUrl: String(videoUrl || ''),
      status,
      caloriesBurned: normalizedCalories,
      loggedAt: new Date(),
    });

    if (status === 'completed') {
      user.stats.workoutsCompleted += 1;
      user.stats.currentStreak += 1;
      user.stats.totalCaloriesBurned += normalizedCalories;
    }

    await user.save();

    res.status(200).json({
      message: status === 'completed' ? 'Workout logged successfully!' : 'Workout skipped and logged successfully!',
      stats: user.stats,
      reportEntry: user.workoutPlanReport[user.workoutPlanReport.length - 1],
    });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
