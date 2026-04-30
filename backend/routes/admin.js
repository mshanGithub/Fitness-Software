const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const WorkoutVideo = require('../models/WorkoutVideo');
const WorkoutPlan = require('../models/WorkoutPlan');
const FoodPlan = require('../models/FoodPlan');
const LiveMeet = require('../models/LiveMeet');
const SessionBookingConfig = require('../models/SessionBookingConfig');
const WorkoutSessionBooking = require('../models/WorkoutSessionBooking');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { WORKOUT_CATEGORY_OPTIONS, WORKOUT_CATEGORY_VALUES } = require('../config/workoutCategories');
const { PREDEFINED_FOOD_PLANS } = require('../config/predefinedFoodPlans');
const {
  DEFAULT_SESSION_BOOKING_CONFIG,
  TIME_PATTERN,
  normalizeTimeToLabel,
} = require('../config/sessionBookingDefaults');

const router = express.Router();

const extractYouTubeId = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const trimmed = input.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '').trim();
    }

    if (url.hostname.includes('youtube.com')) {
      return (url.searchParams.get('v') || '').trim();
    }
  } catch {
    return '';
  }

  return '';
};

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }

  return true;
};

const isValidGoogleMeetUrl = (input = '') => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(String(input).trim());
    return parsed.protocol === 'https:' && parsed.hostname === 'meet.google.com';
  } catch {
    return false;
  }
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateString = (value = '') => {
  const normalized = String(value || '').trim();
  if (!DATE_PATTERN.test(normalized)) {
    return false;
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === normalized;
};

const buildBookingSettingsResponse = (configDoc) => {
  const source = configDoc?.toObject ? configDoc.toObject() : (configDoc || {});
  const slots = Array.isArray(source.slots) && source.slots.length > 0
    ? source.slots
    : DEFAULT_SESSION_BOOKING_CONFIG.slots;

  return {
    isActive: typeof source.isActive === 'boolean' ? source.isActive : DEFAULT_SESSION_BOOKING_CONFIG.isActive,
    sessionName: source.sessionName || DEFAULT_SESSION_BOOKING_CONFIG.sessionName,
    durationMinutes: Number(source.durationMinutes || DEFAULT_SESSION_BOOKING_CONFIG.durationMinutes),
    description: source.description || DEFAULT_SESSION_BOOKING_CONFIG.description,
    timezone: source.timezone || DEFAULT_SESSION_BOOKING_CONFIG.timezone,
    slots: slots
      .map((slot) => ({
        time: String(slot.time || '').trim(),
        label: String(slot.label || normalizeTimeToLabel(slot.time || '')).trim(),
        capacity: Math.max(Number(slot.capacity) || 1, 1),
        isActive: slot.isActive !== false,
      }))
      .filter((slot) => TIME_PATTERN.test(slot.time))
      .sort((a, b) => a.time.localeCompare(b.time)),
    blockedDates: Array.from(new Set(
      (Array.isArray(source.blockedDates) ? source.blockedDates : [])
        .map((entry) => String(entry || '').trim())
        .filter((entry) => isValidDateString(entry))
    )).sort(),
    updatedAt: source.updatedAt || null,
  };
};

const normalizePlanDays = (days = []) => {
  if (!Array.isArray(days) || days.length === 0) {
    return [];
  }

  return days
    .map((day, index) => {
      const workouts = Array.isArray(day.workouts)
        ? day.workouts
          .map((workout) => {
            const videoUrl = String(workout.videoUrl || '').trim();
            const youtubeId = extractYouTubeId(videoUrl);
            
            return {
              title: String(workout.title || '').trim(),
              videoUrl,
              youtubeId, // Store extracted ID for easier frontend consumption
              duration: String(workout.duration || '').trim(),
              description: String(workout.description || '').trim(),
            };
          })
          .filter((workout) => workout.title)
        : [];

      return {
        dayNumber: Number(day.dayNumber) || index + 1,
        workouts,
      };
    })
    .filter((day) => Array.isArray(day.workouts) && day.workouts.length > 0);
};

const withPlanStats = (plan) => {
  const plain = plan.toObject();
  plain.totalWorkouts = plain.days.reduce((total, day) => total + day.workouts.length, 0);
  plain.numberOfDays = plain.days.length;
  return plain;
};

const ensurePredefinedFoodPlans = async () => {
  await Promise.all(
    PREDEFINED_FOOD_PLANS.map((plan) => FoodPlan.findOneAndUpdate(
      { code: plan.code },
      {
        $set: {
          name: plan.name,
          summary: plan.summary,
          sections: plan.sections,
          structuredPlan: plan.structuredPlan || null,
          isPredefined: true,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ))
  );
};

router.use(protect, adminOnly);

router.get('/video-categories', (req, res) => {
  return res.status(200).json(WORKOUT_CATEGORY_OPTIONS);
});

router.get('/live-meet', async (req, res) => {
  try {
    const liveMeet = await LiveMeet.findOne()
      .sort({ updatedAt: -1 })
      .populate('allowedUsers', 'firstName lastName email role');

    return res.status(200).json({ liveMeet: liveMeet || null });
  } catch (error) {
    console.error('Admin live meet fetch error:', error);
    return res.status(500).json({ message: 'Unable to load live meet config' });
  }
});

router.put(
  '/live-meet',
  [
    body('meetingUrl').optional().trim(),
    body('audience').optional().isIn(['all', 'selected']).withMessage('Audience must be all or selected'),
    body('allowedUserIds').optional().isArray().withMessage('allowedUserIds must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    try {
      const existing = await LiveMeet.findOne().sort({ updatedAt: -1 });
      const audience = req.body.audience || existing?.audience || 'all';
      const isActive = typeof req.body.isActive === 'boolean' ? req.body.isActive : (existing?.isActive || false);
      const meetingUrl = String(req.body.meetingUrl ?? existing?.meetingUrl ?? '').trim();
      const allowedUserIds = Array.isArray(req.body.allowedUserIds)
        ? req.body.allowedUserIds.filter(Boolean)
        : (existing?.allowedUsers || []).map((entry) => String(entry));

      if (isActive) {
        if (!meetingUrl) {
          return res.status(400).json({ message: 'Google Meet link is required when live meet is active' });
        }

        if (!isValidGoogleMeetUrl(meetingUrl)) {
          return res.status(400).json({ message: 'Please enter a valid Google Meet link (https://meet.google.com/...)' });
        }
      }

      if (audience === 'selected') {
        if (allowedUserIds.length === 0) {
          return res.status(400).json({ message: 'Select at least one user for selected audience mode' });
        }

        const validUsers = await User.find({ _id: { $in: allowedUserIds }, role: 'user' }).select('_id');
        if (validUsers.length !== allowedUserIds.length) {
          return res.status(400).json({ message: 'One or more selected users are invalid' });
        }
      }

      const payload = {
        meetingUrl,
        audience,
        allowedUsers: audience === 'selected' ? allowedUserIds : [],
        isActive,
        updatedBy: req.user._id,
      };

      if (!existing) {
        payload.createdBy = req.user._id;
      }

      const liveMeet = await LiveMeet.findOneAndUpdate(
        {},
        { $set: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate('allowedUsers', 'firstName lastName email role');

      return res.status(200).json({ liveMeet });
    } catch (error) {
      console.error('Admin live meet update error:', error);
      return res.status(500).json({ message: 'Unable to update live meet config' });
    }
  }
);

router.get('/session-booking-settings', async (req, res) => {
  try {
    const config = await SessionBookingConfig.findOne().sort({ updatedAt: -1 });
    return res.status(200).json({ config: buildBookingSettingsResponse(config) });
  } catch (error) {
    console.error('Admin session booking settings fetch error:', error);
    return res.status(500).json({ message: 'Unable to load booking settings' });
  }
});

router.put(
  '/session-booking-settings',
  [
    body('sessionName').optional().trim().isLength({ min: 2, max: 100 }),
    body('durationMinutes').optional().isInt({ min: 15, max: 240 }),
    body('description').optional().trim().isLength({ min: 2, max: 500 }),
    body('timezone').optional().trim().notEmpty(),
    body('isActive').optional().isBoolean(),
    body('slots').optional().isArray({ min: 1, max: 16 }),
    body('blockedDates').optional().isArray({ max: 60 }),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    try {
      const existing = await SessionBookingConfig.findOne().sort({ updatedAt: -1 });
      const current = buildBookingSettingsResponse(existing);

      const requestedSlots = Array.isArray(req.body.slots) ? req.body.slots : current.slots;
      const normalizedSlots = requestedSlots
        .map((slot) => ({
          time: String(slot?.time || '').trim(),
          label: String(slot?.label || normalizeTimeToLabel(slot?.time || '')).trim(),
          capacity: Math.max(Number(slot?.capacity) || 1, 1),
          isActive: slot?.isActive !== false,
        }))
        .filter((slot) => TIME_PATTERN.test(slot.time));

      if (normalizedSlots.length === 0) {
        return res.status(400).json({ message: 'At least one valid slot is required' });
      }

      const uniqueSlotTimes = new Set(normalizedSlots.map((slot) => slot.time));
      if (uniqueSlotTimes.size !== normalizedSlots.length) {
        return res.status(400).json({ message: 'Slot times must be unique' });
      }

      const requestedBlockedDates = Array.isArray(req.body.blockedDates)
        ? req.body.blockedDates
        : current.blockedDates;

      const normalizedBlockedDates = Array.from(new Set(
        requestedBlockedDates
          .map((entry) => String(entry || '').trim())
          .filter((entry) => entry.length > 0)
      )).sort();

      if (normalizedBlockedDates.some((entry) => !isValidDateString(entry))) {
        return res.status(400).json({ message: 'blockedDates must contain only YYYY-MM-DD values' });
      }

      const payload = {
        isActive: typeof req.body.isActive === 'boolean' ? req.body.isActive : current.isActive,
        sessionName: String(req.body.sessionName || current.sessionName).trim(),
        durationMinutes: Number(req.body.durationMinutes || current.durationMinutes),
        description: String(req.body.description || current.description).trim(),
        timezone: String(req.body.timezone || current.timezone).trim(),
        slots: normalizedSlots.sort((a, b) => a.time.localeCompare(b.time)),
        blockedDates: normalizedBlockedDates,
        updatedBy: req.user._id,
      };

      const config = await SessionBookingConfig.findOneAndUpdate(
        {},
        { $set: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({ config: buildBookingSettingsResponse(config) });
    } catch (error) {
      console.error('Admin session booking settings update error:', error);
      return res.status(500).json({ message: 'Unable to update booking settings' });
    }
  }
);

router.get('/session-bookings', async (req, res) => {
  try {
    const bookings = await WorkoutSessionBooking.find({ status: 'booked' })
      .populate('user', 'name email')
      .sort({ bookingDate: 1, slotTime: 1 })
      .lean();
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Admin session bookings list error:', error);
    return res.status(500).json({ message: 'Unable to load bookings' });
  }
});

router.get('/overview', async (req, res) => {
  try {
    await ensurePredefinedFoodPlans();

    const [
      totalUsers,
      activeUsers,
      workoutPlanCount,
      foodPlanCount,
      fitnessGoalAggregation,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      WorkoutPlan.countDocuments(),
      FoodPlan.countDocuments({ isPredefined: true }),
      User.aggregate([
        { $match: { role: 'user' } },
        { $group: { _id: '$fitnessGoal', count: { $sum: 1 } } },
      ]),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(6).select('-password'),
    ]);

    const fitnessGoalBreakdown = fitnessGoalAggregation.reduce((accumulator, item) => {
      accumulator[item._id || 'unknown'] = item.count;
      return accumulator;
    }, {});

    return res.status(200).json({
      metrics: {
        totalUsers,
        activeUsers,
        inactiveUsers: Math.max(totalUsers - activeUsers, 0),
        totalWorkoutPlans: workoutPlanCount,
        totalFoodPlans: foodPlanCount,
        fitnessGoalCount: fitnessGoalAggregation.length,
      },
      fitnessGoalBreakdown,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ message: 'Unable to load admin overview' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .select('-password')
      .populate('assignedWorkoutPlan', 'name type days')
      .populate('assignedFoodPlans', 'name code');

    return res.status(200).json(users);
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return res.status(500).json({ message: 'Unable to load users' });
  }
});

router.put(
  '/users/:id',
  [
    param('id').isMongoId().withMessage('Valid user id is required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
    body('fitnessGoal').optional().isIn(['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness']),
    body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('weeklyGoal').optional().isInt({ min: 1, max: 14 }).withMessage('Weekly goal must be between 1 and 14'),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    const { id } = req.params;
    const { isActive, fitnessGoal, fitnessLevel, weeklyGoal } = req.body;

    try {
      const user = await User.findById(id);
      if (!user || user.role !== 'user') {
        return res.status(404).json({ message: 'User not found' });
      }

      if (typeof isActive === 'boolean') {
        user.isActive = isActive;
      }

      if (fitnessGoal) {
        user.fitnessGoal = fitnessGoal;
      }

      if (fitnessLevel) {
        user.fitnessLevel = fitnessLevel;
      }

      if (weeklyGoal !== undefined) {
        user.stats.weeklyGoal = Number(weeklyGoal);
      }

      await user.save();
      return res.status(200).json(user.toPublicJSON());
    } catch (error) {
      console.error('Admin update user error:', error);
      return res.status(500).json({ message: 'Unable to update user' });
    }
  }
);

router.put(
  '/users/:id/assignments',
  [
    param('id').isMongoId().withMessage('Valid user id is required'),
    body('workoutPlanId').optional({ nullable: true }).isMongoId().withMessage('workoutPlanId must be valid'),
    body('foodPlanIds').optional().isArray().withMessage('foodPlanIds must be an array'),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    const { id } = req.params;
    const workoutPlanId = req.body.workoutPlanId || null;
    const foodPlanIds = Array.isArray(req.body.foodPlanIds)
      ? req.body.foodPlanIds.filter(Boolean)
      : undefined;

    try {
      const user = await User.findById(id);
      if (!user || user.role !== 'user') {
        return res.status(404).json({ message: 'User not found' });
      }

      if (workoutPlanId) {
        const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
        if (!workoutPlan) {
          return res.status(400).json({ message: 'Workout plan not found' });
        }
      }

      if (foodPlanIds !== undefined && foodPlanIds.length > 0) {
        const foodPlans = await FoodPlan.find({ _id: { $in: foodPlanIds } }).select('_id');
        if (foodPlans.length !== foodPlanIds.length) {
          return res.status(400).json({ message: 'One or more food plans are invalid' });
        }
      }

      if (req.body.workoutPlanId !== undefined) {
        user.assignedWorkoutPlan = workoutPlanId;
      }

      if (foodPlanIds !== undefined) {
        user.assignedFoodPlans = foodPlanIds;
      }

      await user.save();

      const updatedUser = await User.findById(user._id)
        .select('-password')
        .populate('assignedWorkoutPlan', 'name type days')
        .populate('assignedFoodPlans', 'name code');

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Admin update user assignments error:', error);
      return res.status(500).json({ message: 'Unable to update user assignments' });
    }
  }
);

router.get('/workout-plans', async (req, res) => {
  try {
    const plans = await WorkoutPlan.find().sort({ createdAt: -1 });
    return res.status(200).json(plans.map(withPlanStats));
  } catch (error) {
    console.error('Workout plans fetch error:', error);
    return res.status(500).json({ message: 'Unable to load workout plans' });
  }
});

router.post(
  '/workout-plans',
  [
    body('name').trim().notEmpty().withMessage('Plan name is required'),
    body('type').isIn(['daily', 'weekly']).withMessage('Plan type must be daily or weekly'),
    body('days').isArray({ min: 1 }).withMessage('At least one day is required'),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    const normalizedDays = normalizePlanDays(req.body.days);
    if (normalizedDays.length === 0) {
      return res.status(400).json({ message: 'Each day must include at least one workout' });
    }

    try {
      const plan = await WorkoutPlan.create({
        name: req.body.name,
        type: req.body.type,
        days: normalizedDays,
        createdBy: req.user._id,
      });

      return res.status(201).json(withPlanStats(plan));
    } catch (error) {
      console.error('Workout plan create error:', error);
      return res.status(500).json({ message: 'Unable to create workout plan' });
    }
  }
);

router.put(
  '/workout-plans/:id',
  [
    param('id').isMongoId().withMessage('Valid workout plan id is required'),
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['daily', 'weekly']),
    body('days').optional().isArray({ min: 1 }),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    try {
      const plan = await WorkoutPlan.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: 'Workout plan not found' });
      }

      if (req.body.name !== undefined) {
        plan.name = req.body.name;
      }

      if (req.body.type !== undefined) {
        plan.type = req.body.type;
      }

      if (req.body.days !== undefined) {
        const normalizedDays = normalizePlanDays(req.body.days);
        if (normalizedDays.length === 0) {
          return res.status(400).json({ message: 'Each day must include at least one workout' });
        }

        plan.days = normalizedDays;
      }

      await plan.save();
      return res.status(200).json(withPlanStats(plan));
    } catch (error) {
      console.error('Workout plan update error:', error);
      return res.status(500).json({ message: 'Unable to update workout plan' });
    }
  }
);

router.delete('/workout-plans/:id', [param('id').isMongoId().withMessage('Valid workout plan id is required')], async (req, res) => {
  if (!validate(req, res)) {
    return;
  }

  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }

    await User.updateMany({ assignedWorkoutPlan: plan._id }, { $set: { assignedWorkoutPlan: null } });
    await plan.deleteOne();

    return res.status(200).json({ message: 'Workout plan deleted' });
  } catch (error) {
    console.error('Workout plan delete error:', error);
    return res.status(500).json({ message: 'Unable to delete workout plan' });
  }
});

router.get('/food-plans', async (req, res) => {
  try {
    await ensurePredefinedFoodPlans();
    const foodPlans = await FoodPlan.find({ isPredefined: true }).sort({ name: 1 });
    return res.status(200).json(foodPlans);
  } catch (error) {
    console.error('Food plans fetch error:', error);
    return res.status(500).json({ message: 'Unable to load food plans' });
  }
});

router.get('/videos', async (req, res) => {
  try {
    const videos = await WorkoutVideo.find().sort({ createdAt: -1 });
    return res.status(200).json(videos);
  } catch (error) {
    console.error('Admin video fetch error:', error);
    return res.status(500).json({ message: 'Unable to load videos' });
  }
});

router.post(
  '/videos',
  [
    body('title').trim().notEmpty().withMessage('Video title is required'),
    body('youtubeUrl').trim().notEmpty().withMessage('YouTube link is required'),
    body('category').optional().isIn(WORKOUT_CATEGORY_VALUES),
    body('description').optional().trim(),
    body('duration').optional().trim(),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    const youtubeId = extractYouTubeId(req.body.youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({ message: 'Provide a valid YouTube link or video id' });
    }

    try {
      const video = await WorkoutVideo.create({
        title: req.body.title,
        youtubeId,
        description: req.body.description || '',
        category: req.body.category || 'full_body',
        duration: req.body.duration || '',
        isActive: true,
      });

      return res.status(201).json(video);
    } catch (error) {
      console.error('Admin create video error:', error);
      return res.status(500).json({ message: 'Unable to create video' });
    }
  }
);

router.put(
  '/videos/:id',
  [
    param('id').isMongoId().withMessage('Valid video id is required'),
    body('title').optional().trim().notEmpty(),
    body('youtubeUrl').optional().trim().notEmpty(),
    body('category').optional().isIn(WORKOUT_CATEGORY_VALUES),
    body('description').optional().trim(),
    body('duration').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  ],
  async (req, res) => {
    if (!validate(req, res)) {
      return;
    }

    try {
      const video = await WorkoutVideo.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      if (req.body.title) {
        video.title = req.body.title;
      }

      if (req.body.youtubeUrl) {
        const youtubeId = extractYouTubeId(req.body.youtubeUrl);
        if (!youtubeId) {
          return res.status(400).json({ message: 'Provide a valid YouTube link or video id' });
        }

        video.youtubeId = youtubeId;
      }

      if (req.body.category !== undefined) {
        video.category = req.body.category;
      }

      if (req.body.description !== undefined) {
        video.description = req.body.description;
      }

      if (req.body.duration !== undefined) {
        video.duration = req.body.duration;
      }

      if (typeof req.body.isActive === 'boolean') {
        video.isActive = req.body.isActive;
      }

      await video.save();
      return res.status(200).json(video);
    } catch (error) {
      console.error('Admin update video error:', error);
      return res.status(500).json({ message: 'Unable to update video' });
    }
  }
);

router.delete('/videos/:id', [param('id').isMongoId().withMessage('Valid video id is required')], async (req, res) => {
  if (!validate(req, res)) {
    return;
  }

  try {
    const video = await WorkoutVideo.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    await video.deleteOne();
    return res.status(200).json({ message: 'Video deleted' });
  } catch (error) {
    console.error('Admin delete video error:', error);
    return res.status(500).json({ message: 'Unable to delete video' });
  }
});

module.exports = router;
