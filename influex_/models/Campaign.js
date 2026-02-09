// models/Campaign.js
import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: String,
  description: String,

  roles: [String],          // Influencer / Model / Photographer
  categories: [String],     // Fashion, Tech etc
  city: String,

  budget: Number,
  deliverables: [String],

  status: {
    type: String,
    enum: ["OPEN", "ONGOING", "COMPLETED"],
    default: "OPEN"
  }
}, { timestamps: true });

export default mongoose.model("Campaign", campaignSchema);
