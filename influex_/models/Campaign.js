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
    enum: ["influencers","brand"],
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

  

  status: {
    type: String,
    enum: ["open", "ongoing", "completed"],
    default: "open"
  },

  applicationsCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });


export default mongoose.model("Campaign", campaignSchema);
