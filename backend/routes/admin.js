const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const WorkoutVideo = require('../models/WorkoutVideo');
const { protect, adminOnly } = require('../middleware/authMiddleware');

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

router.use(protect, adminOnly);

router.get('/overview', async (req, res) => {
  try {
    const [totalUsers, activeUsers, adminCount, totalVideos, activeVideos, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'admin' }),
      WorkoutVideo.countDocuments(),
      WorkoutVideo.countDocuments({ isActive: true }),
      User.find().sort({ createdAt: -1 }).limit(6).select('-password'),
    ]);

    return res.status(200).json({
      metrics: {
        totalUsers,
        activeUsers,
        inactiveUsers: Math.max(totalUsers - activeUsers, 0),
        adminCount,
        totalVideos,
        activeVideos,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ message: 'Unable to load admin overview' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
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
      if (!user) {
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
    body('category').optional().trim(),
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
        category: req.body.category || 'General',
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
    body('category').optional().trim(),
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