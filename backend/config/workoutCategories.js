'use strict';

const WORKOUT_CATEGORY_OPTIONS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'bulk_muscle', label: 'Bulk / Muscle Gain' },
  { value: 'endurance_cardio', label: 'Endurance / Cardio' },
  { value: 'mobility_flexibility', label: 'Mobility / Flexibility' },
  { value: 'core_abs', label: 'Core / Abs' },
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'lower_body', label: 'Lower Body' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'recovery_beginner', label: 'Recovery / Beginner' },
];

const WORKOUT_CATEGORY_VALUES = WORKOUT_CATEGORY_OPTIONS.map((option) => option.value);

const GOAL_TO_VIDEO_CATEGORIES = {
  weight_loss: ['weight_loss', 'endurance_cardio', 'full_body', 'core_abs', 'recovery_beginner'],
  muscle_gain: ['bulk_muscle', 'upper_body', 'lower_body', 'full_body', 'core_abs'],
  endurance: ['endurance_cardio', 'full_body', 'core_abs', 'recovery_beginner'],
  flexibility: ['mobility_flexibility', 'recovery_beginner', 'core_abs'],
  general_fitness: WORKOUT_CATEGORY_VALUES,
};

const getCategoriesForGoal = (fitnessGoal) => {
  return GOAL_TO_VIDEO_CATEGORIES[fitnessGoal] || WORKOUT_CATEGORY_VALUES;
};

const inferCategoryFromText = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();

  if (/mobility|stretch|flexibility|yoga|recovery/.test(text)) {
    return 'mobility_flexibility';
  }

  if (/beginner|easy|simple|warm-up|warm up|routine/.test(text)) {
    return 'recovery_beginner';
  }

  if (/core|abs|ab\b|plank|russian twist|sit up|bicycle/.test(text)) {
    return 'core_abs';
  }

  if (/lower body|legs|glutes|squat|lunge|hamstring/.test(text)) {
    return 'lower_body';
  }

  if (/upper body|arms|shoulder|rear delt|back|chest|pull apart|push\b/.test(text)) {
    return 'upper_body';
  }

  if (/fat burn|weight loss|slim|burn/.test(text)) {
    return 'weight_loss';
  }

  if (/strength|bulk|muscle|hypertrophy|resistance/.test(text)) {
    return 'bulk_muscle';
  }

  if (/cardio|endurance|conditioning|mountain climber|hit|hiit/.test(text)) {
    return 'endurance_cardio';
  }

  if (/full body|total body/.test(text)) {
    return 'full_body';
  }

  return 'full_body';
};

module.exports = {
  WORKOUT_CATEGORY_OPTIONS,
  WORKOUT_CATEGORY_VALUES,
  GOAL_TO_VIDEO_CATEGORIES,
  getCategoriesForGoal,
  inferCategoryFromText,
};
