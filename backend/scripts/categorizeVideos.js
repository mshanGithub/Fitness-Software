/**
 * Analyze existing workout videos and assign category automatically.
 *
 * Usage: npm run categorize-videos
 */

'use strict';

require('dotenv').config();
const connectDB = require('../config/db');
const WorkoutVideo = require('../models/WorkoutVideo');
const { inferCategoryFromText } = require('../config/workoutCategories');

async function categorizeVideos() {
  await connectDB();

  const videos = await WorkoutVideo.find();
  if (!videos.length) {
    console.log('No videos found to categorize.');
    process.exit(0);
  }

  let updated = 0;

  for (const video of videos) {
    const inferred = inferCategoryFromText(video.title, video.description);
    if (video.category !== inferred) {
      await WorkoutVideo.updateOne({ _id: video._id }, { $set: { category: inferred } });
      updated += 1;
      console.log(`✅ ${video.title} -> ${inferred}`);
    }
  }

  console.log('\n────────────────────────────────');
  console.log(`Total videos : ${videos.length}`);
  console.log(`Updated      : ${updated}`);
  console.log(`Unchanged    : ${videos.length - updated}`);
  console.log('────────────────────────────────\n');

  process.exit(0);
}

categorizeVideos().catch((error) => {
  console.error('Categorization error:', error);
  process.exit(1);
});
