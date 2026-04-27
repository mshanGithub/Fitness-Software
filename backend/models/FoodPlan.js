const mongoose = require('mongoose');

const foodSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      default: '',
      trim: true,
    },
    items: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const foodPlanSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Food plan name cannot exceed 120 characters'],
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    sections: {
      type: [foodSectionSchema],
      default: [],
    },
    structuredPlan: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isPredefined: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FoodPlan', foodPlanSchema);
