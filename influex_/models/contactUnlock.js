import mongoose from "mongoose";

const contactUnlockSchema = new mongoose.Schema({

  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  unlockedAt: {
    type: Date,
    default: Date.now
  },
    type: {
    type: String,
    enum: ["email", "instagram"],
    required: true
  }
}, { timestamps: true });


unlockSchema.index({ brandId: 1, influencerId: 1, type: 1 }, { unique: true });
export default mongoose.model("ContactUnlock", contactUnlockSchema)