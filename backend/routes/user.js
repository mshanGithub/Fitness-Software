const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const LiveMeet = require('../models/LiveMeet');
const WorkoutSessionBooking = require('../models/WorkoutSessionBooking');
const SessionBookingConfig = require('../models/SessionBookingConfig');
const { PREDEFINED_FOOD_PLANS } = require('../config/predefinedFoodPlans');
const { protect } = require('../middleware/authMiddleware');
const { createBookingCalendarEvent, deleteBookingCalendarEvent } = require('../config/googleCalendar');
const { isMailConfigured, sendSessionBookingConfirmation, sendSessionBookingUpdate, sendSessionBookingCancellation } = require('../config/mailer');
const {
  DEFAULT_SESSION_BOOKING_CONFIG,
  TIME_PATTERN,
  normalizeTimeToLabel,
} = require('../config/sessionBookingDefaults');

const router = express.Router();
const predefinedFoodPlanByCode = PREDEFINED_FOOD_PLANS.reduce((accumulator, plan) => {
  accumulator[plan.code] = plan;
  return accumulator;
}, {});

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getResolvedBookingConfig = async () => {
  const configDoc = await SessionBookingConfig.findOne().sort({ updatedAt: -1 });
  const source = configDoc?.toObject ? configDoc.toObject() : (configDoc || {});
  const fallback = DEFAULT_SESSION_BOOKING_CONFIG;

  const slots = (Array.isArray(source.slots) && source.slots.length > 0 ? source.slots : fallback.slots)
    .map((slot) => ({
      time: String(slot.time || '').trim(),
      label: String(slot.label || normalizeTimeToLabel(slot.time || '')).trim(),
      capacity: Math.max(Number(slot.capacity) || 1, 1),
      isActive: slot.isActive !== false,
    }))
    .filter((slot) => TIME_PATTERN.test(slot.time))
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    isActive: typeof source.isActive === 'boolean' ? source.isActive : fallback.isActive,
    sessionName: String(source.sessionName || fallback.sessionName).trim(),
    durationMinutes: Number(source.durationMinutes || fallback.durationMinutes),
    description: String(source.description || fallback.description).trim(),
    timezone: String(source.timezone || fallback.timezone).trim(),
    slots,
    blockedDates: Array.from(new Set(
      (Array.isArray(source.blockedDates) ? source.blockedDates : [])
        .map((entry) => String(entry || '').trim())
        .filter((entry) => DATE_PATTERN.test(entry))
    )),
  };
};

const getTodayInTimezone = (timezone = DEFAULT_SESSION_BOOKING_CONFIG.timezone) => (
  new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
);

