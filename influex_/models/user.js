import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["brand", "influencer"],
    required: true
  },

  profileStatus: {
  type: String,
  enum: ["pending", "completed"],
  default: "pending"
},
bits: {
  type: Number,
  default: 100 // influencers ke liye
},
applicationsUsed: {
  type: Number,
  default: 0
},
campaignsCreated: {
  type: Number,
  default: 0
},
isSubscribed: {
  type: Boolean,
  default: false
},
subscriptionExpiry: {
  type: Date
},
  kycStatus: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending"
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
