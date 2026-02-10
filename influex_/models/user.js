// src/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  role: {
    type: String,
    enum: ["Influencer", "Model", "Photographer", "Brand"]
  },
  city: String,
  category: String,
  avatar: String,

  rating: { type: Number, default: 0 },
  budgetMin: Number,
  budgetMax: Number,

  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profileComplete: { type: Boolean, default: false },

  kycStatus: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending"
  }
 

}, { timestamps: true });

export default mongoose.model("User", UserSchema);
