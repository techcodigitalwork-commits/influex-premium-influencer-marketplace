import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: String,

  roles: [{
    type: String,
    enum: ["INFLUENCER", "MODEL", "PHOTOGRAPHER"],
    required: true
  }],

  categories: [String],

  city: {
    type: String,
    lowercase: true,
    trim: true
  },

  budget: {
    type: Number,
    required: true,
    min: 0
  },

  deliverables: [String],

  status: {
    type: String,
    enum: ["OPEN", "ONGOING", "COMPLETED"],
    default: "OPEN"
  },

  applicationsCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("Campaign", campaignSchema);
