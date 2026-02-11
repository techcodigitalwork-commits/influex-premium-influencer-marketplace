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
    enum: ["Brand", "Influencer", "Model", "Photographer"],
    required: true
  },

  profile: {
    name: String,
    city: String,
    categories: [String],
    budget: Number,
    followers: Number,
    bio: String,
    socialLinks: Object
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
