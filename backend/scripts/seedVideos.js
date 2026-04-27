/**
 * Seed workout videos into MongoDB.
 * Fetches real titles from the YouTube oEmbed API (no API key required).
 * Skips any video already present in the collection.
 *
 * Usage:  npm run seed-videos
 */

'use strict';

require('dotenv').config();
const connectDB = require('../config/db');
const WorkoutVideo = require('../models/WorkoutVideo');
const { inferCategoryFromText } = require('../config/workoutCategories');

const VIDEO_IDS = [
  'Pe8hzGVjZaU',
  'CNH5qMxob3A',
  'B78Rp_gO_04',
  '86WO5mjn3co',
  'BBnpIrVcHEw',
  'pHJgnMBPFmg',
  'Dbag27AvPkQ',
  '3FcSKBbsm8Q',
  'VjFDA-J2EwQ',
  'bT7QWdgRVXc',
  'imvRoiVBR0Y',
  'Kbml-LjvkEc',
  '-9yGtl4_QiY',
  'ZQ7OBdtSnJw',
  'lOaGJ78z98E',
  'NGleZrqZBLs',
  'vJePoHuamdY',
  'MzQjVvjYrts',
  'prlNYuQ1pAw',
  'Sq9EGS6pyEc',
  'b88vXQNhmpQ',
  'PRGe2v1XKUQ',
  'e3Bv3rvqPqE',
  'hLehydKPQLA',
  'LiNxbjomIu0',
  'qOa7kx9bEoc',
  'ROU5eYNVMmc',
  'yewa4r1a9TI',
  '34Su6CKKYYI',
  'v1Nj7Q8azZ0',
  '2fJIwJwRJBM',
  'fO94C-2Yvo8',
  'uryCnyMjS9Y',
  'nR7_bQmyjZU',
  'bxRohBP4_4w',
  'akW3E3aL4tw',
  'H2u4p1XbUS8',
  'Y0N7pmn3spk',
  'qviMsvxMDDQ',
  'Jmfmlo7p--w',
  'wgPwh3FCaP8',
  'sD1Y1k89__U',
  '3sU-T1icuTQ',
  'mDb3KwyQaDA',
  'HAWQpZk3MDk',
  'y7VnvryuvSM',
  'pX-koiTHEKI',
  'BNP2KvAsv_w',
  'Mk3JCjB8iPI',
  'jOnT2WXNoHM',
  'bWH0dAvduV8',
  '3kPDtYKE5mc',
  'lFZpBpxZyfU',
  'wyP1MdOB-gQ',
  '1ZEVyTb9JP8',
  'my0-R4E_o9Q',
  '2cXv1jTdpm8',
  'Fcxp37F-_DU',
  'xk873foJd7A',
  '7C-sMsghcEQ',
];

async function fetchVideoMeta(youtubeId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(youtubeId)}&format=json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      return {
        title: String(data.title || '').trim() || `Workout – ${youtubeId}`,
        author: String(data.author_name || '').trim(),
      };
    }
  } catch {
    // oEmbed unavailable for this video — fall back to id-based title
  }
  return { title: `Workout – ${youtubeId}`, author: '' };
}

async function seed() {
  await connectDB();

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`\n🏋️  Seeding ${VIDEO_IDS.length} workout videos...\n`);

  for (const id of VIDEO_IDS) {
    try {
      const exists = await WorkoutVideo.findOne({ youtubeId: id });
      if (exists) {
        console.log(`  ⏭  skipped  ${id}  (already in DB)`);
        skipped += 1;
        continue;
      }

      const { title, author } = await fetchVideoMeta(id);
      const description = author ? `By ${author}` : '';
      await WorkoutVideo.create({
        title,
        youtubeId: id,
        description,
        category: inferCategoryFromText(title, description),
        duration: '',
        isActive: true,
      });

      console.log(`  ✅  inserted  ${title}`);
      inserted += 1;
    } catch (err) {
      console.error(`  ❌  failed   ${id} — ${err.message}`);
      failed += 1;
    }
  }

  console.log(`\n────────────────────────────────`);
  console.log(`  Inserted : ${inserted}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Failed   : ${failed}`);
  console.log(`────────────────────────────────\n`);

  process.exit(failed > 0 ? 1 : 0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
