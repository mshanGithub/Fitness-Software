const express = require('express');
const WorkoutVideo = require('../models/WorkoutVideo');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route  GET /api/videos
// @desc   Get all active workout videos
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const videos = await WorkoutVideo.find({ isActive: true }).sort({ createdAt: -1 });

    // Seed a default video if the collection is empty
    if (videos.length === 0) {
      const defaultVideo = await WorkoutVideo.create({
        title: 'Full Body Workout with Coach Cain',
        youtubeId: 'Pe8hzGVjZaU',
        description: 'Complete full-body workout session — follow along with Coach Cain!',
        category: 'Full Body',
        duration: '30 min',
      });
      return res.json([defaultVideo]);
    }

    res.json(videos);
  } catch (error) {
    console.error('Fetch videos error:', error);
    res.status(500).json({ message: 'Server error fetching videos' });
  }
});

module.exports = router;