const isValidDateString = (dateValue = '') => {
  if (!DATE_PATTERN.test(String(dateValue))) {
    return false;
  }

  const parsed = new Date(`${dateValue}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return parsed.toISOString().slice(0, 10) === String(dateValue);
};

const buildSlotsWithAvailability = (slots = [], slotBookingMap = new Map()) => (
  slots.map((slot) => {
    const bookedSeats = Number(slotBookingMap.get(slot.time) || 0);
    const remainingSeats = Math.max(slot.capacity - bookedSeats, 0);

    return {
      time: slot.time,
      label: slot.label,
      capacity: slot.capacity,
      bookedSeats,
      remainingSeats,
      isAvailable: remainingSeats > 0,
    };
  })
);

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

// @route  GET /api/user/live-meet
// @desc   Get live meet access for current user
// @access Private
router.get('/live-meet', protect, async (req, res) => {
  try {
    const liveMeet = await LiveMeet.findOne().sort({ updatedAt: -1 });

    if (!liveMeet || !liveMeet.isActive || !liveMeet.meetingUrl) {
      return res.status(200).json({ hasAccess: false, liveMeet: null });
    }

    const hasAccess = liveMeet.audience === 'all'
      || (liveMeet.allowedUsers || []).some((userId) => String(userId) === String(req.user._id));

    if (!hasAccess) {
      return res.status(200).json({ hasAccess: false, liveMeet: null });
    }

    return res.status(200).json({
      hasAccess: true,
      liveMeet: {
        meetingUrl: liveMeet.meetingUrl,
        audience: liveMeet.audience,
        updatedAt: liveMeet.updatedAt,
      },
    });
  } catch (error) {
    console.error('Live meet access error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route  GET /api/user/session-booking/availability
// @desc   Get available session slots for a given date
// @access Private
router.get('/session-booking/availability', protect, async (req, res) => {
  try {
    const config = await getResolvedBookingConfig();
    const requestedDate = String(req.query.date || '').trim() || getTodayInTimezone(config.timezone);
    if (!isValidDateString(requestedDate)) {
      return res.status(400).json({ message: 'date must be in YYYY-MM-DD format' });
    }

    const slotCounts = await WorkoutSessionBooking.aggregate([
      {
        $match: {
          bookingDate: requestedDate,
          status: 'booked',
        },
      },
      {
        $group: {
          _id: '$slotTime',
          count: { $sum: 1 },
        },
      },
    ]);

    const slotBookingMap = slotCounts.reduce((accumulator, entry) => {
      accumulator.set(entry._id, entry.count);
      return accumulator;
    }, new Map());

    const slots = buildSlotsWithAvailability(
      config.slots.filter((slot) => slot.isActive !== false),
      slotBookingMap
    );
    const today = getTodayInTimezone(config.timezone);
    const isBlockedDate = (config.blockedDates || []).includes(requestedDate);
    const bookingEnabled = config.isActive && !isBlockedDate;

    const userBookings = await WorkoutSessionBooking.find({
      user: req.user._id,
      bookingDate: requestedDate,
      status: 'booked',
    })
      .sort({ slotTime: 1 })
      .select('bookingDate slotTime slotLabel status createdAt');

    return res.status(200).json({
      timezone: config.timezone,
      date: requestedDate,
      isPastDate: requestedDate < today,
      session: {
        name: config.sessionName,
        durationMinutes: config.durationMinutes,
        description: config.description,
      },
      bookingEnabled,
      isBlockedDate,
      blockedReason: !config.isActive
        ? 'Session booking is currently turned off by admin.'
        : (isBlockedDate ? 'Selected date is blocked for bookings.' : ''),
      slots: bookingEnabled ? slots : slots.map((slot) => ({
        ...slot,
        remainingSeats: 0,
        isAvailable: false,
      })),
      userBookings,
    });
  } catch (error) {
    console.error('Booking availability error:', error);
    return res.status(500).json({ message: 'Unable to load booking slots' });
  }
});

// @route  POST /api/user/session-booking/book
// @desc   Book a workout session slot
// @access Private
router.post('/session-booking/book', protect, async (req, res) => {
  const bookingDate = String(req.body.bookingDate || '').trim();
  const slotTime = String(req.body.slotTime || '').trim();

  if (!isValidDateString(bookingDate)) {
    return res.status(400).json({ message: 'bookingDate must be in YYYY-MM-DD format' });
  }

  try {
    const config = await getResolvedBookingConfig();
    if (!config.isActive) {
      return res.status(403).json({ message: 'Session booking is currently disabled by admin' });
    }

    if ((config.blockedDates || []).includes(bookingDate)) {
      return res.status(400).json({ message: 'Selected date is blocked for booking' });
    }

    const matchingSlot = config.slots.find((slot) => slot.time === slotTime && slot.isActive !== false);
    if (!matchingSlot) {
      return res.status(400).json({ message: 'Selected slot is invalid or inactive' });
    }

    const today = getTodayInTimezone(config.timezone);
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Past dates cannot be booked' });
    }

    const existingBooking = await WorkoutSessionBooking.findOne({
      user: req.user._id,
      bookingDate,
      slotTime,
      status: 'booked',
    });

    if (existingBooking) {
      return res.status(409).json({ message: 'You already booked this session slot' });
    }

    const bookedSeats = await WorkoutSessionBooking.countDocuments({
      bookingDate,
      slotTime,
      status: 'booked',
    });

    if (bookedSeats >= matchingSlot.capacity) {
      return res.status(409).json({ message: 'This slot is full. Please choose another time.' });
    }

    const booking = await WorkoutSessionBooking.create({
      user: req.user._id,
      bookingDate,
      slotTime,
      slotLabel: matchingSlot.label,
      timezone: config.timezone,
      status: 'booked',
    });

    // Fire-and-forget: create Google Calendar event (non-blocking)
    setImmediate(async () => {
      try {
        const liveMeet = await LiveMeet.findOne().sort({ updatedAt: -1 }).lean();
        const meetLink = liveMeet?.isActive && liveMeet?.meetingUrl ? liveMeet.meetingUrl : null;
        const eventId = await createBookingCalendarEvent({
          summary: `${config.sessionName} — ${req.user.name || req.user.email}`,
          description: config.description,
          date: bookingDate,
          startTime: slotTime,
          durationMinutes: config.durationMinutes,
          timezone: config.timezone,
          attendeeEmail: req.user.email,
          meetLink,
        });
        if (eventId) {
          await WorkoutSessionBooking.findByIdAndUpdate(booking._id, { calendarEventId: eventId });
        }
      } catch (calErr) {
        console.error('[GoogleCalendar] Non-fatal event creation error:', calErr.message);
      }
    });

    // Fire-and-forget: send confirmation email
    if (isMailConfigured()) {
      setImmediate(async () => {
        try {
          const liveMeet = await LiveMeet.findOne().sort({ updatedAt: -1 }).lean();
          const meetLink = liveMeet?.isActive && liveMeet?.meetingUrl ? liveMeet.meetingUrl : null;
          await sendSessionBookingConfirmation({
            email: req.user.email,
            userName: req.user.name || req.user.email,
            sessionName: config.sessionName,
            date: bookingDate,
            slotLabel: matchingSlot.label,
            timezone: config.timezone,
            meetLink,
            description: config.description,
          });
        } catch (emailErr) {
          console.error('[Mailer] Booking confirmation error:', emailErr.message);
        }
      });
    }

    return res.status(201).json({
      message: 'Workout session booked successfully',
      booking,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'You already booked this session slot' });
    }

    console.error('Create booking error:', error);
    return res.status(500).json({ message: 'Unable to complete booking' });
  }
});

// @route  GET /api/user/session-booking/my
// @desc   Get current user's session bookings
// @access Private
router.get('/session-booking/my', protect, async (req, res) => {
  try {
    const bookings = await WorkoutSessionBooking.find({
      user: req.user._id,
      status: 'booked',
    })
      .sort({ bookingDate: -1, slotTime: -1 })
      .limit(25)
      .select('bookingDate slotTime slotLabel timezone status createdAt');

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('List user bookings error:', error);
    return res.status(500).json({ message: 'Unable to load your bookings' });
  }
});

// @route  PUT /api/user/session-booking/reschedule/:bookingId
// @desc   Reschedule a workout session (change date/time)
// @access Private
router.put('/session-booking/reschedule/:bookingId', protect, async (req, res) => {
  const bookingId = String(req.params.bookingId || '').trim();
  const newBookingDate = String(req.body.bookingDate || '').trim();
  const newSlotTime = String(req.body.slotTime || '').trim();

  if (!bookingId || !newBookingDate || !newSlotTime) {
    return res.status(400).json({ message: 'bookingId, bookingDate, and slotTime are required' });
  }

  if (!isValidDateString(newBookingDate)) {
    return res.status(400).json({ message: 'bookingDate must be in YYYY-MM-DD format' });
  }

  try {
    const booking = await WorkoutSessionBooking.findOne({
      _id: bookingId,
      user: req.user._id,
      status: 'booked',
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const config = await getResolvedBookingConfig();
    if (!config.isActive) {
      return res.status(403).json({ message: 'Session booking is currently disabled' });
    }

    if ((config.blockedDates || []).includes(newBookingDate)) {
      return res.status(400).json({ message: 'Selected date is blocked for booking' });
    }

    const matchingSlot = config.slots.find((slot) => slot.time === newSlotTime && slot.isActive !== false);
    if (!matchingSlot) {
      return res.status(400).json({ message: 'Selected slot is invalid or inactive' });
    }

    const today = getTodayInTimezone(config.timezone);
    if (newBookingDate < today) {
      return res.status(400).json({ message: 'Past dates cannot be booked' });
    }

    // Check if user already has a booking for the new slot
    const conflictingBooking = await WorkoutSessionBooking.findOne({
      user: req.user._id,
      bookingDate: newBookingDate,
      slotTime: newSlotTime,
      status: 'booked',
      _id: { $ne: bookingId },
    });

    if (conflictingBooking) {
      return res.status(409).json({ message: 'You already have a booking for this slot' });
    }

    // Check if slot has capacity
    const bookedSeats = await WorkoutSessionBooking.countDocuments({
      bookingDate: newBookingDate,
      slotTime: newSlotTime,
      status: 'booked',
      _id: { $ne: bookingId },
    });

    if (bookedSeats >= matchingSlot.capacity) {
      return res.status(409).json({ message: 'This slot is full. Please choose another time.' });
    }

    // Store old details for email
    const oldDate = booking.bookingDate;
    const oldSlot = booking.slotLabel;

    // Update booking
    booking.bookingDate = newBookingDate;
    booking.slotTime = newSlotTime;
    booking.slotLabel = matchingSlot.label;
    booking.timezone = config.timezone;
    await booking.save();

    // Fire-and-forget: update Google Calendar event
    if (booking.calendarEventId) {
      setImmediate(async () => {
        try {
          // Delete old event
          await deleteBookingCalendarEvent(booking.calendarEventId);
          // Create new event
          const liveMeet = await LiveMeet.findOne().sort({ updatedAt: -1 }).lean();
          const meetLink = liveMeet?.isActive && liveMeet?.meetingUrl ? liveMeet.meetingUrl : null;
          const newEventId = await createBookingCalendarEvent({
            summary: `${config.sessionName} — ${req.user.name || req.user.email}`,
            description: config.description,
            date: newBookingDate,
            startTime: newSlotTime,
            durationMinutes: config.durationMinutes,
            timezone: config.timezone,
            attendeeEmail: req.user.email,
            meetLink,
          });
          if (newEventId) {
            await WorkoutSessionBooking.findByIdAndUpdate(bookingId, { calendarEventId: newEventId });
          }
        } catch (calErr) {
          console.error('[GoogleCalendar] Reschedule error:', calErr.message);
        }
      });
    }

    // Fire-and-forget: send update email
    if (isMailConfigured()) {
      setImmediate(async () => {
        try {
          const liveMeet = await LiveMeet.findOne().sort({ updatedAt: -1 }).lean();
          const meetLink = liveMeet?.isActive && liveMeet?.meetingUrl ? liveMeet.meetingUrl : null;
          await sendSessionBookingUpdate({
            email: req.user.email,
            userName: req.user.name || req.user.email,
            sessionName: config.sessionName,
            oldDate,
            oldSlot,
            newDate: newBookingDate,
            newSlot: matchingSlot.label,
            timezone: config.timezone,
            meetLink,
            description: config.description,
          });
        } catch (emailErr) {
          console.error('[Mailer] Reschedule notification error:', emailErr.message);
        }
      });
    }

    return res.status(200).json({
      message: 'Booking rescheduled successfully',
      booking,
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    return res.status(500).json({ message: 'Unable to reschedule booking' });
  }
});

// @route  DELETE /api/user/session-booking/:bookingId
// @desc   Cancel a workout session booking
// @access Private
router.delete('/session-booking/:bookingId', protect, async (req, res) => {
  const bookingId = String(req.params.bookingId || '').trim();

  if (!bookingId) {
    return res.status(400).json({ message: 'bookingId is required' });
  }

  try {
    const booking = await WorkoutSessionBooking.findOne({
      _id: bookingId,
      user: req.user._id,
      status: 'booked',
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Delete from Google Calendar
    if (booking.calendarEventId) {
      setImmediate(async () => {
        try {
          await deleteBookingCalendarEvent(booking.calendarEventId);
        } catch (calErr) {
          console.error('[GoogleCalendar] Deletion error:', calErr.message);
        }
      });
    }

    // Mark as cancelled
    booking.status = 'cancelled';
    await booking.save();

    // Fire-and-forget: send cancellation email
    if (isMailConfigured()) {
      setImmediate(async () => {
        try {
          const config = await getResolvedBookingConfig();
          await sendSessionBookingCancellation({
            email: req.user.email,
            userName: req.user.name || req.user.email,
            sessionName: config.sessionName,
            date: booking.bookingDate,
            slotLabel: booking.slotLabel,
            timezone: booking.timezone,
          });
        } catch (emailErr) {
          console.error('[Mailer] Cancellation notification error:', emailErr.message);
        }
      });
    }

    return res.status(200).json({
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Unable to cancel booking' });
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
