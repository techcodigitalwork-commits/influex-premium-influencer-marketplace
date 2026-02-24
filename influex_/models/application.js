import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true
  },
  influencerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

applicationSchema.index(
  { campaignId: 1, creatorId: 1 },
  { unique: true }
);

export default mongoose.model("Application", applicationSchema);
