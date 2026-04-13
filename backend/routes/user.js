const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route  GET /api/user/profile
// @desc   Get current user profile
// @access Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user.toPublicJSON());
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
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

// @route  POST /api/user/log-workout
// @desc   Log a completed workout
// @access Private
router.post('/log-workout', protect, async (req, res) => {
  const { caloriesBurned = 0 } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.stats.workoutsCompleted += 1;
    user.stats.currentStreak += 1;
    user.stats.totalCaloriesBurned += Number(caloriesBurned);
    await user.save();

    res.status(200).json({
      message: 'Workout logged successfully!',
      stats: user.stats,
    });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
